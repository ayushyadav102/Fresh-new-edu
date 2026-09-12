const fs = require('fs');
const path = 'src/context/ERPContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// Just replace implicitly any with explicit : any
content = content.replace(/\(err\)/g, '(err: any)');
content = content.replace(/\(l\)/g, '(l: any)');
content = content.replace(/\(l, idx\)/g, '(l: any, idx: any)');
content = content.replace(/\(x, y\)/g, '(x: any, y: any)');
content = content.replace(/\(s\)/g, '(s: any)');
content = content.replace(/\(sum, s\)/g, '(sum: any, s: any)');
content = content.replace(/\(prev\)/g, '(prev: any)');
content = content.replace(/\(m\)/g, '(m: any)');

// Some might be without parenthesis
content = content.replace(/ l =>/g, ' (l: any) =>');
content = content.replace(/ s =>/g, ' (s: any) =>');
content = content.replace(/ m =>/g, ' (m: any) =>');
content = content.replace(/ prev =>/g, ' (prev: any) =>');
content = content.replace(/ err =>/g, ' (err: any) =>');

fs.writeFileSync(path, content);
