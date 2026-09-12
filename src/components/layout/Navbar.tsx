import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Bell,
  Search,
  LogOut,
  GraduationCap,
  CheckCircle2,
  MoreVertical,
  ChevronDown,
  UserCheck,
  User,
  BookOpen,
  Calendar,
  Sparkles,
  Sun,
  Moon,
  School,
  ShieldCheck,
  Camera,
  UserCog,
  Image as ImageIcon,
  Database
} from 'lucide-react';
import { DEMO_STUDENTS, DEMO_TEACHERS } from '../../data/mockData';
import { UserAvatar } from '../common/UserAvatar';
import { ProfilePhotoModal } from '../common/ProfilePhotoModal';
import { StudentProfileModal } from '../common/StudentProfileModal';
import { DataModeBadge } from '../common/DataModeBadge';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toggleSidebarMobile: () => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  toggleSidebarMobile,
  onOpenSearch
}) => {
  const { role, setRole, student, teacher, principal, superAdmin, logout, switchStudent, switchTeacher } = useAuth();
  const { students, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useERP();
  const { theme, toggleTheme } = useTheme();

  const allStudentsList = students && students.length > 0 ? students : DEMO_STUDENTS;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showStudentProfileModal, setShowStudentProfileModal] = useState(false);
  const [studentProfileModalTab, setStudentProfileModalTab] = useState<'profile' | 'switch'>('profile');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const activeUser = role === 'superadmin' ? superAdmin : role === 'principal' ? principal : role === 'teacher' ? teacher : student;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800 shadow-xs px-4 sm:px-6 py-3 transition-colors duration-200">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* Left Brand Section */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleSidebarMobile}
              className="md:hidden p-2 rounded-xl text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-hidden cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
              aria-label="Toggle Navigation Menu"
              title="Open 3-bar Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div
              onClick={() => setActiveTab(role === 'superadmin' ? 'superadmin_portal' : role === 'principal' ? 'principal_portal' : role === 'teacher' ? 'teacher_portal' : 'dashboard')}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group active:scale-[0.98] transition-all duration-150 ease-in-out"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-sm text-white font-bold text-xs group-hover:scale-105 transition-transform duration-150 ease-in-out">
                <Sparkles className="w-4 h-4 fill-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 leading-none">
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">EduX</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">school</span>
                </div>
                <span className="text-[8px] text-slate-400 font-medium tracking-tight">
                  {role === 'superadmin' ? 'SaaS Management' : 'A Complete School ERP Solution'}
                </span>
              </div>
            </div>
          </div>

          {/* Center Search Bar (Desktop & Large screens only) */}
          <div className="hidden lg:flex items-center gap-3 flex-1 justify-center max-w-2xl mx-4">
            {/* Global Search Trigger Bar */}
            <button
              onClick={onOpenSearch}
              className="w-full flex items-center justify-between gap-3 px-4 py-2 text-xs bg-slate-100/90 dark:bg-neutral-900/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-neutral-700/80 rounded-xl text-slate-700 dark:text-slate-300 transition-all cursor-pointer group font-bold ease-in-out active:scale-[0.98] duration-150"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors active:scale-[0.98] duration-150 ease-in-out" />
                <span className="font-extrabold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white active:scale-[0.98] transition-all duration-150 ease-in-out">
                  Search students, notices, classes, timetable...
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] font-black bg-white dark:bg-[#0a0a0a] px-2 py-0.5 rounded-md border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 shadow-2xs">
                <span>⌘K</span>
              </div>
            </button>
          </div>

          {/* Right Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all focus:outline-hidden cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
              title="Global Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Data Source Pipeline Badge & Toggle - Protected: Only visible to SuperAdmin */}
            {role === 'superadmin' && <DataModeBadge />}

            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all focus:outline-hidden cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </button>

            {/* Notifications Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-hidden cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                title="Notice Board"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 py-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">School Alerts & Notices</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-black bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-full border border-rose-200 dark:border-rose-900">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => markAllNotificationsAsRead()}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
                    {notifications.slice(0, 5).map((n, idx) => (
                      <div
                        key={`${n.id || 'notif'}_${idx}`}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          setShowNotifications(false);
                        }}
                        className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-black text-xs text-slate-900 dark:text-white">{n.title}</span>
                          <span className="text-[10px] font-bold text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Active Role Dropdown (3-Dot & Profile Trigger) */}
            <div className="relative">
              {role === 'student' ? (
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)} 
                  className="ml-1 pl-1.5 pr-2 py-1 bg-blue-600/10 hover:bg-blue-600/20 rounded-full flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    {student?.name?.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase() || 'PP'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-600" strokeWidth={2.5} />
                </button>
              ) : (
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/80 shadow-2xs group ease-in-out active:scale-[0.98] duration-150"
                  title="Account Menu & Options"
                  aria-label="Account Options"
                >
                  <UserAvatar
                    avatar={activeUser?.avatar}
                    name={activeUser?.name}
                    role={role}
                    size="sm"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                      {activeUser?.name}
                    </p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                      {role === 'superadmin' ? (superAdmin?.roleTitle || 'Chief SaaS Architect') : role === 'principal' ? principal?.designation : role === 'teacher' ? teacher?.designation : ''}
                    </p>
                  </div>
                  <div className="flex items-center text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors pl-0.5 active:scale-[0.98] duration-150 ease-in-out">
                    <MoreVertical className="w-4 h-4 hidden sm:block" />
                    <ChevronDown className="w-3.5 h-3.5 sm:hidden" />
                  </div>
                </button>
              )}

              {/* Profile Menu & Active Selector */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 py-2.5 z-50 animate-in fade-in">
                  {role === 'superadmin' ? (
                    /* Super Admin SaaS Platform Owner Menu */
                    <div className="space-y-3">
                      <div className="p-3.5 mx-2 rounded-xl bg-gradient-to-tr from-purple-50 via-indigo-50 to-rose-50 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-rose-950/40 border border-purple-200 dark:border-purple-800/60">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                            Platform Owner
                          </span>
                          <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300">
                            {superAdmin?.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <img
                            src={superAdmin?.avatar}
                            alt={superAdmin?.name}
                            className="w-10 h-10 rounded-xl object-cover border border-purple-300 dark:border-purple-700 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {superAdmin?.name}
                            </p>
                            <p className="text-[11px] font-bold text-purple-700 dark:text-purple-300 truncate">
                              {superAdmin?.roleTitle}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 font-mono">
                              {superAdmin?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="px-2 space-y-1">
                        <button
                          onClick={() => {
                            setActiveTab('superadmin_portal');
                            setShowProfileMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            activeTab === 'superadmin_portal'
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            <span>Super Admin SaaS Console</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            activeTab === 'superadmin_portal' ? 'bg-purple-700 text-purple-100' : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          }`}>
                            Active
                          </span>
                        </button>
                      </div>

                      <div className="px-2 pt-1 border-t border-slate-100 dark:border-neutral-800">
                        <button
                          onClick={() => {
                            logout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out Platform Owner</span>
                        </button>
                      </div>
                    </div>
                  ) : role === 'principal' ? (
                    /* Principal Administrative Desk Header & Options */
                    <div className="space-y-3">
                      <div className="p-3.5 mx-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                            Principal Office
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300">
                            {principal?.principalId}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            avatar={principal?.avatar}
                            name={principal?.name}
                            role="principal"
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {principal?.name}
                            </p>
                            <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 truncate">
                              {principal?.designation}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                              {principal?.schoolName}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="px-2 space-y-1">
                        <button
                          onClick={() => {
                            setActiveTab('principal_portal');
                            setShowProfileMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            activeTab === 'principal_portal'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Principal Management Desk</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            activeTab === 'principal_portal' ? 'bg-amber-700 text-amber-100' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}>
                            Active
                          </span>
                        </button>
                      </div>

                      <div className="px-2 pt-1 border-t border-slate-100 dark:border-neutral-800">
                        <button
                          onClick={() => {
                            logout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out Principal</span>
                        </button>
                      </div>
                    </div>
                  ) : role === 'teacher' ? (
                    /* Minimal & Focused Teacher 3-Dot Options */
                    <div className="space-y-3">
                      {/* Teacher Header Info */}
                      <div className="p-3.5 mx-2 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 uppercase tracking-wider">
                            Faculty Account
                          </span>
                          <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-300">
                            {teacher?.teacherId}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            avatar={teacher?.avatar}
                            name={teacher?.name}
                            role="teacher"
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {teacher?.name}
                            </p>
                            <p className="text-[11px] font-bold text-purple-700 dark:text-purple-300 truncate">
                              {teacher?.designation} • {teacher?.department}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                              Class Teacher: {teacher?.classTeacherOf}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Teacher Quick Desk Navigation */}
                      <div className="px-2 space-y-1">
                        <button
                          onClick={() => {
                            setActiveTab('teacher_portal');
                            setShowProfileMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            activeTab === 'teacher_portal'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <UserCog className="w-4 h-4" />
                            <span>Teacher Management Desk</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                            activeTab === 'teacher_portal' ? 'bg-purple-700 text-purple-100' : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          }`}>
                            Active Desk
                          </span>
                        </button>
                      </div>

                      {/* Quick Faculty Switcher (Compact Dropdown) */}
                      <div className="px-3 pt-2 border-t border-slate-100 dark:border-neutral-800">
                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                          Switch Faculty Profile
                        </label>
                        <select
                          value={teacher?.teacherId || ''}
                          onChange={(e) => {
                            switchTeacher(e.target.value);
                            setShowProfileMenu(false);
                          }}
                          className="w-full bg-slate-100 dark:bg-neutral-900 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 focus:outline-hidden cursor-pointer ease-in-out active:scale-[0.98] transition-all duration-150"
                        >
                          {DEMO_TEACHERS.map((t) => (
                            <option key={t.id} value={t.teacherId}>
                              {t.name} ({t.classTeacherOf})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Sign Out */}
                      <div className="px-2 pt-1 border-t border-slate-100 dark:border-neutral-800">
                        <button
                          onClick={() => {
                            logout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out Faculty</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Student Profile & Selector Options */
                    <>
                      <div className="p-4 border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/60">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase border border-blue-200 dark:border-blue-800">
                            School Student
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <UserAvatar
                            avatar={student?.avatar}
                            name={student?.name}
                            role="student"
                            size="md"
                            editable={true}
                            onEdit={() => {
                              setShowProfileMenu(false);
                              setShowPhotoModal(true);
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm text-slate-900 dark:text-white truncate">
                              {student?.name}
                            </p>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate">
                              {student?.schoolName} ({student?.className})
                            </p>
                          </div>
                        </div>

                        {/* Buttons for Full Profile and Upload / Change Photo */}
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              setStudentProfileModalTab('profile');
                              setShowStudentProfileModal(true);
                            }}
                            className="w-full py-2 px-2.5 rounded-xl bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ease-in-out active:scale-[0.98] duration-150"
                          >
                            <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Full Profile</span>
                          </button>

                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              setShowPhotoModal(true);
                            }}
                            className="w-full py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ease-in-out active:scale-[0.98] duration-150"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Edit Photo</span>
                          </button>
                        </div>
                      </div>

                      {/* Quick Student Switcher (Class 9, 10, 11, 12) */}
                      <div className="px-3 pt-2.5 pb-1 border-t border-slate-100 dark:border-neutral-800">
                        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                          Switch Student Profile (Class 9 – 12)
                        </label>
                        <select
                          value={student?.studentId || student?.id || ''}
                          onChange={(e) => {
                            switchStudent(e.target.value);
                            setShowProfileMenu(false);
                          }}
                          className="w-full bg-slate-100 dark:bg-neutral-900 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 focus:outline-hidden cursor-pointer ease-in-out active:scale-[0.98] transition-all duration-150"
                        >
                          {DEMO_STUDENTS.map((s) => (
                            <option key={s.id || s.studentId} value={s.studentId}>
                              {s.name} ({s.className} • Roll {s.rollNo})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => {
                            logout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Profile Photo Upload Modal */}
      <ProfilePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        targetRole={role}
      />

      {/* Student Full Profile & Switcher Modal */}
      <StudentProfileModal
        isOpen={showStudentProfileModal}
        onClose={() => setShowStudentProfileModal(false)}
        initialTab={studentProfileModalTab}
      />
    </>
  );
};
