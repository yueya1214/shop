import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES模块中获取__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 将回调API转换为Promise
const readFileAsync = (path) => fs.promises.readFile(path, 'utf8');
const writeFileAsync = (path, data) => fs.promises.writeFile(path, data, 'utf8');
const readdirAsync = (path) => fs.promises.readdir(path);
const statAsync = (path) => fs.promises.stat(path);

// 冲突标记

// 递归获取所有文件
async function getAllFiles(dir, fileList = []) {
  const files = await readdirAsync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await statAsync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist' && file !== '.git') {
      fileList = await getAllFiles(filePath, fileList);
    } else if (stat.isFile()) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// 修复文件中的合并冲突
async function fixConflict(filePath) {
  try {
    // 读取文件内容
    let content = await readFileAsync(filePath);
    
    // 检查是否有合并冲突
    if (!content.includes(START_MARKER)) {
      return false;
    }
    
    console.log(`修复文件: ${filePath}`);
    
    // 处理方法：保留第一个版本（HEAD）
    let inConflict = false;
    let skipContent = false;
    
    const lines = content.split('\n');
    const result = [];
    
    for (const line of lines) {
      if (line.includes(START_MARKER)) {
        inConflict = true;
        skipContent = false;
        continue;
      }
      
      if (inConflict && line.includes(MIDDLE_MARKER)) {
        skipContent = true;
        continue;
      }
      
      if (inConflict && line.includes(END_MARKER)) {
        inConflict = false;
        skipContent = false;
        continue;
      }
      
      if (!skipContent) {
        result.push(line);
      }
    }
    
    // 写入修复后的内容
    await writeFileAsync(filePath, result.join('\n'));
    return true;
  } catch (error) {
    console.error(`无法修复文件 ${filePath}:`, error);
    return false;
  }
}

// 主函数
async function main() {
  try {
    // 获取所有文件
    const files = await getAllFiles('.');
    let fixedCount = 0;
    
    // 修复每个文件中的合并冲突
    for (const file of files) {
      const fixed = await fixConflict(file);
      if (fixed) {
        fixedCount++;
      }
    }
    
    console.log(`已修复 ${fixedCount} 个文件中的合并冲突`);
  } catch (error) {
    console.error('处理时发生错误:', error);
  }
}

main(); 