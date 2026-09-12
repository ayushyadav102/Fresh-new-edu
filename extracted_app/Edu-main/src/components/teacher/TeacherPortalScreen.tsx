import { TeacherGradebookView } from './TeacherGradebookView';
import { TeacherMyLeaves } from './TeacherMyLeaves';
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { DEMO_STUDENTS, DEMO_TEACHERS } from '../../data/mockData';
import { StudentProfile, TeacherClassCode } from '../../types';

import { subscribeToChatMessages } from '../../services/chatService';
import { ChatMessage } from '../../types';

import { sortTimetableSlots, getTeacherScheduleFromTimetable, getTodayDayName, getTodayDateString, getSlotAttendance } from '../../utils/timetableUtils';
import {
  UserCheck,
  Home,
  User,
  FileSpreadsheet,
  BookOpen,
  Clock,
  FileCheck2,
  Megaphone,
  Users,
  UserPlus,
  GraduationCap,
  Check,
  X,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Send,
  Upload,
  Paperclip,
  Sparkles,
  Search,
  CheckCircle2,
  Calendar,
  Award,
  BookMarked,
  ShieldAlert,
  Download,
  Filter,
  Lock,
  Camera,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  LayoutDashboard,
  ChevronRight,
  RotateCcw,
  FileStack
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserAvatar } from '../common/UserAvatar';
import { ProfilePhotoModal } from '../common/ProfilePhotoModal';
import { TeacherTimetableEditor } from './TeacherTimetableEditor';
import { TeacherScheduleView } from './TeacherScheduleView';
import { TeacherAttendanceView } from './TeacherAttendanceView';
import { TeacherSyllabusHomeworkView } from './TeacherSyllabusHomeworkView';
import { TeacherExamsModule } from './TeacherExamsModule';
import { ChatBoxScreen } from '../chat/ChatBoxScreen';

import { saveAttendanceToCloud } from '../../services/cloudDbService';
import { downloadOrShareCSV } from '../../utils/fileExportUtils';
import {
  filterStudentsBySubject,
  getStreamCategory,
  getStreamBadgeStyle,
  isStudentEnrolledInSubject
} from '../../utils/subjectStreamMatcher';

const ALL_PORTAL_SUBJECTS = [
  { code: '042', name: 'Physics', fullName: 'Physics (Theory & Practical)', faculty: 'Mr. Rajesh Sharma', stream: 'Science PCM / PCB' },
  { code: '043', name: 'Chemistry', fullName: 'Chemistry (Theory & Lab)', faculty: 'Mrs. Sunita Verma', stream: 'Science PCM / PCB' },
  { code: '041', name: 'Mathematics', fullName: 'Mathematics (Calculus & Vectors)', faculty: 'Mr. Vikram Singh', stream: 'Science PCM / Commerce' },
  { code: '044', name: 'Biology', fullName: 'Biology (Botany & Zoology Lab)', faculty: 'Mrs. Ananya Gupta', stream: 'Science PCB' },
  { code: '083', name: 'Computer Science', fullName: 'Computer Science (Python & SQL)', faculty: 'Mr. Amit Kumar', stream: 'Science PCM / CS' },
  { code: '055', name: 'Accountancy', fullName: 'Financial Accounting & Reporting', faculty: 'Mr. Sanjay Agarwal', stream: 'Commerce' },
  { code: '054', name: 'Business Studies', fullName: 'Business Studies & Management', faculty: 'Mr. Sanjay Agarwal', stream: 'Commerce' },
  { code: '030', name: 'Economics', fullName: 'Micro & Macro Economics', faculty: 'Mr. Sanjay Agarwal', stream: 'Commerce / Humanities' },
  { code: '065', name: 'Informatics Practices', fullName: 'Informatics Practices (IP & Python)', faculty: 'Mr. Amit Kumar', stream: 'Commerce' },
  { code: '027', name: 'History', fullName: 'World & Indian History', faculty: 'Mr. Arvind Pandey', stream: 'Humanities' },
  { code: '028', name: 'Political Science', fullName: 'Indian Constitution & Politics', faculty: 'Mr. Arvind Pandey', stream: 'Humanities' },
  { code: '068', name: 'Agriculture Science', fullName: 'Agriculture Science (Agronomy & Soil)', faculty: 'Dr. Ramesh Patel', stream: 'Agriculture' },
  { code: '069', name: 'Agronomy Practical', fullName: 'Agronomy Crop Production Practical', faculty: 'Dr. Ramesh Patel', stream: 'Agriculture' },
  { code: '301', name: 'English Core', fullName: 'English Core (Literature & Language)', faculty: 'Mrs. Rekha Sharma', stream: 'All Streams' },
  { code: '302', name: 'Hindi Core', fullName: 'Hindi Core (Vyakaran & Sahitya)', faculty: 'Mr. Arvind Tiwari', stream: 'All Streams' },
  { code: '048', name: 'Physical Education', fullName: 'Physical Education & Sports', faculty: 'Mr. Vikram Singh', stream: 'All Streams' }
];

const getSubjectCodeByName = (name: string): string => {
  const n = (name || '').toLowerCase();
  if (n.includes('chem')) return '043';
  if (n.includes('math')) return '041';
  if (n.includes('comp') || n.includes('cs') || n.includes('python')) return '083';
  if (n.includes('eng')) return '301';
  if (n.includes('bio') || n.includes('botany') || n.includes('zoology')) return '044';
  if (n.includes('account') || n.includes('acc')) return '055';
  if (n.includes('business') || n.includes('bst')) return '054';
  if (n.includes('eco')) return '030';
  if (n.includes('ip') || n.includes('informatics')) return '065';
  if (n.includes('hist')) return '027';
  if (n.includes('pol')) return '028';
  if (n.includes('agri') && !n.includes('practic')) return '068';
  if (n.includes('agronom') || (n.includes('agri') && n.includes('practic'))) return '069';
  if (n.includes('physic') || n.includes('phy')) return '042';
  if (n.includes('pe') || n.includes('physical') || n.includes('sports')) return '048';
  return '042';
};

export type TeacherSubTab = 'attendance' | 'marks' | 'homework' | 'timetable' | 'exams' | 'notice' | 'roster' | 'add-student' | 'leave-requests' | 'chat' | 'my-leaves';

export interface TeacherModuleItem {
  id: TeacherSubTab;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}


export const TeacherPortalScreen: React.FC = () => {
  const { teacher, switchTeacher } = useAuth();
  const [showTeacherPhotoModal, setShowTeacherPhotoModal] = useState(false);

  const {
    students, teachers, classes, addNewStudent, attendance, getStudentAttendanceSummary,
    results, timetable, exams, updateStudentAttendanceBatch, studentLeaves,
    updateStudentLeaveStatus, staffLeaves, updateStudentMarksBatch, addLmsMaterial,
    activeTeacherClass, setActiveTeacherClass, teacherActiveSubTab, setTeacherActiveSubTab,
    addTimetableSlot, deleteTimetableSlot, teacherResources, addTeacherResource, deleteTeacherResource,
    addLmsAssignment, gradeAssignment, addExamItem, deleteExamItem, broadcastNotice, resetAllStudentAttendance, submitDailyClassReport
  } = useERP();

  const selectedClass: TeacherClassCode = (activeTeacherClass as TeacherClassCode) || '11';
  const setSelectedClass = (cls: TeacherClassCode) => {
    setActiveTeacherClass(cls);
  };

  const [liveChatMessages, setLiveChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const classCode = selectedClass.replace(/^Class\s*/i, '').trim();
    const unsubChat = subscribeToChatMessages(classCode, (msgs) => {
      setLiveChatMessages(msgs);
    });
    return () => unsubChat();
  }, [selectedClass]);

  const availableExams = exams.filter(e => {
     return (e.targetClass?.includes(selectedClass) || selectedClass.includes(e.targetClass || '')) && e.teacher === teacher?.name;
  });

  const examsMetricText = useMemo(() => {
      const activeExams = exams.filter(e => e.invigilator === teacher?.name || e.teacher === teacher?.name)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const upcoming = activeExams.filter(e => new Date(e.date) >= new Date());
      if (upcoming.length === 0) return 'No Upcoming Duties';
      const days = upcoming.slice(0, 3).map(e => new Date(e.date).getDate());
      return `Ph: ${days.join(', ')} Sep`; // Mock format as requested
  }, [exams, teacher]);

  const leavesMetricText = useMemo(() => {
     if (!teacher) return 'Apply for leaves';
     const myLeaves = (staffLeaves || []).filter(l => l.teacherId === teacher.id).sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime());
     const latest = myLeaves[0];
     if (!latest) return 'Apply for leaves';
     if (latest.status === 'Approved') {
        const startDay = new Date(latest.startDate).getDate();
        const endDay = new Date(latest.endDate).getDate();
        const month = new Date(latest.startDate).toLocaleString('en-US', { month: 'short' });
        if (startDay === endDay) {
           return `Approved: ${startDay} ${month}`;
        }
        return `Approved: ${startDay} to ${endDay} ${month}`;
     } else if (latest.status === 'Pending') {
        return `Pending: ${latest.totalDays} Days`;
     } else if (latest.status === 'Rejected') {
        return `Rejected`;
     }
     return 'Apply for leaves';
  }, [staffLeaves, teacher]);

  const unreadQueriesCount = useMemo(() => {
     return liveChatMessages.filter(m => m.senderId !== teacher?.id).length;
  }, [liveChatMessages, teacher]);



  // Homework & Syllabus State
  const [resTitle, setResTitle] = useState('');
  const [resMessage, setResMessage] = useState('');
  const [resType, setResType] = useState<'syllabus' | 'homework'>('homework');
  const [resSubject, setResSubject] = useState('');
  const [gradingState, setGradingState] = useState<{hwId: string, stuId: string, marks: string} | null>(null);
  const [resFile, setResFile] = useState<File | null>(null);

  const handleUploadResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle || !resFile) {
      alert('Please provide a title and select a PDF file.');
      return;
    }
    
    // Check file size limit (5MB for local storage demo is risky, let's allow up to 2MB)
    if (resFile.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit for local storage. Please select a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      addTeacherResource({
        type: resType,
        title: resTitle,
        subjectCode: resSubject || (teacher?.subjectsTaught?.[0] || 'Unknown Subject'),
        subjectName: resSubject || (teacher?.subjectsTaught?.[0] || 'Unknown Subject'),
        className: 'Class ' + selectedClass,
        fileName: resFile.name,
        fileData: reader.result as string,
        message: resMessage,
        uploadedBy: teacher?.name || 'Teacher'
      });
      setResTitle('');
      setResMessage('');
      setResFile(null);
    };
    reader.readAsDataURL(resFile);
  };

  const [isFocusedView, setIsFocusedView] = useState<boolean>(false);

  
  const todayDay = getTodayDayName();
  const todayDate = getTodayDateString();
  const todaySlots = useMemo(() => {
    return sortTimetableSlots(getTeacherScheduleFromTimetable(timetable, teacher, todayDay));
  }, [timetable, teacher, todayDay]);

  const TEACHER_MODULES: TeacherModuleItem[] = useMemo(() => [
    {
      id: 'attendance',
      title: 'Mark Attendance',
      desc: 'Live Student Sync & Biometric Gate Report',
      icon: UserCheck,
      tag: 'Daily'
    },
    {
      id: 'marks',
      title: 'Marks & Gradebook',
      desc: 'Internal, Term Tests & CBSE Saral Sync',
      icon: FileSpreadsheet,
      tag: 'Exams'
    },
    {
      id: 'homework',
      title: 'Syllabus & Homework',
      desc: 'Upload Lesson PDFs, Videos & Assignments',
      icon: BookOpen,
      tag: 'Resources'
    },
    {
      id: 'timetable',
      title: 'My Teaching Schedule',
      desc: 'Weekly Master Timetable & Lab Allocations',
      icon: Clock,
      tag: todaySlots && todaySlots.length > 0 ? `${todaySlots.length} Active Classes Today` : 'Weekly'
    },
    {
      id: 'exams',
      title: 'Exams & Syllabus',
      desc: 'Invigilation Duty Roster & Paper Blueprints',
      icon: FileCheck2,
      tag: examsMetricText
    },
    {
      id: 'notice',
      title: 'Broadcast Notice & SMS',
      desc: 'Push Instant Alerts to Class 11 Guardians',
      icon: Megaphone,
      tag: 'Announce'
    },
    {
      id: 'roster',
      title: 'Class Roster & Profiles',
      desc: 'Parent Contacts, Biometrics & Fee Status',
      icon: Users,
      tag: 'Students'
    },
    {
      id: 'add-student',
      title: 'Add New Student',
      desc: 'Quick Registration & Automatic Roll ID',
      icon: UserPlus,
      tag: 'Enroll'
    },
    {
      id: 'my-leaves',
      title: 'My Leaves',
      desc: 'Apply for Leaves & Check Approval Status',
      icon: FileStack,
      tag: leavesMetricText
    },
    {
      id: 'leave-requests',
      title: 'Student Leave Requests',
      desc: 'Medical Slips & Parent Approval System',
      icon: CheckCircle2,
      tag: 'Action Req.'
    },
    {
      id: 'chat',
      title: 'Chat Box',
      desc: 'Student Doubts, Parent Messages & Instant Chat',
      icon: MessageSquare,
      tag: unreadQueriesCount > 0 ? `${unreadQueriesCount} Unread Queries` : 'Chat'
    }
  ], [todaySlots, examsMetricText, leavesMetricText, unreadQueriesCount]);
  
  const liveSlotIndex = todaySlots.findIndex(slot => {
     // simple logic for now, could just check time. Let's just highlight the first one that is pending attendance, or if all done, none.
     const attInfo = getSlotAttendance(slot.subjectCode || '042', slot.subjectName, todayDate, attendance);
     return !attInfo.isMarked;
  });

  const allStudents = students && students.length > 0 ? students : DEMO_STUDENTS;

  const myClassCode = teacher?.classTeacherOf ? teacher.classTeacherOf.split(' ')[1] || '11' : '11';
  const myClassLabel = teacher?.classTeacherOf || 'Class 11-A';
  
  const myClassStudents = useMemo(() => {
    return allStudents.filter(s => {
      const clsClean = (s.className || '').replace(/^Class\s*/i, '').trim();
      return clsClean.startsWith(myClassCode) || (s.studentId && s.studentId.includes(`STU2026${myClassCode}`));
    });
  }, [allStudents, myClassCode]);

  const todaySummary = useMemo(() => {
    if (myClassStudents.length === 0) return { present: 0, absent: 0, total: 0, absentNames: [] };
    let present = 0;
    let absent = 0;
    const absentNames: any[] = [];
    myClassStudents.forEach((s, idx) => {
       const isAbsent = s.name.includes('Aman') || s.name.includes('Verma') || idx === 3;
       if (isAbsent) {
          absent++;
          absentNames.push(s);
       } else {
          present++;
       }
    });
    return { present, absent, total: myClassStudents.length, absentNames };
  }, [myClassStudents]);


  const teacherAssignedClassCode: TeacherClassCode = teacher?.classTeacherOf?.includes('12')
    ? '12'
    : teacher?.classTeacherOf?.includes('10')
    ? '10'
    : teacher?.classTeacherOf?.includes('9')
    ? '9'
    : '11';

  const isAssignedClassTeacher = selectedClass === teacherAssignedClassCode;
  const activeSubTab: TeacherSubTab = teacherActiveSubTab || 'attendance';
  const setActiveSubTab = (tab: TeacherSubTab) => {
    setTeacherActiveSubTab(tab);
  };

    useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.teacherSubTab) {
        setTeacherActiveSubTab(e.state.teacherSubTab);
        setIsFocusedView(true);
      } else {
        setIsFocusedView(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    if (isFocusedView) {
        window.history.replaceState({ ...window.history.state, teacherSubTab: activeSubTab }, '');
    } else {
        window.history.replaceState({ tab: 'teacher_portal' }, '');
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isFocusedView, activeSubTab, setTeacherActiveSubTab]);

  const handleOpenModule = (tab: TeacherSubTab) => {
    setActiveSubTab(tab);
    setIsFocusedView(true);
    window.history.pushState({ ...window.history.state, teacherSubTab: tab }, '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setIsFocusedView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auto-set selected class to teacher's assigned class on login/switch
  useEffect(() => {
    if (teacherAssignedClassCode) {
      setSelectedClass(teacherAssignedClassCode);
      setNewStuClass(teacherAssignedClassCode);
    }
  }, [teacher?.teacherId, teacherAssignedClassCode]);

  // Filter all students for the selected class
  const classStudents = useMemo(() => {
    return allStudents.filter((s) => {
      const clsClean = (s.className || '').replace(/^Class\s*/i, '').trim();
      return clsClean === selectedClass || clsClean.startsWith(selectedClass) || (s.studentId && s.studentId.includes(`STU2026${selectedClass}`));
    });
  }, [allStudents, selectedClass]);

  // Stream filter state ('AUTO' | 'ALL' | 'Science PCM' | 'Science PCB' | 'Commerce' | 'Agriculture' | 'Humanities')
  const [streamFilter, setStreamFilter] = useState<string>('AUTO');
  const [rosterStreamFilter, setRosterStreamFilter] = useState<string>('ALL');

  // --- 1. Attendance Local State ---
  const d = new Date(); const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); const [attDate, setAttDate] = useState(`${year}-${month}-${day}`);
  const [attSubject, setAttSubject] = useState(teacher?.subjectsTaught?.[0] || 'Physics');
  const [studentAttStatus, setStudentAttStatus] = useState<Record<string, 'Present' | 'Absent' | 'Leave' | 'Pending'>>(() => {
    const initial: Record<string, 'Present' | 'Absent' | 'Leave' | 'Pending'> = {};
    allStudents.forEach((s) => {
      initial[s.studentId] = 'Present';
    });
    return initial;
  });
  const [attSavedMessage, setAttSavedMessage] = useState('');

  // Subject-filtered students for Attendance: ONLY students taking this subject
  const filteredStudents = useMemo(() => {
    return filterStudentsBySubject(allStudents, selectedClass, attSubject, streamFilter);
  }, [allStudents, selectedClass, attSubject, streamFilter]);

  // --- 5. Add New Student Form State ---
  const [newStuClass, setNewStuClass] = useState<'9' | '10' | '11' | '12'>('11');
  const [newStuName, setNewStuName] = useState('');
  const [newStuRoll, setNewStuRoll] = useState('21');
  const [newStuStream, setNewStuStream] = useState('Science (PCM)');
  const [newStuEmail, setNewStuEmail] = useState('');
  const [newStuPhone, setNewStuPhone] = useState('9876543210');
  const [newStuFather, setNewStuFather] = useState('');
  const [newStuMother, setNewStuMother] = useState('');
  const [newStuParentPhone, setNewStuParentPhone] = useState('9876543210');
  const [newStuBlood, setNewStuBlood] = useState('O+');
  const [newStuDob, setNewStuDob] = useState('2008-05-15');
  const [newStuAvatar, setNewStuAvatar] = useState('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6');
  const [addStudentSuccess, setAddStudentSuccess] = useState<StudentProfile | null>(null);

  // Auto-calculate next Roll No when newStuClass or students list changes
  useEffect(() => {
    const classCount = allStudents.filter((s) => {
      const clsClean = s.className.replace(/^Class\s*/i, '').trim();
      return clsClean === newStuClass || clsClean.startsWith(newStuClass) || s.studentId.includes(`STU2026${newStuClass}`);
    }).length;
    setNewStuRoll(String(classCount + 1).padStart(2, '0'));
  }, [newStuClass, allStudents]);

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStuName.trim()) return;

    const rollId = `STU2026${newStuClass}${newStuRoll.padStart(2, '0')}`;
    const generatedEmail = newStuEmail.trim() || `${newStuName.toLowerCase().replace(/\s+/g, '')}${newStuRoll}@stxaviors.edu.in`;

    const createdStudent = addNewStudent({
      studentId: rollId,
      name: newStuName.trim(),
      email: generatedEmail,
      phone: newStuPhone.trim(),
      avatar: newStuAvatar,
      className: `Class ${newStuClass}`,
      rollNo: newStuRoll,
      stream: newStuStream,
      fatherName: newStuFather.trim() || 'Parent Guardian',
      motherName: newStuMother.trim() || 'Parent Guardian',
      parentPhone: newStuParentPhone.trim(),
      bloodGroup: newStuBlood,
      dob: newStuDob
    });

    setAddStudentSuccess(createdStudent);
    setNewStuName('');
    setNewStuFather('');
    setNewStuMother('');
    setNewStuEmail('');
  };

  useEffect(() => {
    if (allStudents.length > 0) {
      setStudentAttStatus((prev) => {
        const updated = { ...prev };
        allStudents.forEach((s) => {
          if (!updated[s.studentId]) {
            updated[s.studentId] = 'Present';
          }
        });
        return updated;
      });

      setMarksTable((prev) => {
        const updated = { ...prev };
        allStudents.forEach((s, idx) => {
          if (!updated[s.studentId]) {
            updated[s.studentId] = {
              internal: 25 + (idx % 5),
              external: 60 + (idx % 10)
            };
          }
        });
        return updated;
      });
    }
  }, [selectedClass, allStudents]);

  // Auto-sync active teacher subjects when teacher switches
  useEffect(() => {
    if (teacher?.subjectsTaught?.[0]) {
      const primarySub = teacher.subjectsTaught[0];
      setAttSubject(primarySub);
      setSubjectName(primarySub);
      setSubjectCode(getSubjectCodeByName(primarySub));
      setMatSubject(primarySub);
      setTtSubject(primarySub);
    }
  }, [teacher]);

  // Load existing attendance for this date & subject if available in storage/state
  useEffect(() => {
    try {
      const savedMap = localStorage.getItem('edux_student_attendance_map');
      if (savedMap) {
        const stuMap = JSON.parse(savedMap);
        const subLower = attSubject.toLowerCase();
        const updated: Record<string, 'Present' | 'Absent' | 'Leave' | 'Pending'> = {};

        filteredStudents.forEach((s) => {
          const stuRecords = stuMap[s.studentId];
          if (stuRecords && Array.isArray(stuRecords)) {
            const subRec = stuRecords.find((r: any) =>
              r.subjectName.toLowerCase().includes(subLower.split(' ')[0]) ||
              r.subjectCode === getSubjectCodeByName(attSubject)
            );
            const dateLog = subRec?.logs?.find((l: any) => l.date === attDate);
            if (dateLog && dateLog.status) {
              updated[s.studentId] = dateLog.status;
            }
          }
        });

        if (Object.keys(updated).length > 0) {
          setStudentAttStatus((prev) => ({ ...prev, ...updated }));
        }
      }
    } catch {}
  }, [attDate, attSubject, selectedClass, filteredStudents]);

  const handleAttStatusToggle = (studentId: string, status: 'Present' | 'Absent' | 'Leave' | 'Pending') => {
    setStudentAttStatus((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllAtt = (status: 'Present' | 'Absent' | 'Pending') => {
    const updated: Record<string, 'Present' | 'Absent' | 'Leave' | 'Pending'> = {};
    filteredStudents.forEach((s) => {
      updated[s.studentId] = status;
    });
    setStudentAttStatus((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveAttendance = async () => {
    const records = filteredStudents.map((s) => ({
      studentId: s.studentId,
      status: studentAttStatus[s.studentId] || 'Present'
    }));
    updateStudentAttendanceBatch(selectedClass, attSubject, attDate, records);

    // Auto-record teacher self-presence in class reports for Principal audit
    const presentCount = records.filter(r => r.status === 'Present').length;
    const absentCount = records.filter(r => r.status === 'Absent').length;
    try {
      submitDailyClassReport({
        date: attDate,
        className: selectedClass.startsWith('Class') ? selectedClass : `Class ${selectedClass}`,
        section: 'Section A',
        stream: 'Subject Specific',
        totalStudents: filteredStudents.length,
        presentStudents: presentCount,
        absentStudents: absentCount,
        facultiesPresentCount: 1,
        facultiesPresentNames: [`${teacher?.name || 'Faculty'} [ID: ${teacher?.teacherId || 'TCH'}] - Present`],
        submittedByTeacherName: teacher?.name || 'Faculty',
        teacherId: teacher?.teacherId || 'TCH001',
        teacherSelfStatus: 'Present',
        periodTaught: `Period - ${attSubject}`,
        subjectTaught: attSubject,
        remarks: `Live attendance conducted and verified by ${teacher?.name} (${teacher?.teacherId})`
      });
    } catch {}

    // Direct Live Sync to Google Cloud Firestore & Storage
    const absentList = filteredStudents.filter((s) => (studentAttStatus[s.studentId] || 'Present') === 'Absent');
    const reportId = `att-rep-${selectedClass}-${attDate}-${Date.now()}`;

    const studentLogs = filteredStudents.map((s, idx) => ({
      id: `log-${reportId}-${s.studentId}`,
      studentId: s.studentId,
      studentName: s.name,
      rollNo: s.rollNo || (idx + 1),
      className: selectedClass,
      subjectName: attSubject,
      status: studentAttStatus[s.studentId] || 'Present',
      date: attDate,
      markedByTeacherName: teacher?.name || 'Faculty'
    }));

    saveAttendanceToCloud(
      {
        id: reportId,
        date: attDate,
        classId: selectedClass,
        className: `Class ${selectedClass}`,
        subjectTaught: attSubject,
        totalStudents: filteredStudents.length,
        presentCount,
        absentCount: absentList.length,
        attendancePercentage: Math.round((presentCount / (filteredStudents.length || 1)) * 100),
        absentRollNos: absentList.map((s, i) => s.rollNo || (i + 1)),
        absentStudentNames: absentList.map((s) => s.name),
        submittedByTeacherName: teacher?.name || 'Faculty',
        submittedByTeacherId: teacher?.teacherId || 'TCH001'
      },
      studentLogs
    ).then((res) => {
      if (res.success) {
        console.log('✅ Google Cloud Firestore Live Attendance Synced successfully');
      }
    }).catch((err) => {
      console.warn('Google Cloud Firestore Sync notice:', err);
    });

    setAttSavedMessage(`✅ Attendance for ${filteredStudents.length} students in Class ${selectedClass} (${attSubject}) on ${attDate} successfully saved to Cloud Database!`);
    setTimeout(() => setAttSavedMessage(''), 5000);
  };

  // Export current class attendance to Excel / CSV
  const handleExportAttendanceExcel = () => {
    if (filteredStudents.length === 0) return;

    const headers = ['Roll No', 'Student ID', 'Student Name', 'Class', 'Subject', 'Status', 'Date', 'Teacher'];
    const rows = filteredStudents.map((s, idx) => [
      s.rollNo || (idx + 1),
      s.studentId,
      `"${s.name}"`,
      `"Class ${selectedClass}"`,
      `"${attSubject}"`,
      studentAttStatus[s.studentId] || 'Present',
      attDate,
      `"${teacher?.name || 'Faculty'}"`
    ]);

    const summaryBlock = [
      ['ST. XAVIER SENIOR SECONDARY SCHOOL - CLASS ATTENDANCE SHEET'],
      [`Date: ${attDate}`, `Class: ${selectedClass}`, `Subject: ${attSubject}`],
      [`Teacher: ${teacher?.name || 'Faculty'} (ID: ${teacher?.teacherId || 'TCH'})`],
      [`Total Students: ${filteredStudents.length}`, `Present: ${filteredStudents.filter((s) => (studentAttStatus[s.studentId] || 'Present') === 'Present').length}`, `Absent: ${filteredStudents.filter((s) => studentAttStatus[s.studentId] === 'Absent').length}`],
      [],
      headers
    ];

    const csvContent =
      summaryBlock.map((r) => r.join(',')).join('\n') +
      '\n' +
      rows.map((r) => r.join(',')).join('\n');

    downloadOrShareCSV({
      filename: `Attendance_Class_${selectedClass}_${attSubject.replace(/\s+/g, '_')}_${attDate}.csv`,
      title: `Attendance Class ${selectedClass} - ${attSubject} (${attDate})`,
      csvContent
    });
  };

  // --- 2. Marks Entry Local State ---
  const [examType, setExamType] = useState('Unit Test 1 (July 2025)');
  const [subjectCode, setSubjectCode] = useState(teacher?.subjectsTaught?.[0] ? getSubjectCodeByName(teacher.subjectsTaught[0]) : '042');
  const [subjectName, setSubjectName] = useState(teacher?.subjectsTaught?.[0] || 'Physics');

  const marksFilteredStudents = useMemo(() => {
    return filterStudentsBySubject(allStudents, selectedClass, subjectName, 'AUTO');
  }, [allStudents, selectedClass, subjectName]);

  const [marksTable, setMarksTable] = useState<
    Record<string, { internal: number | string; external: number | string }>
  >({});
  const [marksSavedMessage, setMarksSavedMessage] = useState('');

  const handleMarkChange = (studentId: string, field: 'internal' | 'external', val: string) => {
    let newValue: number | string = val;
    if (val !== '') {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) {
        newValue = Math.max(0, Math.min(field === 'internal' ? 30 : 70, parsed));
      }
    }
    setMarksTable((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { internal: '', external: '' }),
        [field]: newValue
      }
    }));
  };

  const calculateGrade = (total: number) => {
    if (total >= 91) return 'A1';
    if (total >= 81) return 'A2';
    if (total >= 71) return 'B1';
    if (total >= 61) return 'B2';
    if (total >= 51) return 'C1';
    if (total >= 41) return 'C2';
    return 'D';
  };

  const handlePublishMarks = () => {
    if (!isAssignedClassTeacher) {
      alert(`Permission Denied: You are logged in as ${teacher?.name} (${teacher?.classTeacherOf}). You can only edit and publish marks for ${teacher?.classTeacherOf}.`);
      return;
    }
    const marksData = (marksFilteredStudents || []).map((s) => {
      const entry = marksTable[s.studentId] || { internal: '', external: '' };
      const intVal = entry.internal === '' ? 0 : Number(entry.internal);
      const extVal = entry.external === '' ? 0 : Number(entry.external);
      const total = intVal + extVal;
      return {
        studentId: s.studentId,
        internalMarks: intVal,
        externalMarks: extVal,
        totalMarks: total,
        grade: calculateGrade(total)
      };
    });

    updateStudentMarksBatch(selectedClass, subjectCode, subjectName, examType, marksData);
    setMarksSavedMessage(`🎉 Grades & Report Card for Class ${selectedClass} (${subjectName}) published to student portals!`);
    setTimeout(() => setMarksSavedMessage(''), 4000);
  };

  // --- 3. LMS New Material & Assignment Forms ---
  const [matTitle, setMatTitle] = useState('');
  const [matSubject, setMatSubject] = useState(teacher?.subjectsTaught?.[0] || 'Physics');
  const [matChapter, setMatChapter] = useState('Chapter 4: Electrostatics & Potential');
  const [matType, setMatType] = useState<'PDF' | 'Video' | 'PPT' | 'Notes'>('PDF');
  const [matUrl, setMatUrl] = useState('https://stxaviersonline.edu/notes/physics_ch4.pdf');

  const [assignTitle, setAssignTitle] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('2025-08-30');
  const [assignTotalMarks, setAssignTotalMarks] = useState(25);
  const [assignDesc, setAssignDesc] = useState('');

  const [gradingMarks, setGradingMarks] = useState<Record<string, number>>({});

  const handleUploadMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle) return;
    const resolvedCode = getSubjectCodeByName(matSubject);
    const resolvedFileType = (matType === 'PDF' ? 'pdf' : matType === 'Video' ? 'video' : matType === 'PPT' ? 'slides' : 'doc') as 'pdf' | 'doc' | 'video' | 'slides' | 'zip' | 'code';
    addLmsMaterial({
      title: matTitle,
      subjectCode: resolvedCode,
      subjectName: matSubject,
      facultyName: teacher?.name || 'Subject Teacher',
      fileType: resolvedFileType,
      fileSize: '4.2 MB',
      description: 'Lecture notes and reference material for class',
      downloadUrl: matUrl,
      module: 'Unit 1'
    });
    setMatTitle('');
    alert(`Study Notes "${matTitle}" uploaded and broadcasted to Class ${selectedClass}!`);
  };

  const handlePostAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle) return;
    const resolvedCode = getSubjectCodeByName(matSubject);
    addLmsAssignment({
      title: assignTitle,
      subjectCode: resolvedCode,
      subjectName: matSubject,
      dueDate: assignDueDate,
      totalMarks: Number(assignTotalMarks),
      instructions: assignDesc || 'Solve all numerical questions step-by-step in your class register.'
    });
    setAssignTitle('');
    setAssignDesc('');
    alert(`Homework "${assignTitle}" published to Class ${selectedClass}!`);
  };

  // --- 4. Timetable Editor Local State ---
  const [ttDay, setTtDay] = useState('Monday');
  const [ttViewFilterDay, setTtViewFilterDay] = useState<'ALL' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('ALL');
  const [ttSubject, setTtSubject] = useState(teacher?.subjectsTaught?.[0] || 'Physics');
  const [ttStart, setTtStart] = useState('08:30 AM');
  const [ttEnd, setTtEnd] = useState('09:20 AM');
  const [ttType, setTtType] = useState<'Lecture' | 'Lab' | 'Tutorial' | 'Activity'>('Lecture');
  const [ttRoom, setTtRoom] = useState('Room 101');

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const dayExistingCount = timetable.filter((t) => t.day === ttDay).length;
    const resolvedCode = getSubjectCodeByName(ttSubject);
    addTimetableSlot({
      day: ttDay as any,
      periodNo: dayExistingCount + 1,
      startTime: ttStart,
      endTime: ttEnd,
      type: ttType,
      subjectCode: resolvedCode,
      subjectName: ttSubject,
      facultyName: teacher?.name || 'Faculty',
      roomNo: ttRoom,
      building: 'Senior Science Block'
    });
    alert(`Timetable period for ${ttSubject} (${ttStart} - ${ttEnd}) added on ${ttDay}!`);
  };

  // --- 5. Exams Local State ---
  // (Moved to TeacherExamsModule)

  // --- 6. Broadcast Notice Local State ---
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');
  const [noticePriority, setNoticePriority] = useState<'High' | 'Medium' | 'Low'>('High');

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle || !noticeMsg) return;
    broadcastNotice(selectedClass, noticeTitle, noticeMsg, noticePriority);
    setNoticeTitle('');
    setNoticeMsg('');
    alert(`Notice broadcasted to all students of Class ${selectedClass}!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. CLEAN NAVIGATION BAR (Rendered when a module is opened) */}
      {/* ========================================================================= */}
      {isFocusedView ? (
        (activeSubTab === 'chat' || activeSubTab === 'homework') ? null : (
          <div className="flex items-center justify-between flex-wrap gap-2.5 pt-1 pb-2">
            

            {/* Clean Class Switcher just like Chatroom below */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Switch Class:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(['9', '10', '11', '12'] as const).map((cls) => {
                  const isSelected = selectedClass === cls;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700 border border-slate-200 dark:border-neutral-700'
                      }`}
                    >
                      Class {cls}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )
      ) : (

        /* ========================================================================= */
        /* 2. OVERVIEW DASHBOARD (Teacher Profile, Schedule & 8 Action Modules) */
        /* ========================================================================= */
        <>
          {/* Main Dashboard Layout matching High Fidelity UI */}
          <div className="space-y-4 max-w-[500px] mx-auto w-full">
            
            {/* Teacher Profile Card */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-200 space-y-5 relative">
              {/* Badges Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold flex items-center gap-1.5 tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    TEACHER PORTAL & EDIT DESK
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold flex items-center gap-1.5 tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    2025-26
                  </div>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-200">
                  <Camera className="w-3.5 h-3.5" />
                  Edit
                </button>
              </div>

                            {/* Profile Info */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl ${teacher?.name.includes('Sunita') ? 'bg-rose-500 shadow-rose-500/20' : teacher?.name.includes('Aarti') ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-blue-600 shadow-blue-500/20'} text-white flex items-center justify-center text-2xl font-bold shadow-md`}>
                    {teacher?.name ? teacher.name.split(' ').slice(-2).map(n => n[0]).join('').toUpperCase() : 'T'}
                  </div>
                  <button className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${teacher?.name.includes('Sunita') ? 'bg-rose-500' : teacher?.name.includes('Aarti') ? 'bg-indigo-500' : 'bg-blue-600'} text-white border-2 border-white flex items-center justify-center shadow-sm`}>
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-[20px] font-black text-slate-900 leading-tight tracking-tight">{teacher?.name || 'Faculty Member'}</h2>
                  <p className="text-[13px] font-bold text-blue-600">{teacher?.designation || 'Teacher'}</p>
                  <p className="text-[11px] font-medium text-slate-500">{teacher?.department} • Faculty ID: <span className="font-bold text-slate-700">{teacher?.teacherId}</span></p>
                </div>
              </div>

              {/* Class Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400 tracking-wider">SELECT ACTIVE CLASS (4 ASSIGNED):</span>
                  <span className="text-blue-600 cursor-pointer hover:underline">View All</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {['9-A', '10-A', '11-A', '11-B', '12-A'].map((cls) => {
                    const isSelected = selectedClass === cls;
                    return (
                      <button 
                        key={cls}
                        onClick={() => setSelectedClass(cls as any)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5' 
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Class {cls}
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

                            {/* KPIs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-[20px] bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider">ACTIVE CLASS ROSTER</p>
                  <p className="text-[15px] font-black text-slate-900">{classStudents.length} Students</p>
                  <p className="text-[11px] font-bold text-blue-600">Class {selectedClass}</p>
                </div>
                <div className="p-3.5 rounded-[20px] bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider">ASSIGNED SUBJECT</p>
                  <p className="text-[15px] font-black text-slate-900 line-clamp-1">{teacher?.subjectsTaught?.[0] || 'General'}</p>
                  <p className="text-[11px] font-bold text-slate-500 line-clamp-1">{teacher?.subjectsTaught?.slice(1).join(', ') || 'Core'}</p>
                </div>
                <div className="p-3.5 rounded-[20px] bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider">CLASS IN-CHARGE</p>
                  <p className="text-[13px] font-black text-emerald-600 flex items-center gap-1.5">
                    {teacher?.classTeacherOf ? <><Check className="w-4 h-4" /> {teacher.classTeacherOf}</> : <><X className="w-4 h-4" /> None</>}
                  </p>
                </div>
                <div className="p-3.5 rounded-[20px] bg-slate-50 border border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider">PORTAL MODE</p>
                  <p className="text-[13px] font-black text-teal-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span> Full Edit & Sync
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-200 space-y-5 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-wide">TODAY'S TEACHING SCHEDULE</h3>
                    <p className="text-[11px] font-semibold text-slate-500">{todayDay} • {todaySlots.length} Lectures Assigned</p>
                  </div>
                </div>
                {liveSlotIndex !== -1 && (
                  <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold tracking-wide">
                    1 Live Now
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {todaySlots.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-100">
                    No lectures scheduled by the Principal for today.
                  </div>
                ) : (
                  todaySlots.map((slot, idx) => {
                    const attInfo = getSlotAttendance(slot.subjectCode || '042', slot.subjectName, todayDate, attendance);
                    const isDone = attInfo.isMarked;
                    const isLive = idx === liveSlotIndex;

                    return (
                      <div key={slot.id} className={`flex items-start gap-3 ${isLive ? 'relative' : ''}`}>
                        {isLive && <div className="absolute top-12 bottom-12 left-5 w-px bg-slate-100 -z-10"></div>}
                        
                        <div className={`w-10 h-10 rounded-full flex flex-col items-center justify-center shrink-0 ${isLive ? 'bg-blue-600 text-white ring-4 ring-blue-50 shadow-md shadow-blue-500/20 relative z-10' : 'bg-slate-100 text-slate-500'}`}>
                          <span className="text-[11px] font-black leading-none">P{slot.periodNo || idx + 1}</span>
                          <span className="text-[8px] font-bold mt-0.5">{isLive ? 'NOW' : slot.startTime.split(' ')[0]}</span>
                          {isLive && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>}
                        </div>

                        <div className={`flex-1 ${isLive ? 'p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative z-10' : 'pb-4 border-b border-slate-100'}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-[13px] font-black text-slate-900">
                                Class {slot.classCode} • {slot.subjectName.split('(')[0].trim()} <span className={`ml-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${isLive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{slot.roomNo}</span>
                              </p>
                              {isDone ? (
                                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                                  <Check className="w-3.5 h-3.5" /> Attendance Marked
                                </p>
                              ) : isLive ? (
                                <p className="text-[11px] font-medium text-slate-500 mt-1">{slot.startTime} – {slot.endTime}</p>
                              ) : (
                                <p className="text-[11px] font-medium text-slate-400 mt-1">Starts at {slot.startTime}</p>
                              )}
                            </div>
                            
                            {isDone ? (
                              <span className="text-[11px] font-bold text-slate-400">Done</span>
                            ) : isLive ? (
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            ) : null}
                          </div>

                          {isLive && !isDone && (
                            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                              <span className="text-[11px] font-semibold text-slate-600">Pending Session Register</span>
                              <button onClick={() => { setActiveTeacherClass(slot.classCode as any); setTeacherActiveSubTab('attendance'); setIsFocusedView(true); }} className="px-4 py-2 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-transform cursor-pointer">
                                Mark Attendance <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Science Health Card */}
            <div className="bg-[#1e2330] text-white rounded-[24px] p-5 space-y-4 shadow-lg shadow-slate-900/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black tracking-wider uppercase">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  {myClassLabel.toUpperCase()} HEALTH
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-mono text-slate-300">Daily Sync</div>
              </div>
              <div className="grid grid-cols-3 gap-2 border-b border-white/10 pb-4">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold tracking-wider mb-1">ATTENDANCE</p>
                  <p className="text-xl font-black">{todaySummary.present}/{todaySummary.total} <span className="text-emerald-400 text-sm">({todaySummary.total > 0 ? Math.round((todaySummary.present/todaySummary.total)*100) : 0}%)</span></p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold tracking-wider mb-1">ABSENTEE</p>
                  <p className={`text-base font-black mt-1 ${todaySummary.absent > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{todaySummary.absent} Student{todaySummary.absent !== 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold tracking-wider mb-1">HW PENDING</p>
                  <p className="text-base font-black text-amber-400 mt-1">2 Reviews</p>
                </div>
              </div>
              {todaySummary.absentNames.length > 0 ? (
                 <div className="flex items-center justify-between">
                   <span className="text-xs font-medium text-slate-300 truncate pr-2">Roll {todaySummary.absentNames[0].rollNo || '04'}: {todaySummary.absentNames[0].name} (Uninformed)</span>
                   <button className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
                     <MessageSquare className="w-3.5 h-3.5" /> Notify Guardian
                   </button>
                 </div>
              ) : (
                 <div className="flex items-center justify-between">
                   <span className="text-xs font-medium text-slate-300">All students present today.</span>
                   <button className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
                     <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Perfect Day
                   </button>
                 </div>
              )}
            </div>

                        {/* Action Modules Vertical List (matching screenshot) */}
            <div className="mt-8 mb-4">
              <div className="flex items-center justify-between px-1 mb-3">
                <div>
                  <h2 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-wider">TEACHER MANAGEMENT DESK</h2>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Direct Portal Controls & Data Sync</p>
                </div>
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 font-mono bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                  {TEACHER_MODULES.length} Active Modules
                </span>
              </div>
              
              <div className="space-y-3">
                {TEACHER_MODULES.map((box) => {
                  const Icon = box.icon;
                  
                  // Dynamic styles matching the screenshot exactly
                  let iconBg = 'bg-slate-100 text-slate-600';
                  let footerText = '';
                  let footerColor = 'text-slate-500';
                  let ctaText = 'Open Page';
                  
                  switch(box.id) {
                    case 'attendance':
                      iconBg = 'bg-purple-100 text-purple-600';
                      footerText = `Current Session: Class ${selectedClass} Pending`;
                      footerColor = 'text-slate-400';
                      break;
                    case 'marks':
                      iconBg = 'bg-blue-100 text-blue-600';
                      footerText = 'Term 1 Results Locked';
                      footerColor = 'text-emerald-600 font-bold';
                      break;
                    case 'homework':
                      iconBg = 'bg-indigo-100 text-indigo-600';
                      footerText = '2 Homework Submissions Due';
                      footerColor = 'text-amber-600 font-bold';
                      break;
                    case 'timetable':
                      iconBg = 'bg-amber-100 text-amber-600';
                      footerText = 'Total: 22 Periods/Week';
                      footerColor = 'text-slate-400';
                      break;
                    case 'exams':
                      iconBg = 'bg-rose-100 text-rose-600';
                      footerText = 'Mid-Term: Oct 14';
                      footerColor = 'text-slate-400';
                      break;
                    case 'notice':
                      iconBg = 'bg-cyan-100 text-cyan-600';
                      footerText = 'Template: CBSE Practical Prep';
                      footerColor = 'text-slate-400';
                      break;
                    case 'roster':
                      iconBg = 'bg-emerald-100 text-emerald-600';
                      footerText = `${classStudents.length} Active Student Profiles`;
                      footerColor = 'text-slate-400';
                      break;
                    case 'add-student':
                      iconBg = 'bg-emerald-100 text-emerald-600';
                      footerText = `Class ${selectedClass} Seat Quota: 40`;
                      footerColor = 'text-slate-400';
                      break;
                    case 'leave-requests':
                      iconBg = 'bg-orange-100 text-orange-600';
                      footerText = '1 Medical Leave Awaiting Sign-off';
                      footerColor = 'text-orange-600 font-bold';
                      ctaText = 'Review';
                      break;
                    case 'chat':
                      iconBg = 'bg-violet-100 text-violet-600';
                      footerText = 'Direct Student & Parent Communication';
                      footerColor = 'text-violet-600 font-bold';
                      ctaText = 'Open Chat';
                      break;
                    default:
                      break;
                  }

                  return (
                    <div
                      key={box.id}
                      onClick={() => handleOpenModule(box.id)}
                      className="bg-white dark:bg-[#0a0a0a] rounded-[24px] p-4 border border-slate-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group active:scale-[0.98] active:bg-slate-50 dark:active:bg-neutral-900/50 flex flex-col gap-3"
                    >
                      {/* Top Row: Icon, Title, Desc, Tag */}
                      <div className="flex items-start gap-3.5">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${iconBg} transition-all duration-300 group-hover:scale-110 group-active:scale-90 group-hover:rotate-[-8deg] shadow-sm group-hover:shadow-md`}>
                          <Icon className="w-[18px] h-[18px]" />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-[14px] font-black text-slate-900 dark:text-white truncate group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                              {box.title}
                            </h3>
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-50 dark:bg-neutral-900 text-slate-500 dark:text-slate-400 rounded-md shrink-0 border border-slate-200 dark:border-neutral-800">
                              {box.tag}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {box.desc}
                          </p>
                        </div>
                      </div>
                      
                      {/* Bottom Footer Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-neutral-800/60">
                        <span className={`text-[11px] ${footerColor}`}>
                          {footerText}
                        </span>
                        <div className="text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1 group-hover:gap-1.5 transition-all">
                          {ctaText} <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 3. ACTIVE SUB-MODULE VIEWS (Shown when in Focused View or directly) */}
      {/* ========================================================================= */}
      {isFocusedView && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* --- SUB-TAB 1: ATTENDANCE MARKER & SYNC --- */}
      {activeSubTab === 'attendance' && (
        <TeacherAttendanceView selectedClass={selectedClass} subjectName={attSubject} />
      )}

      {/* --- SUB-TAB 2: MARKS & REPORT CARD GRADEBOOK --- */}
      {activeSubTab === 'marks' && (
        <TeacherGradebookView selectedClass={selectedClass} subjectName={attSubject} />
      )}

      {/* --- SUB-TAB 3: SYLLABUS & HOMEWORK --- */}
      {activeSubTab === 'homework' && (
        <TeacherSyllabusHomeworkView
          selectedClass={selectedClass}
          onSelectClass={setSelectedClass}
          onBackToDashboard={handleBackToDashboard}
        />
      )}

      {/* --- SUB-TAB 4: TEACHER'S PERSONAL TEACHING SCHEDULE (LIVE FROM PRINCIPAL) --- */}
      {activeSubTab === 'timetable' && (
        <TeacherScheduleView
          onNavigateToAttendance={(classCode, subjectName) => {
            setSelectedClass(classCode);
            if (subjectName) {
              setAttSubject(subjectName);
            }
            setStreamFilter('AUTO');
            setActiveSubTab('attendance');
          }}
        />
      )}

      {/* --- SUB-TAB 5: EXAMS & SYLLABUS --- */}
      {activeSubTab === 'exams' && (
        <TeacherExamsModule teacher={teacher} selectedClass={selectedClass} />
      )}

      {/* --- SUB-TAB 6: BROADCAST NOTICE --- */}
      {activeSubTab === 'notice' && (
        <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-md space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-600" />
              Broadcast School Notice to Class {selectedClass}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Send instant high-priority alerts directly to student notification feeds.
            </p>
          </div>

          <form onSubmit={handleSendNotice} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Notice Heading / Title</label>
              <input
                type="text"
                placeholder="e.g. Physics Lab Practical Exam Submission Deadline Extended"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                className="w-full mt-1 p-3 bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white font-bold"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Notice Message Details</label>
              <textarea
                rows={4}
                value={noticeMsg}
                onChange={(e) => setNoticeMsg(e.target.value)}
                placeholder="Write message content here..."
                className="w-full mt-1 p-3 bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white resize-none"
                required
              />
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 mr-2">Priority Level:</label>
                <select
                  value={noticePriority}
                  onChange={(e) => setNoticePriority(e.target.value as any)}
                  className="p-2 bg-slate-100 dark:bg-neutral-900 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="High">High (Urgent Red Alert)</option>
                  <option value="Medium">Medium (Regular Notice)</option>
                  <option value="Low">Low (Informational)</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2 active:scale-[0.98] duration-150 ease-in-out"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast Notice Now</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- SUB-TAB 7: STUDENT ROSTER --- */}
      {activeSubTab === 'roster' && (
        <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Class Roster ({selectedClass} • {classStudents.length} Students)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete student directory with guardian phone numbers and school fee payment status.
              </p>
            </div>
            <button
              onClick={() => {
                setNewStuClass(selectedClass);
                setAddStudentSuccess(null);
                setActiveSubTab('add-student');
              }}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all self-start sm:self-auto ease-in-out active:scale-[0.98] duration-150"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Student to {selectedClass}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(classStudents || []).map((stu) => (
              <div
                key={stu.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 space-y-2 text-xs hover:border-purple-500/40 transition-all active:scale-[0.98] duration-150 ease-in-out"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar avatar={stu.avatar} name={stu.name} role="student" size="md" ringColor="ring-purple-500/20" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{stu.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Roll #{stu.rollNo} • ID: {stu.studentId}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-neutral-700/80 space-y-1 text-[11px]">
                  <p className="text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-400">Stream:</span> {stu.stream}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-400">Father:</span> {stu.fatherName}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-400">Parent Phone:</span> {stu.parentPhone}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-semibold text-slate-400">Fee Status:</span>
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Fees Paid
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUB-TAB 8: ADD NEW STUDENT --- */}
      {activeSubTab === 'add-student' && (
        <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-neutral-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                Enroll New Student to Class Roster
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register a new student directly into Class {newStuClass}. Automatically assigns Roll ID and syncs across attendance, marks, and logins.
              </p>
            </div>
            {addStudentSuccess && (
              <button
                onClick={() => setAddStudentSuccess(null)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer ease-in-out active:scale-[0.98] transition-all duration-150"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Student</span>
              </button>
            )}
          </div>

          {/* Success Card Modal/Banner */}
          {addStudentSuccess && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                    Student Enrolled Successfully!
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {addStudentSuccess.name} has been enrolled in {addStudentSuccess.className} with unique Roll ID <span className="font-mono font-bold">{addStudentSuccess.studentId}</span>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <UserAvatar avatar={addStudentSuccess.avatar} name={addStudentSuccess.name} role="student" size="md" ringColor="ring-emerald-500/30" />
                  <div className="text-xs">
                    <h4 className="font-bold text-slate-900 dark:text-white">{addStudentSuccess.name}</h4>
                    <p className="text-slate-500 font-mono text-[11px]">
                      ID: {addStudentSuccess.studentId} • Roll #{addStudentSuccess.rollNo}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {addStudentSuccess.className} ({addStudentSuccess.stream})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedClass(newStuClass);
                      setActiveSubTab('roster');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                  >
                    View in Class Roster
                  </button>
                  <button
                    onClick={() => {
                      setSelectedClass(newStuClass);
                      setActiveSubTab('attendance');
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                  >
                    Mark Attendance Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {!addStudentSuccess && (
            <form onSubmit={handleAddStudentSubmit} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Target Class */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Select Class <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newStuClass}
                    onChange={(e) => setNewStuClass(e.target.value as '9' | '10' | '11' | '12')}
                    className="w-full p-2.5 bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-bold text-slate-900 dark:text-white cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                  >
                    <option value="9">Class 9 (Junior Secondary)</option>
                    <option value="10">Class 10 (Secondary Board Batch)</option>
                    <option value="11">Class 11 (Senior Secondary)</option>
                    <option value="12">Class 12 (Board Batch)</option>
                  </select>
                </div>

                {/* Roll Number */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Roll Number (Auto Assigned) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStuRoll}
                    onChange={(e) => setNewStuRoll(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-bold text-slate-900 dark:text-white"
                    required
                  />
                </div>

                {/* Generated Student ID Preview */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Generated Unique Roll ID
                  </label>
                  <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-xl font-mono font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-purple-600" />
                    <span>
                      STU2026{newStuClass}
                      {newStuRoll.padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rohan Sharma"
                    value={newStuName}
                    onChange={(e) => setNewStuName(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                    required
                  />
                </div>

                {/* Stream */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Academic Stream / Branch
                  </label>
                  <select
                    value={newStuStream}
                    onChange={(e) => setNewStuStream(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-semibold text-slate-900 dark:text-white cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                  >
                    <option value="Science (PCM)">Science (PCM - Physics, Chem, Math)</option>
                    <option value="Science (PCB)">Science (PCB - Physics, Chem, Bio)</option>
                    <option value="Commerce">Commerce (Accounts, Eco, Business)</option>
                    <option value="Arts / Humanities">Arts / Humanities</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Student Email */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Student Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rohan.sharma@stxaviors.edu.in"
                    value={newStuEmail}
                    onChange={(e) => setNewStuEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>

                {/* Student Phone */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Student Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={newStuPhone}
                    onChange={(e) => setNewStuPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={newStuDob}
                    onChange={(e) => setNewStuDob(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Father's Name */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Father's / Guardian Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Sharma"
                    value={newStuFather}
                    onChange={(e) => setNewStuFather(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>

                {/* Mother's Name */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunita Sharma"
                    value={newStuMother}
                    onChange={(e) => setNewStuMother(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-medium text-slate-900 dark:text-white"
                  />
                </div>

                {/* Parent Contact */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                    Parent Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={newStuParentPhone}
                    onChange={(e) => setNewStuParentPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-100 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl font-medium text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Avatar Preset Selector */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                  Select Profile Avatar Preset
                </label>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {[
                    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
                  ].map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewStuAvatar(imgUrl)}
                      className={`relative rounded-full p-0.5 cursor-pointer transition-all shrink-0 ${
                        newStuAvatar === imgUrl
                          ? 'ring-4 ring-purple-600 scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`Avatar option ${i + 1}`} className="w-12 h-12 rounded-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-neutral-800 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 cursor-pointer flex items-center gap-2 text-xs transition-all active:scale-[0.98] duration-150 ease-in-out"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Enrol Student in Class {newStuClass}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* --- SUB-TAB: MY LEAVES --- */}
      {activeSubTab === 'my-leaves' && (
        <TeacherMyLeaves />
      )}

      {/* --- SUB-TAB 9: LEAVE REQUESTS --- */}
      {activeSubTab === 'leave-requests' && (() => {
        const classCode = selectedClass.replace(/^Class\s*/i, '').trim();
        const classLeaves = (studentLeaves || []).filter(l => 
          (l.className || '').toLowerCase().includes(classCode.toLowerCase())
        ).sort((a, b) => new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime());
        
        const pendingCount = classLeaves.filter(l => l.status === 'Pending').length;

        return (
        <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-neutral-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-orange-600" />
                Student Leave Requests & Medical Slips
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Medical Slips & Parent Approval System for Class {selectedClass}.
              </p>
            </div>
            {pendingCount > 0 && (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 w-fit">
                {pendingCount} Pending Review{pendingCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {classLeaves.length > 0 ? (
            <div className="space-y-4">
              {classLeaves.map(leave => (
                <div key={leave.id} className="border border-slate-200 dark:border-neutral-800 rounded-xl p-5 bg-slate-50/50 dark:bg-neutral-900/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {leave.studentName} (Roll {leave.rollNo || '00'})
                      </h4>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
                        {leave.type} Leave ({leave.days} Days) &bull; {leave.startDate} to {leave.endDate}
                      </p>
                    </div>
                    {leave.status === 'Approved' && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-900">
                        Approved
                      </span>
                    )}
                    {leave.status === 'Rejected' && (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-100 dark:border-rose-900">
                        Rejected
                      </span>
                    )}
                    {leave.status === 'Pending' && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-100 dark:border-amber-900">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 p-3 bg-white dark:bg-[#0a0a0a] rounded-lg border border-slate-100 dark:border-neutral-800 leading-relaxed italic">
                    "{leave.reason}"
                  </p>
                  
                  {leave.documentName && (
                    <div className="flex items-center gap-2 mt-3 text-xs">
                      <span className="text-slate-400 font-medium">Attachment:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1">
                        {leave.documentName} ({leave.documentSize || '1.2 MB'})
                      </span>
                    </div>
                  )}
                  
                  {leave.status === 'Pending' && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-neutral-800">
                      <button 
                        onClick={() => updateStudentLeaveStatus?.(leave.id, 'Approved')}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 active:scale-[0.98]"
                      >
                        Approve Leave
                      </button>
                      <button 
                        onClick={() => updateStudentLeaveStatus?.(leave.id, 'Rejected')}
                        className="flex-1 py-2 rounded-xl bg-white dark:bg-[#0a0a0a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-900 text-xs font-bold transition-all active:scale-[0.98]"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800 p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 dark:bg-neutral-900/30">
              <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-neutral-600 mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Leave Requests</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                There are no leave requests from students in Class {selectedClass}.
              </p>
            </div>
          )}
        </div>
        );
      })()}

      {/* --- SUB-TAB 10: CHAT BOX --- */}
      {activeSubTab === 'chat' && (
        <div id="teacher-chat-box-container" className="space-y-4">
          <ChatBoxScreen 
            onBack={handleBackToDashboard} 
            isTeacherView={true} 
            selectedClass={selectedClass} 
            onSelectClass={(cls) => setSelectedClass(cls as any)} 
          />
        </div>
      )}

      {/* Bottom Back to Dashboard Button when in Focused View (hidden in Chat Box & Homework view as they have their own styled bottom bar) */}
      {activeSubTab !== 'chat' && activeSubTab !== 'homework' && (
        <div className="pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-neutral-800">
          
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Active Class: <strong className="text-purple-600 dark:text-purple-400">Class {selectedClass}</strong></span>
            <span>•</span>
            <span>Logged: <strong className="text-slate-800 dark:text-slate-200">{teacher?.name}</strong></span>
          </div>
        </div>
      )}
    </div>
  )}

      {/* Teacher Profile Photo Upload Modal */}
      <ProfilePhotoModal
        isOpen={showTeacherPhotoModal}
        onClose={() => setShowTeacherPhotoModal(false)}
        targetRole="teacher"
      />
    </div>
  );
};
