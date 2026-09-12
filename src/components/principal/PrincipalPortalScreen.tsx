import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { SchoolClassInfo, TeacherProfile, StudentProfile } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { ProfilePhotoModal } from '../common/ProfilePhotoModal';
import { PrincipalStaffView } from './PrincipalStaffView';
import { PrincipalAcademicsView } from './PrincipalAcademicsView';
import { PrincipalTimetableManager } from './PrincipalTimetableManager';
import { PrincipalDailyAttendanceView } from './PrincipalDailyAttendanceView';
import {
  School, MapPin, Star, FileText,
  Users, UserCheck, GraduationCap, BookOpen,
  Plus, Edit3, Trash2, CheckCircle2, AlertCircle,
  Search, Filter, ArrowRightLeft, ArrowLeft,
  Megaphone, ShieldCheck, Building, Sparkles,
  Phone, Mail, DoorOpen, Briefcase, ChevronRight,
  TrendingUp, Layers, Award, Check, X,
  FileCheck, FileDigit, Loader2, ArrowUpRight,
  TrendingDown, Info, UploadCloud, Link as LinkIcon,
  Video, UserMinus, Monitor, PlayCircle, Settings,
  Calendar, Printer, AlertTriangle, Fingerprint, LogOut,
  MoreVertical, FileSpreadsheet, Send, FileAudio,
  HelpCircle, IndianRupee, CalendarCheck, BarChart3,
  Receipt, FileCheck2, Clock, CalendarDays, Camera,
  MoreHorizontal, UserPlus, Download, MessageSquare,
  MessageCircle, Eye, CreditCard, Edit2, Save,
  LayoutGrid, List, Banknote
} from 'lucide-react';
import { PrincipalExamsModule } from './PrincipalExamsModule';
import { PrincipalFeesModule } from './PrincipalFeesModule';

export const PrincipalPortalScreen: React.FC = () => {
  const { principal, role } = useAuth();
  const {
    classes,
    teachers,
    students,
    schoolFeeSummary,
    staffLeaves,
    staffAttendanceLogs,
    academicAnalytics,
    updateClassCapacity,
    assignClassTeacher,
    assignSubjectTeacherToClass,
    addSubjectToClass,
    removeSubjectFromClass,
    addNewSchoolClass,
    updateClassDetails,
    deleteSchoolClass,
    updateTeacherAssignments,
    addNewTeacher,
    addNewStudent,
    updateStudentProfile,
    transferStudentClass,
    principalBroadcast,
    notifications,
    exams,
    addExamItem,
    updateExamItem,
    deleteExamItem
  } = useERP();

  // Active Tab within Principal Desk
  const [activeSubTab, setActiveSubTab] = useState<
    'classes' | 'teachers' | 'students' | 'circulars' | 'financials' | 'staff' | 'academics' | 'timetable' | 'daily-attendance' | 'exam-schedule' | 'student-fees'
  >('classes');

  // Focused view state (opens module directly with Back to Dashboard button)
  const [isFocusedView, setIsFocusedView] = useState<boolean>(false);

  // Filter & Search states
  const [classFilter, setClassFilter] = useState<string>('All');
  const [classesViewMode, setClassesViewMode] = useState<'cards' | 'roster'>('cards');
  const [classesSearchQuery, setClassesSearchQuery] = useState<string>('');
  const [searchStudentQuery, setSearchStudentQuery] = useState<string>('');
  const [searchTeacherQuery, setSearchTeacherQuery] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Modals state
  const [showPrincipalPhotoModal, setShowPrincipalPhotoModal] = useState<boolean>(false);
  const [isEditingFees, setIsEditingFees] = useState(false);
  const [editTotal, setEditTotal] = useState('');
  const [editPaid, setEditPaid] = useState('');
  const [editPrevious, setEditPrevious] = useState('');
  const [editPending, setEditPending] = useState('');
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<StudentProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState<any>({});
  const [isNewClassModalOpen, setIsNewClassModalOpen] = useState<boolean>(false);
  const [isEditCapacityModalOpen, setIsEditCapacityModalOpen] = useState<boolean>(false);
  const [isAssignTeacherModalOpen, setIsAssignTeacherModalOpen] = useState<boolean>(false);
  const [isNewTeacherModalOpen, setIsNewTeacherModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [isCircularModalOpen, setIsCircularModalOpen] = useState<boolean>(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);
  const [examFilterClass, setExamFilterClass] = useState<string>('All');
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState<boolean>(false);
  const [newExamDetails, setNewExamDetails] = useState({
    targetClass: 'Class 11',
    subjectName: '',
    subjectCode: '',
    date: '',
    timeSlot: '09:00 AM - 12:00 PM',
    roomNo: '',
    invigilator: ''
  });
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState<boolean>(false);

  // Navigation handlers
    useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.principalSubTab) {
        setActiveSubTab(e.state.principalSubTab);
        setIsFocusedView(true);
      } else {
        setIsFocusedView(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    // Overwrite current state to ensure base has no principalSubTab
    if (isFocusedView) {
        window.history.replaceState({ ...window.history.state, principalSubTab: activeSubTab }, '');
    } else {
        window.history.replaceState({ tab: 'principal_portal' }, '');
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenModule = (modId: typeof activeSubTab) => {
    setActiveSubTab(modId);
    setIsFocusedView(true);
    window.history.pushState({ ...window.history.state, principalSubTab: modId }, '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setIsFocusedView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active item in modal
  const [targetClass, setTargetClass] = useState<SchoolClassInfo | null>(null);
  const [targetClassForSubject, setTargetClassForSubject] = useState<SchoolClassInfo | null>(null);
  const [targetTeacher, setTargetTeacher] = useState<TeacherProfile | null>(null);
  const [targetStudent, setTargetStudent] = useState<StudentProfile | null>(null);

  // Form states for New Class
  const [newClassName, setNewClassName] = useState<'Class 11' | 'Class 12' | 'Class 10' | 'Class 9'>('Class 12');
  const [newSection, setNewSection] = useState('12 Agriculture Science (Agronomy & Soil Science)');
  const [newStream, setNewStream] = useState('Agriculture Science');
  const [newRoomNo, setNewRoomNo] = useState('Agri-Lab 02');
  const [newBuilding, setNewBuilding] = useState('Agricultural Sciences Wing');
  const [newCapacity, setNewCapacity] = useState<number>(40);
  const [newClassTeacherId, setNewClassTeacherId] = useState<string>('TCH007');

  // Form states for Add Subject Modal
  const [newSubCode, setNewSubCode] = useState('068');
  const [newSubName, setNewSubName] = useState('Agriculture Science (Theory & Agronomy)');
  const [newSubTeacherId, setNewSubTeacherId] = useState('TCH007');
  const [newSubPeriods, setNewSubPeriods] = useState<number>(6);

  // Form states for Edit Capacity
  const [editCapacityVal, setEditCapacityVal] = useState<number>(40);
  const [editRoomVal, setEditRoomVal] = useState<string>('');

  // Form states for Teacher Assignment Modal
  const [assignClassTeacherVal, setAssignClassTeacherVal] = useState<string>('None');
  const [assignSubjectsVal, setAssignSubjectsVal] = useState<string[]>([]);

  // Form states for New Teacher
  const [newTechName, setNewTechName] = useState('');
  const [newTechId, setNewTechId] = useState('');
  const [newTechEmail, setNewTechEmail] = useState('');
  const [newTechPhone, setNewTechPhone] = useState('+91 98');
  const [newTechDesignation, setNewTechDesignation] = useState('PGT Faculty');
  const [newTechDepartment, setNewTechDepartment] = useState('Science Department');
  const [newTechQualification, setNewTechQualification] = useState('M.Sc, B.Ed');
  const [newTechRoom, setNewTechRoom] = useState('Faculty Room 2');
  const [newTechClassTeacherOf, setNewTechClassTeacherOf] = useState('Class 12');
  const [newTechSubjectInput, setNewTechSubjectInput] = useState('Agriculture Science');

  // Form state for Transfer Student
  const [transferTargetClass, setTransferTargetClass] = useState<string>('Class 12');
  const [transferTargetSection, setTransferTargetSection] = useState<string>('Section A (Science PCM)');

  // Form states for Add Student (Principal Direct Enrollment)
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState<boolean>(false);
  const [stuClass, setStuClass] = useState<'Class 9' | 'Class 10' | 'Class 11' | 'Class 12'>('Class 9');
  const [stuSection, setStuSection] = useState('Section A');
  const [stuStream, setStuStream] = useState('Junior Secondary (CBSE)');
  const [stuName, setStuName] = useState('');
  const [stuRoll, setStuRoll] = useState('03');
  const [stuEmail, setStuEmail] = useState('');
  const [stuPhone, setStuPhone] = useState('9876543210');
  const [stuFather, setStuFather] = useState('');
  const [stuMother, setStuMother] = useState('');
  const [stuParentPhone, setStuParentPhone] = useState('9876543210');
  const [stuBlood, setStuBlood] = useState('B+');
  const [stuDob, setStuDob] = useState('2011-05-15');
  const [stuAvatar, setStuAvatar] = useState('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6');

  const handleStuClassChange = (selected: 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12') => {
    setStuClass(selected);
    if (selected === 'Class 9') {
      setStuStream('Junior Secondary (CBSE)');
      setStuSection('Section A');
    } else if (selected === 'Class 10') {
      setStuStream('Secondary Board (CBSE)');
      setStuSection('Section A (Secondary Board Batch)');
    } else if (selected === 'Class 11') {
      setStuStream('Science Stream (PCM + CS)');
      setStuSection('Section A (Science PCM)');
    } else {
      setStuStream('Science Stream (PCM + CS)');
      setStuSection('Section A (Science PCM)');
    }
  };

  // Auto-calculate next Roll No when stuClass or students list changes
  useEffect(() => {
    const classNum = stuClass.replace(/\D/g, '') || '9';
    const count = students.filter(
      (s) =>
        s.className.includes(classNum) ||
        s.studentId.includes(`STU2026${classNum}`) ||
        s.studentId.includes(`STU0${classNum}`) ||
        s.studentId.includes(`STU${classNum}`)
    ).length;
    setStuRoll(String(count + 1).padStart(2, '0'));
  }, [stuClass, students]);

  const handlePrincipalAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuName.trim()) return;

    const classNum = stuClass.replace(/\D/g, '') || '9';
    const rollId = `STU2026${classNum}${stuRoll.padStart(2, '0')}`;
    const loginId = stuPhone.trim() || stuName.trim().toLowerCase().replace(/\s+/g, '') || rollId;
    const generatedEmail =
      stuEmail.trim() || `${loginId.toLowerCase()}@edux.demo`;

    const newStudentProfile = addNewStudent({
      studentId: loginId,
      password: stuDob ? stuDob.split('-').reverse().join('') : 'student123',
      name: stuName.trim(),
      email: generatedEmail,
      phone: stuPhone.trim(),
      avatar: stuAvatar,
      className: stuClass,
      section: stuSection,
      rollNo: stuRoll,
      stream: stuStream,
      fatherName: stuFather.trim() || 'Parent / Guardian',
      motherName: stuMother.trim() || 'Mother',
      parentPhone: stuParentPhone.trim(),
      bloodGroup: stuBlood,
      dob: stuDob,
      mentor: {
        name: principal?.name || 'Dr. Arvind Swaminathan',
        designation: 'Principal / Senior Administrator',
        department: 'Principal Office',
        email: principal?.email || 'principal@stxaviors.edu.in',
        phone: principal?.phone || '+91 98111 00001',
        office: 'Principal Desk Office'
      }
    });

    setIsAddStudentModalOpen(false);
    setStuName('');
    setStuEmail('');
    setStuFather('');
    setStuMother('');
    showSuccess(`🎉 Student "${newStudentProfile.name}" enrolled into ${stuClass} (ID: ${newStudentProfile.studentId}, Roll #${stuRoll}) with immediate credentials live!`);
  };

  // Form states for Circular
  const [circularAudience, setCircularAudience] = useState<'All' | 'Teachers' | 'Students' | 'Class 11' | 'Class 12'>('All');
  const [circularTitle, setCircularTitle] = useState('');
  const [circularMessage, setCircularMessage] = useState('');
  const [circularPriority, setCircularPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  // Success alert state
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  // Helper to count students per class
  const getStudentsInClass = (className: string) => {
    return students.filter((s) => s.className === className);
  };

  // Filtered classes
  const filteredClasses = classes.filter((cls) => {
    if (classFilter === 'All') return true;
    if (classFilter === 'Class 9') return cls.className.includes('9') || cls.classCode?.includes('9');
    if (classFilter === 'Class 10') return cls.className.includes('10') || cls.classCode?.includes('10');
    if (classFilter === 'Class 11') return cls.className.includes('11') || cls.classCode?.includes('11');
    if (classFilter === 'Class 12') return cls.className.includes('12') || cls.classCode?.includes('12');
    if (classFilter === 'Agriculture' || classFilter === 'Agriculture Science') {
      return (
        cls.stream?.toLowerCase().includes('agri') ||
        cls.section?.toLowerCase().includes('agri') ||
        cls.className?.toLowerCase().includes('agri') ||
        cls.subjects.some((s) => s.name.toLowerCase().includes('agri'))
      );
    }
    return (
      cls.className === classFilter ||
      cls.stream === classFilter ||
      cls.section === classFilter ||
      cls.id === classFilter
    );
  });

  // Filtered classes by search query (class, stream, subject, or teacher)
  const displayedClasses = filteredClasses.filter((cls) => {
    if (!classesSearchQuery.trim()) return true;
    const q = classesSearchQuery.toLowerCase();
    const matchClass =
      cls.className.toLowerCase().includes(q) ||
      cls.classCode.toLowerCase().includes(q) ||
      cls.section.toLowerCase().includes(q) ||
      cls.stream.toLowerCase().includes(q) ||
      cls.classTeacherName.toLowerCase().includes(q) ||
      cls.roomNo.toLowerCase().includes(q);
    const matchSubject = cls.subjects.some(
      (sub) =>
        sub.name.toLowerCase().includes(q) ||
        sub.code.toLowerCase().includes(q) ||
        sub.teacherName.toLowerCase().includes(q)
    );
    return matchClass || matchSubject;
  });

  const totalSubjectAllocations = classes.reduce((sum, c) => sum + c.subjects.length, 0);
  const totalAssignedSubjectTeachers = classes.reduce(
    (sum, c) => sum + c.subjects.filter((s) => s.teacherName && s.teacherName.trim() !== '').length,
    0
  );

  const handleAssignSubjectTeacher = (classId: string, subjectCode: string, teacherId: string) => {
    assignSubjectTeacherToClass(classId, subjectCode, teacherId);
    const teacher = teachers.find((t) => t.teacherId === teacherId);
    showSuccess(`Subject faculty updated to ${teacher?.name || 'Faculty'}.`);
  };

  // Filtered teachers
  const filteredTeachers = teachers.filter((t) => {
    if (!searchTeacherQuery.trim()) return true;
    const q = searchTeacherQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.teacherId.toLowerCase().includes(q) ||
      t.designation.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q) ||
      t.subjectsTaught.some((sub) => sub.toLowerCase().includes(q))
    );
  });

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const matchQuery =
      !searchStudentQuery.trim() ||
      s.name.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
      s.rollNo.includes(searchStudentQuery);

    if (classFilter === 'All') return matchQuery;
    if (classFilter === 'Class 9') {
      return matchQuery && (s.className.includes('9') || s.studentId.includes('STU20269') || s.studentId.includes('STU09') || s.studentId.includes('STU9'));
    }
    if (classFilter === 'Class 10') {
      return matchQuery && (s.className.includes('10') || s.studentId.includes('STU202610') || s.studentId.includes('STU10'));
    }
    if (classFilter === 'Class 11') {
      return matchQuery && (s.className.includes('11') || s.studentId.includes('STU202611') || s.studentId.includes('STU01'));
    }
    if (classFilter === 'Class 12') {
      return matchQuery && (s.className.includes('12') || s.studentId.includes('STU202612') || s.studentId.includes('STU04'));
    }
    if (classFilter === 'Agriculture' || classFilter === 'Agriculture Science') {
      return matchQuery && (s.stream?.toLowerCase().includes('agri') || s.section?.toLowerCase().includes('agri'));
    }
    const matchClass = s.className === classFilter;
    return matchQuery && matchClass;
  });

  // Handlers
  const handleOpenEditCapacity = (cls: SchoolClassInfo) => {
    setTargetClass(cls);
    setEditCapacityVal(cls.capacity);
    setEditRoomVal(cls.roomNo);
    setIsEditCapacityModalOpen(true);
  };

  const handleSaveCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClass) return;
    updateClassCapacity(targetClass.id, editCapacityVal);
    if (editRoomVal && editRoomVal !== targetClass.roomNo) {
      updateClassDetails(targetClass.id, { roomNo: editRoomVal });
    }
    setIsEditCapacityModalOpen(false);
    showSuccess(`Class capacity for ${targetClass.className} updated to ${editCapacityVal} students.`);
  };

  const handleOpenAssignTeacher = (t: TeacherProfile) => {
    setTargetTeacher(t);
    setAssignClassTeacherVal(t.classTeacherOf || 'None');
    setAssignSubjectsVal([...t.subjectsTaught]);
    setIsAssignTeacherModalOpen(true);
  };

  const handleSaveTeacherAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTeacher) return;
    updateTeacherAssignments(targetTeacher.teacherId, assignClassTeacherVal, assignSubjectsVal);

    // If assigned to a class, update class info too
    if (assignClassTeacherVal && assignClassTeacherVal !== 'None') {
      const cls = classes.find((c) => c.className === assignClassTeacherVal);
      if (cls) {
        assignClassTeacher(cls.id, targetTeacher.teacherId);
      }
    }

    setIsAssignTeacherModalOpen(false);
    showSuccess(`Assignments for ${targetTeacher.name} successfully updated & synced.`);
  };

  const handleOpenAddSubject = (cls: SchoolClassInfo) => {
    setTargetClassForSubject(cls);
    if (cls.stream.toLowerCase().includes('agri') || cls.section.toLowerCase().includes('agri')) {
      setNewSubCode('068');
      setNewSubName('Agriculture Science (Theory & Agronomy)');
      const agriTeacher = teachers.find((t) =>
        t.subjectsTaught.some((s) => s.toLowerCase().includes('agri')) || t.name.includes('Patel')
      );
      setNewSubTeacherId(agriTeacher?.teacherId || teachers[0]?.teacherId || 'TCH007');
    } else {
      setNewSubCode('');
      setNewSubName('');
      setNewSubTeacherId(teachers[0]?.teacherId || 'TCH001');
    }
    setNewSubPeriods(6);
    setIsAddSubjectModalOpen(true);
  };

  const handleSaveAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClassForSubject || !newSubName.trim()) return;
    const teacher = teachers.find((t) => t.teacherId === newSubTeacherId);
    const code = newSubCode.trim() || `SUB${Math.floor(100 + Math.random() * 900)}`;

    addSubjectToClass(targetClassForSubject.id, {
      code,
      name: newSubName.trim(),
      teacherId: newSubTeacherId,
      teacherName: teacher ? teacher.name : 'Assigned Faculty',
      periodsPerWeek: Number(newSubPeriods) || 5
    });

    setIsAddSubjectModalOpen(false);
    showSuccess(`Subject "${newSubName}" successfully added to ${targetClassForSubject.className} (${targetClassForSubject.section})!`);
  };

  const handleCreateNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedTeacher = teachers.find((t) => t.teacherId === newClassTeacherId);
    const teacherName = assignedTeacher ? assignedTeacher.name : 'Unassigned';

    const newClassCode = `${newClassName.replace('Class ', '')}-${newSection.charAt(0)}`;

    let classSubjects = [
      { code: '042', name: 'Physics (Theory & Practical)', teacherId: 'TCH001', teacherName: 'Mr. Rajesh Sharma', periodsPerWeek: 6 },
      { code: '043', name: 'Chemistry (Theory & Lab)', teacherId: 'TCH002', teacherName: 'Mrs. Sunita Verma', periodsPerWeek: 6 },
      { code: '041', name: 'Mathematics', teacherId: 'TCH003', teacherName: 'Mr. Vikram Singh', periodsPerWeek: 6 },
      { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 }
    ];

    if (newStream === 'Agriculture Science') {
      classSubjects = [
        { code: '068', name: 'Agriculture Science (Theory & Agronomy)', teacherId: 'TCH007', teacherName: 'Dr. Ramesh Patel', periodsPerWeek: 6 },
        { code: '069', name: 'Agronomy Crop Production Practical', teacherId: 'TCH007', teacherName: 'Dr. Ramesh Patel', periodsPerWeek: 4 },
        { code: '044', name: 'Biology & Plant Physiology', teacherId: 'TCH004', teacherName: 'Mrs. Ananya Gupta', periodsPerWeek: 6 },
        { code: '043', name: 'Soil Chemistry & Fertilizers', teacherId: 'TCH002', teacherName: 'Mrs. Sunita Verma', periodsPerWeek: 6 },
        { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 }
      ];
    } else if (newStream === 'Science (PCB)') {
      classSubjects = [
        { code: '042', name: 'Physics (Theory & Practical)', teacherId: 'TCH001', teacherName: 'Mr. Rajesh Sharma', periodsPerWeek: 6 },
        { code: '043', name: 'Chemistry (Theory & Lab)', teacherId: 'TCH002', teacherName: 'Mrs. Sunita Verma', periodsPerWeek: 6 },
        { code: '044', name: 'Biology (Theory & Lab)', teacherId: 'TCH004', teacherName: 'Mrs. Ananya Gupta', periodsPerWeek: 6 },
        { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 }
      ];
    } else if (newStream === 'Commerce') {
      classSubjects = [
        { code: '055', name: 'Accountancy', teacherId: 'TCH005', teacherName: 'Mr. Amit Kumar', periodsPerWeek: 6 },
        { code: '054', name: 'Business Studies', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 6 },
        { code: '030', name: 'Economics', teacherId: 'TCH003', teacherName: 'Mr. Vikram Singh', periodsPerWeek: 6 },
        { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 }
      ];
    } else if (newStream === 'Humanities') {
      classSubjects = [
        { code: '027', name: 'History', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 6 },
        { code: '028', name: 'Political Science', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 6 },
        { code: '030', name: 'Economics', teacherId: 'TCH003', teacherName: 'Mr. Vikram Singh', periodsPerWeek: 6 },
        { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 }
      ];
    }

    addNewSchoolClass({
      classCode: newClassCode,
      className: newClassName,
      section: newSection,
      stream: newStream,
      roomNo: newRoomNo,
      building: newBuilding,
      capacity: Number(newCapacity),
      classTeacherId: newClassTeacherId,
      classTeacherName: teacherName,
      academicYear: '2026-2027',
      subjects: classSubjects
    });

    setIsNewClassModalOpen(false);
    showSuccess(`New class ${newClassName} (${newSection}) successfully established with ${newCapacity} seats!`);
  };

  const handleCreateNewTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTechName.trim()) return;

    const generatedId = newTechId.trim() || `TCH00${teachers.length + 1}`;
    const subjectsArray = newTechSubjectInput.split(',').map((s) => s.trim()).filter(Boolean);

    addNewTeacher({
      teacherId: generatedId,
      password: `${generatedId.toLowerCase()}123`,
      name: newTechName,
      email: newTechEmail || `${newTechName.toLowerCase().replace(/\s+/g, '.')}@stxaviers.edu.in`,
      phone: newTechPhone,
      avatar: '',
      designation: newTechDesignation,
      department: newTechDepartment,
      classTeacherOf: newTechClassTeacherOf,
      subjectsTaught: subjectsArray.length > 0 ? subjectsArray : ['General Subject'],
      qualification: newTechQualification,
      roomNo: newTechRoom
    });

    setIsNewTeacherModalOpen(false);
    // Reset form
    setNewTechName('');
    setNewTechId('');
    setNewTechEmail('');
    showSuccess(`Faculty member ${newTechName} appointed with Employee ID ${generatedId}.`);
  };

  const handleOpenTransferModal = (stu: StudentProfile) => {
    setTargetStudent(stu);
    setTransferTargetClass(stu.className === 'Class 11' ? 'Class 12' : 'Class 11');
    setIsTransferModalOpen(true);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudent) return;
    transferStudentClass(targetStudent.studentId, transferTargetClass, transferTargetSection);
    setIsTransferModalOpen(false);
    showSuccess(`Student ${targetStudent.name} successfully transferred to ${transferTargetClass} (${transferTargetSection}).`);
  };

  const handleSendCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!circularTitle.trim() || !circularMessage.trim()) return;
    principalBroadcast(circularAudience, circularTitle, circularMessage, circularPriority);
    setIsCircularModalOpen(false);
    setCircularTitle('');
    setCircularMessage('');
    showSuccess(`Official Principal Circular dispatched to ${circularAudience}!`);
  };

  // Institutional statistics
  const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);
  const totalEnrolled = students.length;
  const occupancyRate = Math.round((totalEnrolled / (totalCapacity || 1)) * 100);
  const totalFacultyCount = teachers.length;
  const ptrRatio = Math.round(totalEnrolled / (totalFacultyCount || 1));

  const PRINCIPAL_MODULES = [
    {
      id: 'student-fees' as const,
      num: '11',
      title: 'Student Fees & Collections',
      desc: 'Fee status, receipts & direct communication',
      icon: Banknote,
      badge: 'Manage',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
    },

    {
      id: 'classes' as const,
      num: '1',
      title: 'Class Strength & Capacity',
      desc: 'Capacities, Streams & Incharge',
      icon: Building,
      badge: `${classes.length} Classes`,
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
    },
    {
      id: 'teachers' as const,
      num: '2',
      title: 'Teacher Allocation',
      desc: 'Subject & Class Incharge Roles',
      icon: UserCheck,
      badge: `${teachers.length} Faculty`,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    },
    {
      id: 'students' as const,
      num: '3',
      title: 'Student Directory',
      desc: 'Bio, Roll Nos & Class Transfers',
      icon: GraduationCap,
      badge: `${students.length} Students`,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
    },
    {
      id: 'circulars' as const,
      num: '4',
      title: 'Circulars & Directives',
      desc: 'Official Administrative Directives',
      icon: Megaphone,
      badge: 'Broadcast',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    },
    {
      id: 'staff' as const,
      num: '6',
      title: 'Staff Attendance & Leaves',
      desc: 'Biometrics & Leave Sanctions',
      icon: CalendarCheck,
      badge: (staffLeaves || []).filter((l) => l.status === 'Pending').length > 0
        ? `${(staffLeaves || []).filter((l) => l.status === 'Pending').length} Pending`
        : 'Up to date',
      badgeColor: (staffLeaves || []).filter((l) => l.status === 'Pending').length > 0
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
        : 'bg-slate-100 text-slate-700 dark:bg-neutral-900 dark:text-slate-300'
    },
    {
      id: 'academics' as const,
      num: '7',
      title: 'Exam Results & Performance',
      desc: 'CBSE Pass Rates & Performance',
      icon: BarChart3,
      badge: `${academicAnalytics?.overallPassPercentage || '97.5'}% Pass`,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    },
    {
      id: 'timetable' as const,
      num: '8',
      title: 'Class Timetable Master Bar',
      desc: 'Live Period Slots & Lab Sync',
      icon: Clock,
      badge: 'Live Sync',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      isLive: true
    },
    {
      id: 'exam-schedule' as const,
      num: '10',
      title: 'Master Exam Schedule',
      desc: 'View & Edit All Class Exams',
      icon: Clock,
      badge: `${exams.length} Scheduled`,
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
    },
    {
      id: 'daily-attendance' as const,
      num: '9',
      title: 'Daily Class & Faculty Attendance',
      desc: 'Live Roster Counters & Excel Export',
      icon: UserCheck,
      badge: 'Live Sync',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      isLive: true
    }
  ];

  const currentActiveModule = PRINCIPAL_MODULES.find((m) => m.id === activeSubTab) || PRINCIPAL_MODULES[0];
  const CurrentModuleIcon = currentActiveModule.icon;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Toast Notification Banner */}
      {successBanner && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
          <span className="text-xs font-bold">{successBanner}</span>
          <button onClick={() => setSuccessBanner(null)} className="p-1 hover:bg-white/20 rounded-lg active:scale-[0.98] transition-all duration-150 ease-in-out">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER: Clean Navigation Bar when module is opened */}
      {!isFocusedView && (
        <>
          {/* Principal Identity Hero Card */}
          <div className="relative overflow-hidden rounded-[32px] bg-white dark:bg-[#0a0a0a] border border-slate-100 dark:border-neutral-800 shadow-sm p-6 sm:p-8">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-64 h-full pointer-events-none opacity-[0.03] dark:opacity-[0.02]">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-current" preserveAspectRatio="none">
                <polygon points="50,0 100,50 50,100 0,50" />
              </svg>
            </div>
            
            <div className="relative z-10 flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="relative">
                  <UserAvatar
                    avatar={principal?.avatar}
                    name={principal?.name || 'Dr. Arvind Swaminathan'}
                    role="principal"
                    size="xl"
                  />
                  <button 
                    onClick={() => setShowPrincipalPhotoModal(true)}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full border-2 border-white dark:border-[#0a0a0a] flex items-center justify-center text-white shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/50">
                      INSTITUTIONAL LEADERSHIP DESK
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-neutral-800">
                      Academic Year 2026-2027
                    </span>
                  </div>
                  
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {principal?.name || 'Dr. Arvind Swaminathan'}
                  </h1>
                  
                  <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                    {principal?.designation || 'Principal & Director of Academic Administration'} • {principal?.schoolName || "St. Xavier's Senior Secondary School"}
                  </p>
                  
                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
                      <div className="w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center shrink-0">
                        <MapPin className="w-3 h-3 text-rose-500" />
                      </div>
                      <span className="font-medium">{principal?.officeRoom || 'Principal Office, Admin Block 1st Floor'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-3 h-3 text-indigo-500" />
                      </div>
                      <span className="font-medium">{principal?.qualification || 'Ph.D In Education Leadership, M.Sc Physics (Gold Medalist)'}</span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[11px] font-bold border border-amber-100 dark:border-amber-900/50">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {principal?.experienceYears || 24} Years Leadership
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-50 dark:border-neutral-800/50">
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 text-[13px] font-bold hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Photo & Profile
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold transition-colors shadow-sm shadow-blue-600/20">
                  <FileText className="w-4 h-4" />
                  Sign Executive Directives
                </button>
              </div>
            </div>
          </div>

                    {/* Institutional Metrics Vertical Stack */}
          <div className="space-y-4 pt-2">
            {/* Metric 1: Total Enrolled */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 flex flex-col gap-3 relative overflow-hidden shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Users className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">TOTAL ENROLLED</span>
                </div>
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                  Term I
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">{totalEnrolled}</span>
                <span className="text-sm font-medium text-slate-400">/ {totalCapacity} Max Seats</span>
              </div>
              <div className="pt-2">
                <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, occupancyRate)}%` }}></div>
                </div>
                <p className="text-[10px] font-medium text-slate-400 text-right mt-1.5">{occupancyRate}% Intake Progress</p>
              </div>
            </div>

            {/* Metric 2: Active Classes */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">ACTIVE CLASSES</span>
                </div>
                <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
                  Optimal
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">{classes.length}</span>
                <span className="text-sm font-medium text-slate-400">Sections</span>
              </div>
              <div className="flex items-center gap-1.5 pt-2 text-emerald-600 dark:text-emerald-500 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% Class Teachers Assigned</span>
              </div>
            </div>

            {/* Metric 3: Teaching Faculty */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">TEACHING FACULTY</span>
                </div>
                <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-100 dark:border-amber-800">
                  100% On-Duty
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">{totalFacultyCount}</span>
                <span className="text-sm font-medium text-slate-400">Teachers</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-neutral-800/50 mt-1">
                <span className="text-xs text-slate-500 font-medium">PTR Ratio</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">1 : {ptrRatio} (CBSE Standard)</span>
              </div>
            </div>

            {/* Metric 4: Seat Occupancy */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-neutral-800 p-6 flex flex-col gap-3 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">SEAT OCCUPANCY</span>
                </div>
                <span className="bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-100 dark:border-purple-800">
                  Open Admissions
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">{occupancyRate}%</span>
                <span className="text-sm font-medium text-slate-400">Current Occupancy</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-neutral-800/50 mt-1">
                <span className="text-xs text-slate-500 font-medium">Vacant Seats</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{totalCapacity - totalEnrolled} Vacant Available</span>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="pt-6 pb-2">
            <div className="flex gap-4 items-start">
              <div className="w-2 h-10 bg-amber-500 rounded-full shrink-0"></div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">INSTITUTIONAL ADMINISTRATIVE DESK CONTROLS</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Direct governance access, real-time rosters & department operations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800 shrink-0">
                9 Modules
              </span>
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Filter:</span>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="bg-transparent border-0 font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer w-full"
                >
                  <option value="All">All Classes & Sections ({classes.length})</option>
                  <option value="Class 9">Class 9 Batches</option>
                  <option value="Class 10">Class 10 Batches</option>
                  <option value="Class 11">Class 11 Batches</option>
                  <option value="Class 12">Class 12 Batches</option>
                </select>
              </div>
            </div>
          </div>

            {/* Action Grid (Vertical Stack as per design) */}
            <div className="flex flex-col gap-4">
              {PRINCIPAL_MODULES.map((mod) => {
                const IconComp = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleOpenModule(mod.id)}
                    className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a] p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 active:scale-[0.98] flex flex-col justify-between relative overflow-hidden text-left"
                    id={`principal-module-${mod.id}`}
                  >
                    <div className="flex items-start justify-between w-full mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${mod.badgeColor}`}>
                        {mod.isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        {mod.badge}
                      </span>
                    </div>

                    <div className="mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider block text-amber-600 dark:text-amber-500 mb-1 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        MODULE {mod.num}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-0.5 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                        {mod.desc}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-500 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      <span>Open Page</span>
                      <ChevronRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
                    </div>
                  </button>
                );
              })}
            </div>


          {/* Compliance & Vault Card */}
          <div className="mt-8 bg-[#111827] rounded-3xl p-6 sm:p-8 flex flex-col gap-5 text-white shadow-xl shadow-slate-900/10">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-1">CBSE Statutory Compliance & Digital Vault</h3>
                <p className="text-sm text-slate-400 leading-relaxed">All institutional logs, affiliation renewals & emergency protocols are synchronized to cloud.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-sm py-3 rounded-xl transition-colors">
                Export Excel Dossier
              </button>
              <button className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm py-3 rounded-xl transition-colors">
                Dispatch Emergency Alert
              </button>
            </div>
          </div>
          </>

      )}

      {/* RENDER ACTIVE MODULE CONTENT (ONLY WHEN IN FOCUSED VIEW OR DIRECT VIEW) */}
      {isFocusedView && (
        <div className="space-y-6 pt-2 animate-in fade-in duration-200">

      {/* ========================================================================= */}
      {/* TAB 1: CLASS ALLOCATION & STUDENT STRENGTH MANAGER */}
      {/* ========================================================================= */}
      {activeSubTab === 'classes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Class-Wise Student Strength, Subjects & Seat Capacity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Principal can configure student capacities, assign class teachers, add new academic subjects & practical labs, and manage classrooms.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl">
                <button
                  onClick={() => setClassesViewMode('cards')}
                  className={`p-1.5 rounded-lg transition-all ${
                    classesViewMode === 'cards'
                      ? 'bg-white dark:bg-[#0a0a0a] text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  title="Card View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setClassesViewMode('roster')}
                  className={`p-1.5 rounded-lg transition-all ${
                    classesViewMode === 'roster'
                      ? 'bg-white dark:bg-[#0a0a0a] text-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setIsNewClassModalOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer ease-in-out active:scale-[0.98] transition-all duration-150"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create New Class</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={classesSearchQuery}
                onChange={(e) => setClassesSearchQuery(e.target.value)}
                placeholder="Search classes, subjects, or teachers..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-xl text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
              />
            </div>
            <div className="text-xs font-semibold text-slate-500">
              {displayedClasses.length} Classes Found
            </div>
          </div>

          {classesViewMode === 'roster' ? (
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-neutral-900/50 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-neutral-800">
                    <tr>
                      <th className="px-5 py-4">Class & Stream</th>
                      <th className="px-5 py-4">Strength / Capacity</th>
                      <th className="px-5 py-4">Class Teacher</th>
                      <th className="px-5 py-4">Subjects & Faculty</th>
                      <th className="px-5 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/50 text-slate-700 dark:text-slate-300">
                    {displayedClasses.map((cls) => {
                      const enrolledList = getStudentsInClass(cls.className);
                      const enrolledCount = enrolledList.length;
                      const fillPct = Math.round((enrolledCount / cls.capacity) * 100);
                      const isFull = enrolledCount >= cls.capacity;

                      return (
                        <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-neutral-900/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white border border-slate-200 dark:border-neutral-700">
                                {cls.classCode}
                              </span>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{cls.className}</p>
                                <p className="text-[10px] text-slate-500">{cls.stream}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1 w-32">
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className={isFull ? 'text-amber-600' : 'text-slate-900 dark:text-white'}>
                                  {enrolledCount} / {cls.capacity}
                                </span>
                                <span className="text-[10px] text-slate-500">{fillPct}%</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    fillPct > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(100, fillPct)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-slate-400" />
                              <select
                                value={cls.classTeacherId}
                                onChange={(e) => assignClassTeacher(cls.id, e.target.value)}
                                className="text-xs font-semibold px-2 py-1 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs active:scale-[0.98] transition-all max-w-[150px] truncate"
                              >
                                {teachers.map((t) => (
                                  <option key={t.teacherId} value={t.teacherId}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                              {cls.subjects.map((sub) => (
                                <div key={sub.code} className="flex items-center justify-between gap-3 text-xs border-b border-slate-100 dark:border-neutral-800/60 pb-1.5 last:border-0 last:pb-0">
                                  <div className="flex items-center gap-1.5">
                                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[120px]" title={sub.name}>{sub.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-neutral-900 px-1 rounded">{sub.code}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <select
                                      value={sub.teacherId}
                                      onChange={(e) => handleAssignSubjectTeacher(cls.id, sub.code, e.target.value)}
                                      className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs max-w-[120px] truncate"
                                    >
                                      {teachers.map((t) => (
                                        <option key={t.teacherId} value={t.teacherId}>{t.name}</option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => removeSubjectFromClass(cls.id, sub.code)}
                                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                                      title="Remove Subject"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {cls.subjects.length === 0 && (
                                <span className="text-xs text-slate-400 italic">No subjects assigned</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleOpenAddSubject(cls)}
                              className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Add Subject
                            </button>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditCapacity(cls)}
                                className="p-1.5 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg transition-all shadow-sm"
                                title="Edit Capacity"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setActiveSubTab('students');
                                  setClassFilter(cls.className);
                                }}
                                className="p-1.5 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg transition-all shadow-sm"
                                title="View Student Roster"
                              >
                                <GraduationCap className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedClasses.map((cls) => {
                const enrolledList = getStudentsInClass(cls.className);
                const enrolledCount = enrolledList.length;
                const fillPct = Math.round((enrolledCount / cls.capacity) * 100);
                const isFull = enrolledCount >= cls.capacity;

                return (
                <div
                  key={cls.id}
                  className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-5 border border-slate-200 dark:border-neutral-800 shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between active:scale-[0.98] duration-150 ease-in-out"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white border border-slate-200 dark:border-neutral-700">
                            {cls.classCode}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {cls.stream}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {cls.className}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {cls.section}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditCapacity(cls)}
                          title="Edit Student Capacity & Room"
                          className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Capacity & Strength Meter */}
                    <div className="p-3.5 bg-slate-50 dark:bg-neutral-900/60 rounded-2xl border border-slate-100 dark:border-neutral-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-blue-500" /> Student Enrollment:
                        </span>
                        <span className="text-slate-900 dark:text-white font-mono text-sm">
                          {enrolledCount} / {cls.capacity} Seats
                        </span>
                      </div>

                      <div className="w-full bg-slate-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            fillPct > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, fillPct)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <span>{fillPct}% Capacity utilized</span>
                        <span className={isFull ? 'text-rose-500 font-bold' : 'text-emerald-600 font-bold'}>
                          {isFull ? 'Class Full' : `${cls.capacity - enrolledCount} Vacancies`}
                        </span>
                      </div>
                    </div>

                    {/* Class Teacher Assignment */}
                    <div className="p-3 bg-slate-50 dark:bg-neutral-900/40 rounded-2xl border border-slate-200/80 dark:border-neutral-800">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" /> Appointed Class Teacher:
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {cls.classTeacherName}
                        </p>
                        <select
                          value={cls.classTeacherId}
                          onChange={(e) => assignClassTeacher(cls.id, e.target.value)}
                          className="text-[11px] font-semibold px-2 py-1 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs active:scale-[0.98] transition-all duration-150 ease-in-out"
                        >
                          {teachers.map((t) => (
                            <option key={t.teacherId} value={t.teacherId}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Room & Building details */}
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1 font-medium">
                      <span className="flex items-center gap-1">
                        <DoorOpen className="w-3.5 h-3.5 text-slate-400" /> {cls.roomNo}
                      </span>
                      <span>{cls.building}</span>
                    </div>

                    {/* Subjects taught list with add subject */}
                    <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Curriculum Subjects ({cls.subjects.length}):
                        </p>
                        <button
                          onClick={() => handleOpenAddSubject(cls)}
                          className="text-[11px] font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ease-in-out active:scale-[0.98] duration-150"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Subject</span>
                        </button>
                      </div>
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {cls.subjects.map((sub) => (
                          <div
                            key={sub.code}
                            className="text-xs flex items-center justify-between bg-slate-50 dark:bg-neutral-900/50 p-1.5 rounded-xl border border-slate-100 dark:border-neutral-800 text-slate-700 dark:text-slate-300 group"
                          >
                            <div className="truncate max-w-[170px]">
                              <span className="font-semibold text-slate-900 dark:text-white block truncate">
                                {sub.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Code: {sub.code} • {sub.periodsPerWeek || 5} hrs/wk
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#0a0a0a] px-2 py-0.5 rounded-md border border-slate-200 dark:border-neutral-700">
                                {sub.teacherName.split(' ')[0]} {sub.teacherName.split(' ')[1] || ''}
                              </span>
                              <button
                                onClick={() => removeSubjectFromClass(cls.id, sub.code)}
                                title="Remove subject from class"
                                className="p-1 text-slate-400 hover:text-rose-500 opacity-60 hover:opacity-100 transition-all cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddSubject(cls)}
                      className="flex-1 py-2 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1 ease-in-out active:scale-[0.98] duration-150"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Subject</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditCapacity(cls)}
                      className="px-3 py-2 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer text-center active:scale-[0.98] duration-150 ease-in-out"
                    >
                      Capacity
                    </button>
                    <button
                      onClick={() => {
                        setActiveSubTab('students');
                        setClassFilter(cls.className);
                      }}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ease-in-out active:scale-[0.98] duration-150"
                    >
                      <span>Roster</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEACHER CLASS & SUBJECT ALLOCATION DESK */}
      {/* ========================================================================= */}
      {activeSubTab === 'teachers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Teacher Class & Subject Assignment Desk
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Assign primary class teacher responsibilities, allocate subject curriculum, and monitor weekly teaching workloads.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search faculty..."
                  value={searchTeacherQuery}
                  onChange={(e) => setSearchTeacherQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-purple-500"
                />
              </div>
              <button
                onClick={() => setIsNewTeacherModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer shrink-0 active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <Plus className="w-4 h-4" />
                <span>Appoint Faculty</span>
              </button>
            </div>
          </div>

          {/* Teacher Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeachers.map((tech) => {
              const assignedClass = classes.find((c) => c.classTeacherId === tech.teacherId);

              return (
                <div
                  key={tech.id}
                  className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-5 border border-slate-200 dark:border-neutral-800 shadow-md hover:border-purple-300 dark:hover:border-purple-800 transition-all flex flex-col justify-between active:scale-[0.98] duration-150 ease-in-out"
                >
                  <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-start gap-3.5">
                      <UserAvatar avatar={tech.avatar} name={tech.name} role="teacher" size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md font-mono">
                            {tech.teacherId}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 truncate">
                          {tech.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                          {tech.designation}
                        </p>
                      </div>
                    </div>

                    {/* Class Teacher Allocation Card */}
                    <div className="p-3 bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/40">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" /> Class Teacher of:
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {tech.classTeacherOf || 'None (Subject Specialist)'}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          Appointed
                        </span>
                      </div>
                    </div>

                    {/* Subjects taught */}
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Subjects Taught:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tech.subjectsTaught.map((sub, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-neutral-700/60"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Department, Qualification & Room */}
                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-neutral-800">
                      <p className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{tech.department}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{tech.qualification}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <DoorOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{tech.roomNo}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-neutral-800">
                    <button
                      onClick={() => handleOpenAssignTeacher(tech)}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.98] duration-150 ease-in-out"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Reassign Class & Subjects</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SCHOOL STUDENT DIRECTORY & CLASS TRANSFER */}
      {/* ========================================================================= */}
      {activeSubTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  School Student Directory & Admissions Roster
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  {students.length} Total Enrolled
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Principal direct admissions desk: Enroll new students to Class 9, 10, 11, or 12, manage student profiles, and execute inter-class transfers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, roll, or ID..."
                  value={searchStudentQuery}
                  onChange={(e) => setSearchStudentQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 w-52 sm:w-60"
                />
              </div>

              {/* Principal Add Student Action Button */}
              <button
                onClick={() => setIsAddStudentModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                id="principal-add-student-btn"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Enroll New Student</span>
              </button>
            </div>
          </div>

          {/* Quick Class Filter Chips for Principal */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mr-1 shrink-0">Filter Class:</span>
            {[
              { label: `All (${students.length})`, value: 'All' },
              { label: 'Class 9', value: 'Class 9' },
              { label: 'Class 10', value: 'Class 10' },
              { label: 'Class 11', value: 'Class 11' },
              { label: 'Class 12', value: 'Class 12' },
              { label: '🌾 Agriculture', value: 'Agriculture' }
            ].map((chip) => {
              const isSelected = classFilter === chip.value;
              return (
                <button
                  key={chip.value}
                  onClick={() => setClassFilter(chip.value)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 text-xs ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Student Table (Responsive Grid View) - Compact */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-md overflow-hidden">
            {/* Desktop Header (Hidden on Mobile) */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-slate-50 dark:bg-neutral-900/80 border-b border-slate-200 dark:border-neutral-800 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <div className="col-span-12 md:col-span-4">Roll / Student</div>
              <div className="col-span-12 md:col-span-3">Class & Stream</div>
              <div className="col-span-12 md:col-span-3">Parent Details</div>
              <div className="col-span-12 md:col-span-2 text-right">Performance & Actions</div>
            </div>

            {/* List Body */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((stu) => (
                <div
                  key={stu.id}
                  onClick={() => setSelectedStudentForDrawer(stu)}
                  className="group flex flex-col md:grid md:grid-cols-12 md:gap-3 md:items-center p-3 md:px-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer relative active:scale-[0.98] duration-150 ease-in-out"
                >
                  {/* 1. Roll / Student */}
                  <div className="col-span-12 md:col-span-4 flex items-start md:items-center gap-3 mb-3 md:mb-0">
                    <div className="relative shrink-0">
                      <UserAvatar avatar={stu.avatar} name={stu.name} role="student" size="sm" />
                      <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200 scale-95 group-hover:scale-100 active:scale-[0.98]">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate leading-tight">
                        {stu.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <span className="text-[9px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700/50">
                          ID: {stu.studentId}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600 text-[9px]">•</span>
                        <span className="text-[9px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700/50">
                          Roll #{stu.rollNo}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile-only divider */}
                  <div className="md:hidden w-full h-px bg-slate-100 dark:bg-slate-800/60 mb-3" />

                  {/* 2. Class & Stream */}
                  <div className="col-span-12 md:col-span-3 mb-3 md:mb-0 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center">
                    <span className="md:hidden text-[9px] font-bold text-slate-400 uppercase tracking-wider">Class</span>
                    <div className="flex flex-col items-end md:items-start text-right md:text-left">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 mb-1 inline-block shadow-xs">
                        {stu.className}
                      </span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                        {stu.stream}
                      </p>
                    </div>
                  </div>

                  {/* Mobile-only divider */}
                  <div className="md:hidden w-full h-px bg-slate-100 dark:bg-slate-800/60 mb-3" />

                  {/* 3. Parent Details */}
                  <div className="col-span-12 md:col-span-3 mb-3 md:mb-0 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center">
                    <span className="md:hidden text-[9px] font-bold text-slate-400 uppercase tracking-wider">Parent</span>
                    <div className="flex flex-col items-end md:items-start text-right md:text-left">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mb-1 line-clamp-1">
                        {stu.fatherName}
                      </p>
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded-lg border border-slate-100 dark:border-slate-700/50">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 font-mono font-semibold tracking-tight">
                          {stu.parentPhone}
                        </span>
                        <div className="w-px h-2.5 bg-slate-200 dark:bg-slate-600 mx-0.5"></div>
                        {/* SMS Icon Button */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); window.location.href = "sms:" + stu.parentPhone.replace(/\s/g, ""); }}
                          className="p-0.5 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-600 dark:text-sky-400 rounded-md transition-all active:scale-95 shadow-xs duration-150 ease-in-out"
                          title="Send SMS"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mobile-only divider */}
                  <div className="md:hidden w-full h-px bg-slate-100 dark:bg-slate-800/60 mb-3" />

                  {/* 4. Performance & Actions */}
                  <div className="col-span-12 md:col-span-2 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:gap-1.5">
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-1.5 md:gap-1">
                      <span className="font-black text-slate-900 dark:text-white text-[15px] tracking-tight">
                        {stu.overallPercentage}%
                      </span>
                      <span className="text-[9px] font-black tracking-wider uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                        Grade A1
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0 md:mt-1.5 w-full md:w-auto justify-end">
                      {/* Mobile View Profile Button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedStudentForDrawer(stu); }}
                        className="md:hidden flex-1 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-xs ease-in-out duration-150"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Profile</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenTransferModal(stu); }}
                        className="flex-1 md:flex-none px-2.5 py-1.5 md:px-2 md:py-1 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 active:scale-95 shadow-xs ease-in-out duration-150"
                        title="Transfer Class"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline">Transfer</span>
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CIRCULARS & DIRECTIVES */}
      {/* ========================================================================= */}
      {activeSubTab === 'circulars' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Principal Directives & Institutional Circulars
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Broadcast official circulars from the Principal's Office directly to students, teachers, or parents.
              </p>
            </div>
            <button
              onClick={() => setIsCircularModalOpen(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer self-start sm:self-auto ease-in-out active:scale-[0.98] transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Official Notice</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-white dark:bg-[#0a0a0a] p-5 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                      {notif.priority} Priority
                    </span>
                    <span className="text-[11px] text-slate-400">{notif.category}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {notif.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {notif.message}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Dispatched from Principal Desk
                  </span>
                  <span>Institutional Sync ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: STAFF ATTENDANCE & LEAVE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'staff' && (
        <div className="space-y-6">
          <PrincipalStaffView />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: EXAM RESULTS & ACADEMIC PERFORMANCE */}
      {/* ========================================================================= */}
      {activeSubTab === 'academics' && (
        <div className="space-y-6">
          <PrincipalAcademicsView />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: PRINCIPAL CLASS-WISE DAILY TIMETABLE DIRECTOR & LIVE SYNC */}
      {/* ========================================================================= */}
      {activeSubTab === 'timetable' && (
        <div className="space-y-6">
          <PrincipalTimetableManager initialClass={classFilter} />
        </div>
      )}


      {/* ========================================================================= */}
      {/* TAB 10: MASTER EXAM SCHEDULE */}
      {/* ========================================================================= */}
      {activeSubTab === 'exam-schedule' && (
        <PrincipalExamsModule />
      )}

      {/* ========================================================================= */}
      {/* TAB 9: DAILY CLASS & FACULTY ATTENDANCE LIVE DESK (EXCEL EXPORT) */}
      {/* ========================================================================= */}
      {activeSubTab === 'daily-attendance' && (
        <div className="space-y-6">
          <PrincipalDailyAttendanceView />
        </div>
      )}
      
      {activeSubTab === 'student-fees' && (
        <div className="space-y-6">
          <PrincipalFeesModule />
        </div>
      )}

          {/* Bottom Back Navigation Bar inside Focused View */}
          <div className="pt-6 border-t border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            

            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <span>Institution: {principal?.schoolName || "St. Xavier's Senior Secondary School"}</span>
              <span>•</span>
              <span className="text-amber-700 dark:text-amber-300 font-bold">Academic Session 2026-27</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT CLASS CAPACITY & ROOM */}
      {/* ========================================================================= */}
      {isEditCapacityModalOpen && targetClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Update Class Capacity
                  </h3>
                  <p className="text-xs text-slate-500">
                    {targetClass.className} ({targetClass.section})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditCapacityModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCapacity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Max Student Seat Capacity
                </label>
                <input
                  type="number"
                  min="5"
                  max="80"
                  required
                  value={editCapacityVal}
                  onChange={(e) => setEditCapacityVal(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Current enrolled students: {getStudentsInClass(targetClass.className).length}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Allocated Room Number
                </label>
                <input
                  type="text"
                  required
                  value={editRoomVal}
                  onChange={(e) => setEditRoomVal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-indigo-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditCapacityModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REASSIGN TEACHER CLASS & SUBJECTS */}
      {/* ========================================================================= */}
      {isAssignTeacherModalOpen && targetTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserAvatar avatar={targetTeacher.avatar} name={targetTeacher.name} role="teacher" size="sm" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Reassign Classes & Subjects
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {targetTeacher.name} ({targetTeacher.teacherId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignTeacherModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacherAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Appoint as Primary Class Teacher:
                </label>
                <select
                  value={assignClassTeacherVal}
                  onChange={(e) => setAssignClassTeacherVal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-purple-600 cursor-pointer ease-in-out active:scale-[0.98] transition-all duration-150"
                >
                  <option value="None">None (Subject Specialist Only)</option>
                  <optgroup label="General Class Standards (9 to 12)">
                    <option value="Class 9">Class 9 (Junior Secondary)</option>
                    <option value="Class 10">Class 10 (Secondary Board)</option>
                    <option value="Class 11">Class 11 (Senior Secondary)</option>
                    <option value="Class 12">Class 12 (Board Examination Batch)</option>
                  </optgroup>
                  {classes && classes.length > 0 && (
                    <optgroup label="Specific Class & Section">
                      {classes.map((cls) => (
                        <option key={cls.id} value={`${cls.className} (${cls.section})`}>
                          {cls.className} - {cls.section}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Assigned Subjects Curriculum:
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-neutral-900/80 rounded-2xl border border-slate-200 dark:border-neutral-700">
                  {[
                    'Physics',
                    'Physics Lab',
                    'Chemistry',
                    'Chemistry Lab',
                    'Mathematics',
                    'Applied Mathematics',
                    'Biology',
                    'Biotechnology Lab',
                    'Computer Science',
                    'Informatics Practices',
                    'English Core',
                    'Accountancy',
                    'Business Studies',
                    'Economics'
                  ].map((sub) => {
                    const isChecked = assignSubjectsVal.includes(sub);
                    return (
                      <label
                        key={sub}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignSubjectsVal((prev) => [...prev, sub]);
                            } else {
                              setAssignSubjectsVal((prev) => prev.filter((s) => s !== sub));
                            }
                          }}
                          className="rounded-sm text-purple-600 focus:ring-purple-500"
                        />
                        <span className="truncate">{sub}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignTeacherModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Save Assignments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE NEW CLASS / SECTION */}
      {/* ========================================================================= */}
      {isNewClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Create New Class Section
                  </h3>
                  <p className="text-xs text-slate-500">
                    Allocate section, room, seat capacity & class teacher
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewClassModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewClass} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Class Standard
                  </label>
                  <select
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 9">Class 9</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Academic Stream / Specialization
                  </label>
                  <select
                    value={newStream}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewStream(val);
                      if (val === 'Agriculture Science') {
                        setNewSection('12 Agriculture Science (Agronomy & Soil Science)');
                        setNewRoomNo('Agri-Lab 02');
                        setNewBuilding('Agricultural Sciences Wing');
                        setNewClassTeacherId('TCH007');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Agriculture Science">🌾 Agriculture Science (Agronomy & Crop Production)</option>
                    <option value="Science (PCM)">Science (PCM - Physics, Chem, Math)</option>
                    <option value="Science (PCB)">Science (PCB - Physics, Chem, Biology)</option>
                    <option value="Commerce">Commerce & Accountancy</option>
                    <option value="Humanities">Humanities & Social Sciences</option>
                    <option value="Vocational & Skill Studies">Vocational & Applied Studies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Section Title / Identifier
                </label>
                <input
                  type="text"
                  required
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  placeholder="e.g. 12 Agriculture Science (Agronomy)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Room / Lab No
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoomNo}
                    onChange={(e) => setNewRoomNo(e.target.value)}
                    placeholder="e.g. Agri-Lab 02"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Max Seat Capacity
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="60"
                    required
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Appoint Class Teacher
                </label>
                <select
                  value={newClassTeacherId}
                  onChange={(e) => setNewClassTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {teachers.map((t) => (
                    <option key={t.teacherId} value={t.teacherId}>
                      {t.name} ({t.designation}) - {t.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewClassModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold cursor-pointer shadow-md active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Establish Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD SUBJECT TO CLASS */}
      {/* ========================================================================= */}
      {isAddSubjectModalOpen && targetClassForSubject && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Add Subject to {targetClassForSubject.className}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {targetClassForSubject.section} • {targetClassForSubject.stream}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddSubjectModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick preset selector for common subjects */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Quick Preset Subjects
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Agriculture Science (Theory & Agronomy)', code: '068', periods: 6 },
                  { name: 'Agronomy Crop Production Practical', code: '069', periods: 4 },
                  { name: 'Soil Chemistry & Fertilizers', code: '043', periods: 6 },
                  { name: 'Biology & Plant Physiology', code: '044', periods: 6 },
                  { name: 'Physics (Theory & Practical)', code: '042', periods: 6 },
                  { name: 'Mathematics', code: '041', periods: 6 },
                  { name: 'Computer Science', code: '083', periods: 6 },
                  { name: 'English Core', code: '301', periods: 5 },
                  { name: 'Hindi Core', code: '302', periods: 5 }
                ].map((preset) => (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => {
                      setNewSubName(preset.name);
                      setNewSubCode(preset.code);
                      setNewSubPeriods(preset.periods);
                      if (preset.code === '068' || preset.code === '069') {
                        setNewSubTeacherId('TCH007');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      newSubCode === preset.code
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-slate-50 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-700 hover:bg-slate-100'
                    }`}
                  >
                    {preset.name.split(' ')[0]} ({preset.code})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveAddSubject} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Subject Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Agriculture Science (Theory & Agronomy)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    CBSE Subject Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    placeholder="e.g. 068"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Periods Per Week
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={newSubPeriods}
                    onChange={(e) => setNewSubPeriods(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Assigned Faculty Teacher
                </label>
                <select
                  value={newSubTeacherId}
                  onChange={(e) => setNewSubTeacherId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {teachers.map((t) => (
                    <option key={t.teacherId} value={t.teacherId}>
                      {t.name} ({t.designation}) - {t.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold cursor-pointer shadow-md active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: APPOINT / HIRE NEW FACULTY */}
      {/* ========================================================================= */}
      {isNewTeacherModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Appoint New Teaching Faculty
                  </h3>
                  <p className="text-xs text-slate-500">
                    Register faculty member credentials and teaching assignments
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewTeacherModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTeacher} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Faculty Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTechName}
                    onChange={(e) => setNewTechName(e.target.value)}
                    placeholder="e.g. Dr. Meenakshi Joshi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={newTechId}
                    onChange={(e) => setNewTechId(e.target.value)}
                    placeholder="e.g. TCH007"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={newTechDesignation}
                    onChange={(e) => setNewTechDesignation(e.target.value)}
                    placeholder="e.g. PGT Biology"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    value={newTechDepartment}
                    onChange={(e) => setNewTechDepartment(e.target.value)}
                    placeholder="e.g. Science Department"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Subjects Taught (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={newTechSubjectInput}
                  onChange={(e) => setNewTechSubjectInput(e.target.value)}
                  placeholder="e.g. Biology, Biotechnology Lab"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Class Teacher of
                  </label>
                  <select
                    value={newTechClassTeacherOf}
                    onChange={(e) => setNewTechClassTeacherOf(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                  >
                    <option value="None">None (Subject Specialist Only)</option>
                    <optgroup label="General Class Standards (9 to 12)">
                      <option value="Class 9">Class 9 (Junior Secondary)</option>
                      <option value="Class 10">Class 10 (Secondary Board Batch)</option>
                      <option value="Class 11">Class 11 (Senior Secondary)</option>
                      <option value="Class 12">Class 12 (Board Examination Batch)</option>
                    </optgroup>
                    {classes && classes.length > 0 && (
                      <optgroup label="Specific Class & Section">
                        {classes.map((cls) => (
                          <option key={cls.id} value={`${cls.className} (${cls.section})`}>
                            {cls.className} - {cls.section}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={newTechQualification}
                    onChange={(e) => setNewTechQualification(e.target.value)}
                    placeholder="e.g. M.Sc, Ph.D, B.Ed"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTeacherModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Appoint Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: STUDENT CLASS TRANSFER */}
      {/* ========================================================================= */}
      {isTransferModalOpen && targetStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Transfer Student Class
                  </h3>
                  <p className="text-xs text-slate-500">
                    {targetStudent.name} (Roll #{targetStudent.rollNo})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-700 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                Current Class: <span className="text-blue-600 dark:text-blue-400">{targetStudent.className}</span>
              </p>
              <p className="text-slate-500 mt-0.5">
                Stream: {targetStudent.stream}
              </p>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Target Destination Class:
                </label>
                <select
                  value={transferTargetClass}
                  onChange={(e) => setTransferTargetClass(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Class 9">Class 9 (Junior Secondary)</option>
                  <option value="Class 10">Class 10 (Secondary Board Batch)</option>
                  <option value="Class 11">Class 11 (Senior Secondary Year 1)</option>
                  <option value="Class 12">Class 12 (Board Examination Batch)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ISSUE OFFICIAL CIRCULAR */}
      {/* ========================================================================= */}
      {isCircularModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Issue Principal Circular
                  </h3>
                  <p className="text-xs text-slate-500">
                    Broadcast institutional announcement to school portals
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCircularModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendCircular} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={circularAudience}
                    onChange={(e) => setCircularAudience(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="All">Entire School Community</option>
                    <option value="Teachers">Teaching Faculty Only</option>
                    <option value="Students">All Students Only</option>
                    <option value="Class 9">Class 9 Students & Parents</option>
                    <option value="Class 10">Class 10 Students & Parents</option>
                    <option value="Class 11">Class 11 Students & Parents</option>
                    <option value="Class 12">Class 12 Board Batch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={circularPriority}
                    onChange={(e) => setCircularPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="High">High / Urgent Notice</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">General Information</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Notice Subject / Heading
                </label>
                <input
                  type="text"
                  required
                  value={circularTitle}
                  onChange={(e) => setCircularTitle(e.target.value)}
                  placeholder="e.g. CBSE Term-End Practicals & Class Attendance Directive"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Circular Directive Body
                </label>
                <textarea
                  rows={4}
                  required
                  value={circularMessage}
                  onChange={(e) => setCircularMessage(e.target.value)}
                  placeholder="Type the official administrative notice text..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs text-slate-900 dark:text-white leading-relaxed resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCircularModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Circular</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: PRINCIPAL DIRECT STUDENT ENROLLMENT DESK */}
      {/* ========================================================================= */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-2xl rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Principal Admissions Desk: Enroll New Student
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add new student to Class 9, 10, 11, or 12 with automatic Roll ID and instant login credentials.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePrincipalAddStudent} className="space-y-4 text-xs">
              {/* Row 1: Target Class & Stream */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Class <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={stuClass}
                    onChange={(e) => handleStuClassChange(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl font-bold text-slate-900 dark:text-white cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                  >
                    <option value="Class 9">Class 9 (Junior Secondary)</option>
                    <option value="Class 10">Class 10 (Secondary Board Batch)</option>
                    <option value="Class 11">Class 11 (Senior Secondary)</option>
                    <option value="Class 12">Class 12 (Board Batch)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Section <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={stuSection}
                    onChange={(e) => setStuSection(e.target.value)}
                    placeholder="e.g. Section A"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Stream / Curriculum <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={stuStream}
                    onChange={(e) => setStuStream(e.target.value)}
                    placeholder="e.g. Junior Secondary (CBSE)"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 2: Full Name & Roll Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={stuName}
                    onChange={(e) => setStuName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Roll Number (Class Index) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={stuRoll}
                    onChange={(e) => setStuRoll(e.target.value)}
                    placeholder="e.g. 03"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Auto-Generated Unique ID Banner */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                    Auto-Generated Student ERP Credentials
                  </span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 text-xs">
                    Login ID: <span className="text-blue-600 dark:text-blue-400">{stuPhone.trim() || stuName.trim().toLowerCase().replace(/\s+/g, '') || `STU2026${stuClass.replace(/\D/g, '') || '9'}${stuRoll.padStart(2, '0')}`}</span> • Password: <span className="text-slate-600 dark:text-slate-300 font-normal">{stuDob ? stuDob.split('-').reverse().join('') : 'student123'}</span>
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800">
                  Active Upon Save
                </span>
              </div>

              {/* Row 3: Email & Student Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Email (Auto-suggested)
                  </label>
                  <input
                    type="email"
                    value={stuEmail}
                    onChange={(e) => setStuEmail(e.target.value)}
                    placeholder={stuName ? `${stuName.toLowerCase().replace(/\s+/g, '')}${stuRoll}@stxaviors.edu.in` : 'student@stxaviors.edu.in'}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Mobile / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={stuPhone}
                    onChange={(e) => setStuPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 4: Parent Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Father / Guardian Name
                  </label>
                  <input
                    type="text"
                    value={stuFather}
                    onChange={(e) => setStuFather(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mother Name
                  </label>
                  <input
                    type="text"
                    value={stuMother}
                    onChange={(e) => setStuMother(e.target.value)}
                    placeholder="e.g. Sunita Sharma"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parent Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={stuParentPhone}
                    onChange={(e) => setStuParentPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Row 5: DOB & Blood Group & Avatar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={stuDob}
                    onChange={(e) => setStuDob(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={stuBlood}
                    onChange={(e) => setStuBlood(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl font-bold text-slate-900 dark:text-white cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Profile Avatar Preset
                  </label>
                  <select
                    value={stuAvatar}
                    onChange={(e) => setStuAvatar(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl font-semibold text-slate-900 dark:text-white cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                  >
                    <option value="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6">Student Avatar 1 (Boy)</option>
                    <option value="https://images.unsplash.com/photo-1534528741775-53994a69daeb">Student Avatar 2 (Girl)</option>
                    <option value="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d">Student Avatar 3 (Boy)</option>
                    <option value="https://images.unsplash.com/photo-1517841905240-472988babdf9">Student Avatar 4 (Girl)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold cursor-pointer transition-all active:scale-[0.98] duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] duration-150 ease-in-out"
                  id="submit-principal-enroll-btn"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Confirm Student Admission</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Quick Profile Drawer */}
      {selectedStudentForDrawer && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity active:scale-[0.98] duration-150 ease-in-out"
            onClick={() => setSelectedStudentForDrawer(null)}
          />
          
          {/* Drawer */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white dark:bg-[#0a0a0a] shadow-2xl z-50 border-l border-slate-200 dark:border-neutral-800 transform transition-transform duration-300 flex flex-col animate-in slide-in-from-right">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-neutral-900/50">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-600" />
                Quick Profile
              </h3>
              <div className="flex items-center gap-2">
                {isEditingProfile ? (
                  <>
                    <button 
                      onClick={() => {
                        updateStudentProfile(selectedStudentForDrawer.studentId, editProfileData);
                        setSelectedStudentForDrawer({ ...selectedStudentForDrawer, ...editProfileData });
                        setIsEditingProfile(false);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 active:scale-[0.98] duration-150 ease-in-out"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button 
                      onClick={() => setIsEditingProfile(false)}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg text-xs font-bold transition-colors active:scale-[0.98] duration-150 ease-in-out"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setEditProfileData({
                        name: selectedStudentForDrawer.name,
                        rollNo: selectedStudentForDrawer.rollNo,
                        className: selectedStudentForDrawer.className,
                        stream: selectedStudentForDrawer.stream,
                        fatherName: selectedStudentForDrawer.fatherName,
                        parentPhone: selectedStudentForDrawer.parentPhone,
                      });
                      setIsEditingProfile(true);
                    }}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer text-slate-500 active:scale-[0.98] duration-150 ease-in-out"
                    title="Edit Profile"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={() => { setSelectedStudentForDrawer(null); setIsEditingProfile(false); }}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>


            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Profile Overview */}
              <div className="flex flex-col items-center text-center space-y-3">
                <UserAvatar avatar={selectedStudentForDrawer.avatar} name={selectedStudentForDrawer.name} role="student" size="xl" />
                {isEditingProfile ? (
                  <div className="w-full space-y-2 mt-2 text-left px-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Student Name</label>
                      <input type="text" value={editProfileData.name || ''} onChange={e => setEditProfileData({...editProfileData, name: e.target.value})} className="w-full bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Roll No</label>
                        <input type="text" value={editProfileData.rollNo || ''} onChange={e => setEditProfileData({...editProfileData, rollNo: e.target.value})} className="w-full bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Student ID</label>
                        <input type="text" value={selectedStudentForDrawer.studentId} disabled className="w-full bg-slate-200 dark:bg-neutral-800 border border-slate-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 opacity-70 cursor-not-allowed" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Class</label>
                        <input type="text" value={editProfileData.className || ''} onChange={e => setEditProfileData({...editProfileData, className: e.target.value})} className="w-full bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stream</label>
                        <input type="text" value={editProfileData.stream || ''} onChange={e => setEditProfileData({...editProfileData, stream: e.target.value})} className="w-full bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedStudentForDrawer.name}</h2>
                      <p className="text-xs font-mono text-slate-500 mt-1">ID: {selectedStudentForDrawer.studentId} • Roll #{selectedStudentForDrawer.rollNo}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                        {selectedStudentForDrawer.className}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300">
                        {selectedStudentForDrawer.stream}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Academic & Attendance Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600 dark:text-blue-400 mb-1">Overall Score</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{selectedStudentForDrawer.overallPercentage}%</p>
                  <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${selectedStudentForDrawer.overallPercentage}%` }}></div>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 mb-1">Attendance</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">92%</p>
                  <div className="w-full bg-emerald-200 dark:bg-emerald-900/50 rounded-full h-1.5 mt-2">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>

              {/* Guardian Info & Comms */}
              <div className="p-5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-md">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Parent / Guardian
                </h4>
                {isEditingProfile ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Parent/Guardian Name</label>
                      <input type="text" value={editProfileData.fatherName || ''} onChange={e => setEditProfileData({...editProfileData, fatherName: e.target.value})} className="w-full bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
                      <input type="text" value={editProfileData.parentPhone || ''} onChange={e => setEditProfileData({...editProfileData, parentPhone: e.target.value})} className="w-full bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white font-mono" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedStudentForDrawer.fatherName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Primary Contact</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); window.location.href = "sms:" + selectedStudentForDrawer.parentPhone?.replace(/\s/g, ""); }} className="w-8 h-8 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center hover:bg-sky-100 transition-colors border border-sky-200 dark:border-sky-800 cursor-pointer text-xs ease-in-out active:scale-[0.98] duration-150" title="Send SMS">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <a href={`tel:${selectedStudentForDrawer.parentPhone}`} className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 transition-colors border border-blue-200 dark:border-blue-800 active:scale-[0.98] duration-150 ease-in-out" title="Call Parent">
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                    <div className="text-sm font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-neutral-900 p-2.5 rounded-lg border border-slate-100 dark:border-neutral-700">
                      {selectedStudentForDrawer.parentPhone}
                    </div>
                  </div>
                )}
              </div>

              {/* Fee Status & History */}
              <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#1e293b] dark:text-white">Student Ledger</h3>
                  
                  <div className="flex items-center gap-2">
                    {isEditingFees ? (
                       <>
                          <button 
                            onClick={() => {
                               if (selectedStudentForDrawer) {
                                  updateStudentProfile(selectedStudentForDrawer.studentId, {
                                     totalFeeAmount: Number(editTotal),
                                     paidFeeAmount: Number(editPaid),
                                     previousFeeAmount: Number(editPrevious),
                                     pendingFeeAmount: Number(editPending),
                                     feeStatus: Number(editPending) > 0 ? 'Pending' : 'Paid'
                                  });
                                  setSelectedStudentForDrawer({
                                    ...selectedStudentForDrawer,
                                    totalFeeAmount: Number(editTotal),
                                    paidFeeAmount: Number(editPaid),
                                    previousFeeAmount: Number(editPrevious),
                                    pendingFeeAmount: Number(editPending),
                                    feeStatus: Number(editPending) > 0 ? 'Pending' : 'Paid'
                                  });
                               }
                               setIsEditingFees(false);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-sm active:scale-[0.98] transition-all duration-150 ease-in-out"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setIsEditingFees(false)}
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 cursor-pointer border border-slate-200 dark:border-slate-700 shadow-md ease-in-out active:scale-[0.98] transition-all duration-150"
                          >
                            Cancel
                          </button>
                       </>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            setEditTotal((selectedStudentForDrawer?.totalFeeAmount ?? 25000).toString());
                            setEditPaid((selectedStudentForDrawer?.paidFeeAmount ?? 0).toString());
                            setEditPrevious((selectedStudentForDrawer?.previousFeeAmount ?? 0).toString());
                            setEditPending((selectedStudentForDrawer?.pendingFeeAmount ?? 25000).toString());
                            setIsEditingFees(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-md border border-slate-200 dark:border-neutral-700 ease-in-out active:scale-[0.98] duration-150"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit Ledger
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 2x2 Grid */}
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 overflow-hidden mb-6 shadow-md">
                  <div className="grid grid-cols-2">
                    {/* To Be Collected */}
                    <div className="p-4 border-r border-b border-slate-200 dark:border-neutral-800">
                      <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-1">To Be Collected</p>
                      <div className="flex items-center justify-between">
                        {isEditingFees ? (
                          <input type="number" value={editTotal} onChange={e => setEditTotal(e.target.value)} className="w-full bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm font-bold text-teal-700 dark:text-teal-300 mr-2" />
                        ) : (
                          <p className="text-xl font-bold text-teal-700 dark:text-teal-400">₹ {(selectedStudentForDrawer?.totalFeeAmount || 25000).toLocaleString()}</p>
                        )}
                        {!isEditingFees && <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0"><TrendingUp className="w-3.5 h-3.5" /></div>}
                      </div>
                    </div>

                    {/* Paid */}
                    <div className="p-4 border-b border-slate-200 dark:border-neutral-800">
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Paid</p>
                      <div className="flex items-center justify-between">
                        {isEditingFees ? (
                          <input type="number" value={editPaid} onChange={e => setEditPaid(e.target.value)} className="w-full bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm font-bold text-emerald-700 dark:text-emerald-300 mr-2" />
                        ) : (
                          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">₹ {(selectedStudentForDrawer?.paidFeeAmount || 0).toLocaleString()}</p>
                        )}
                        {!isEditingFees && <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /></div>}
                      </div>
                    </div>

                    {/* Previous Fee */}
                    <div className="p-4 border-r border-slate-200 dark:border-neutral-800">
                      <p className="text-xs font-medium text-amber-500 dark:text-amber-400 mb-1">Previous Fee</p>
                      <div className="flex items-center justify-between">
                        {isEditingFees ? (
                          <input type="number" value={editPrevious} onChange={e => setEditPrevious(e.target.value)} className="w-full bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm font-bold text-amber-600 dark:text-amber-500 mr-2" />
                        ) : (
                          <p className="text-xl font-bold text-amber-500 dark:text-amber-400">₹ {(selectedStudentForDrawer?.previousFeeAmount || 0).toLocaleString()}</p>
                        )}
                        {!isEditingFees && <div className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center shrink-0"><MoreHorizontal className="w-4 h-4" /></div>}
                      </div>
                    </div>

                    {/* Pending */}
                    <div className="p-4">
                      <p className="text-xs font-medium text-rose-500 dark:text-rose-400 mb-1">Pending</p>
                      <div className="flex items-center justify-between">
                        {isEditingFees ? (
                          <input type="number" value={editPending} onChange={e => setEditPending(e.target.value)} className="w-full bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-sm font-bold text-rose-600 dark:text-rose-400 mr-2" />
                        ) : (
                          <p className="text-xl font-bold text-rose-600 dark:text-rose-500">₹ {(selectedStudentForDrawer?.pendingFeeAmount ?? 25000).toLocaleString()}</p>
                        )}
                        {!isEditingFees && (
                          <div className="flex items-center gap-2">
                            <a 
                              href={`sms:${selectedStudentForDrawer?.parentPhone || ''}?body=Dear Parent, this is a reminder that an amount of Rs. ${selectedStudentForDrawer?.pendingFeeAmount ?? 25000} is pending for ${selectedStudentForDrawer?.name}'s school fees. Kindly pay at the earliest to avoid late fees. - Principal`}
                              className="w-6 h-6 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-600 flex items-center justify-center shrink-0 transition-colors active:scale-[0.98] duration-150 ease-in-out"
                              title="Send SMS Reminder"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                            <div className="w-6 h-6 rounded-full border-2 border-rose-500 text-rose-500 flex items-center justify-center shrink-0">
                              <AlertCircle className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1e293b] dark:text-white">Academic Fee Receipts</h3>
                </div>

                <div className="space-y-3">
                  <div className="bg-rose-500 text-white rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <span className="font-semibold">Pending Fees</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">₹ {(selectedStudentForDrawer?.pendingFeeAmount ?? 25000).toLocaleString()}</span>
                      <a 
                        href={`sms:${selectedStudentForDrawer?.parentPhone || ''}?body=Dear Parent, this is a reminder that an amount of Rs. ${selectedStudentForDrawer?.pendingFeeAmount ?? 25000} is pending for ${selectedStudentForDrawer?.name}'s school fees. Kindly pay at the earliest to avoid late fees. - Principal`}
                        className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-colors active:scale-[0.98] duration-150 ease-in-out"
                        title="Send SMS Reminder"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="bg-emerald-500 text-white rounded-xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-emerald-600 transition-colors active:scale-[0.98] duration-150 ease-in-out">
                    <span className="font-semibold">
                      {(selectedStudentForDrawer?.paidFeeAmount ?? 0) > 0 ? 'Payment Successful' : 'Academic Fees Paid'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">₹ {(selectedStudentForDrawer?.paidFeeAmount ?? 0).toLocaleString()}</span>
                      <Download className="w-4 h-4 opacity-70 hover:opacity-100 active:scale-[0.98] transition-all duration-150 ease-in-out" onClick={(e) => {
                          e.stopPropagation();
                          if(!selectedStudentForDrawer) return;
                             try {
                               const doc = new jsPDF('p', 'mm', 'a5');
                               doc.setFont('helvetica', 'bold');
                               doc.setFontSize(14);
                               doc.text("ST. XAVIER'S SENIOR SECONDARY SCHOOL", 74, 20, { align: 'center' });
                               doc.setFontSize(10);
                               doc.setTextColor(100);
                               doc.text("FEE PAYMENT RECEIPT", 74, 28, { align: 'center' });
                               
                               doc.setDrawColor(200);
                               doc.line(10, 35, 138, 35);
                               
                               doc.setTextColor(0);
                               doc.setFont('helvetica', 'normal');
                               doc.text(`Receipt No: FEE-${(selectedStudentForDrawer.studentId || '000').substring(0,4)}`, 10, 45);
                               doc.text(`Date: ${new Date().toLocaleDateString()}`, 90, 45);
                               
                               doc.text(`Student Name: ${selectedStudentForDrawer.name}`, 10, 55);
                               doc.text(`Class/Stream: ${selectedStudentForDrawer.className} / ${selectedStudentForDrawer.stream || 'N/A'}`, 10, 65);
                               doc.text(`Roll No: ${selectedStudentForDrawer.rollNo}`, 90, 65);
                               
                               doc.setFont('helvetica', 'bold');
                               doc.text("Payment Details", 10, 80);
                               doc.setFont('helvetica', 'normal');
                               doc.text(`Amount Paid: Rs. ${(selectedStudentForDrawer.paidFeeAmount || 0).toLocaleString()}/-`, 10, 90);
                               doc.text(`Status: SUCCESSFUL`, 10, 100);
                               
                               doc.line(10, 120, 138, 120);
                               doc.setFontSize(8);
                               doc.setTextColor(150);
                               doc.text("This is a computer generated receipt.", 74, 130, { align: 'center' });
                               
                               doc.save(`Receipt_${selectedStudentForDrawer.name.replace(/\s/g, '_')}.pdf`);
                             } catch(err) {
                               alert("Failed to generate PDF. Check if jsPDF is installed.");
                             }
                      }} />
                    </div>
                  </div>
                </div>

              </div>

              {/* Academic Highlights */}
              <div className="p-5 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-md">
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-4 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" /> Recent Highlights
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-slate-600 dark:text-slate-300 flex-1">Mathematics Unit Test</span>
                    <span className="font-bold text-slate-900 dark:text-white">94/100</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    <span className="text-slate-600 dark:text-slate-300 flex-1">Science Mid Term</span>
                    <span className="font-bold text-slate-900 dark:text-white">88/100</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    <span className="text-slate-600 dark:text-slate-300 flex-1">Co-curricular (Debate)</span>
                    <span className="font-bold text-slate-900 dark:text-white">Grade A</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </>
      )}



      {/* ========================================================================= */}
      {/* ADD EXAM MODAL */}
      {/* ========================================================================= */}
      {isAddExamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Schedule New Exam
                  </h3>
                  <p className="text-xs text-slate-500">Create a schedule directly from the Principal's Desk</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddExamModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addExamItem({
                  ...newExamDetails,
                  title: newExamDetails.subjectName,
                  type: 'board_term',
                  code: newExamDetails.subjectCode,
                  marks: 100,
                  date: newExamDetails.date,
                  time: newExamDetails.timeSlot,
                  room: newExamDetails.roomNo,
                  status: 'locked',
                  createdBy: 'Principal'
                });
                setIsAddExamModalOpen(false);
                setNewExamDetails({ targetClass: 'Class 11', subjectName: '', subjectCode: '', date: '', timeSlot: '09:00 AM - 12:00 PM', roomNo: '', invigilator: '' });
                alert('Exam schedule created successfully!');
              }}
              className="space-y-4 text-sm"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Subject Name</label>
                  <select
                    value={newExamDetails.subjectName}
                    onChange={(e) => setNewExamDetails({ ...newExamDetails, subjectName: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    required
                  >
                  <option value="" disabled>Select option...</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Accountancy">Accountancy</option>
                  <option value="Business Studies">Business Studies</option>
                  <option value="Economics">Economics</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Physical Education">Physical Education</option>
                  <option value="Agriculture Science">Agriculture Science</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Subject Code</label>
                  <select
                    value={newExamDetails.subjectCode}
                    onChange={(e) => setNewExamDetails({ ...newExamDetails, subjectCode: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    required
                  >
                  <option value="" disabled>Select option...</option>
                  <option value="041">041</option>
                  <option value="042">042</option>
                  <option value="043">043</option>
                  <option value="044">044</option>
                  <option value="301">301</option>
                  <option value="302">302</option>
                  <option value="083">083</option>
                  <option value="055">055</option>
                  <option value="054">054</option>
                  <option value="030">030</option>
                  <option value="027">027</option>
                  <option value="029">029</option>
                  <option value="048">048</option>
                  <option value="068">068</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Target Class / Section</label>
                <select
                  value={newExamDetails.targetClass}
                  onChange={(e) => setNewExamDetails({ ...newExamDetails, targetClass: e.target.value })}
                  className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  required
                >
                  <option value="All">All Students</option>
                  <option value="Class 9">Class 9 (All Sections)</option>
                  <option value="Class 10">Class 10 (All Sections)</option>
                  <option value="Class 11">Class 11 (All Sections)</option>
                  <option value="Class 11-A">Class 11-A</option>
                  <option value="Class 11-B">Class 11-B</option>
                  <option value="Class 12">Class 12 (All Sections)</option>
                  <option value="Class 12-A">Class 12-A</option>
                  <option value="Class 12-B">Class 12-B</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Exam Date</label>
                  <input
                    type="date"
                    value={newExamDetails.date}
                    onChange={(e) => setNewExamDetails({ ...newExamDetails, date: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Time Slot</label>
                  <select
                    value={newExamDetails.timeSlot}
                    onChange={(e) => setNewExamDetails({ ...newExamDetails, timeSlot: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    required
                  >
                  <option value="" disabled>Select option...</option>
                  <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                  <option value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM</option>
                  <option value="01:00 PM - 04:00 PM">01:00 PM - 04:00 PM</option>
                  <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Room No.</label>
                  <select
                    value={newExamDetails.roomNo}
                    onChange={(e) => setNewExamDetails({ ...newExamDetails, roomNo: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    required
                  >
                  <option value="" disabled>Select option...</option>
                  <option value="Main Examination Hall A">Main Examination Hall A</option>
                  <option value="Main Examination Hall B">Main Examination Hall B</option>
                  <option value="Room 101">Room 101</option>
                  <option value="Room 102">Room 102</option>
                  <option value="Room 103">Room 103</option>
                  <option value="Room 201">Room 201</option>
                  <option value="Agri-Lab 02">Agri-Lab 02</option>
                  <option value="Computer Lab 1">Computer Lab 1</option>
                  <option value="Physics Lab">Physics Lab</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Invigilator</label>
                  <select
                    value={newExamDetails.invigilator}
                    onChange={(e) => setNewExamDetails({ ...newExamDetails, invigilator: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                    
                  >
                  <option value="" disabled>Select option...</option>
                  {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddExamModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold cursor-pointer transition-all active:scale-[0.98] duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-[0.98] duration-150 ease-in-out"
                >
                  <Plus className="w-4 h-4" /> Create Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXAM EDIT MODAL */}
      {/* ========================================================================= */}
      {isExamModalOpen && editingExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Exam Schedule
                  </h3>
                  <p className="text-xs text-slate-500">Modify date, time, and room assignments</p>
                </div>
              </div>
              <button
                onClick={() => { setIsExamModalOpen(false); setEditingExam(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateExamItem(editingExam.id, editingExam);
                setIsExamModalOpen(false);
                setEditingExam(null);
                alert('Exam schedule updated successfully!');
              }}
              className="space-y-4 text-sm"
            >
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Subject Name</label>
                <select
                    value={editingExam.subjectName}
                    onChange={(e) => setEditingExam({ ...editingExam, subjectName: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    required
                  >
                  <option value="" disabled>Select option...</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Accountancy">Accountancy</option>
                  <option value="Business Studies">Business Studies</option>
                  <option value="Economics">Economics</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Physical Education">Physical Education</option>
                  <option value="Agriculture Science">Agriculture Science</option>
                  </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Subject Code</label>
                  <select
                    value={editingExam.subjectCode}
                    onChange={(e) => setEditingExam({ ...editingExam, subjectCode: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    required
                  >
                  <option value="" disabled>Select option...</option>
                  <option value="041">041</option>
                  <option value="042">042</option>
                  <option value="043">043</option>
                  <option value="044">044</option>
                  <option value="301">301</option>
                  <option value="302">302</option>
                  <option value="083">083</option>
                  <option value="055">055</option>
                  <option value="054">054</option>
                  <option value="030">030</option>
                  <option value="027">027</option>
                  <option value="029">029</option>
                  <option value="048">048</option>
                  <option value="068">068</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Target Class</label>
                  <select
                    value={editingExam.targetClass || ""}
                    onChange={(e) => setEditingExam({ ...editingExam, targetClass: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                  >
                  <option value="All">All Students</option>
                  <option value="Class 9">Class 9 (All Sections)</option>
                  <option value="Class 10">Class 10 (All Sections)</option>
                  <option value="Class 11">Class 11 (All Sections)</option>
                  <option value="Class 11-A">Class 11-A</option>
                  <option value="Class 11-B">Class 11-B</option>
                  <option value="Class 12">Class 12 (All Sections)</option>
                  <option value="Class 12-A">Class 12-A</option>
                  <option value="Class 12-B">Class 12-B</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Exam Date</label>
                  <input
                    type="date"
                    value={editingExam.date}
                    onChange={(e) => setEditingExam({ ...editingExam, date: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Time Slot</label>
                  <select
                    value={editingExam.timeSlot}
                    onChange={(e) => setEditingExam({ ...editingExam, timeSlot: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    required
                  >
                  <option value="" disabled>Select option...</option>
                  <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM</option>
                  <option value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM</option>
                  <option value="01:00 PM - 04:00 PM">01:00 PM - 04:00 PM</option>
                  <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Room No.</label>
                  <select
                    value={editingExam.roomNo}
                    onChange={(e) => setEditingExam({ ...editingExam, roomNo: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    required
                  >
                  <option value="" disabled>Select option...</option>
                  <option value="Main Examination Hall A">Main Examination Hall A</option>
                  <option value="Main Examination Hall B">Main Examination Hall B</option>
                  <option value="Room 101">Room 101</option>
                  <option value="Room 102">Room 102</option>
                  <option value="Room 103">Room 103</option>
                  <option value="Room 201">Room 201</option>
                  <option value="Agri-Lab 02">Agri-Lab 02</option>
                  <option value="Computer Lab 1">Computer Lab 1</option>
                  <option value="Physics Lab">Physics Lab</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Invigilator</label>
                  <select
                    value={editingExam.invigilator || ""}
                    onChange={(e) => setEditingExam({ ...editingExam, invigilator: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                    
                  >
                  <option value="" disabled>Select option...</option>
                  {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsExamModalOpen(false); setEditingExam(null); }}
                  className="flex-1 py-3 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold cursor-pointer transition-all active:scale-[0.98] duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-2 active:scale-[0.98] duration-150 ease-in-out"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Principal Profile Photo Modal */}
      <ProfilePhotoModal
        isOpen={showPrincipalPhotoModal}
        onClose={() => setShowPrincipalPhotoModal(false)}
        targetRole="principal"
      />

    </div>
  );
};
