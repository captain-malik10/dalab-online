import fs from 'fs';
import path from 'path';

const targetDir = './app'; // Directory to search for files
const commentRegex = /{[/][*].*?[*][/]}/gs; // Regex to match {/* ... */} comments

function removeCommentsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    content = content.replace(commentRegex, '');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleaned comments in: ${filePath}`);
    } else {
      console.log(`No comments found or changed in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath); // Recurse into subdirectories
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.jsx'))) {
      removeCommentsInFile(fullPath);
    }
  }
}

console.log(`Starting to remove JSX comments in ${targetDir}...`);
processDirectory(targetDir);
console.log('Finished removing JSX comments.');
