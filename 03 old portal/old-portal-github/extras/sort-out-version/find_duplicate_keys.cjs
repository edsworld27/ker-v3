const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('src', (filePath) => {
  if (!filePath.endsWith('.tsx')) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = /key=(["'])(.*?)\1/g;
  const keys = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.push(match[2]);
  }
  const counts = {};
  keys.forEach(k => counts[k] = (counts[k] || 0) + 1);
  for (const [k, v] of Object.entries(counts)) {
    if (v > 1) {
      console.log(`Duplicate key in ${filePath}: ${k} (${v} times)`);
    }
  }
});
