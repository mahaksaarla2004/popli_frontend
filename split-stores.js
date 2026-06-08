const fs = require('fs');
const path = require('path');

const indexFile = path.join(__dirname, 'src', 'store', 'index.ts');
const content = fs.readFileSync(indexFile, 'utf8');

const blocks = content.split('// ==========================================');

const header = blocks[0]; // the imports

// Mapping of store names
const files = {
  '1. AUTH': 'authStore.ts',
  '2. KYC': 'kycStore.ts',
  '3. WALLET': 'walletStore.ts',
  '4. VIDEO FEED': 'feedStore.ts',
  '5. INBOX': 'chatStore.ts',
  '6. STORY STORE': 'storyStore.ts',
  '7. STORY ARCHIVE STORE': 'storyArchiveStore.ts',
  '8. HIGHLIGHTS STORE': 'storyHighlightStore.ts',
  '9. CAMERA SETTINGS': 'cameraSettingsStore.ts'
};

const generatedFiles = [];

for (let i = 1; i < blocks.length; i += 2) {
  const titleBlock = blocks[i].trim();
  const codeBlock = blocks[i+1];
  
  let fileName = 'unknown.ts';
  for (const [key, val] of Object.entries(files)) {
    if (titleBlock.includes(key)) {
      fileName = val;
      break;
    }
  }

  // Create file content
  // We need to inject the imports
  let fileContent = `import { create } from 'zustand';\nimport { persist, createJSONStorage } from 'zustand/middleware';\n`;
  fileContent += `import { Creator, Reel, Comment, Chat, Message, NotificationItem, TransactionItem, GiftType } from '../types';\n`;
  fileContent += `import { generateMockDatabase, MOCK_COMMENTS } from '../services/mockApi';\n`;
  fileContent += `import { getHaversineDistance } from '../services/geoService';\n`;
  fileContent += `import { apiClient } from '../api/client';\n`;
  fileContent += `import { mmkvStoreStorage } from './storage';\n\n`;
  
  // Some stores need other stores. We can import them all from index for now, or from their specific files.
  // Actually, importing them all from index causes cycles if not careful, but let's see.
  
  fileContent += `// ==========================================\n// ${titleBlock}\n// ==========================================\n`;
  fileContent += codeBlock;

  fs.writeFileSync(path.join(__dirname, 'src', 'store', fileName), fileContent);
  generatedFiles.push(fileName);
}

// Generate new index.ts
let newIndexContent = `export * from './storage';\n`;
for (const file of generatedFiles) {
  newIndexContent += `export * from './${file.replace('.ts', '')}';\n`;
}

fs.writeFileSync(path.join(__dirname, 'src', 'store', 'index.ts'), newIndexContent);

console.log('Split completed!');
