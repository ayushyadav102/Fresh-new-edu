import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile, TeacherProfile, PrincipalProfile, SuperAdminProfile, UserRole } from '../types';
import { DEMO_STUDENTS, DEMO_TEACHERS, DEFAULT_PRINCIPAL } from '../data/mockData';

import { auth, db, doc, setDoc } from '../firebase';
import { onAuthStateChanged, signOut as fbSignOut, signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc } from 'firebase/firestore';
import { isMockDataEnabled } from '../config/dataConfig';


const writeUserRoleToFirestore = async (userRole: string, refId: string) => {
  if (isMockDataEnabled()) return;
  try {
    let currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('Skipping write: Not authenticated'); return;
    }
    if (currentUser?.uid) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        role: userRole,
        refId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    console.warn('Failed to sync user role to Firestore users/{uid}:', err);
  }
};

interface AuthContextType {
  role: 'student' | 'teacher' | 'principal' | 'superadmin';
  student: StudentProfile | null;
  teacher: TeacherProfile | null;
  principal: PrincipalProfile | null;
  superAdmin: SuperAdminProfile | null;
  isAuthenticated: boolean;
  setRole: (role: 'student' | 'teacher' | 'principal' | 'superadmin') => void;
  login: (idOrEmail: string, pass: string, targetRole?: 'student' | 'teacher' | 'principal' | 'superadmin') => Promise<boolean>;
  logout: () => Promise<void> | void;
  switchStudent: (studentId: string) => void;
  switchTeacher: (teacherId: string) => void;
  updateProfile: (updated: Partial<StudentProfile>) => void;
  updateTeacherProfile: (updated: Partial<TeacherProfile>) => void;
  updatePrincipalProfile: (updated: Partial<PrincipalProfile>) => void;
  updateSuperAdminProfile: (updated: Partial<SuperAdminProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [role, setRoleState] = useState<'student' | 'teacher' | 'principal' | 'superadmin'>(() => {
    const savedRole = localStorage.getItem('edux_role');
    if (savedRole === 'superadmin') return 'superadmin';
    if (savedRole === 'principal') return 'principal';
    return savedRole === 'teacher' ? 'teacher' : 'student';
  });

  const [student, setStudent] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem('edux_student');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id || parsed.studentId || parsed.name)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse student session', e);
      }
    }
    return DEMO_STUDENTS[0]; // Piyush Panwar (Class 11, Roll 01)
  });

  const [teacher, setTeacher] = useState<TeacherProfile | null>(() => {
    const saved = localStorage.getItem('edux_teacher');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse teacher session', e);
      }
    }
    return DEMO_TEACHERS[0]; // Mr. Rajesh Sharma (PGT Physics, Class 11)
  });

  const [principal, setPrincipal] = useState<PrincipalProfile | null>(() => {
    const saved = localStorage.getItem('edux_principal');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse principal session', e);
      }
    }
    return DEFAULT_PRINCIPAL; // Dr. Arvind Swaminathan
  });

  const [superAdmin, setSuperAdmin] = useState<SuperAdminProfile | null>(() => {
    const saved = localStorage.getItem('edux_superadmin');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse superadmin session', e);
      }
    }
    // NOTE: password is only ever used in local mock mode (isMockDataEnabled()).
    // In real Firebase mode this field is ignored — login() never compares
    // passwords locally, it always defers to Firebase Auth.
    return { id: 'sa1', adminId: 'superadmin01', name: 'Alex Vance', email: 'alex.vance@eduxplatform.com', roleTitle: 'System Administrator', phone: '+1-555-0192', permissions: ['all'], assignedSchools: ['stx_001'], createdAt: '2022-01-10', status: 'active', password: 'SuperAdmin#Xavier2026' } as any; // Alex Vance
  });

  useEffect(() => {
    localStorage.setItem('edux_role', role);
  }, [role]);

  useEffect(() => {
    if (student) {
      localStorage.setItem('edux_student', JSON.stringify(student));
    }
  }, [student]);

  useEffect(() => {
    if (teacher) {
      localStorage.setItem('edux_teacher', JSON.stringify(teacher));
    }
  }, [teacher]);

  useEffect(() => {
    if (principal) {
      localStorage.setItem('edux_principal', JSON.stringify(principal));
    }
  }, [principal]);

  useEffect(() => {
    if (superAdmin) {
      localStorage.setItem('edux_superadmin', JSON.stringify(superAdmin));
    }
  }, [superAdmin]);

  // Sync role and refId to users/{firebaseUid} on authentication/restore
  useEffect(() => {
    if (role) {
      let refId = '';
      if (role === 'student') refId = student?.id || student?.studentId || '';
      else if (role === 'teacher') refId = teacher?.id || teacher?.teacherId || '';
      else if (role === 'principal') refId = principal?.id || principal?.principalId || '';
      else if (role === 'superadmin') refId = superAdmin?.id || superAdmin?.adminId || '';
      if (refId) {
        writeUserRoleToFirestore(role, refId);
      }
    }
  }, [role, student?.id, student?.studentId, teacher?.id, teacher?.teacherId, principal?.id, principal?.principalId, superAdmin?.id, superAdmin?.adminId]);

  const setRole = (newRole: 'student' | 'teacher' | 'principal' | 'superadmin') => {
    setRoleState(newRole);
  };

  const login = async (idOrEmail: string, pass: string, targetRole?: 'student' | 'teacher' | 'principal' | 'superadmin'): Promise<boolean> => {
    const cleanQuery = idOrEmail.trim().toLowerCase();
    const cleanPass = pass.trim();
    if (!cleanQuery || !cleanPass) return false;

    // ---------------------------------------------------------------------
    // MOCK MODE: fully local, offline demo. Never calls Firebase Auth and
    // never writes to Firestore, so it is safe for the well-known demo
    // passwords in mockData.ts to live here — no real backend is reachable
    // through this path.
    // ---------------------------------------------------------------------
    if (isMockDataEnabled()) {
      if (targetRole === 'superadmin') {
        const admin: any = superAdmin;
        const match = admin && (cleanQuery === (admin.adminId || '').toLowerCase() || cleanQuery === (admin.email || '').toLowerCase() || cleanQuery === 'superadmin01' || cleanQuery === 'superadmin') && admin.password && cleanPass === admin.password;
        if (match) {
          setRoleState('superadmin');
          setIsAuthenticated(true);
          return true;
        }
        return false;
      }
      if (targetRole === 'principal') {
        const p: any = principal || DEFAULT_PRINCIPAL;
        const match = (cleanQuery === (p.principalId || '').toLowerCase() || cleanQuery === (p.email || '').toLowerCase() || cleanQuery === 'prn001' || cleanQuery === 'principal') && p.password && cleanPass === p.password;
        if (match) {
          setPrincipal(p);
          setRoleState('principal');
          setIsAuthenticated(true);
          return true;
        }
        return false;
      }
      if (targetRole === 'teacher') {
        const found = DEMO_TEACHERS.find((t: any) => t.teacherId.toLowerCase() === cleanQuery || t.email.toLowerCase() === cleanQuery || t.name.toLowerCase() === cleanQuery);
        if (found && (found as any).password && cleanPass === (found as any).password) {
          setTeacher(found);
          setRoleState('teacher');
          setIsAuthenticated(true);
          return true;
        }
        return false;
      }
      // Default: student
      const found = DEMO_STUDENTS.find((s: any) =>
        (s.studentId || '').toLowerCase() === cleanQuery ||
        (s.id || '').toLowerCase() === cleanQuery ||
        (s.email || '').toLowerCase() === cleanQuery ||
        (s.name || '').toLowerCase() === cleanQuery
      );
      if (found && (found as any).password && cleanPass === (found as any).password) {
        setStudent(found);
        setRoleState('student');
        setIsAuthenticated(true);
        return true;
      }
      return false;
    }

    // ---------------------------------------------------------------------
    // REAL FIREBASE MODE: only signs in to accounts that already exist.
    // Accounts and their role/refId must be provisioned by an admin through
    // a trusted server-side path (Cloud Function / Express + Admin SDK).
    // This function NEVER creates accounts and NEVER trusts the role tab
    // the person clicked in the UI — the role always comes from the
    // server-stored users/{uid} document.
    // ---------------------------------------------------------------------
    let email = cleanQuery;
    if (!email.includes('@')) {
      email = `${email}@edux.demo`;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, cleanPass);
      if (!userCredential.user) return false;

      const userSnap = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userSnap.exists() ? (userSnap.data() as any) : null;

      if (!userData?.role) {
        alert('Your account has not been assigned a role yet. Please contact your school administrator.');
        await fbSignOut(auth);
        return false;
      }

      setRoleState(userData.role);
      setIsAuthenticated(true);
      if (userData.role === 'student' && userData.refId) switchStudent(userData.refId);
      else if (userData.role === 'teacher' && userData.refId) switchTeacher(userData.refId);
      return true;
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found' && error.code !== 'auth/invalid-credential') {
        console.error('Firebase Auth Login failed:', error);
      }
      alert('Invalid email or password.');
      return false;
    }
  };

  const logout = async () => {
    try { await fbSignOut(auth); } catch (e) {}
    setIsAuthenticated(false);
    
  };

  const switchStudent = (studentId: string) => {
    let allAvailableStudents = [...DEMO_STUDENTS];
    try {
      const savedStudents = localStorage.getItem('edux_students');
      if (savedStudents) {
        const parsed = JSON.parse(savedStudents);
        if (Array.isArray(parsed)) {
          const existingIds = new Set(allAvailableStudents.map(s => s.studentId || s.id));
          parsed.forEach(s => {
            if (!existingIds.has(s.studentId || s.id)) {
              allAvailableStudents.push(s);
            }
          });
        }
      }
    } catch {
      // ignore
    }

    const q = studentId.trim().toLowerCase();
    const qClean = q.replace(/[^a-z0-9]/g, '');

    const found = allAvailableStudents.find((s) => {
      const sId = (s.studentId || '').toLowerCase();
      const id = (s.id || '').toLowerCase();
      const sIdClean = sId.replace(/[^a-z0-9]/g, '');
      const idClean = id.replace(/[^a-z0-9]/g, '');
      const rollNo = (s.rollNo || '').toString().toLowerCase();
      const name = (s.name || '').toLowerCase();

      return (
        sId === q ||
        id === q ||
        sIdClean === qClean ||
        idClean === qClean ||
        rollNo === q ||
        name === q ||
        name.includes(q)
      );
    });

    if (found) {
      setStudent(found);
      localStorage.setItem('edux_student', JSON.stringify(found));
    }
  };

  const switchTeacher = (teacherId: string) => {
    const found = DEMO_TEACHERS.find((t) => t.teacherId === teacherId);
    if (found) {
      setTeacher(found);
    }
  };

  const updateProfile = (updated: Partial<StudentProfile>) => {
    if (student) {
      setStudent({ ...student, ...updated });
    }
  };

  const updateTeacherProfile = (updated: Partial<TeacherProfile>) => {
    if (teacher) {
      setTeacher({ ...teacher, ...updated });
    }
  };

  const updatePrincipalProfile = (updated: Partial<PrincipalProfile>) => {
    if (principal) {
      setPrincipal({ ...principal, ...updated });
    }
  };

  const updateSuperAdminProfile = (updated: Partial<SuperAdminProfile>) => {
    if (superAdmin) {
      setSuperAdmin({ ...superAdmin, ...updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        student,
        teacher,
        principal,
        superAdmin,
        isAuthenticated,
        setRole,
        login,
        logout,
        switchStudent,
        switchTeacher,
        updateProfile,
        updateTeacherProfile,
        updatePrincipalProfile,
        updateSuperAdminProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

