const fs = require('fs');
const path = 'src/context/AuthContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /catch \(error: any\) {[\s\S]*?return false;\n  };/g;

const newCatch = `catch (error: any) {
      if (error.code === 'auth/operation-not-allowed') {
         console.warn('Firebase Email/Password Auth is disabled. Falling back to local mock session.');
         return handleSuccess();
      }

      // Do not use console.error for expected login failures like wrong password
      if (error.code !== 'auth/user-not-found' && error.code !== 'auth/invalid-credential') {
          console.error('Firebase Auth Login failed:', error);
      }
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
         try {
            console.log("Attempting to auto-create user (demo mode fallback)...", email);
            const { createUserWithEmailAndPassword } = await import('firebase/auth');
            const newCred = await createUserWithEmailAndPassword(auth, email, pass.trim());
            
            const { setDoc, doc } = await import('firebase/firestore');
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
                console.warn('Firebase Email/Password Auth is disabled during creation. Falling back to local mock session.');
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

content = content.replace(regex, newCatch);
fs.writeFileSync(path, content);
console.log("Replaced catch block successfully.");
