const fs = require('fs');
const files = [
  'src/components/auth/LoginScreen.tsx',
  'src/context/ERPContext.tsx',
  'src/context/AuthContext.tsx'
];

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/import \{ DEFAULT_SUPER_ADMIN \} from '\.\.\/data\/superAdminMockData';/, '');
  code = code.replace(/import \{[\s\S]*?\} from '\.\.\/data\/superAdminMockData';/, '');
  fs.writeFileSync(f, code);
});
