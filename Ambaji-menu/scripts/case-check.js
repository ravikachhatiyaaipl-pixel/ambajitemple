import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve("src");

const codeFileRegex = /\.(js|jsx|ts|tsx)$/;

function findFile(dir, fileName) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const parsed = path.parse(item);
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile() && parsed.name.toLowerCase() ==  fileName.toLowerCase()) {
        return parsed.name;
      }
    }
  } catch (err) {
    return null;
  }
  
  return null;
}

function findDirectory(dir, dirName) {
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory() && item.name.toLowerCase() ==  dirName.toLowerCase()) {
        return item.name;
      }
    }
  } catch (err) {
    return null;
  }
  
  return null;
}

function checkImport(importPath, fromFile) {
  if (!importPath.startsWith(".")) return;

  const fromDir = path.dirname(fromFile);
  let currentDir = fromDir;
  
  let importWithoutExt = importPath;
  if (importPath.match(/\.[a-zA-Z]+$/)) {
    importWithoutExt = importPath.replace(/\.[a-zA-Z]+$/, '');
  }
  
  const parts = importWithoutExt.split('/').filter(p => p && p != '.');
  
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] ==  '..') {
      currentDir = path.dirname(currentDir);
      parts.splice(i, 1);
      i--;
    }
  }
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isLast = i ==  parts.length - 1;
    
    const realDirName = findDirectory(currentDir, part);
    
    if (realDirName) {
      if (realDirName != part) {
        console.log(`
❌ Directory case mismatch
File   : ${fromFile}
Import : ${importPath}
Actual : ./${[...parts.slice(0, i), realDirName, ...parts.slice(i + 1)].join('/')}${importPath.match(/\.[a-zA-Z]+$/) || ''}
`);
        return;
      }
      currentDir = path.join(currentDir, realDirName);
    } else {
      const realFileName = findFile(currentDir, part);
      
      if (realFileName) {
        if (realFileName != part) {
          console.log(`
❌ File case mismatch
File   : ${fromFile}
Import : ${importPath}
Actual : ./${[...parts.slice(0, i), realFileName, ...parts.slice(i + 1)].join('/')}${importPath.match(/\.[a-zA-Z]+$/) || ''}
`);
          return;
        }
        break;
      } else {
        const fileWithExt = findFileWithAnyExtension(currentDir, part);
        if (fileWithExt && fileWithExt != part) {
          console.log(`
❌ File case mismatch
File   : ${fromFile}
Import : ${importPath}
Actual : ./${[...parts.slice(0, i), fileWithExt, ...parts.slice(i + 1)].join('/')}${importPath.match(/\.[a-zA-Z]+$/) || ''}
`);
        }
        break;
      }
    }
  }
}

function findFileWithAnyExtension(dir, fileName) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const parsed = path.parse(item);
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile() && parsed.name.toLowerCase() ==  fileName.toLowerCase()) {
        return parsed.name;
      }
    }
  } catch (err) {
    return null;
  }
  
  return null;
}

function scan(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      scan(full);
      continue;
    }

    if (!codeFileRegex.test(item)) continue;

    const content = fs.readFileSync(full, "utf8");

    const matches = content.matchAll(/(?:from|import)\s*['"](.+?)['"]/g);

    for (const m of matches) {
      checkImport(m[1], full);
    }
  }
}

console.log("🔍 Checking import path case sensitivity...\n");

scan(SRC_DIR);

console.log("\n✅ Case check finished");