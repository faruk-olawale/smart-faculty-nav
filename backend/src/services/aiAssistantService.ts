import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI, SchemaType, Tool } from '@google/generative-ai';
import { AIQueryRequest, AIQueryResponse } from '../types';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const EMERGENCY_RE = /\b(emergency|help|security|danger|unsafe|sick)\b/i;

async function searchLocation(query: string) {
  const term = { contains: query, mode: 'insensitive' as const };
  const [buildings, departments] = await Promise.all([
    prisma.building.findMany({
      where: { OR: [{ name: term }, { shortName: term }, { description: term }] },
      include: { faculty: { select: { name: true } } },
      take: 5,
    }),
    prisma.department.findMany({
      where: { OR: [{ name: term }, { code: term }, { description: term }] },
      include: { building: true, faculty: { select: { name: true } } },
      take: 5,
    }),
  ]);

  return {
    buildings: buildings.map(b => ({
      id: b.id, name: b.name, shortName: b.shortName, type: b.type,
      floor: b.floor, description: b.description,
      latitude: b.latitude, longitude: b.longitude,
      openingHours: b.openingHours, phone: b.phone,
    })),
    departments: departments.map(d => ({
      id: d.id, name: d.name, code: d.code,
      buildingId: d.building?.id, buildingName: d.building?.name,
      floor: d.building?.floor, roomNumber: d.roomNumber,
      latitude: d.building?.latitude, longitude: d.building?.longitude,
    })),
  };
}

async function listAllLocations() {
  const buildings = await prisma.building.findMany({
    select: { id: true, name: true, shortName: true, type: true, floor: true },
    orderBy: { name: 'asc' },
  });
  return { count: buildings.length, locations: buildings };
}

async function getEmergencyHelp() {
  const building = await prisma.building.findFirst({ where: { isEmergency: true } });
  return building
    ? {
        id: building.id, name: building.name, phone: building.phone,
        latitude: building.latitude, longitude: building.longitude,
      }
    : null;
}

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'search_location',
        description:
          'Search for a building, lecture room, lab, or department by name or description fragment. Use this whenever the user mentions any place, room, or department by name or description, even partial or informal (e.g. "the place I print stuff" -> search "print").',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            query: { type: SchemaType.STRING, description: 'Search term, e.g. "NLP lab", "lecture room f", "print"' },
          },
          required: ['query'],
        },
      },
      {
        name: 'list_all_locations',
        description: 'List every navigable location in the faculty. Use when the user asks what locations/rooms/departments exist.',
        parameters: { type: SchemaType.OBJECT, properties: {} },
      },
      {
        name: 'get_emergency_help',
        description: 'Get the nearest emergency/security contact point. Use only for genuine emergency or safety requests.',
        parameters: { type: SchemaType.OBJECT, properties: {} },
      },
    ],
  },
];

const SYSTEM_INSTRUCTION = `You are the voice navigation assistant for the Faculty of Information & Communication Technology (ICT) at KWASU, Malete.

Rules:
- You are speaking out loud through text-to-speech. Keep replies SHORT — 1-2 sentences, no markdown, no bullet lists, no emojis, no asterisks.
- NEVER invent a room, building, or department name. Always call search_location first to confirm something exists before mentioning it.
- If search_location finds nothing relevant, say so plainly and suggest the user try a different phrase, or call list_all_locations if they seem unsure what's available.
- If the user wants to go somewhere ("take me to...", "navigate to...", "where is...", "how do I get to..."), confirm the destination naturally, e.g. "Heading to the NLP Lab, it's upstairs on floor 2."
- Be warm and concise, like a real tour guide giving quick spoken directions, not a chatbot.`;

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: SYSTEM_INSTRUCTION,
  tools,
});

const FUNCTIONS: Record<string, (args: any) => Promise<any>> = {
  search_location: args => searchLocation(args.query),
  list_all_locations: () => listAllLocations(),
  get_emergency_help: () => getEmergencyHelp(),
};

export async function processAIQuery(req: AIQueryRequest): Promise<AIQueryResponse> {
  const { message } = req;

  if (EMERGENCY_RE.test(message)) {
    const security = await getEmergencyHelp();
    return {
      reply: security
        ? `Emergency detected. The nearest help point is ${security.name}. Navigating there now.`
        : `Emergency detected, but no security post is set up yet. Please seek help directly.`,
      action: security
        ? {
            type: 'emergency',
            targetId: security.id,
            targetLat: security.latitude,
            targetLng: security.longitude,
            name: security.name,
          }
        : undefined,
      suggestions: ['Navigate to Security Post', 'Call Security'],
    };
  }

  if (!process.env.GEMINI_API_KEY) {
    return {
      reply: 'AI assistant is not configured yet. Add GEMINI_API_KEY to the backend .env file.',
      suggestions: ['Where is the NLP Lab?', 'List all locations'],
    };
  }

  try {
    const chat = model.startChat();
    let result = await chat.sendMessage(message);

    let lastLocation: { id: string; name: string; lat: number; lng: number } | null = null;

    for (let i = 0; i < 3; i++) {
      const calls = result.response.functionCalls();
      if (!calls || calls.length === 0) break;

      const responses = [];
      for (const call of calls) {
        const fn = FUNCTIONS[call.name];
        const output = fn ? await fn(call.args) : { error: 'Unknown function' };

        if (call.name === 'search_location' && !lastLocation) {
          const b = output.buildings?.[0];
          const d = output.departments?.[0];
          if (b) lastLocation = { id: b.id, name: b.name, lat: b.latitude, lng: b.longitude };
          else if (d && d.latitude != null) lastLocation = { id: d.buildingId, name: d.name, lat: d.latitude, lng: d.longitude };
        }

        responses.push({
          functionResponse: { name: call.name, response: output },
        });
      }

      result = await chat.sendMessage(responses as any);
    }

    const reply = result.response.text().trim() ||
      'Sorry, I could not find that. Try asking about a specific room or lab.';

    const wantsNav = /\b(take me|navigate|go to|directions?|how (do i|to) get to|route to)\b/i.test(message);

    return {
      reply,
      action: lastLocation
        ? {
            type: wantsNav ? 'navigate' : 'show_building',
            targetId: lastLocation.id,
            targetLat: lastLocation.lat,
            targetLng: lastLocation.lng,
            name: lastLocation.name,
          }
        : undefined,
      suggestions: lastLocation
        ? [`Navigate to ${lastLocation.name}`, 'Show on map', 'List all locations']
        : ['Where is the NLP Lab?', 'List all locations', 'Emergency help'],
    };
  } catch (err) {
    const e = err as any;
    console.error('Gemini assistant error STATUS:', e?.status);
    console.error('Gemini assistant error MESSAGE:', e?.message);
    console.error('Gemini assistant error DETAILS:', JSON.stringify(e?.errorDetails || e));
    return {
      reply: 'Something went wrong reaching the assistant. Please try again.',
      suggestions: ['Where is the NLP Lab?', 'List all locations'],
    };
  }
}

export async function processVoiceQuery(
  audioBase64: string,
  mimeType: string
): Promise<AIQueryResponse & { transcript?: string }> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      reply: 'AI assistant is not configured yet. Add GEMINI_API_KEY to the backend .env file.',
      suggestions: ['Where is the NLP Lab?', 'List all locations'],
    };
  }

  try {
    const chat = model.startChat();

    let result = await chat.sendMessage([
      {
        inlineData: {
          mimeType,
          data: audioBase64,
        },
      },
      {
        text:
          'This is a spoken voice command from a user navigating the KWASU ICT faculty. ' +
          'Listen to it, figure out what they want, and respond following your system instructions. ' +
          'Use your tools to confirm any location before mentioning it.',
      },
    ]);

    let lastLocation: { id: string; name: string; lat: number; lng: number } | null = null;

    for (let i = 0; i < 3; i++) {
      const calls = result.response.functionCalls();
      if (!calls || calls.length === 0) break;

      const responses = [];
      for (const call of calls) {
        const fn = FUNCTIONS[call.name];
        const output = fn ? await fn(call.args) : { error: 'Unknown function' };

        if (call.name === 'search_location' && !lastLocation) {
          const b = output.buildings?.[0];
          const d = output.departments?.[0];
          if (b) lastLocation = { id: b.id, name: b.name, lat: b.latitude, lng: b.longitude };
          else if (d && d.latitude != null) lastLocation = { id: d.buildingId, name: d.name, lat: d.latitude, lng: d.longitude };
        }

        responses.push({
          functionResponse: { name: call.name, response: output },
        });
      }

      result = await chat.sendMessage(responses as any);
    }

    const reply = result.response.text().trim() ||
      'Sorry, I could not understand that. Please try again.';

    const wantsNav = /\b(take|head|navigate|going|route)\b/i.test(reply);

    return {
      reply,
      action: lastLocation
        ? {
            type: wantsNav ? 'navigate' : 'show_building',
            targetId: lastLocation.id,
            targetLat: lastLocation.lat,
            targetLng: lastLocation.lng,
            name: lastLocation.name,
          }
        : undefined,
      suggestions: lastLocation
        ? [`Navigate to ${lastLocation.name}`, 'Show on map', 'List all locations']
        : ['Where is the NLP Lab?', 'List all locations', 'Emergency help'],
    };
  } catch (err: any) {
    console.error('Gemini voice error STATUS:', err?.status);
    console.error('Gemini voice error MESSAGE:', err?.message);
    const isQuota = err?.status === 429;
    const isAudio = err?.message?.includes('audio') || err?.message?.includes('mime');
    return {
      reply: isQuota
        ? 'The AI is rate limited. Please wait a moment and try again.'
        : isAudio
        ? 'Could not process the audio. Please speak again.'
        : 'Something went wrong understanding that. Please try again.',
      suggestions: ['Where is the NLP Lab?', 'List all locations'],
    };
  }
}
