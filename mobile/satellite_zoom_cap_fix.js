const fs = require('fs');
const path = 'src/screens/MapScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `currentTileLayer = L.tileLayer(SATELLITE_TILES, { maxZoom: 19 }).addTo(map);`,
  `currentTileLayer = L.tileLayer(SATELLITE_TILES, { maxZoom: 21 }).addTo(map);`
);

content = content.replace(
  `map.options.maxZoom = 19;`,
  `map.options.maxZoom = 21;`
);

content = content.replace(
  `if (map.getZoom() > 19) map.setZoom(19, { animate: false });`,
  `if (map.getZoom() > 21) map.setZoom(21, { animate: false });`
);

fs.writeFileSync(path, content);
console.log('ZOOM_CAP_UPDATED_TO_21');
