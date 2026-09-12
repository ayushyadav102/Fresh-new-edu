import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { TeacherClassCode } from '../../types';
import { getTeacherScheduleFromTimetable } from '../../utils/timetableUtils';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  BookOpen,
  FileCheck2,
  Award,
  CreditCard,
  Bus,
  Home,
  Bell,
  MessageSquare,
  CalendarDays,
  UserCheck,
  Edit3,
  CheckCircle2,
  Megaphone,
  UserCog,
  FileSpreadsheet,
  GraduationCap,
  Search,
  School,
  Sparkles,
  ArrowRight,
  Check,
  ChevronRight,
  Layers,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Users,
  LifeBuoy,
  Server,
  Zap,
  HardDrive,
  Database,
  X,
  User,
  LogOut
} from 'lucide-react';
import { StudentProfileModal } from '../common/StudentProfileModal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenSearch?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isMobileOpen,
  setIsMobileOpen,
  onOpenSearch
}) => {
  const { role, setRole, teacher, student, principal, superAdmin, logout } = useAuth();
  const [showStudentProfileModal, setShowStudentProfileModal] = React.useState(false);
  const [studentProfileModalTab, setStudentProfileModalTab] = React.useState<'profile' | 'switch'>('profile');
  const {
    activeTeacherClass,
    setActiveTeacherClass,
    teacherActiveSubTab,
    setTeacherActiveSubTab,
    switchTeacherClassAndAction,
    classes,
    teachers,
    students,
    schoolTenants,
    globalUsers,
    platformMetrics,
    supportTickets,
    timetable
  } = useERP();

  const teacherSchedule = getTeacherScheduleFromTimetable(timetable, teacher);

  const superAdminModules = [
    { id: 'tenants', label: '1. School Onboarding & Tenants', icon: School, badge: `${schoolTenants?.length || 0} Schools` },
    { id: 'users', label: '2. Global Profile & IAM Master', icon: Users, badge: `${globalUsers?.length || 0} Staff` },
    { id: 'billing', label: '3. Subscription & Billing (MRR)', icon: CreditCard, badge: `₹${((platformMetrics?.totalMonthlyRevenue || 0) / 1000).toFixed(0)}k` },
    { id: 'support', label: '4. Support & System Overrides', icon: LifeBuoy, badge: `${supportTickets?.filter(t => t.status !== 'Resolved').length || 0} Active` }
  ];

  const teacherSections = [
    {
      title: 'Teacher Desk Modules',
      items: [
        { id: 'attendance', label: '1. Mark Attendance (Live Sync)', icon: UserCheck, badge: 'Live' },
        { id: 'marks', label: '2. Student Marks & Grades', icon: FileSpreadsheet, badge: 'CBSE' },
        { id: 'timetable', label: '4. My Teaching Schedule', icon: Clock, badge: 'Live' },
        { id: 'exams', label: '5. Exam Schedule & Tests', icon: FileCheck2, badge: 'Planner' },
        { id: 'notice', label: '6. Broadcast Notice', icon: Megaphone, badge: 'Alert' },
        { id: 'roster', label: '7. Class Student Roster', icon: GraduationCap, badge: '20 Stu' },
        { id: 'add-student', label: '8. Enroll New Student', icon: UserCog, badge: 'New' },
        { id: 'chat', label: '9. Chat Box & Queries', icon: MessageSquare, badge: 'Chat' }
      ]
    }
  ];

  const principalModules = [
    { id: 'cloud_database', label: 'Cloud SQL Database', icon: Database, badge: 'Live SQL' },
    { id: 'classes', label: 'Class & Capacity Allocation', icon: Layers, badge: `${classes?.length || 2} Classes` },
    { id: 'teachers', label: 'Teacher & Subject Assignment', icon: UserCheck, badge: `${teachers?.length || 4} Staff` },
    { id: 'students', label: 'Student Admissions & Transfer', icon: GraduationCap, badge: `${students?.length || 40} Stu` },
    { id: 'circulars', label: 'Official School Circulars', icon: Megaphone, badge: 'Notices' },
    { id: 'timetable_override', label: 'Master Academic Timetable', icon: Clock, badge: 'Schedule' }
  ];

  const studentSections = [
    {
      title: 'Main Overview',
      items: [
        { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard, badge: null }
      ]
    },
    {
      title: 'Class & Daily Schedule',
      items: [
        { id: 'timetable', label: 'Class Timetable', icon: Clock, badge: 'Periods' },
        { id: 'attendance', label: 'Attendance Tracker', icon: UserCheck, badge: 'Log' }
      ]
    },
    {
      title: 'Academics & Exams',
      items: [
        { id: 'syllabus_homework', label: 'Syllabus & Homework', icon: BookOpen, badge: 'Materials' },
        { id: 'exams', label: 'Exam Schedule & Dates', icon: FileCheck2, badge: 'Tests' },
        { id: 'results', label: 'Report Card & Grades', icon: Award, badge: 'Marks' }
      ]
    },
    {
      title: 'Services & Support',
      items: [
        { id: 'chat', label: 'Chat Box & Discussions', icon: MessageSquare, badge: 'Chat' },
        { id: 'notifications', label: 'School Notice Board', icon: Bell, badge: 'Notices' },
        { id: 'calendar', label: 'Academic Calendar & Mentor', icon: CalendarDays, badge: 'Events' }
      ]
    }
  ];

  const handleStudentTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const handlePrincipalDeskActionClick = (subTabId: string) => {
    setActiveTab('principal_portal');
    setIsMobileOpen(false);
  };

  const handleTeacherDeskActionClick = (subTabId: any) => {
    setActiveTab('teacher_portal');
    setTeacherActiveSubTab(subTabId);
    setIsMobileOpen(false);
  };

  const handleSelectClass = (cls: TeacherClassCode) => {
    switchTeacherClassAndAction(cls, 'attendance');
    setActiveTab('teacher_portal');
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 md:hidden active:scale-[0.98] transition-all duration-150 ease-in-out"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container - Clean White Body with Crisp Dark Typography in Light Mode */}
      <aside
        className={`fixed md:sticky top-0 md:top-[61px] left-0 h-[100vh] md:h-[calc(100vh-61px)] w-68 sm:w-72 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 z-40 transition-transform duration-300 ease-in-out border-r border-slate-200 dark:border-neutral-800 flex flex-col justify-between overflow-y-auto custom-scrollbar shadow-lg md:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-4">
          {/* Mobile Header with School Logo */}
          <div className="flex items-center justify-between md:hidden pb-3 border-b border-slate-200 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="EduX Logo" className="h-12 w-auto object-contain bg-white rounded-lg p-1" />
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Spotlight Search inside Sidebar */}
          {onOpenSearch && (
            <button
              onClick={() => {
                setIsMobileOpen(false);
                onOpenSearch();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-900/80 hover:bg-blue-50/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer group shadow-2xs ease-in-out active:scale-[0.98] duration-150"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform active:scale-[0.98] duration-150 ease-in-out" />
                <span className="font-bold">Search anything...</span>
              </div>
              <kbd className="text-[10px] font-mono font-bold bg-white dark:bg-[#0a0a0a] px-1.5 py-0.5 rounded-md border border-slate-300 dark:border-neutral-700 text-slate-600 dark:text-slate-400 shadow-2xs">
                ⌘K
              </kbd>
            </button>
          )}

          {/* SUPER ADMIN SPECIFIC SECTIONS */}
          {role === 'superadmin' && (
            <div className="space-y-4">
              {/* Active Super Admin Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-blue-950/40 border border-purple-200 dark:border-purple-800/80 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Platform Owner
                  </span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-200/80 dark:bg-purple-900/80 text-purple-900 dark:text-purple-200 font-mono">
                    SAAS ROOT
                  </span>
                </div>
                <p className="font-black text-slate-900 dark:text-white text-sm leading-tight">
                  {superAdmin?.name || 'Alex Vance'}
                </p>
                <p className="text-xs font-semibold text-purple-800 dark:text-purple-300">
                  {superAdmin?.roleTitle || 'Chief SaaS Architect'}
                </p>
              </div>

              {/* Platform Telemetry Metrics */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-700/80 space-y-2">
                <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  SAAS FLEET METRICS
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 shadow-2xs">
                    <span className="block text-base font-black text-indigo-600">{schoolTenants?.length || 0}</span>
                    <span className="text-[9px] font-bold text-slate-500">Schools</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 shadow-2xs">
                    <span className="block text-base font-black text-emerald-600">₹{((platformMetrics?.totalMonthlyRevenue || 0) / 1000).toFixed(0)}k</span>
                    <span className="text-[9px] font-bold text-slate-500">MRR</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 shadow-2xs">
                    <span className="block text-base font-black text-purple-600">{globalUsers?.length || 0}</span>
                    <span className="text-[9px] font-bold text-slate-500">Staff</span>
                  </div>
                </div>
              </div>

              {/* Super Admin Desk Navigation */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-neutral-800">
                <p className="px-1 text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  PLATFORM CONTROLS
                </p>

                <div className="space-y-1">
                  {superAdminModules.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === 'superadmin_portal';

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab('superadmin_portal');
                          setIsMobileOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
                            : 'text-slate-800 dark:text-slate-200 font-bold hover:text-purple-700 dark:hover:text-white hover:bg-purple-50/60 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                          <span className="font-bold truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-neutral-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* PRINCIPAL-SPECIFIC SECTIONS */}
          {role === 'principal' && principal && (
            <div className="space-y-4">
              {/* Active Principal Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 shadow-2xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Institutional Head
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-mono">
                    {principal.principalId}
                  </span>
                </div>
                <p className="font-black text-slate-900 dark:text-white text-sm leading-tight">{principal.name}</p>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">{principal.designation}</p>
              </div>

              {/* Administrative Overview Stats */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-700/80 space-y-2">
                <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  INSTITUTION METRICS
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 shadow-2xs">
                    <span className="block text-base font-black text-amber-600">{classes?.length || 2}</span>
                    <span className="text-[9px] font-bold text-slate-500">Classes</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 shadow-2xs">
                    <span className="block text-base font-black text-purple-600">{teachers?.length || 4}</span>
                    <span className="text-[9px] font-bold text-slate-500">Teachers</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 shadow-2xs">
                    <span className="block text-base font-black text-blue-600">{students?.length || 40}</span>
                    <span className="text-[9px] font-bold text-slate-500">Students</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEACHER-SPECIFIC SECTIONS */}
          {role === 'teacher' && teacher && (
            <div className="space-y-4">
              {/* Active Teacher Banner */}
              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active Faculty
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-purple-200/80 dark:bg-purple-900/80 text-purple-900 dark:text-purple-200 font-mono">
                    {teacher.teacherId}
                  </span>
                </div>
                <p className="font-black text-slate-900 dark:text-white text-sm leading-tight">{teacher.name}</p>
                <p className="text-xs font-semibold text-purple-800 dark:text-purple-300">{teacher.designation}</p>
              </div>

              {/* 1. Quick Class Switcher (Class 11, Class 12) */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-slate-800/90 dark:to-purple-950/40 border border-purple-200 dark:border-purple-800/70 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-purple-900 dark:text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>SELECT CLASS</span>
                  </p>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-xs">
                    Class {activeTeacherClass}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-tight">
                  Tap to switch class records & attendance:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {(['11', '12'] as const).map((cls) => {
                    const isSelected = activeTeacherClass === cls;
                    const isClassTeacher = teacher.classTeacherOf?.includes(cls);

                    return (
                      <button
                        key={cls}
                        onClick={() => handleSelectClass(cls)}
                        className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-300 dark:ring-purple-700'
                            : 'bg-white dark:bg-[#0a0a0a]/90 hover:bg-purple-100/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black">Class {cls}</span>
                        </div>
                        {isSelected ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        ) : isClassTeacher ? (
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-300 dark:border-emerald-700">
                            CT
                          </span>
                        ) : (
                          <ArrowRight className="w-3 h-3 opacity-40" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Today's Assigned Schedule (Dynamic from Principal's Timetable) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>SCHEDULE (TILL 2:00 PM)</span>
                  </p>
                  <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-neutral-700">
                    {teacherSchedule.length} {teacherSchedule.length === 1 ? 'Period' : 'Periods'}
                  </span>
                </div>

                {teacherSchedule.length === 0 ? (
                  <div className="p-3 text-center rounded-xl bg-slate-50 dark:bg-neutral-900/40 border border-dashed border-slate-200 dark:border-neutral-700">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      No schedule for today
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Waiting for Principal update
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {teacherSchedule.map((slot) => {
                      const isSlotClassActive = activeTeacherClass === slot.classCode;
                      return (
                        <button
                          key={slot.id}
                          onClick={() => handleSelectClass(slot.classCode as TeacherClassCode)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border cursor-pointer ${
                            isSlotClassActive
                              ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-400 dark:border-purple-700 shadow-xs'
                              : 'bg-slate-50/80 dark:bg-neutral-900/60 hover:bg-purple-50/40 dark:hover:bg-slate-800 border-slate-200 dark:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-600 text-white font-mono">
                                P{slot.periodNo}
                              </span>
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                Class {slot.classCode}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-1 text-[11px]">
                            <span className="font-bold text-purple-900 dark:text-purple-200 truncate max-w-[130px]">
                              {slot.subject}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              {slot.roomNo}
                            </span>
                          </div>

                          {isSlotClassActive && (
                            <div className="mt-1 pt-1 border-t border-purple-200 dark:border-purple-800 flex items-center justify-between text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <span>✓ Active for Attendance</span>
                              <span className="text-[9px] bg-emerald-100 dark:bg-emerald-950/80 px-1 py-0.2 rounded">Ready</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Teacher Desk Modules Navigation */}
              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-neutral-800">
                <p className="px-1 text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  TEACHER DESK ACTIONS
                </p>

                <div className="space-y-1">
                  {teacherSections[0].items.map((item) => {
                    const Icon = item.icon;
                    const isDeskActive = activeTab === 'teacher_portal' && teacherActiveSubTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTeacherDeskActionClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                          isDeskActive
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-extrabold'
                            : 'text-slate-800 dark:text-slate-200 font-bold hover:text-purple-700 dark:hover:text-white hover:bg-purple-50/60 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isDeskActive ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                          <span className="font-bold truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${
                              isDeskActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-neutral-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STUDENT-SPECIFIC SECTIONS */}
          {role === 'student' && (
            <div className="space-y-4">
              {student && (
                <div
                  onClick={() => {
                    setStudentProfileModalTab('switch');
                    setShowStudentProfileModal(true);
                  }}
                  className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100/70 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/80 shadow-2xs space-y-1.5 cursor-pointer group transition-all active:scale-[0.98] duration-150 ease-in-out"
                  title="Click to view full profile or switch student"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Active Student
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-200/80 dark:bg-blue-900/80 text-blue-900 dark:text-blue-200 font-mono">
                      Roll #{student.rollNo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-slate-900 dark:text-white text-sm leading-tight group-hover:text-blue-600 transition-colors active:scale-[0.98] duration-150 ease-in-out">
                        {student.name}
                      </p>
                      <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                        {student.className} ({student.stream})
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-white dark:bg-neutral-900 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-800 shadow-2xs shrink-0">
                      Switch →
                    </span>
                  </div>
                </div>
              )}

              {studentSections.map((section, idx) => (
                <div key={idx} className="space-y-1.5">
                  <p className="px-2 text-[11px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-wider">
                    {section.title}
                  </p>

                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleStudentTabClick(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-extrabold'
                              : 'text-slate-800 dark:text-slate-200 font-bold hover:text-blue-700 dark:hover:text-white hover:bg-blue-50/70 dark:hover:bg-slate-800/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                            <span className="font-bold tracking-tight">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-200/80 dark:bg-neutral-900 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-neutral-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-black/40 space-y-3">
          <button
            onClick={() => {
              logout();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-neutral-700 text-sm font-extrabold transition-all cursor-pointer shadow-xs active:scale-98 ease-in-out duration-150"
            id="sidebar-logout-btn"
          >
            <LogOut className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span>Sign Out / Log Out</span>
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Session 2025-26</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">St. Xavier's Senior Sec. School</p>
          </div>
        </div>
      </aside>

      {/* Student Profile & Switcher Modal */}
      <StudentProfileModal
        isOpen={showStudentProfileModal}
        onClose={() => setShowStudentProfileModal(false)}
        initialTab={studentProfileModalTab}
      />
    </>
  );
};
