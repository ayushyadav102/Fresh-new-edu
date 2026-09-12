const fs = require('fs');
const path = 'src/context/AuthContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldLogic = `      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
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
      }`;

const newLogic = `      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
         try {
            console.log("Attempting to auto-create user (demo mode fallback)...", email);
            const { createUserWithEmailAndPassword } = await import('firebase/auth');
            const newCred = await createUserWithEmailAndPassword(auth, email, pass.trim());
            
            await setDoc(doc(db, 'users', newCred.user.uid), {
                role: targetRole || 'student',
                refId: idOrEmail.trim(),
                updatedAt: new Date().toISOString()
            }, { merge: true });
            
            return true;
         } catch (createErr: any) {
            if (createErr.code === 'auth/email-already-in-use') {
                // User exists, so the original error was indeed a wrong password
                alert('Invalid email or password.');
            } else {
                console.error("Auto-create failed", createErr);
                alert("Failed to auto-create user: " + createErr.message);
            }
         }
      }`;

if (content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync(path, content);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find the target string!");
}
