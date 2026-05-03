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

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Regex to match named component imports from local files
  // Exclude setup, types, lucide-react, react, etc.
  const importRegex = /^import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([.\/]+.*?)['"];?/gm;
  
  let hasChanges = false;
  let newContent = content.replace(importRegex, (match, importsStr, importPath) => {
    // Skip if it's setup or not a component (like setup, types)
    if (importPath.endsWith('setup') || importPath.endsWith('types') || importPath.includes('lucide-react') || importPath.includes('lucide') || importPath.includes('@/AppShell')) {
      return match;
    }
    
    // Parse the imports
    const imports = importsStr.split(',').map(s => s.trim()).filter(Boolean);
    
    let lazyDeclarations = [];
    let keepImports = [];
    
    for (const imp of imports) {
      let parts = imp.split(/\s+as\s+/);
      let original = parts[0].trim();
      let alias = parts[1] ? parts[1].trim() : null;
      const name = alias || original;
      
      // Only convert to lazy if it looks like a component (starts with uppercase)
      if (/^[A-Z]/.test(name)) {
        lazyDeclarations.push(`const ${name} = lazy(() => import('${importPath}').then(m => ({ default: m.${original} })));`);
        hasChanges = true;
      } else {
        // Keep it as a normal import
        keepImports.push(imp);
      }
    }
    
    let result = '';
    if (keepImports.length > 0) {
      result += `import { ${keepImports.join(', ')} } from '${importPath}';\n`;
    }
    if (lazyDeclarations.length > 0) {
      result += lazyDeclarations.join('\n');
    }
    return result || match;
  });

  // Handle default imports
  const defaultImportRegex = /^import\s+([A-Z]\w+)\s+from\s+['"]([.\/]+.*?)['"];?/gm;
  newContent = newContent.replace(defaultImportRegex, (match, name, importPath) => {
    if (importPath.endsWith('setup') || importPath.endsWith('types') || importPath.includes('lucide-react') || importPath.includes('@/AppShell')) {
      return match;
    }
    hasChanges = true;
    return `const ${name} = lazy(() => import('${importPath}').then(m => ({ default: m.default || m.${name} })));`;
  });

  if (hasChanges) {
    if (!newContent.includes('import React, { lazy }') && !newContent.includes('import { lazy }')) {
      // Check if 'import React' exists
      if (newContent.includes('import React from')) {
        newContent = newContent.replace(/import React(?!,)/, 'import React, { lazy }');
      } else if (newContent.includes('import * as React')) {
        newContent = newContent.replace(/import \* as React from ['"]react['"];?/, `import * as React from 'react';\nimport { lazy } from 'react';`);
      } else {
        newContent = `import React, { lazy } from 'react';\n` + newContent;
      }
    }
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated: ${filePath}`);
  }
}

files.forEach(processFile);
console.log('Done refactoring registries.');
