const fs = require('fs');

let code = fs.readFileSync('src/context/AuthContext.tsx', 'utf8');

// Find imports
code = code.replace(
  "import { auth, db, doc, setDoc } from '../firebase';",
  "import { auth, db, doc, setDoc } from '../firebase';\nimport { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';\nimport { getDoc } from 'firebase/firestore';"
);

// We need to inject an effect to listen to auth state
const effectCode = `
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        // Fetch role from Firestore /users/{uid}
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRoleState(data.role as any);
            // In a real app we'd fetch the actual student/teacher/principal doc using refId
          }
        } catch (e) {
          console.error("Failed to fetch user role", e);
        }
      } else {
        setIsAuthenticated(false);
        setRoleState(null);
        setStudent(null);
        setTeacher(null);
        setPrincipal(null);
        setSuperAdmin(null);
      }
    });
    return () => unsubscribe();
  }, []);
`;

// Insert after state declarations
code = code.replace(
  "const [superAdmin, setSuperAdmin] = useState<SuperAdminProfile | null>(null);",
  "const [superAdmin, setSuperAdmin] = useState<SuperAdminProfile | null>(null);\n" + effectCode
);

// Update logout
code = code.replace(
  "const logout = () => {\n    setIsAuthenticated(false);",
  "const logout = async () => {\n    try { await fbSignOut(auth); } catch (e) {}\n    setIsAuthenticated(false);"
);
code = code.replace(/logout: \(\) => void;/, "logout: () => Promise<void> | void;");


fs.writeFileSync('src/context/AuthContext.tsx', code);
