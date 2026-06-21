const fs = require('fs');
const path = 'src/screens/ARScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldSet = `    setArData(computed);`;

const newSet = `    // Only float markers for the selected destination, to avoid
    // clutter/overlap from every nearby building. If no destination is
    // set, fall back to showing just the single nearest building.
    const filtered = destination
      ? computed.filter(d => d.isDestination)
      : computed.slice(0, 1);
    setArData(filtered);`;

if (content.includes(oldSet)) {
  content = content.replace(oldSet, newSet);
  console.log('DESTINATION_ONLY_FIX_APPLIED');
} else {
  console.log('DESTINATION_ONLY_FIX_NOT_FOUND');
}

fs.writeFileSync(path, content);
