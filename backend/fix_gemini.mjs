import { readFileSync, writeFileSync } from 'fs';

const target = 'src/services/aiAssistantService.ts';
let content = readFileSync(target, 'utf8');

// Switch model
content = content.replace(/gemini-2\.5-flash/g, 'gemini-1.5-flash');
console.log('Model switched to gemini-1.5-flash');

// Add retry wrapper if not already there
const retryHelper = `
async function callGeminiWithRetry(model, request, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await model.generateContent(request);
    } catch (err) {
      if (err?.status === 429 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log('Rate limited. Retrying in ' + delay + 'ms...');
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
}
`;

if (!content.includes('callGeminiWithRetry')) {
  content = retryHelper + content;
  console.log('Retry helper injected.');
} else {
  console.log('Retry helper already present, skipping.');
}

writeFileSync(target, content);
console.log('Done. Restart backend with: npm run dev');
