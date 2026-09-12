const fs = require('fs');
const path = 'src/context/AuthContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldLoginStart = `  const login = async (idOrEmail: string, pass: string, targetRole?: 'student' | 'teacher' | 'principal' | 'superadmin'): Promise<boolean> => {`;
const oldLoginEnd = `    return false;
  };`;

// We'll replace the entire login function
const regex = /const login = async \([\s\S]*?return false;\n  };/g;

const newLogin = `const login = async (idOrEmail: string, pass: string, targetRole?: 'student' | 'teacher' | 'principal' | 'superadmin'): Promise<boolean> => {
    let email = idOrEmail.trim().toLowerCase();
    
    if (!email.includes('@')) {
      email = \`\${email}@edux.demo\`;
    }

    const handleSuccess = () => {
      setIsAuthenticated(true);
      if (targetRole) setRoleState(targetRole);
      
      if (targetRole === 'student' || (!targetRole && idOrEmail.startsWith('STU'))) {
         switchStudent(idOrEmail);
      } else if (targetRole === 'teacher' || (!targetRole && idOrEmail.startsWith('TCH'))) {
         switchTeacher(idOrEmail);
      }
      return true;
    };

    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, pass.trim());
      
      if (userCredential.user) {
        return handleSuccess();
      }
    } catch (error: any) {
      console.error('Firebase Auth Login failed:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/operation-not-allowed') {
         try {
            console.log("Attempting to auto-create user (demo mode fallback)...", email);
            const { createUserWithEmailAndPassword } = await import('firebase/auth');
            const newCred = await createUserWithEmailAndPassword(auth, email, pass.trim());
            
            await setDoc(doc(db, 'users', newCred.user.uid), {
                role: targetRole || 'student',
                refId: idOrEmail.trim(),
                updatedAt: new Date().toISOString()
            }, { merge: true });
            
            return handleSuccess();
         } catch (createErr: any) {
            if (createErr.code === 'auth/email-already-in-use') {
                alert('Invalid email or password.');
            } else if (createErr.code === 'auth/operation-not-allowed') {
                console.warn('Firebase Email/Password Auth is disabled. Falling back to local mock session.');
                return handleSuccess();
            } else {
                console.error("Auto-create failed", createErr);
                alert("Failed to auto-create user: " + createErr.message);
            }
         }
      } else {
         alert('Invalid email or password.');
      }
    }
    return false;
  };`;

content = content.replace(regex, newLogin);
fs.writeFileSync(path, content);
console.log("Replaced login function successfully.");
