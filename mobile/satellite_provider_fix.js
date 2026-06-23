const fs = require('fs');
const path = 'src/screens/MapScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const old = `  const SATELLITE_TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';`;

const updated = `  const SATELLITE_TILES = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';`;

if (content.includes(old)) {
  content = content.replace(old, updated);
  fs.writeFileSync(path, content);
  console.log('PROVIDER_SWITCHED_TO_GOOGLE');
} else {
  console.log('NOT_FOUND');
}
