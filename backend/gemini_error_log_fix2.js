const fs = require('fs');
const path = 'src/services/aiAssistantService.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `    console.error('Gemini assistant error STATUS:', err?.status);
    console.error('Gemini assistant error MESSAGE:', err?.message);
    console.error('Gemini assistant error DETAILS:', JSON.stringify(err?.errorDetails || err));`,
  `    const e = err as any;
    console.error('Gemini assistant error STATUS:', e?.status);
    console.error('Gemini assistant error MESSAGE:', e?.message);
    console.error('Gemini assistant error DETAILS:', JSON.stringify(e?.errorDetails || e));`
);

fs.writeFileSync(path, content);
console.log('FIXED');
