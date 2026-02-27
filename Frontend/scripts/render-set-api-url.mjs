import fs from 'node:fs';
import path from 'node:path';

const apiUrl = process.env.API_URL;
const envFilePath = path.resolve(process.cwd(), 'src/environments/environment.prod.ts');

if (!apiUrl) {
  console.error('[render-set-api-url] Missing API_URL environment variable.');
  console.error('[render-set-api-url] Example: https://mallconnect-backend.onrender.com/api');
  process.exit(1);
}

const currentFile = fs.readFileSync(envFilePath, 'utf8');
const updatedFile = currentFile.replace(/apiUrl:\s*'[^']*'/, `apiUrl: '${apiUrl}'`);

if (updatedFile === currentFile) {
  console.error('[render-set-api-url] Could not find apiUrl entry in environment.prod.ts.');
  process.exit(1);
}

fs.writeFileSync(envFilePath, updatedFile, 'utf8');
console.log(`[render-set-api-url] API_URL injected into environment.prod.ts: ${apiUrl}`);

