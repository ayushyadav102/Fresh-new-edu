const fs = require('fs');

let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

const startIndex = code.indexOf("const login = (idOrEmail: string, pass: string, targetRole?: 'student' | 'teacher' | 'principal' | 'superadmin'): boolean => {");
if (startIndex !== -1) {
    // Find the end of this function. Since it's big, we can just find the next function definition:
    const endIndex = code.indexOf("const logout = async () => {", startIndex);
    
    if (endIndex !== -1) {
        const prefix = code.substring(0, startIndex);
        const suffix = code.substring(endIndex);
        
        const newLoginLogic = `const login = async (idOrEmail: string, pass: string, targetRole?: 'student' | 'teacher' | 'principal' | 'superadmin'): Promise<boolean> => {
    let email = idOrEmail.trim().toLowerCase();
    
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
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        const demoPasswords = ['piyush123', 'principal123', 'SuperAdmin#Xavier2026'];
        if (demoPasswords.includes(pass.trim())) {
           try {
              console.log("Auto-creating demo user...", email);
              const { createUserWithEmailAndPassword } = await import('firebase/auth');
              const newCred = await createUserWithEmailAndPassword(auth, email, pass.trim());
              
              await setDoc(doc(db, 'users', newCred.user.uid), {
                  role: targetRole || 'student',
                  refId: idOrEmail.trim(),
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
  };\n\n  `;
        
        fs.writeFileSync('src/context/AuthContext.tsx', prefix + newLoginLogic + suffix);
        console.log("Successfully replaced login logic!");
    } else {
        console.log("Could not find endIndex");
    }
} else {
    console.log("Could not find startIndex");
}

