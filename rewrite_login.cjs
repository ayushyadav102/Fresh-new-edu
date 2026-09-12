const fs = require('fs');

let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

const newLoginLogic = `
  const login = async (idOrEmail: string, pass: string, targetRole?: 'student' | 'teacher' | 'principal' | 'superadmin'): Promise<boolean> => {
    let email = idOrEmail.trim().toLowerCase();
    
    // Auto-map IDs to emails so Firebase Auth works smoothly for testing
    if (!email.includes('@')) {
      email = \`\${email}@edux.demo\`;
    }

    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, pass.trim());
      
      if (userCredential.user) {
        return true;
      }
    } catch (error: any) {
      console.error('Firebase Auth Login failed:', error);
      
      // Developer Convenience: Auto-create the demo user if they don't exist yet!
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        const demoPasswords = ['piyush123', 'principal123', 'SuperAdmin#Xavier2026'];
        if (demoPasswords.includes(pass.trim())) {
           try {
              console.log("Auto-creating demo user...", email);
              const { createUserWithEmailAndPassword } = await import('firebase/auth');
              const newCred = await createUserWithEmailAndPassword(auth, email, pass.trim());
              
              // Write the user's role to the DB
              await setDoc(doc(db, 'users', newCred.user.uid), {
                  role: targetRole || 'student',
                  refId: idOrEmail.trim(), // Original ID
                  updatedAt: new Date().toISOString()
              }, { merge: true });
              
              return true;
           } catch (createErr: any) {
              console.error("Auto-create failed", createErr);
              alert("Failed to auto-create demo user: " + createErr.message);
           }
        }
      }
      
      alert('Invalid email or password.');
    }
    return false;
  };
`;

// Replace the entire login function block
code = code.replace(/const login = \(idOrEmail: string, pass: string[\s\S]*?return false;\n  \};/, newLoginLogic.trim());

// Also change the type of `login` in the AuthContextType just in case
code = code.replace(/login: \(idOrEmail: string, pass: string, targetRole\?: 'student' \| 'teacher' \| 'principal' \| 'superadmin'\) => boolean;/, "login: (idOrEmail: string, pass: string, targetRole?: 'student' | 'teacher' | 'principal' | 'superadmin') => Promise<boolean>;");

fs.writeFileSync('src/context/AuthContext.tsx', code);
