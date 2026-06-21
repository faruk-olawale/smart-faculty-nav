const fs = require('fs');
const path = 'src/constants/index.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /export const API_BASE_URL = '[^']*';/,
  `export const API_BASE_URL = 'https://smart-faculty-nav.onrender.com/api/v1';`
);
content = content.replace(
  /export const WS_URL = '[^']*';/,
  `export const WS_URL = 'wss://smart-faculty-nav.onrender.com/ws';`
);

fs.writeFileSync(path, content);
console.log('RENDER_URL_APPLIED');
