import fs from 'fs';
import path from 'path';

const projectDir = '/Users/eds/Desktop/projects/Portal need to do/aqua-portal-v9-main/Templates';

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (let item of list) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      getFiles(itemPath, files);
    } else if (itemPath.endsWith('registry.ts') || itemPath.endsWith('registry.tsx')) {
      files.push(itemPath);
    }
  }
  return files;
}

const files = getFiles(projectDir);
const ids = new Set();

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/id:\s*['"]([^'"]+)['"]/);
  if (match) ids.add(match[1]);
});

console.log(Array.from(ids).join(', '));
