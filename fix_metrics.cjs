const fs = require('fs');
const path = 'src/context/ERPContext.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'return saved ? JSON.parse(saved) : [];\n      } catch {\n        return [];',
  'return saved ? JSON.parse(saved) : {};\n      } catch {\n        return {};'
);

fs.writeFileSync(path, content);
