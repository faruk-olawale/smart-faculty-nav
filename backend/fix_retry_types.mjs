import { readFileSync, writeFileSync } from 'fs';

const target = 'src/services/aiAssistantService.ts';
let c = readFileSync(target, 'utf8');

// Remove the badly typed retry helper we injected at the top
c = c.replace(`
async function callGeminiWithRetry(model, request, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await model.generateContent(request);
    } catch (err) {
      if (err?.status === 429 && attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log('Rate limited. Retrying in ' + delay + 'ms...');
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
}
`, '');

writeFileSync(target, c);
console.log('Removed bad retry helper.');
