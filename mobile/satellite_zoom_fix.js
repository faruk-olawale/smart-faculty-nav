const fs = require('fs');
const path = 'src/screens/MapScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const old = `  function setMapType(type) {
    map.removeLayer(currentTileLayer);
    const mapEl = document.getElementById('map');
    if (type === 'satellite') {
      currentTileLayer = L.tileLayer(SATELLITE_TILES, { maxZoom: 19 }).addTo(map);
      mapEl.classList.remove('dimmed');
    } else {
      currentTileLayer = L.tileLayer(DEFAULT_TILES, { maxZoom: 22 }).addTo(map);
      mapEl.classList.add('dimmed');
    }
  }`;

const updated = `  function setMapType(type) {
    map.removeLayer(currentTileLayer);
    const mapEl = document.getElementById('map');
    if (type === 'satellite') {
      currentTileLayer = L.tileLayer(SATELLITE_TILES, { maxZoom: 19 }).addTo(map);
      mapEl.classList.remove('dimmed');
      map.setMaxZoom(19);
      if (map.getZoom() > 19) map.setZoom(19);
    } else {
      currentTileLayer = L.tileLayer(DEFAULT_TILES, { maxZoom: 22 }).addTo(map);
      mapEl.classList.add('dimmed');
      map.setMaxZoom(22);
    }
  }`;

if (content.includes(old)) {
  content = content.replace(old, updated);
  fs.writeFileSync(path, content);
  console.log('SATELLITE_ZOOM_CAP_APPLIED');
} else {
  console.log('NOT_FOUND');
}
