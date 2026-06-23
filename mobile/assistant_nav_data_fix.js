const fs = require('fs');
const path = 'src/screens/AssistantScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldHandler = `  async function handlePressOut() {
    const reply = await stopRecordingAndSend(
      userLocation ? { userLat: userLocation.lat, userLng: userLocation.lng } : undefined
    );
    if (reply?.action?.targetLat != null && reply.action.targetLng != null) {
      setTimeout(() => {
        if (reply.action!.type === 'navigate') {
          navigation.navigate('Navigation', {
            destination: {
              id: reply.action!.targetId,
              name: reply.action!.name,
              latitude: reply.action!.targetLat,
              longitude: reply.action!.targetLng,
            },
          });
        } else if (reply.action!.type === 'show_building' || reply.action!.type === 'emergency') {
          navigation.navigate('Building', {
            building: {
              id: reply.action!.targetId,
              name: reply.action!.name,
              latitude: reply.action!.targetLat,
              longitude: reply.action!.targetLng,
            },
          });
        }
      }, 600);
    }
  }`;

const newHandler = `  async function handlePressOut() {
    const reply = await stopRecordingAndSend(
      userLocation ? { userLat: userLocation.lat, userLng: userLocation.lng } : undefined
    );
    if (reply?.action?.targetId) {
      setTimeout(() => {
        const fullBuilding = buildings.find(b => b.id === reply.action!.targetId);

        const fallback = {
          id: reply.action!.targetId,
          name: reply.action!.name,
          latitude: reply.action!.targetLat,
          longitude: reply.action!.targetLng,
          type: 'OTHER',
        };

        const target = fullBuilding || fallback;

        if (reply.action!.type === 'navigate') {
          navigation.navigate('Navigation', { destination: target });
        } else if (reply.action!.type === 'show_building' || reply.action!.type === 'emergency') {
          navigation.navigate('Building', { building: target });
        }
      }, 600);
    }
  }`;

if (content.includes(oldHandler)) {
  content = content.replace(oldHandler, newHandler);
  content = content.replace(
    'const { userLocation } = useAppStore();',
    'const { userLocation, buildings } = useAppStore();'
  );
  fs.writeFileSync(path, content);
  console.log('NAV_DATA_FIX_APPLIED');
} else {
  console.log('NAV_DATA_FIX_NOT_FOUND');
}
