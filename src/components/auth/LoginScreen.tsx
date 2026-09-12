import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { DEMO_STUDENTS, DEMO_TEACHERS, DEFAULT_PRINCIPAL } from '../../data/mockData';

import {
  GraduationCap,
  UserCheck,
  Crown,
  ShieldCheck,
  Building2,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Laptop,
  ChevronRight,
  Info,
  CheckCircle2,
  Sun,
  Moon,
  HelpCircle,
  LogIn
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [schoolId] = useState('SCH-EDUX-2026-XAVIER');
  const [loginRole, setLoginRole] = useState<'student' | 'teacher' | 'principal' | 'superadmin'>('student');
  const [idQuery, setIdQuery] = useState('STU20261101');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [studentClassFilter, setStudentClassFilter] = useState<'all' | '9' | '10' | '11' | '12'>('all');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idQuery.trim() || !password.trim()) {
      setError('Please enter both User ID and Password');
      return;
    }

    setError('');
    setIsLoading(true);

    setTimeout(async () => {
      const success = await login(idQuery, password, loginRole);
      if (!success) {
        if (loginRole === 'superadmin') {
          setError('Invalid Super Admin credentials. Click the Super Admin card below to auto-fill.');
        } else if (loginRole === 'principal') {
          setError('Invalid Principal ID or Password. Click the Principal card below to auto-fill.');
        } else if (loginRole === 'teacher') {
          setError('Invalid Teacher ID or Password. Click any teacher card below to auto-fill.');
        } else {
          setError('Invalid Student ID or Password. Click any student card below to auto-fill.');
        }
      }
      setIsLoading(false);
    }, 400);
  };

  const selectDemoStudent = (demoId: string, studentPass?: string) => {
    setLoginRole('student');
    setIdQuery(demoId);
    setPassword(studentPass || '');
    setError('');
  };

  const selectDemoTeacher = (teacherId: string, teacherPass?: string) => {
    setLoginRole('teacher');
    setIdQuery(teacherId);
    setPassword(teacherPass || '');
    setError('');
  };

  const selectDemoPrincipal = () => {
    setLoginRole('principal');
    setIdQuery('PRN001');
    setPassword('principal123');
    setError('');
  };

  const selectDemoSuperAdmin = () => {
    setLoginRole('superadmin');
    setIdQuery('superadmin01');
    setPassword('SuperAdmin#Xavier2026');
    setError('');
  };

  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };
  
  const getAvatarBg = (name: string) => {
    if (name.includes('Aarav') || name.includes('Admin')) return 'bg-indigo-600';
    if (name.includes('Ananya')) return 'bg-pink-500';
    if (name.includes('Sneha')) return 'bg-emerald-600';
    if (name.includes('Rohan')) return 'bg-amber-500';
    if (name.includes('Ayush') || name.includes('Yadav')) return 'bg-purple-600';
    if (name.includes('Principal')) return 'bg-rose-500';
    return 'bg-blue-600';
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen relative overflow-x-hidden flex flex-col justify-between selection:bg-indigo-500 selection:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .bg-grid-pattern {
          background-size: 32px 32px;
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.05) 1px, transparent 1px);
        }
      `}</style>
      
      {/* Ambient Background */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-200/50 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] bg-sky-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-60"></div>
      </div>

      {/* TopNavigationBar */}
      <header className="relative z-10 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 p-[1.5px] shadow-[0_4px_12px_-2px_rgba(99,102,241,0.2)]">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center shadow-inner">
                  <GraduationCap className="w-6 h-6 text-indigo-600" strokeWidth={2} />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-bold tracking-tight text-slate-900">Edu<span className="text-indigo-600">X</span></span>
                  <span className="text-[11px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">ERP</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide">Next-Gen Academic Management</p>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <div className="hidden sm:flex items-center space-x-2 text-slate-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-slate-800 tracking-tight">St. Xavier's Senior Secondary School</span>
              <span className="text-[11px] text-slate-500">(Affiliated to CBSE, New Delhi)</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All ERP Systems Operational</span>
            </div>
            <button className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span className="hidden md:inline">IT Helpdesk</span>
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
            >
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT COLUMN: Main Login Card (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="relative bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="absolute top-0 right-1/4 w-48 h-1.5 bg-gradient-to-r from-transparent via-indigo-500 to-cyan-400 rounded-full"></div>
              
              {/* Role Selector */}
              <div className="mb-8">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2.5">Select Portal Access Role</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-slate-100 border border-slate-200/70 rounded-2xl">
                  {['student', 'teacher', 'principal', 'superadmin'].map((role) => (
                    <button
                      key={role}
                      onClick={() => setLoginRole(role as any)}
                      className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl transition-all focus:outline-none ${
                        loginRole === role
                          ? 'bg-indigo-600 text-white shadow-sm font-semibold text-xs sm:text-sm focus:ring-2 focus:ring-indigo-400'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 font-medium text-xs sm:text-sm'
                      }`}
                      type="button"
                    >
                      {role === 'student' && <GraduationCap className={`w-4 h-4 ${loginRole !== 'student' ? 'text-slate-500' : ''}`} />}
                      {role === 'teacher' && <UserCheck className={`w-4 h-4 ${loginRole !== 'teacher' ? 'text-slate-500' : ''}`} />}
                      {role === 'principal' && <Crown className={`w-4 h-4 ${loginRole !== 'principal' ? 'text-slate-500' : ''}`} />}
                      {role === 'superadmin' && <ShieldCheck className={`w-4 h-4 ${loginRole !== 'superadmin' ? 'text-slate-500' : ''}`} />}
                      <span className="capitalize">{role === 'superadmin' ? 'Admin' : role}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Login Header & Subtitle */}
              <div className="mb-7">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  {loginRole === 'student' ? 'Student Sign In' :
                   loginRole === 'teacher' ? 'Teacher Sign In' :
                   loginRole === 'principal' ? 'Principal Sign In' :
                   'Super Admin Sign In'}
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Session 2026
                  </span>
                </h1>
                <p className="text-slate-500 text-sm mt-1.5">
                  {loginRole === 'student' ? 'Sign in to view your report card, attendance log, homework, and timetable.' :
                   loginRole === 'teacher' ? 'Sign in to manage classes, attendance, assignments, and student grades.' :
                   loginRole === 'principal' ? 'Sign in to monitor school analytics, timetables, and academic operations.' :
                   'Sign in to manage school settings, master data, and system configurations.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Main Authentication Form */}
              <form className="space-y-5" onSubmit={handleLoginSubmit}>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700" htmlFor="tenantId">
                      School Unique ID / Tenant Code
                    </label>
                    <span className="inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Active Tenant</span>
                    </span>
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <input 
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-sm tracking-wide focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-not-allowed selection:bg-indigo-100" 
                      id="tenantId" 
                      name="tenantId" 
                      readOnly 
                      type="text" 
                      value={schoolId}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5" htmlFor="studentRollId">
                    {loginRole === 'student' ? 'Student Roll ID / Email' :
                     loginRole === 'teacher' ? 'Teacher ID / Email' :
                     loginRole === 'principal' ? 'Principal ID / Email' :
                     'Super Admin ID'}
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input 
                      className="block w-full pl-11 pr-4 py-3 bg-slate-50/70 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                      id="studentRollId" 
                      name="studentRollId" 
                      placeholder={loginRole === 'student' ? "Enter Roll ID or Institutional Email" : "Enter ID or Email"}
                      type="text" 
                      value={idQuery}
                      onChange={(e) => setIdQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700" htmlFor="password">
                      Password
                    </label>
                    <a className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors" href="#forgot">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      className="block w-full pl-11 pr-11 py-3 bg-slate-50/70 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all tracking-wider" 
                      id="password" 
                      name="password" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      aria-label="Toggle password visibility" 
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input 
                      defaultChecked 
                      className="w-4 h-4 rounded bg-white border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-white" 
                      type="checkbox"
                    />
                    <span className="text-xs text-slate-600 font-medium select-none">Remember this device for 30 days</span>
                  </label>
                  <span className="inline-flex items-center space-x-1 text-[11px] text-slate-500">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    <span>256-Bit SSL Encrypted</span>
                  </span>
                </div>

                <div className="pt-2">
                  <button 
                    className="w-full relative group overflow-hidden py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-md shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed" 
                    type="submit"
                    disabled={isLoading}
                  >
                    <span>{isLoading ? 'Authenticating...' : `Enter ${loginRole === 'student' ? 'Student' : loginRole === 'teacher' ? 'Teacher' : loginRole === 'principal' ? 'Principal' : 'Admin'} App`}</span>
                    {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>
              </form>
              
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <Laptop className="w-4 h-4 text-slate-400" />
                  <span>Hardware-bound Smart Attendance sync ready</span>
                </div>
                <a className="text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center space-x-1 font-medium" href="#help">
                  <span>Need help logging in?</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Demo Credentials Sandbox (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xl shadow-slate-200/50 flex flex-col h-full max-h-[640px]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600"></span>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Demo Credentials Selector</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Click any profile card below to auto-fill sign in fields.</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 whitespace-nowrap">
                  Dev Sandbox
                </span>
              </div>
              
              {loginRole === 'student' && (
                <div className="py-4">
                  <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/70 overflow-x-auto text-xs">
                    <button 
                      onClick={() => setStudentClassFilter('all')}
                      className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex-1 text-center font-semibold ${studentClassFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`} 
                      type="button"
                    >
                      All ({DEMO_STUDENTS.length})
                    </button>
                    <button 
                      onClick={() => setStudentClassFilter('9')}
                      className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex-1 text-center font-semibold ${studentClassFilter === '9' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`} 
                      type="button"
                    >
                      Class 9
                    </button>
                    <button 
                      onClick={() => setStudentClassFilter('10')}
                      className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex-1 text-center font-semibold ${studentClassFilter === '10' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`} 
                      type="button"
                    >
                      Class 10
                    </button>
                    <button 
                      onClick={() => setStudentClassFilter('11')}
                      className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex-1 text-center font-semibold ${studentClassFilter === '11' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`} 
                      type="button"
                    >
                      Class 11
                    </button>
                    <button 
                      onClick={() => setStudentClassFilter('12')}
                      className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors flex-1 text-center font-semibold ${studentClassFilter === '12' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-white'}`} 
                      type="button"
                    >
                      Class 12
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {loginRole === 'student' && DEMO_STUDENTS.filter((s: any) => {
                  if (studentClassFilter === '9') return s.className.includes('9');
                  if (studentClassFilter === '10') return s.className.includes('10');
                  if (studentClassFilter === '11') return s.className.includes('11');
                  if (studentClassFilter === '12') return s.className.includes('12');
                  return true;
                }).map((stu: any) => (
                  <div 
                    key={stu.studentId}
                    onClick={() => selectDemoStudent(stu.studentId, stu.password)}
                    className={`group cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      idQuery === stu.studentId
                        ? 'bg-indigo-50/60 border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50 shadow-sm'
                        : 'bg-slate-50/80 border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="relative">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm ${getAvatarBg(stu.name)}`}>
                          {getAvatarInitials(stu.name)}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-sm font-semibold transition-colors ${idQuery === stu.studentId ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-600'}`}>{stu.name}</h3>
                          {idQuery === stu.studentId && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200">Selected</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                          <span>{stu.className} • Roll {stu.rollNo}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-600 text-[11px] font-medium">ID: {stu.studentId}</span>
                        </div>
                      </div>
                    </div>
                    <div className={idQuery === stu.studentId ? 'text-indigo-600 translate-x-0.5' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'}>
                      {idQuery === stu.studentId ? <LogIn className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                ))}

                {loginRole === 'teacher' && DEMO_TEACHERS.map((tech: any) => (
                  <div 
                    key={tech.id}
                    onClick={() => selectDemoTeacher(tech.teacherId, tech.password)}
                    className={`group cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      idQuery === tech.teacherId
                        ? 'bg-indigo-50/60 border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50 shadow-sm'
                        : 'bg-slate-50/80 border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="relative">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm ${getAvatarBg(tech.name)}`}>
                          {getAvatarInitials(tech.name)}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-sm font-semibold transition-colors ${idQuery === tech.teacherId ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-600'}`}>{tech.name}</h3>
                          {idQuery === tech.teacherId && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200">Selected</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                          <span>Class: {tech.classTeacherOf}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-600 text-[11px] font-medium">ID: {tech.teacherId}</span>
                        </div>
                      </div>
                    </div>
                    <div className={idQuery === tech.teacherId ? 'text-indigo-600 translate-x-0.5' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'}>
                      {idQuery === tech.teacherId ? <LogIn className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                ))}

                {loginRole === 'principal' && (
                  <div 
                    onClick={selectDemoPrincipal}
                    className={`group cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      idQuery === 'PRN001'
                        ? 'bg-indigo-50/60 border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50 shadow-sm'
                        : 'bg-slate-50/80 border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="relative">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm ${getAvatarBg('Principal')}`}>
                          {getAvatarInitials(DEFAULT_PRINCIPAL.name)}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-sm font-semibold transition-colors ${idQuery === 'PRN001' ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-600'}`}>{DEFAULT_PRINCIPAL.name}</h3>
                          {idQuery === 'PRN001' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200">Selected</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                          <span>{DEFAULT_PRINCIPAL.designation}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-600 text-[11px] font-medium">ID: PRN001</span>
                        </div>
                      </div>
                    </div>
                    <div className={idQuery === 'PRN001' ? 'text-indigo-600 translate-x-0.5' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'}>
                      {idQuery === 'PRN001' ? <LogIn className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                )}

                {loginRole === 'superadmin' && (
                  <div 
                    onClick={selectDemoSuperAdmin}
                    className={`group cursor-pointer p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      idQuery === 'superadmin01'
                        ? 'bg-indigo-50/60 border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50 shadow-sm'
                        : 'bg-slate-50/80 border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="relative">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm ${getAvatarBg('Admin')}`}>
                          {getAvatarInitials('Admin')}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-sm font-semibold transition-colors ${idQuery === 'superadmin01' ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-600'}`}>{'Admin'}</h3>
                          {idQuery === 'superadmin01' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200">Selected</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                          <span>{'System Administrator'}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-600 text-[11px] font-medium">ID: superadmin01</span>
                        </div>
                      </div>
                    </div>
                    <div className={idQuery === 'superadmin01' ? 'text-indigo-600 translate-x-0.5' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'}>
                      {idQuery === 'superadmin01' ? <LogIn className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Demo accounts reset every 24 hours</span>
                </span>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium" type="button">Export Mock Logins</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            © 2026 <span className="text-slate-800 font-semibold">EduX School ERP</span> by Edutech Global Inc. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <a className="hover:text-slate-800 transition-colors" href="#privacy">Privacy Policy</a>
            <a className="hover:text-slate-800 transition-colors" href="#terms">Terms of Service</a>
            <a className="hover:text-slate-800 transition-colors" href="#security">Security Certifications</a>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600 hidden sm:inline font-medium">Tenant: ST-XAVIER-DELHI</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
