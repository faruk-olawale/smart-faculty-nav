const fs = require('fs');
const path = 'src/screens/MapScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

let applied = 0;

// Fix 1: add maxZoom:19 to map init (regex so we don't need FACULTY_ICT values)
const newContent1 = content.replace(
  /const map = L\.map\('map',\s*\{([^}]*?)zoomControl: false,\s*\}\);/s,
  (match) => match.replace('zoomControl: false,', 'maxZoom: 19,\n    zoomControl: false,')
);
if (newContent1 !== content) { content = newContent1; applied++; }

// Fix 2: upgrade setMapType to use map.options.maxZoom
content = content.replace(
  "map.setMaxZoom(19);\n      if (map.getZoom() > 19) map.setZoom(19);",
  "map.options.maxZoom = 19;\n      if (map.getZoom() > 19) map.setZoom(19, { animate: false });"
);

content = content.replace(
  "map.setMaxZoom(22);",
  "map.options.maxZoom = 22;"
);
applied++;

fs.writeFileSync(path, content);
console.log('Applied ' + applied + '/2 fixes');
