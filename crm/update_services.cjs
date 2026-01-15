const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\bruni\\Downloads\\bbgpet2\\bbgpetpro\\crm\\screens\\Services.tsx';
const newContentPath = 'c:\\Users\\bruni\\Downloads\\bbgpet2\\bbgpetpro\\crm\\new_content.txt';

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

// We want to replace lines 440 to 919 (1-based) => indices 439 to 918 (0-based)
// Lines to keep: 0 to 438 (inclusive) AND 919 to end.

const startLines = lines.slice(0, 439);
const endLines = lines.slice(919);

const newContent = fs.readFileSync(newContentPath, 'utf8');

const newFileContent = [...startLines, newContent, ...endLines].join('\n');
fs.writeFileSync(filePath, newFileContent, 'utf8');
console.log('Update successful');
