const fs = require('fs');
const path = 'src/services/aiAssistantService.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `    console.error('Gemini assistant error:', err);`,
  `    console.error('Gemini assistant error STATUS:', err?.status);
    console.error('Gemini assistant error MESSAGE:', err?.message);
    console.error('Gemini assistant error DETAILS:', JSON.stringify(err?.errorDetails || err));`
);

fs.writeFileSync(path, content);
console.log('ERROR_LOGGING_IMPROVED');
