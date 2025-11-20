const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('Usage: node check_braces.js <file>'); process.exit(2); }
const s = fs.readFileSync(path, 'utf8');
let stack = [];
const open = { '{': '}', '(': ')', '[': ']' };
const close = { '}': '{', ')': '(', ']': '[' };
let line = 1;
for (let i=0;i<s.length;i++){
  const ch = s[i];
  if (ch === '\n') line++;
  if (open[ch]) stack.push({ch, line, idx: i});
  else if (close[ch]) {
    if (stack.length === 0) {
      console.error('Unmatched closing', ch, 'at line', line);
      process.exit(1);
    }
    const top = stack.pop();
    if (top.ch !== close[ch]) {
      console.error('Mismatched', top.ch, 'opened at line', top.line, "but closed by", ch, 'at line', line);
      process.exit(1);
    }
  }
}
if (stack.length) {
  const top = stack.pop();
  console.error('Unclosed', top.ch, 'opened at line', top.line);
  process.exit(1);
}
console.log('Braces balanced');
