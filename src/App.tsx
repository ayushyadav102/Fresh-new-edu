import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ERPProvider } from './context/ERPContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginScreen } from './components/auth/LoginScreen';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { TeacherPortalScreen } from './components/teacher/TeacherPortalScreen';
import { PrincipalPortalScreen } from './components/principal/PrincipalPortalScreen';
import { TimetableScreen } from './components/timetable/TimetableScreen';
import { AttendanceScreen } from './components/attendance/AttendanceScreen';
import { ExamsScreen } from './components/academics/ExamsScreen';
import { SyllabusHomeworkScreen } from './components/academics/SyllabusHomeworkScreen';
import { ResultsScreen } from './components/academics/ResultsScreen';
import { FeesScreen } from './components/utilities/FeesScreen';
import { BusPassScreen } from './components/utilities/BusPassScreen';
import { NotificationCenter } from './components/communication/NotificationCenter';
import { AcademicCalendarScreen } from './components/communication/AcademicCalendarScreen';
import { SuperAdminPortal } from './components/superadmin/SuperAdminPortal';
import { ChatBoxScreen } from './components/chat/ChatBoxScreen';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { saveAttendanceToCloud } from './services/cloudDbService';
import {
  ArrowLeft,
  Clock,
  UserCheck,
  BookOpen,
  FileCheck2,
  Award,
  IndianRupee,
  Bus,
  Home,
  Bell,
  MessageSquare,
  Calendar,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';

/**
 * Global Attendance Submit Function (Google Cloud Firestore Database)
 */
export async function submitAttendanceToCloud(
  report: any,
  studentLogs: any[]
) {
  return await saveAttendanceToCloud(report, studentLogs);
}


const STUDENT_MODULE_NAMES: Record<string, { title: string; icon: any }> = {
  timetable: { title: 'Class Timetable & Daily Schedule', icon: Clock },
  attendance: { title: 'Attendance Tracker & Subject Summary', icon: UserCheck },
  exams: { title: 'Examination Schedule & Dates', icon: FileCheck2 },
  results: { title: 'Marksheet & Academic Grades', icon: Award },
  syllabus_homework: { title: 'Syllabus & Homework', icon: BookOpen },
  fees: { title: 'Fee Payments & Fee Receipts', icon: IndianRupee },
  buspass: { title: 'Digital Bus Pass & Transport', icon: Bus },
  notifications: { title: 'Notice Board & Broadcasts', icon: Bell },
  calendar: { title: 'Institutional Academic Calendar', icon: Calendar },
  chat: { title: 'Chat Box & Discussions', icon: MessageSquare }
};

const MainAppContent: React.FC = () => {
  const { role, isAuthenticated, student } = useAuth();
  
  const [activeTab, setActiveTabState] = useState<string>('dashboard');

  const setActiveTab = (tabId: string) => {
    setActiveTabState((prevTab) => {
      if (prevTab !== tabId) {
        window.history.pushState({ tab: tabId }, '', window.location.pathname);
      }
      return tabId;
    });
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab) {
        setActiveTabState(event.state.tab);
      } else {
        // Fallback for initial load
        if (role === 'superadmin') setActiveTabState('superadmin_portal');
        else if (role === 'principal') setActiveTabState('principal_portal');
        else if (role === 'teacher') setActiveTabState('teacher_portal');
        else setActiveTabState('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    
    // Replace initial state
    window.history.replaceState({ tab: activeTab }, '', window.location.pathname);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [role]); // Intentionally leaving activeTab out to avoid loop, we want to set initial state


  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  // Global Ctrl+K / Cmd+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (role === 'superadmin') {
      setActiveTab('superadmin_portal');
    } else if (role === 'principal') {
      setActiveTab('principal_portal');
    } else if (role === 'teacher') {
      setActiveTab('teacher_portal');
    } else if (role === 'student' && (activeTab === 'teacher_portal' || activeTab === 'principal_portal' || activeTab === 'superadmin_portal')) {
      setActiveTab('dashboard');
    }
  }, [role]);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleGlobalNavigate = (tabId: string) => {
    setActiveTab(tabId);
    setIsGlobalSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStudentDashboard = () => {
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentModuleInfo = STUDENT_MODULE_NAMES[activeTab];
  const CurrentModuleIcon = currentModuleInfo?.icon || LayoutDashboard;

  const renderActiveScreen = () => {
    let screenContent: React.ReactNode = null;

    switch (activeTab) {
      case 'superadmin_portal':
        screenContent = <SuperAdminPortal />;
        break;
      case 'principal_portal':
        screenContent = <PrincipalPortalScreen />;
        break;
      case 'dashboard':
        screenContent = <DashboardScreen setActiveTab={setActiveTab} onOpenSearch={() => setIsGlobalSearchOpen(true)} toggleSidebarMobile={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)} />;
        break;
      case 'teacher_portal':
        screenContent = <TeacherPortalScreen />;
        break;
      case 'timetable':
        screenContent = <TimetableScreen />;
        break;
      case 'attendance':
        screenContent = <AttendanceScreen />;
        break;
      case 'exams':
        screenContent = <ExamsScreen />;
        break;
      case 'results':
        screenContent = <ResultsScreen />;
        break;
      case 'syllabus_homework':
        screenContent = <SyllabusHomeworkScreen onBack={() => setActiveTab('dashboard')} />;
        break;
      case 'fees':
        screenContent = <FeesScreen />;
        break;
      case 'buspass':
        screenContent = <BusPassScreen />;
        break;
      case 'notifications':
        screenContent = <NotificationCenter />;
        break;
      case 'calendar':
        screenContent = <AcademicCalendarScreen />;
        break;
      case 'chat':
        screenContent = <ChatBoxScreen onBack={() => setActiveTab('dashboard')} />;
        break;
      default:
        if (role === 'superadmin') screenContent = <SuperAdminPortal />;
        else if (role === 'principal') screenContent = <PrincipalPortalScreen />;
        else if (role === 'teacher') screenContent = <TeacherPortalScreen />;
        else screenContent = <DashboardScreen setActiveTab={setActiveTab} onOpenSearch={() => setIsGlobalSearchOpen(true)} />;
    }

    return screenContent;
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-800 dark:text-slate-100 font-sans flex flex-col antialiased transition-colors duration-200 relative">
      {/* Global Background Watermark */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.12] dark:opacity-[0.15] select-none">
        <img src="/logo.png" alt="" className="w-[85vw] md:w-[50vw] max-w-3xl object-contain " />
      </div>

      <div className="relative z-10 flex flex-col flex-1 w-full">
      {/* Top Fixed Navbar */}
      <div className="block">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toggleSidebarMobile={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
          onOpenSearch={() => setIsGlobalSearchOpen(true)}
        />
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileOpen={isSidebarMobileOpen}
          setIsMobileOpen={setIsSidebarMobileOpen}
          onOpenSearch={() => setIsGlobalSearchOpen(true)}
        />

        {/* Main Dynamic View Screen */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-hidden">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Global Spotlight Search Modal */}
      </div>
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onNavigate={handleGlobalNavigate}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ERPProvider>
          <MainAppContent />
        </ERPProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
