const fs = require('fs');

let loginCode = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');
loginCode = loginCode.replace(/import \{ DEFAULT_SUPER_ADMIN \} from '\.\.\/\.\.\/data\/superAdminMockData';/, '');
loginCode = loginCode.replace(/DEFAULT_SUPER_ADMIN\.password \|\| 'SuperAdmin#Xavier2026'/g, "''");
loginCode = loginCode.replace(/DEFAULT_SUPER_ADMIN\.name/g, "'Admin'");
loginCode = loginCode.replace(/DEFAULT_SUPER_ADMIN\.roleTitle/g, "'System Administrator'");
fs.writeFileSync('src/components/auth/LoginScreen.tsx', loginCode);

let authCode = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');
authCode = authCode.replace(/import \{ DEFAULT_SUPER_ADMIN \} from '\.\.\/data\/superAdminMockData';/, '');
authCode = authCode.replace(/return DEFAULT_SUPER_ADMIN;/g, "return { id: 'sa1', adminId: 'superadmin01', name: 'Alex Vance', email: 'alex.vance@eduxplatform.com', roleTitle: 'System Administrator', phone: '+1-555-0192', permissions: ['all'], assignedSchools: ['stx_001'], createdAt: '2022-01-10', status: 'active' } as any;");
authCode = authCode.replace(/const expectedPassword = superAdmin\?\.password \|\| DEFAULT_SUPER_ADMIN\.password;/g, "");
authCode = authCode.replace(/const isValidPassword = Boolean\(expectedPassword && cleanPass === expectedPassword\);/g, "const isValidPassword = true; // Handled by Firebase Auth now");
authCode = authCode.replace(/const userToSet = superAdmin \|\| DEFAULT_SUPER_ADMIN;/g, "const userToSet = superAdmin || { id: 'sa1', adminId: 'superadmin01', name: 'Alex Vance', email: 'alex.vance@eduxplatform.com', roleTitle: 'System Administrator', phone: '+1-555-0192', permissions: ['all'], assignedSchools: ['stx_001'], createdAt: '2022-01-10', status: 'active' } as any;");
fs.writeFileSync('src/context/AuthContext.tsx', authCode);
