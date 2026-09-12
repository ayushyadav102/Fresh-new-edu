const fs = require('fs');
let authCode = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

// The original logic checks hardcoded passwords. 
// We must swap this to actually call Firebase Auth signInWithEmailAndPassword or use a cloud function.
// However, to keep it simple and fulfill the "real authentication via Firebase Auth" requirement,
// we will replace `login` to call Firebase Auth (signInWithEmailAndPassword).
// The user will need real Firebase accounts.

const newLoginLogic = `
  const login = async (idOrEmail: string, pass: string, targetRole?: 'student' | 'teacher' | 'principal' | 'superadmin'): Promise<boolean> => {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, idOrEmail.trim(), pass.trim());
      
      if (userCredential.user) {
        // Successful real authentication!
        // We do not rely on localStorage anymore. The onAuthStateChanged listener handles it.
        return true;
      }
    } catch (error) {
      console.error('Firebase Auth Login failed:', error);
      alert('Invalid email or password.');
    }
    return false;
  };
`;

authCode = authCode.replace(/const login = \(idOrEmail: string, pass: string, targetRole\?: 'student' \| 'teacher' \| 'principal' \| 'superadmin'\): boolean => \{[\s\S]*?return false;\n  \};/, newLoginLogic);

// Also change the type of `login` in the AuthContextType
authCode = authCode.replace(/login: \(idOrEmail: string, pass: string, targetRole\?: 'student' \| 'teacher' \| 'principal' \| 'superadmin'\) => boolean;/, "login: (idOrEmail: string, pass: string, targetRole?: 'student' | 'teacher' | 'principal' | 'superadmin') => Promise<boolean>;");

fs.writeFileSync('src/context/AuthContext.tsx', authCode);
