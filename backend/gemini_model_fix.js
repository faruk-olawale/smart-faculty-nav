const fs = require('fs');
const path = 'src/services/aiAssistantService.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `model: 'gemini-2.5-flash',`,
  `model: 'gemini-2.0-flash',`
);

fs.writeFileSync(path, content);
console.log('MODEL_SWITCHED_TO_2.0_FLASH');
