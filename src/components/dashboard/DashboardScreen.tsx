import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search, Moon, Sun, Bell, Menu, Clock, UserCheck, BookOpen, FileCheck2, Award, CreditCard,
  ChevronRight, Sparkles, ArrowUpRight, CheckCircle2, XCircle, BookMarked, Home, MessageSquare
} from 'lucide-react';
import { sortTimetableSlots, getTodayDateString, getTodayDayName, getSlotAttendance, getStudentTimetableSlots } from '../../utils/timetableUtils';
import { isStudentEnrolledInSubject } from '../../utils/subjectStreamMatcher';
import { UserAvatar } from '../common/UserAvatar';
import { ProfilePhotoModal } from '../common/ProfilePhotoModal';
import { StudentProfileModal } from '../common/StudentProfileModal';
import { StudentLeaveModal } from './StudentLeaveModal';

import { subscribeToStudentMarks } from '../../services/examService';
import { subscribeToChatMessages } from '../../services/chatService';
import { ChatMessage } from '../../types';
import { ExamMark } from '../../services/examService';


interface DashboardScreenProps {
  setActiveTab: (tab: string) => void;
  onOpenSearch?: () => void;
  toggleSidebarMobile?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ setActiveTab, onOpenSearch, toggleSidebarMobile }) => {
  const { student: authStudent } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { students, attendance, getStudentAttendanceSummary, timetable, classes, exams, feeSummary, getStudentAttendance, teacherResources, studentLeaves, results } = useERP();
  const student = students.find(s => s.studentId === authStudent?.studentId) || authStudent;

  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [profileModalInitialTab, setProfileModalInitialTab] = useState<'profile' | 'switch'>('profile');

  const [liveMarks, setLiveMarks] = useState<ExamMark[]>([]);
  const [liveChatMessages, setLiveChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!student) return;
    
    const unsubMarks = subscribeToStudentMarks(student.studentId, undefined, (fetchedMarks) => {
      setLiveMarks(fetchedMarks);
    });

    const classCodeMatch = student.className.match(/\d+/);
    const classCode = classCodeMatch ? classCodeMatch[0] : '10';
    
    const unsubChat = subscribeToChatMessages(classCode, (msgs) => {
      setLiveChatMessages(msgs);
    });

    return () => {
      unsubMarks();
      unsubChat();
    };
  }, [student]);

  
  const filteredExams = exams.filter(e => {
    let classMatches = !e.targetClass || e.targetClass === 'All';
    if (!classMatches && student?.className) {
      const tgtNum = e.targetClass?.match(/\d+/)?.[0];
      const stdNum = student.className.match(/\d+/)?.[0];
      if (tgtNum && stdNum && tgtNum === stdNum) {
        classMatches = true;
      }
    }
    if (!classMatches) return false;
    if (student && !isStudentEnrolledInSubject(student, e.title, student.className) && !isStudentEnrolledInSubject(student, e.code, student.className)) {
      return false;
    }
    return true;
  });

  const activeResult = (results || []).find(r => r.semester === 1);
  const activeSubjects = activeResult?.subjects || [];
  const totalObtainedMarks = activeSubjects.reduce((sum, s) => sum + (s.totalMarks || 0), 0);
  const totalMaxMarks = activeSubjects.length > 0 ? activeSubjects.length * 100 : 100;
  
  const termPercentage = activeSubjects.length > 0 ? ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(1) : null;

  // Real-time Metrics Calculation
  
  // 1. Homework & Syllabus
  const activeHomeworkCount = useMemo(() => {
    return teacherResources.filter(res => res.type === 'homework').length;
  }, [teacherResources]);

  // 2. Marksheet & Grade
  const { publishedCount, pendingCount } = useMemo(() => {
    let pub = 0;
    let pend = 0;
    liveMarks.forEach(m => {
       if (m.isPublished || m.status === 'Approved' || m.status === 'Verified') pub++;
       else pend++;
    });
    return { publishedCount: pub, pendingCount: pend };
  }, [liveMarks]);

  // 3. Fees
  const pendingFeeAmount = student?.pendingFeeAmount ?? feeSummary.due;

  // 4. Chat Box
  
  
  // Real Chat Count based on recent messages (mocking unread for this demo since we might not track individual read receipts)
  const unreadChatCount = liveChatMessages.filter(m => m.senderId !== student?.studentId).length; // using all received as unread for dashboard demo


  const enrolledSubjects = useMemo(() => {
    if (!student) return [];
    return getStudentAttendance(student.id).map(a => a.subjectName);
  }, [student, getStudentAttendance]);

  const recentHomeworks = useMemo(() => {
    if (!student || !teacherResources) return [];
    const homeworks = teacherResources.filter(res => {
      if (res.type !== 'homework') return false;
      if (!student.className.toLowerCase().includes(res.className.toLowerCase()) &&
           !res.className.toLowerCase().includes(student.className.toLowerCase())) {
        return false;
      }
      if (!isStudentEnrolledInSubject(student, res.subjectName, student.className)) {
        return false;
      }
      return true;
    });
    return homeworks.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()).slice(0, 3);
  }, [student, teacherResources]);

  const studentTimetable = useMemo(() => {
    return getStudentTimetableSlots(timetable, student, classes);
  }, [timetable, student, classes]);

  const studentAttSummary = student?.studentId
    ? getStudentAttendanceSummary(student.studentId)
    : {
        totalClasses: attendance.reduce((sum, item) => sum + item.totalClasses, 0),
        attendedClasses: attendance.reduce((sum, item) => sum + item.attendedClasses, 0),
        percentage: 85.0
      };
  const overallAttendancePct = studentAttSummary.percentage.toFixed(1);

  const availableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
  
  const myLeaves = useMemo(() => {
    if (!student) return [];
    return studentLeaves.filter(l => l.studentId === student.id || l.studentId === student.studentId)
      .sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime());
  }, [studentLeaves, student]);

  const latestLeave = myLeaves[0];

  const todayDateStr = getTodayDateString();
  const currentDayName = getTodayDayName();
  const [selectedDashboardDay, setSelectedDashboardDay] = useState<string>(() => currentDayName);
  const todayClasses = sortTimetableSlots(studentTimetable.filter((t) => t.day === selectedDashboardDay));
  const nextExam = filteredExams?.[0];

  const moduleTiles = [
    {
      id: 'timetable',
      title: 'Timetable',
      desc: 'Live daily & weekly class slots & lab rooms',
      icon: Clock,
      iconBg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-active:bg-blue-600 group-active:text-white',
      titleColor: 'text-slate-800 group-hover:text-blue-600',
      borderColor: 'hover:border-blue-200 active:border-blue-300',
      badge: 'Live Mon - Sat'
    },
    {
      id: 'attendance',
      title: 'Attendance',
      desc: `${overallAttendancePct}% Overall | Subject wise breakdown`,
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white group-active:bg-emerald-600 group-active:text-white',
      titleColor: 'text-slate-800 group-hover:text-emerald-700',
      borderColor: 'hover:border-emerald-200 active:border-emerald-300',
      badge: `${overallAttendancePct}%`
    },
    {
      id: 'syllabus_homework',
      title: 'Homework & Syllabus',
      desc: activeHomeworkCount > 0 ? `${activeHomeworkCount} Subjects Pending Homework` : 'No Pending Assignments',
      icon: BookOpen,
      iconBg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white group-active:bg-amber-600 group-active:text-white',
      titleColor: 'text-slate-800 group-hover:text-amber-700',
      borderColor: 'hover:border-amber-200 active:border-amber-300',
      badge: activeHomeworkCount > 0 ? `${activeHomeworkCount} Pending` : 'Academics'
    },
    {
      id: 'exams',
      title: 'Exams Schedule',
      desc: filteredExams.length > 0 ? `${filteredExams.length} upcoming tests scheduled` : 'No upcoming tests',
      icon: FileCheck2,
      iconBg: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-active:bg-indigo-600 group-active:text-white',
      titleColor: 'text-slate-800 group-hover:text-indigo-700',
      borderColor: 'hover:border-indigo-200 active:border-indigo-300',
      badge: `${filteredExams.length} Upcoming`
    },
    {
      id: 'results',
      title: 'Marksheet & Grade',
      desc: (publishedCount > 0 || pendingCount > 0) ? `${publishedCount} Published | ${pendingCount} Pending` : 'No results published yet',
      icon: Award,
      iconBg: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white group-active:bg-purple-600 group-active:text-white',
      titleColor: 'text-slate-800 group-hover:text-purple-700',
      borderColor: 'hover:border-purple-200 active:border-purple-300',
      badge: publishedCount > 0 ? 'Results Live' : 'Pending'
    },
    {
      id: 'fees',
      title: 'Fees',
      desc: pendingFeeAmount > 0 ? `₹${pendingFeeAmount.toLocaleString()} Due for Current Term` : 'No Pending Dues',
      icon: CreditCard,
      iconBg: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white group-active:bg-rose-600 group-active:text-white',
      titleColor: 'text-slate-800 group-hover:text-rose-600',
      borderColor: 'hover:border-rose-200 active:border-rose-300',
      badge: pendingFeeAmount > 0 ? 'Payment Due' : 'Paid',
      descColor: ((student?.pendingFeeAmount ?? feeSummary.due) > 0) ? 'text-rose-500 font-semibold flex items-center gap-1' : 'text-slate-400',
      badgeClass: ((student?.pendingFeeAmount ?? feeSummary.due) > 0) ? 'bg-rose-50 text-rose-600 border border-rose-100 font-bold' : 'bg-slate-100 text-slate-600 font-semibold'
    },
    {
      id: 'chat',
      title: 'Chat Box',
      desc: 'Direct Communication & Instant Queries',
      icon: MessageSquare,
      iconBg: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white group-active:bg-violet-600 group-active:text-white',
      titleColor: 'text-slate-800 group-hover:text-violet-700',
      borderColor: 'hover:border-violet-200 active:border-violet-300',
      badge: unreadChatCount > 0 ? `${unreadChatCount} New Messages` : 'Chat',
      badgeClass: unreadChatCount > 0 ? 'bg-violet-600 text-white font-bold border border-violet-600' : 'bg-violet-50 text-violet-700 font-bold border border-violet-200'
    },
  ];

  return (
    <div className="w-full max-w-[390px] mx-auto bg-[#F8F9FF] min-h-screen flex flex-col relative pb-6 sm:border-x border-slate-200 text-slate-800 font-sans [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      
      {/* Main Content Area */}
      <main className="px-4 pt-4 pb-6 flex flex-col gap-5">
        
        {/* Student Welcome Card */}
        <section className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="absolute -right-14 -top-14 w-40 h-40 bg-blue-50/60 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/80 border border-blue-100 rounded-full text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
              <span>Academic Portal 2025-26</span>
            </div>
            <div className="px-2.5 py-1 bg-slate-100 border border-slate-200/80 rounded-md text-[11px] font-bold text-slate-700 tracking-wide">
              Roll #{student?.rollNo || '01'}
            </div>
          </div>

          <div className="flex items-start gap-3.5 mb-5 relative z-10">
            <div className="relative flex-shrink-0 cursor-pointer" onClick={() => setShowPhotoModal(true)}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                {student?.name?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || 'PP'}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight font-heading">
                Welcome back, {student?.name?.split(' ')[0] || 'Piyush'}! <span className="not-italic inline-block hover:animate-pulse cursor-default">👋</span>
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-1 leading-snug">
                {student?.className || 'Class 11'} ({student?.stream || 'Science Stream [PCM + CS]'}) <span className="text-slate-300">•</span> St. Xavier's School
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100 relative z-10">
            <div onClick={() => setActiveTab('attendance')} className="cursor-pointer group active:scale-[0.98] transition-all hover:border-emerald-300 hover:shadow-sm bg-gradient-to-b from-emerald-50/40 to-slate-50/50 rounded-2xl p-3.5 border border-emerald-100/70 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 text-emerald-700 mb-1 transition-colors group-hover:text-emerald-800">
                <UserCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="text-[10px] font-bold tracking-wider uppercase">ATTENDANCE</span>
              </div>
              <div className="text-2xl font-black text-slate-900 leading-tight">{overallAttendancePct}%</div>
              <div className="mt-1.5 inline-block px-2 py-0.5 bg-emerald-100/80 rounded-full text-emerald-800 text-[10px] font-semibold group-hover:bg-emerald-600 group-hover:text-white group-active:bg-emerald-600 group-active:text-white transition-colors">
                Safe &gt; 75%
              </div>
            </div>
            
            <div onClick={() => setActiveTab('timetable')} className="cursor-pointer group active:scale-[0.98] transition-all hover:border-blue-300 hover:shadow-sm bg-gradient-to-b from-blue-50/40 to-slate-50/50 rounded-2xl p-3.5 border border-blue-100/70 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 text-blue-700 mb-1 transition-colors group-hover:text-blue-800">
                <BookOpen className="w-3.5 h-3.5" strokeWidth={2.5} />
                <span className="text-[10px] font-bold tracking-wider uppercase">SUBJECTS</span>
              </div>
              <div className="text-2xl font-black text-slate-900 leading-tight">6 Active</div>
              <div className="mt-1.5 inline-block px-2.5 py-0.5 bg-blue-100/80 rounded-full text-blue-800 text-[10px] font-semibold group-hover:bg-blue-600 group-hover:text-white group-active:bg-blue-600 group-active:text-white transition-colors">
                Term 1
              </div>
            </div>
          </div>
        </section>

        {/* Core Modules Header */}
        <div className="pt-2 px-1">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight font-heading">ERP Core Modules</h2>
          <p className="text-xs text-slate-500 font-medium">Select a module to view detailed academic data & actions</p>
        </div>

        {/* Core Modules List */}
        <section className="flex flex-col gap-3">
          {moduleTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.id}
                onClick={() => setActiveTab(tile.id)}
                className={`group bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-sm flex items-center justify-between active:scale-[1.02] active:-translate-y-1 active:shadow-md hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer ${tile.borderColor}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0 ${tile.iconBg}`}>
                    <Icon className="w-6 h-6 group-hover:fill-current group-active:fill-current transition-all duration-200" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold transition-colors ${tile.titleColor}`}>{tile.title}</h3>
                    <p className={`text-xs mt-0.5 font-medium ${tile.descColor || 'text-slate-400'}`}>{tile.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${tile.badgeClass || 'bg-slate-100 text-slate-600 font-semibold'}`}>
                    {tile.badge}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </div>
              </div>
            );
          })}
        </section>

        {/* Class Schedule Section */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl">
                <Clock className="w-5 h-5" strokeWidth={2} />
              </div>
              <h2 className="text-base font-bold text-slate-900 font-heading">Class Schedule ({selectedDashboardDay})</h2>
            </div>
            <button onClick={() => setActiveTab('timetable')} className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              <span>Full Timetable</span>
              <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 border-b border-slate-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {availableDays.map((day) => {
              const isSelected = selectedDashboardDay === day;
              const slotCount = studentTimetable.filter((t) => t.day === day).length;
              const shortDay = day.slice(0, 3);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDashboardDay(day)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all active:scale-[0.98] ${
                    isSelected 
                      ? 'bg-blue-600 text-white font-bold shadow-sm' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{shortDay}</span>
                  <span className={`text-[10px] px-1 rounded-full ${
                    isSelected 
                      ? 'text-blue-600 bg-white' 
                      : 'text-slate-400 bg-white shadow-xs'
                  }`}>
                    {slotCount}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-3">
            {todayClasses.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                  <Clock className="w-6 h-6" strokeWidth={1.75} />
                </div>
                <h4 className="text-xs font-bold text-slate-700">No Classes Published for {selectedDashboardDay}</h4>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                  The Principal has not added periods for this day yet. Once published by the Principal, periods and teacher details will appear here.
                </p>
              </div>
            ) : (
              todayClasses.map((cls, idx) => {
                const att = getSlotAttendance(cls.subjectCode, cls.subjectName, todayDateStr, attendance);
                return (
                  <div key={cls.id} className="group cursor-pointer flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm hover:border-blue-200 active:border-blue-300 active:scale-[0.98] transition-all">
                    <div className="text-center min-w-[70px] pr-3 border-r border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                        Period {cls.periodNo || idx + 1}
                      </span>
                      <p className="text-[11px] font-black text-slate-900">{cls.startTime}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-slate-900 text-sm truncate">{cls.subjectName}</span>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        {cls.facultyName} • Room: {cls.roomNo}
                      </p>
                    </div>
                    {/* Attendance status */}
                    <div className="shrink-0">
                       {att.isMarked && att.status === 'Absent' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                            <XCircle className="w-3 h-3" /> Absent
                          </span>
                        ) : att.isMarked && att.status === 'Present' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3" /> Present
                          </span>
                        ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Next Examination Section */}
        <section className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" strokeWidth={2.2} />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">NEXT EXAMINATION</span>
            </div>
            <div className="w-6 h-1.5 bg-indigo-500 rounded-full"></div>
          </div>
          <div className="text-xs text-slate-500 font-medium">Subject Code:</div>
          <div className="text-sm font-bold text-slate-800 mt-0.5">{nextExam?.subjectCode || 'Not Announced Yet'}</div>
          <div className="mt-4 pt-3 border-t border-indigo-100/60 grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">EXAM DATE</div>
              <div className="text-xs font-semibold text-slate-700 mt-0.5">{nextExam?.date || '--'}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">HALL & SEAT</div>
              <div className="text-xs font-semibold text-slate-700 mt-0.5">{nextExam?.roomNo || ''} {nextExam?.seatNo ? `(${nextExam?.seatNo})` : '()'}</div>
            </div>
          </div>
        </section>

        {/* Recent Homework Section */}
        <section className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-blue-600" strokeWidth={2.2} />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">RECENT HOMEWORK</span>
            </div>
            <button onClick={() => setActiveTab('syllabus_homework')} className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-all active:scale-[0.98]">
              View All
            </button>
          </div>
          
          <div className="p-6 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center">
            {recentHomeworks.length > 0 ? (
              <div className="space-y-3 w-full text-left">
                {recentHomeworks.map(hw => {
                  const mySubmission = hw.submissions?.find(s => s.studentId === student?.id);
                  return (
                    <div key={hw.id} className="p-3 rounded-xl border border-slate-100 bg-white flex flex-col gap-1 hover:border-blue-200 active:border-blue-300 hover:shadow-sm cursor-pointer active:scale-[0.98] transition-all">
                      <h4 className="font-bold text-sm text-slate-800 truncate">{hw.title}</h4>
                      <p className="text-[11px] font-medium text-slate-500 truncate">{hw.subjectName}</p>
                      <div className="flex items-center justify-between mt-1 pt-1">
                         <span className="text-[10px] text-slate-500">{new Date(hw.uploadDate).toLocaleDateString()}</span>
                         {mySubmission ? (
                           <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600">Submitted</span>
                         ) : (
                           <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-600">Pending</span>
                         )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-400 mb-2">
                  <BookMarked className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div className="text-xs font-medium text-slate-500">No recent homework</div>
              </>
            )}
          </div>
        </section>

        {/* Student Leave Module */}
        <section className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" strokeWidth={2.2} />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">LEAVES & ABSENCE</span>
            </div>
            <button 
              onClick={() => setShowLeaveModal(true)}
              className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-all active:scale-[0.98]"
            >
              Apply Leave
            </button>
          </div>
          
          {latestLeave ? (
            <div 
              onClick={() => setShowLeaveModal(true)}
              className={`p-4 rounded-2xl border flex flex-col gap-2 cursor-pointer transition-all active:scale-[0.98] ${
                latestLeave.status === 'Approved' 
                  ? 'bg-emerald-50 border-emerald-100 hover:border-emerald-200' 
                  : latestLeave.status === 'Rejected'
                  ? 'bg-rose-50 border-rose-100 hover:border-rose-200'
                  : 'bg-amber-50 border-amber-100 hover:border-amber-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{latestLeave.type} Leave ({latestLeave.days} Days)</p>
                  <p className="text-[10px] font-medium text-slate-600 mt-0.5">{latestLeave.startDate} to {latestLeave.endDate}</p>
                </div>
                {latestLeave.status === 'Approved' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Approved
                  </span>
                )}
                {latestLeave.status === 'Pending' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center gap-1 border border-amber-200">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                )}
                {latestLeave.status === 'Rejected' && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center gap-1 border border-rose-200">
                    <XCircle className="w-3 h-3" /> Rejected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 italic leading-snug line-clamp-1 border-t border-slate-200/50 pt-2 mt-1">"{latestLeave.reason}"</p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setShowLeaveModal(true)}>
               <div>
                 <p className="text-xs font-bold text-slate-800">Need time off?</p>
                 <p className="text-[10px] text-slate-500 mt-0.5">Submit formal leave slips to your class teacher.</p>
               </div>
               <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                 <ArrowUpRight className="w-4 h-4" />
               </div>
            </div>
          )}
        </section>

      </main>

      {/* Modals */}
      <ProfilePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        targetRole="student"
      />
      <StudentLeaveModal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} />
      <StudentProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialTab={profileModalInitialTab}
      />
    </div>
  );
};
