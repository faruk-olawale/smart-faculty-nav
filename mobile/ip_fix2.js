const fs = require('fs');
const path = 'src/constants/index.ts';
let content = fs.readFileSync(path, 'utf8');

const oldApi = `export const API_BASE_URL = 'http://172.20.10.3:5000/api/v1';`;
const newApi = `export const API_BASE_URL = 'http://10.214.60.207:5000/api/v1';`;

const oldWs = `export const WS_URL = 'ws://172.20.10.3:5000/ws';`;
const newWs = `export const WS_URL = 'ws://10.214.60.207:5000/ws';`;

let applied = 0;
if (content.includes(oldApi)) { content = content.replace(oldApi, newApi); applied++; }
if (content.includes(oldWs)) { content = content.replace(oldWs, newWs); applied++; }

fs.writeFileSync(path, content);
console.log(`IP_FIX_APPLIED: ${applied}/2 lines updated`);
