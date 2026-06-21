const fs = require('fs');
const path = 'src/index.ts';
let content = fs.readFileSync(path, 'utf8');

const oldLine = `const PORT = process.env.PORT || 5000;`;
const newLine = `const PORT = Number(process.env.PORT) || 5000;`;

if (content.includes(oldLine)) {
  content = content.replace(oldLine, newLine);
  fs.writeFileSync(path, content);
  console.log('PORT_FIX_APPLIED');
} else {
  console.log('PORT_FIX_NOT_FOUND');
}
