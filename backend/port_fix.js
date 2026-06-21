const fs = require('fs');
const path = 'src/index.ts';
let content = fs.readFileSync(path, 'utf8');

const patterns = [
  { old: `const PORT = process.env.PORT || 3000;`, new: `const PORT = Number(process.env.PORT) || 3000;` },
  { old: `const PORT = process.env.PORT || '3000';`, new: `const PORT = Number(process.env.PORT) || 3000;` },
];

let applied = false;
for (const p of patterns) {
  if (content.includes(p.old)) {
    content = content.replace(p.old, p.new);
    applied = true;
  }
}

if (applied) {
  console.log('PORT_FIX_APPLIED');
  fs.writeFileSync(path, content);
} else {
  console.log('PORT_FIX_NOT_FOUND');
}
