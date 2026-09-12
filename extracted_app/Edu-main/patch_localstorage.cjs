const fs = require('fs');
let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

// Replace the initialization of isAuthenticated from localStorage
code = code.replace(
  /const \[isAuthenticated, setIsAuthenticated\] = useState<boolean>\(\(\) => \{\n\s*return localStorage\.getItem\('edux_logged_in'\) === 'true';\n\s*\}\);/,
  "const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);"
);

// We should also replace all `localStorage.setItem('edux_logged_in', 'true');` with nothing
code = code.replace(/localStorage\.setItem\('edux_logged_in', 'true'\);/g, '');

// Also clean up `localStorage.removeItem('edux_logged_in');` in logout
code = code.replace(/localStorage\.removeItem\('edux_logged_in'\);/g, '');

fs.writeFileSync('src/context/AuthContext.tsx', code);
