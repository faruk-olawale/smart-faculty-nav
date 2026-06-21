const fs = require('fs');
const path = 'src/services/aiAssistantService.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';`,
  `import { GoogleGenerativeAI, SchemaType, Tool } from '@google/generative-ai';`
);

content = content.replace(
  `const tools = [`,
  `const tools: Tool[] = [`
);

fs.writeFileSync(path, content);
console.log('TOOL_TYPE_FIX_APPLIED');
