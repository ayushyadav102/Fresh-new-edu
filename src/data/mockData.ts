import {
  StudentProfile,
  TeacherProfile,
  PrincipalProfile,
  SchoolClassInfo,
  TeacherScheduleSlot,
  AttendanceRecord,
  TimetableSlot,
  LMSMaterial,
  LMSAssignment,
  ExamScheduleItem,
  SemesterResult,
  FeeBreakdownItem,
  FeeTransaction,
  HostelComplaint,
  AcademicDocument,
  NotificationItem,
  FeedbackSubmission,
  AcademicCalendarEvent,
  MentorLog,
  DailyClassAttendanceReport
} from '../types';

// ---------------------------------------------------------------------------
// ⚠️ SECURITY NOTE
// The `password` fields below are used ONLY by the local mock-mode login path
// in src/context/AuthContext.tsx (isMockDataEnabled() === true), which never
// contacts Firebase Auth or Firestore. They are not, and must never become,
// real account passwords.
// When deploying with a real Firestore backend (VITE_USE_MOCK_DATA=false),
// real accounts must be provisioned by an admin with their own passwords —
// this file is never consulted for authentication in that mode.
// This file is still bundled into the client build; do not add real
// secrets, production credentials, or real student/staff data here.
// ---------------------------------------------------------------------------

export const DEFAULT_PRINCIPAL: PrincipalProfile = {
  id: 'prn1',
  principalId: 'PRN001',
  
  name: 'Dr. Arvind Swaminathan',
  email: 'principal@stxaviers.edu.in',
  phone: '+91 98450 11990',
  avatar: '',
  designation: 'Principal & Director of Academic Administration',
  schoolName: "St. Xavier's Senior Secondary School",
  qualification: 'Ph.D in Education Leadership, M.Sc Physics (Gold Medalist)',
  experienceYears: 24,
  officeRoom: 'Principal Office, Administrative Block 1st Floor'
};

export const DEFAULT_SCHOOL_CLASSES: SchoolClassInfo[] = [
  {
    id: 'cls_11_sci',
    classCode: '11-A',
    className: 'Class 11',
    section: 'Section A (Science PCM + CS)',
    stream: 'Science (PCM)',
    roomNo: 'Room 101',
    building: 'Senior Science Wing',
    capacity: 40,
    classTeacherId: 'TCH001',
    classTeacherName: 'Mr. Rajesh Sharma',
    academicYear: '2026-2027',
    subjects: [
      { code: '042', name: 'Physics (Theory & Practical)', teacherId: 'TCH001', teacherName: 'Mr. Rajesh Sharma', periodsPerWeek: 6 },
      { code: '043', name: 'Chemistry (Theory & Lab)', teacherId: 'TCH002', teacherName: 'Mrs. Sunita Verma', periodsPerWeek: 6 },
      { code: '041', name: 'Mathematics', teacherId: 'TCH003', teacherName: 'Mr. Vikram Singh', periodsPerWeek: 6 },
      { code: '083', name: 'Computer Science', teacherId: 'TCH005', teacherName: 'Mr. Amit Kumar', periodsPerWeek: 6 },
      { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 }
    ]
  },
  {
    id: 'cls_11_bio',
    classCode: '11-B',
    className: 'Class 11',
    section: 'Section B (Science PCB + Bio)',
    stream: 'Science (PCB)',
    roomNo: 'Room 102',
    building: 'Senior Science Wing',
    capacity: 40,
    classTeacherId: 'TCH002',
    classTeacherName: 'Mrs. Sunita Verma',
    academicYear: '2026-2027',
    subjects: [
      { code: '042', name: 'Physics', teacherId: 'TCH001', teacherName: 'Mr. Rajesh Sharma', periodsPerWeek: 6 },
      { code: '043', name: 'Chemistry', teacherId: 'TCH002', teacherName: 'Mrs. Sunita Verma', periodsPerWeek: 6 },
      { code: '044', name: 'Biology (Theory & Lab)', teacherId: 'TCH004', teacherName: 'Mrs. Ananya Gupta', periodsPerWeek: 6 },
      { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 }
    ]
  },
  {
    id: 'cls_12_sci',
    classCode: '12-A',
    className: 'Class 12',
    section: 'Section A (Science PCM + CS)',
    stream: 'Science (PCM)',
    roomNo: 'Room 201',
    building: 'Senior Science Wing',
    capacity: 45,
    classTeacherId: 'TCH003',
    classTeacherName: 'Mr. Vikram Singh',
    academicYear: '2026-2027',
    subjects: [
      { code: '042', name: 'Physics', teacherId: 'TCH001', teacherName: 'Mr. Rajesh Sharma', periodsPerWeek: 6 },
      { code: '043', name: 'Chemistry', teacherId: 'TCH002', teacherName: 'Mrs. Sunita Verma', periodsPerWeek: 6 },
      { code: '041', name: 'Mathematics', teacherId: 'TCH003', teacherName: 'Mr. Vikram Singh', periodsPerWeek: 6 },
      { code: '083', name: 'Computer Science', teacherId: 'TCH005', teacherName: 'Mr. Amit Kumar', periodsPerWeek: 6 },
      { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 }
    ]
  },
  {
    id: 'cls_12_bio',
    classCode: '12-B',
    className: 'Class 12',
    section: 'Section B (Science PCB + Bio)',
    stream: 'Science (PCB)',
    roomNo: 'Room 202',
    building: 'Senior Science Wing',
    capacity: 45,
    classTeacherId: 'TCH004',
    classTeacherName: 'Mrs. Ananya Gupta',
    academicYear: '2026-2027',
    subjects: [
      { code: '042', name: 'Physics', teacherId: 'TCH001', teacherName: 'Mr. Rajesh Sharma', periodsPerWeek: 6 },
      { code: '043', name: 'Chemistry', teacherId: 'TCH002', teacherName: 'Mrs. Sunita Verma', periodsPerWeek: 6 },
      { code: '044', name: 'Biology', teacherId: 'TCH004', teacherName: 'Mrs. Ananya Gupta', periodsPerWeek: 6 },
      { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 }
    ]
  },
  {
    id: 'cls_11_comm',
    classCode: '11-C',
    className: 'Class 11',
    section: 'Section C (Commerce & IP)',
    stream: 'Commerce',
    roomNo: 'Room 105',
    building: 'Commerce Block',
    capacity: 40,
    classTeacherId: 'TCH008',
    classTeacherName: 'Mr. Sanjay Agarwal',
    academicYear: '2026-2027',
    subjects: [
      { code: '055', name: 'Accountancy', teacherId: 'TCH008', teacherName: 'Mr. Sanjay Agarwal', periodsPerWeek: 6 },
      { code: '054', name: 'Business Studies', teacherId: 'TCH009', teacherName: 'Mrs. Ritu Malhotra', periodsPerWeek: 6 },
      { code: '030', name: 'Economics', teacherId: 'TCH009', teacherName: 'Mrs. Ritu Malhotra', periodsPerWeek: 6 },
      { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 },
      { code: '065', name: 'Informatics Practices', teacherId: 'TCH005', teacherName: 'Mr. Amit Kumar', periodsPerWeek: 5 }
    ]
  },
  {
    id: 'cls_11_arts',
    classCode: '11-D',
    className: 'Class 11',
    section: 'Section D (Humanities & Arts)',
    stream: 'Humanities & Arts',
    roomNo: 'Room 108',
    building: 'Humanities Block',
    capacity: 40,
    classTeacherId: 'TCH010',
    classTeacherName: 'Mr. Arvind Pandey',
    academicYear: '2026-2027',
    subjects: [
      { code: '027', name: 'History', teacherId: 'TCH010', teacherName: 'Mr. Arvind Pandey', periodsPerWeek: 6 },
      { code: '028', name: 'Political Science', teacherId: 'TCH010', teacherName: 'Mr. Arvind Pandey', periodsPerWeek: 6 },
      { code: '030', name: 'Economics', teacherId: 'TCH009', teacherName: 'Mrs. Ritu Malhotra', periodsPerWeek: 6 },
      { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 },
      { code: '048', name: 'Physical Education', teacherId: 'TCH011', teacherName: 'Mr. D. S. Rawat', periodsPerWeek: 5 }
    ]
  },
  {
    id: 'cls_11_agri',
    classCode: '11-AG',
    className: 'Class 11',
    section: 'Section AG (Agriculture Science)',
    stream: 'Agriculture Science',
    roomNo: 'Room 106 (Agri-Lab)',
    building: 'Applied Agricultural Sciences Complex',
    capacity: 40,
    classTeacherId: 'TCH007',
    classTeacherName: 'Dr. Ramesh Patel',
    academicYear: '2026-2027',
    subjects: [
      { code: '068', name: 'Agriculture Science (Theory & Agronomy)', teacherId: 'TCH007', teacherName: 'Dr. Ramesh Patel', periodsPerWeek: 6 },
      { code: '069', name: 'Agronomy Crop Production Practical', teacherId: 'TCH018', teacherName: 'Mr. Kuldeep Yadav', periodsPerWeek: 4 },
      { code: '044', name: 'Biology & Plant Genetics', teacherId: 'TCH004', teacherName: 'Mrs. Ananya Gupta', periodsPerWeek: 6 },
      { code: '043', name: 'Soil Chemistry & Agro-chemicals', teacherId: 'TCH002', teacherName: 'Mrs. Sunita Verma', periodsPerWeek: 6 },
      { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 }
    ]
  },
  {
    id: 'cls_12_comm',
    classCode: '12-C',
    className: 'Class 12',
    section: 'Section C (Commerce & Management)',
    stream: 'Commerce',
    roomNo: 'Room 203',
    building: 'Commerce Block',
    capacity: 45,
    classTeacherId: 'TCH008',
    classTeacherName: 'Mr. Sanjay Agarwal',
    academicYear: '2026-2027',
    subjects: [
      { code: '055', name: 'Accountancy', teacherId: 'TCH008', teacherName: 'Mr. Sanjay Agarwal', periodsPerWeek: 6 },
      { code: '054', name: 'Business Studies', teacherId: 'TCH009', teacherName: 'Mrs. Ritu Malhotra', periodsPerWeek: 6 },
      { code: '030', name: 'Economics', teacherId: 'TCH009', teacherName: 'Mrs. Ritu Malhotra', periodsPerWeek: 6 },
      { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 },
      { code: '065', name: 'Informatics Practices', teacherId: 'TCH005', teacherName: 'Mr. Amit Kumar', periodsPerWeek: 5 }
    ]
  },
  {
    id: 'cls_12_arts',
    classCode: '12-D',
    className: 'Class 12',
    section: 'Section D (Humanities & Social Sciences)',
    stream: 'Humanities & Arts',
    roomNo: 'Room 204',
    building: 'Humanities Block',
    capacity: 40,
    classTeacherId: 'TCH010',
    classTeacherName: 'Mr. Arvind Pandey',
    academicYear: '2026-2027',
    subjects: [
      { code: '027', name: 'History', teacherId: 'TCH010', teacherName: 'Mr. Arvind Pandey', periodsPerWeek: 6 },
      { code: '028', name: 'Political Science', teacherId: 'TCH010', teacherName: 'Mr. Arvind Pandey', periodsPerWeek: 6 },
      { code: '030', name: 'Economics', teacherId: 'TCH009', teacherName: 'Mrs. Ritu Malhotra', periodsPerWeek: 6 },
      { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 },
      { code: '048', name: 'Physical Education', teacherId: 'TCH011', teacherName: 'Mr. D. S. Rawat', periodsPerWeek: 5 }
    ]
  },
  {
    id: 'cls_12_agri',
    classCode: '12-AG',
    className: 'Class 12',
    section: 'Section AG (Agriculture Science)',
    stream: 'Agriculture Science',
    roomNo: 'Room 205 (Agronomy Research Wing)',
    building: 'Applied Agricultural Sciences Complex',
    capacity: 40,
    classTeacherId: 'TCH007',
    classTeacherName: 'Dr. Ramesh Patel',
    academicYear: '2026-2027',
    subjects: [
      { code: '068', name: 'Agriculture Science (Theory & Agronomy)', teacherId: 'TCH007', teacherName: 'Dr. Ramesh Patel', periodsPerWeek: 6 },
      { code: '069', name: 'Agronomy Crop Production Practical', teacherId: 'TCH018', teacherName: 'Mr. Kuldeep Yadav', periodsPerWeek: 4 },
      { code: '044', name: 'Biology & Plant Genetics', teacherId: 'TCH004', teacherName: 'Mrs. Ananya Gupta', periodsPerWeek: 6 },
      { code: '043', name: 'Soil Chemistry & Agro-chemicals', teacherId: 'TCH002', teacherName: 'Mrs. Sunita Verma', periodsPerWeek: 6 },
      { code: '301', name: 'English Core', teacherId: 'TCH006', teacherName: 'Mrs. Rekha Sharma', periodsPerWeek: 5 },
      { code: '302', name: 'Hindi Core', teacherId: 'TCH007', teacherName: 'Mr. Arvind Tiwari', periodsPerWeek: 5 }
    ]
  },
  {
    id: 'cls_10_a',
    classCode: '10-A',
    className: 'Class 10',
    section: 'Section A (Secondary Board)',
    stream: 'General Secondary',
    roomNo: 'Room 301',
    building: 'Secondary Block',
    capacity: 42,
    classTeacherId: 'TCH014',
    classTeacherName: 'Mr. Manoj Tiwari',
    academicYear: '2026-2027',
    subjects: [
      { code: '041', name: 'Mathematics', teacherId: 'TCH014', teacherName: 'Mr. Manoj Tiwari', periodsPerWeek: 6 },
      { code: '086', name: 'Science & Technology', teacherId: 'TCH013', teacherName: 'Dr. Neha Kapoor', periodsPerWeek: 6 },
      { code: '087', name: 'Social Science', teacherId: 'TCH015', teacherName: 'Mrs. Sangeeta Sen', periodsPerWeek: 6 },
      { code: '184', name: 'English Language & Literature', teacherId: 'TCH016', teacherName: 'Ms. Meenakshi Joshi', periodsPerWeek: 5 },
      { code: '085', name: 'Hindi Course A', teacherId: 'TCH012', teacherName: 'Dr. Harish Chandra', periodsPerWeek: 5 }
    ]
  },
  {
    id: 'cls_10_b',
    classCode: '10-B',
    className: 'Class 10',
    section: 'Section B (Secondary Board)',
    stream: 'General Secondary',
    roomNo: 'Room 302',
    building: 'Secondary Block',
    capacity: 42,
    classTeacherId: 'TCH013',
    classTeacherName: 'Dr. Neha Kapoor',
    academicYear: '2026-2027',
    subjects: [
      { code: '041', name: 'Mathematics', teacherId: 'TCH014', teacherName: 'Mr. Manoj Tiwari', periodsPerWeek: 6 },
      { code: '086', name: 'Science & Technology', teacherId: 'TCH013', teacherName: 'Dr. Neha Kapoor', periodsPerWeek: 6 },
      { code: '087', name: 'Social Science', teacherId: 'TCH015', teacherName: 'Mrs. Sangeeta Sen', periodsPerWeek: 6 },
      { code: '184', name: 'English Language & Literature', teacherId: 'TCH016', teacherName: 'Ms. Meenakshi Joshi', periodsPerWeek: 5 },
      { code: '085', name: 'Hindi Course A', teacherId: 'TCH012', teacherName: 'Dr. Harish Chandra', periodsPerWeek: 5 }
    ]
  },
  {
    id: 'cls_9_a',
    classCode: '9-A',
    className: 'Class 9',
    section: 'Section A (Foundational Secondary)',
    stream: 'Foundational Secondary',
    roomNo: 'Room 303',
    building: 'Secondary Block',
    capacity: 40,
    classTeacherId: 'TCH015',
    classTeacherName: 'Mrs. Sangeeta Sen',
    academicYear: '2026-2027',
    subjects: [
      { code: '041', name: 'Mathematics', teacherId: 'TCH014', teacherName: 'Mr. Manoj Tiwari', periodsPerWeek: 6 },
      { code: '086', name: 'Science', teacherId: 'TCH013', teacherName: 'Dr. Neha Kapoor', periodsPerWeek: 6 },
      { code: '087', name: 'Social Science', teacherId: 'TCH015', teacherName: 'Mrs. Sangeeta Sen', periodsPerWeek: 6 },
      { code: '184', name: 'English Language', teacherId: 'TCH016', teacherName: 'Ms. Meenakshi Joshi', periodsPerWeek: 5 },
      { code: '085', name: 'Hindi', teacherId: 'TCH017', teacherName: 'Mrs. Vandana Mishra', periodsPerWeek: 5 }
    ]
  },
  {
    id: 'cls_9_b',
    classCode: '9-B',
    className: 'Class 9',
    section: 'Section B (Foundational Secondary)',
    stream: 'Foundational Secondary',
    roomNo: 'Room 304',
    building: 'Secondary Block',
    capacity: 40,
    classTeacherId: 'TCH016',
    classTeacherName: 'Ms. Meenakshi Joshi',
    academicYear: '2026-2027',
    subjects: [
      { code: '041', name: 'Mathematics', teacherId: 'TCH014', teacherName: 'Mr. Manoj Tiwari', periodsPerWeek: 6 },
      { code: '086', name: 'Science', teacherId: 'TCH013', teacherName: 'Dr. Neha Kapoor', periodsPerWeek: 6 },
      { code: '087', name: 'Social Science', teacherId: 'TCH015', teacherName: 'Mrs. Sangeeta Sen', periodsPerWeek: 6 },
      { code: '184', name: 'English Language', teacherId: 'TCH016', teacherName: 'Ms. Meenakshi Joshi', periodsPerWeek: 5 },
      { code: '085', name: 'Hindi', teacherId: 'TCH017', teacherName: 'Mrs. Vandana Mishra', periodsPerWeek: 5 }
    ]
  }
];

export const DEMO_TEACHERS: TeacherProfile[] = [
  {
    id: 'tch1',
    teacherId: 'TCH001',
    
    name: 'Mr. Rajesh Sharma',
    email: 'rajesh.sharma@stxaviers.edu.in',
    phone: '+91 98765 11223',
    avatar: '',
    designation: 'PGT Physics & Head of Science',
    department: 'Physics Department',
    classTeacherOf: 'Class 11',
    subjectsTaught: ['Physics', 'Physics Lab'],
    qualification: 'M.Sc. Physics, B.Ed (Delhi University)',
    roomNo: 'Physics Lab / Lab-102'
  },
  {
    id: 'tch2',
    teacherId: 'TCH002',
    
    name: 'Mrs. Sunita Verma',
    email: 'sunita.verma@stxaviers.edu.in',
    phone: '+91 98123 44332',
    avatar: '',
    designation: 'PGT Chemistry',
    department: 'Chemistry Department',
    classTeacherOf: 'Class 11',
    subjectsTaught: ['Chemistry', 'Organic Chemistry Lab'],
    qualification: 'M.Sc. Organic Chemistry, B.Ed',
    roomNo: 'Chemistry Lab / Lab-104'
  },
  {
    id: 'tch3',
    teacherId: 'TCH003',
    
    name: 'Mr. Vikram Singh',
    email: 'vikram.singh@stxaviers.edu.in',
    phone: '+91 98221 55667',
    avatar: '',
    designation: 'PGT Mathematics',
    department: 'Mathematics Department',
    classTeacherOf: 'Class 12',
    subjectsTaught: ['Mathematics', 'Applied Mathematics'],
    qualification: 'M.Sc. Mathematics, B.Ed',
    roomNo: 'Room 302 (Class 12 Wing)'
  },
  {
    id: 'tch4',
    teacherId: 'TCH004',
    
    name: 'Mrs. Ananya Gupta',
    email: 'ananya.gupta@stxaviers.edu.in',
    phone: '+91 98998 77665',
    avatar: '',
    designation: 'PGT Biology',
    department: 'Biology & Life Sciences',
    classTeacherOf: 'Class 12',
    subjectsTaught: ['Biology', 'Biotechnology Lab'],
    qualification: 'M.Sc. Botany, M.Ed',
    roomNo: 'Biology Lab / Lab-201'
  },
  {
    id: 'tch5',
    teacherId: 'TCH005',
    
    name: 'Mr. Amit Kumar',
    email: 'amit.kumar@stxaviers.edu.in',
    phone: '+91 98111 22334',
    avatar: '',
    designation: 'PGT Computer Science & IP',
    department: 'Computer Science Department',
    classTeacherOf: 'Class 11',
    subjectsTaught: ['Computer Science', 'Informatics Practices'],
    qualification: 'M.Tech CSE, MCA',
    roomNo: 'Computer Lab 1'
  },
  {
    id: 'tch6',
    teacherId: 'TCH006',
    
    name: 'Mrs. Rekha Sharma',
    email: 'rekha.sharma@stxaviers.edu.in',
    phone: '+91 98333 44556',
    avatar: '',
    designation: 'PGT English Core & Head of Humanities',
    department: 'English & Languages Department',
    classTeacherOf: 'Class 11',
    subjectsTaught: ['English Core', 'Applied English'],
    qualification: 'M.A. English Literature, B.Ed (DU)',
    roomNo: 'Language Lab / Room 204'
  },
  {
    id: 'tch7',
    teacherId: 'TCH007',
    
    name: 'Dr. Ramesh Patel',
    email: 'ramesh.patel@stxaviers.edu.in',
    phone: '+91 98777 66554',
    avatar: '',
    designation: 'PGT Agriculture Science & Agronomy',
    department: 'Department of Agricultural Sciences',
    classTeacherOf: 'Class 12',
    subjectsTaught: ['Agriculture Science (068)', 'Agronomy Practical (069)', 'Horticulture & Soil Science'],
    qualification: 'Ph.D in Agronomy, M.Sc Agriculture (IARI New Delhi)',
    roomNo: 'Agronomy Research Lab / Lab-205'
  },
  {
    id: 'tch8',
    teacherId: 'TCH008',
    
    name: 'Mr. Sanjay Agarwal',
    email: 'sanjay.agarwal@stxaviers.edu.in',
    phone: '+91 98444 33221',
    avatar: '',
    designation: 'PGT Accountancy & Commerce',
    department: 'Commerce Department',
    classTeacherOf: 'Class 11',
    subjectsTaught: ['Accountancy', 'Financial Management'],
    qualification: 'M.Com, FCA, B.Ed',
    roomNo: 'Room 105 (Commerce Wing)'
  },
  {
    id: 'tch9',
    teacherId: 'TCH009',
    
    name: 'Mrs. Ritu Malhotra',
    email: 'ritu.malhotra@stxaviers.edu.in',
    phone: '+91 98555 44332',
    avatar: '',
    designation: 'PGT Business Studies & Economics',
    department: 'Commerce & Economics Department',
    classTeacherOf: 'Class 12',
    subjectsTaught: ['Business Studies', 'Economics'],
    qualification: 'M.A. Economics, MBA, B.Ed',
    roomNo: 'Room 203 (Commerce Wing)'
  },
  {
    id: 'tch10',
    teacherId: 'TCH010',
    
    name: 'Mr. Arvind Pandey',
    email: 'arvind.pandey@stxaviers.edu.in',
    phone: '+91 98666 55443',
    avatar: '',
    designation: 'PGT History & Political Science',
    department: 'Humanities & Social Sciences',
    classTeacherOf: 'Class 11',
    subjectsTaught: ['History', 'Political Science'],
    qualification: 'M.A. History & Pol. Sc., UGC-NET, B.Ed',
    roomNo: 'Room 108 (Humanities Wing)'
  },
  {
    id: 'tch11',
    teacherId: 'TCH011',
    
    name: 'Mr. D. S. Rawat',
    email: 'ds.rawat@stxaviers.edu.in',
    phone: '+91 98777 44112',
    avatar: '',
    designation: 'Director of Physical Education & Sports',
    department: 'Physical Education & Sports',
    classTeacherOf: 'Class 11',
    subjectsTaught: ['Physical Education', 'Sports & Yoga'],
    qualification: 'M.P.Ed, NIS Coach',
    roomNo: 'Sports Pavilion & Gymnasium'
  },
  {
    id: 'tch12',
    teacherId: 'TCH012',
    
    name: 'Dr. Harish Chandra',
    email: 'harish.chandra@stxaviers.edu.in',
    phone: '+91 98888 77221',
    avatar: '',
    designation: 'PGT Hindi Literature',
    department: 'Hindi & Sanskrit Department',
    classTeacherOf: 'Class 10',
    subjectsTaught: ['Hindi Course A', 'Hindi Literature'],
    qualification: 'Ph.D. Hindi, M.A., B.Ed',
    roomNo: 'Room 301 (Secondary Wing)'
  },
  {
    id: 'tch13',
    teacherId: 'TCH013',
    
    name: 'Dr. Neha Kapoor',
    email: 'neha.kapoor@stxaviers.edu.in',
    phone: '+91 98999 88332',
    avatar: '',
    designation: 'TGT Science & Foundation Science',
    department: 'Secondary Science Wing',
    classTeacherOf: 'Class 10',
    subjectsTaught: ['Science & Technology', 'Foundation Physics & Chem'],
    qualification: 'Ph.D. Applied Chemistry, B.Ed',
    roomNo: 'Science Lab 2 / Room 302'
  },
  {
    id: 'tch14',
    teacherId: 'TCH014',
    
    name: 'Mr. Manoj Tiwari',
    email: 'manoj.tiwari@stxaviers.edu.in',
    phone: '+91 98111 66778',
    avatar: '',
    designation: 'TGT Mathematics (Secondary)',
    department: 'Mathematics Department',
    classTeacherOf: 'Class 10',
    subjectsTaught: ['Mathematics (041)', 'Applied Secondary Math'],
    qualification: 'M.Sc. Mathematics, B.Ed',
    roomNo: 'Room 303 (Secondary Wing)'
  },
  {
    id: 'tch15',
    teacherId: 'TCH015',
    
    name: 'Mrs. Sangeeta Sen',
    email: 'sangeeta.sen@stxaviers.edu.in',
    phone: '+91 98222 77889',
    avatar: '',
    designation: 'TGT Social Science (Secondary)',
    department: 'Social Sciences Department',
    classTeacherOf: 'Class 9',
    subjectsTaught: ['Social Science (087)', 'Civics & Geography'],
    qualification: 'M.A. Geography, B.Ed',
    roomNo: 'Room 304 (Secondary Wing)'
  },
  {
    id: 'tch16',
    teacherId: 'TCH016',
    
    name: 'Ms. Meenakshi Joshi',
    email: 'meenakshi.joshi@stxaviers.edu.in',
    phone: '+91 98333 88990',
    avatar: '',
    designation: 'TGT English Language (Secondary)',
    department: 'English & Languages Department',
    classTeacherOf: 'Class 9',
    subjectsTaught: ['English Language (184)', 'Spoken Communication'],
    qualification: 'M.A. English, B.Ed',
    roomNo: 'Room 305 (Secondary Wing)'
  },
  {
    id: 'tch17',
    teacherId: 'TCH017',
    
    name: 'Mrs. Vandana Mishra',
    email: 'vandana.mishra@stxaviers.edu.in',
    phone: '+91 98444 99001',
    avatar: '',
    designation: 'TGT Hindi & Sanskrit',
    department: 'Hindi & Sanskrit Department',
    classTeacherOf: 'Class 9',
    subjectsTaught: ['Hindi', 'Sanskrit'],
    qualification: 'M.A. Hindi & Sanskrit, B.Ed',
    roomNo: 'Room 306 (Secondary Wing)'
  },
  {
    id: 'tch18',
    teacherId: 'TCH018',
    
    name: 'Mr. Kuldeep Yadav',
    email: 'kuldeep.yadav@stxaviers.edu.in',
    phone: '+91 98555 11224',
    avatar: '',
    designation: 'Agronomy & Field Practical Instructor',
    department: 'Department of Agricultural Sciences',
    classTeacherOf: 'Class 11',
    subjectsTaught: ['Agronomy Practical (069)', 'Agricultural Field Work'],
    qualification: 'M.Sc. Agronomy, ICAR-NET',
    roomNo: 'Agricultural Field Farm & Complex'
  }
];

export const TEACHER_SCHEDULES: Record<string, TeacherScheduleSlot[]> = {};

export const getTeacherSchedule = (teacherId?: string): TeacherScheduleSlot[] => {
  const targetId = teacherId || 'TCH001';
  return TEACHER_SCHEDULES[targetId] || [];
};

export const PIYUSH_PANWAR: StudentProfile = {
  id: 'STU20261101',
  password: "piyush123",
  studentId: 'STU20261101',
  name: 'Piyush Panwar',
  email: 'piyush.panwar@stxaviers.edu.in',
  phone: '+91 98765 43210',
  avatar: '',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-A',
  rollNo: '01',
  stream: 'Science Stream (PCM + CS)',
  fatherName: 'Mr. Rajesh Panwar',
  motherName: 'Mrs. Sunita Panwar',
  parentPhone: '+91 98765 40001',
  bloodGroup: 'O+',
  dob: '2008-05-15',
  academicYear: '2025-2026',
  overallPercentage: 94.5,
  totalSubjects: 5,
  // Legacy compatibility
  department: 'Class 11 (Science)',
  program: 'Senior Secondary - Science',
  semester: 1,
  batch: '2025 - 2026',
  cgpa: 9.45,
  totalCredits: 100,
  mentor: {
    name: 'Mr. Rajesh Sharma',
    designation: 'Class Teacher (PGT Physics)',
    department: 'Academic Section',
    email: 'rajesh.sharma@stxaviers.edu.in',
    phone: '+91 98123 00998',
    office: 'Physics Lab 1'
  },
  hostel: {
    block: 'School Day Scholar / Bus Student',
    roomNo: 'N/A',
    bedNo: 'N/A',
    wardenName: 'Mr. R. K. Pandey (House Master)',
    wardenPhone: '+91 98700 44332',
    messGroup: 'School Canteen & Lunch Hall'
  },
  busPass: {
    passId: 'BUS-2026-1101',
    routeNo: 'Route 03',
    routeName: 'City Route 03 - Main School Gate',
    busStop: 'Sector 14 Main Stand',
    validTill: '2026-03-31',
    status: 'Active'
  }
};

export const AMAN_VERMA: StudentProfile = {
  id: 'STU20261102',
  password: "aman123",
  studentId: 'STU20261102',
  name: 'Aman Verma',
  email: 'aman.verma@stxaviers.edu.in',
  phone: '+91 98765 11002',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-A',
  rollNo: '02',
  stream: 'Science Stream (PCM + CS)',
  fatherName: 'Mr. Manoj Verma',
  motherName: 'Mrs. Anita Verma',
  parentPhone: '+91 98765 40002',
  bloodGroup: 'A+',
  dob: '2008-08-10',
  academicYear: '2025-2026',
  overallPercentage: 91.2,
  totalSubjects: 5,
  department: 'Class 11 (Science)',
  program: 'Senior Secondary - Science',
  semester: 1,
  batch: '2025 - 2026',
  cgpa: 9.12,
  totalCredits: 100,
  mentor: {
    name: 'Mr. Rajesh Sharma',
    designation: 'Class Teacher (PGT Physics)',
    department: 'Academic Section',
    email: 'rajesh.sharma@stxaviers.edu.in',
    phone: '+91 98123 00998',
    office: 'Physics Lab 1'
  },
  hostel: {
    block: 'School Day Scholar / Bus Student',
    roomNo: 'N/A',
    bedNo: 'N/A',
    wardenName: 'Mr. R. K. Pandey',
    wardenPhone: '+91 98700 44332',
    messGroup: 'School Canteen & Lunch Hall'
  },
  busPass: {
    passId: 'BUS-2026-1102',
    routeNo: 'Route 02',
    routeName: 'City Route 02 - North Gate',
    busStop: 'Civil Lines Station',
    validTill: '2026-03-31',
    status: 'Active'
  }
};

export const SNEHA_SHARMA: StudentProfile = {
  id: 'STU20261103',
  password: "sneha123",
  studentId: 'STU20261103',
  name: 'Sneha Sharma',
  email: 'sneha.sharma@stxaviers.edu.in',
  phone: '+91 98765 11003',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-A',
  rollNo: '03',
  stream: 'Science Stream (PCB + Bio)',
  fatherName: 'Mr. Alok Sharma',
  motherName: 'Mrs. Deepa Sharma',
  parentPhone: '+91 98765 40003',
  bloodGroup: 'B+',
  dob: '2008-11-20',
  academicYear: '2025-2026',
  overallPercentage: 95.8,
  totalSubjects: 5,
  department: 'Class 11 (Science)',
  program: 'Senior Secondary - Science',
  semester: 1,
  batch: '2025 - 2026',
  cgpa: 9.58,
  totalCredits: 100,
  mentor: {
    name: 'Mrs. Ananya Gupta',
    designation: 'Class Teacher (PGT Biology)',
    department: 'Department of Life Sciences',
    email: 'ananya.gupta@stxaviers.edu.in',
    phone: '+91 98111 22334',
    office: 'Biology Lab 2'
  },
  hostel: {
    block: 'Gargi Girls Hostel Block B',
    roomNo: 'Room 204',
    bedNo: 'Bed 01',
    wardenName: 'Mrs. Sudha Devi',
    wardenPhone: '+91 98700 88776',
    messGroup: 'Girls Hostel Mess-A'
  },
  busPass: {
    passId: 'BUS-2026-1103',
    routeNo: 'Hostel Resident',
    routeName: 'Campus Walking Access',
    busStop: 'Campus Gate 1',
    validTill: '2026-03-31',
    status: 'Active'
  }
};

export const ROHAN_MEHRA: StudentProfile = {
  id: 'STU20261104',
  password: "rohan123",
  studentId: 'STU20261104',
  name: 'Rohan Mehra',
  email: 'rohan.mehra@stxaviers.edu.in',
  phone: '+91 98765 11004',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-A',
  rollNo: '04',
  stream: 'Science Stream (PCM + CS)',
  fatherName: 'Mr. Vivek Mehra',
  motherName: 'Mrs. Shweta Mehra',
  parentPhone: '+91 98765 40004',
  bloodGroup: 'AB+',
  dob: '2008-03-14',
  academicYear: '2025-2026',
  overallPercentage: 88.0,
  totalSubjects: 5,
  department: 'Class 11 (Science)',
  program: 'Senior Secondary - Science',
  semester: 1,
  batch: '2025 - 2026',
  cgpa: 8.8,
  totalCredits: 100,
  mentor: {
    name: 'Mr. Rajesh Sharma',
    designation: 'Class Teacher (PGT Physics)',
    department: 'Academic Section',
    email: 'rajesh.sharma@stxaviers.edu.in',
    phone: '+91 98123 00998',
    office: 'Physics Lab 1'
  }
};

export const AYUSH_YADAV: StudentProfile = {
  id: 'STU20261105',
  password: "ayush123",
  studentId: 'STU20261105',
  name: 'Ayush Yadav',
  email: 'ayush.yadav@stxaviers.edu.in',
  phone: '+91 98765 11005',
  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-A',
  rollNo: '05',
  stream: 'Commerce Stream (Accounts + BST + Eco)',
  fatherName: 'Mr. Manoj Yadav',
  motherName: 'Mrs. Seema Yadav',
  parentPhone: '+91 98765 40005',
  bloodGroup: 'O+',
  dob: '2008-05-19',
  academicYear: '2025-2026',
  overallPercentage: 91.0,
  totalSubjects: 5,
  department: 'Class 11 (Commerce)',
  program: 'Senior Secondary - Commerce',
  mentor: {
    name: 'Mr. Sanjay Agarwal',
    designation: 'Class Teacher (PGT Accountancy)',
    department: 'Commerce Faculty',
    email: 'sanjay.agarwal@stxaviers.edu.in',
    phone: '+91 98333 44550',
    office: 'Commerce Wing 103'
  }
};

export const HARSHITA_JAIN: StudentProfile = {
  id: 'STU20261106',
  password: "harshita123",
  studentId: 'STU20261106',
  name: 'Harshita Jain',
  email: 'harshita.jain@stxaviers.edu.in',
  phone: '+91 98765 11006',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-B',
  rollNo: '06',
  stream: 'Commerce Stream (Accounts + IP + Eco)',
  fatherName: 'Mr. Dinesh Jain',
  motherName: 'Mrs. Anita Jain',
  parentPhone: '+91 98765 40006',
  bloodGroup: 'B+',
  dob: '2008-09-24',
  academicYear: '2025-2026',
  overallPercentage: 93.5,
  totalSubjects: 5,
  department: 'Class 11 (Commerce)',
  program: 'Senior Secondary - Commerce',
  mentor: {
    name: 'Mr. Sanjay Agarwal',
    designation: 'Class Teacher (PGT Accountancy)',
    department: 'Commerce Faculty',
    email: 'sanjay.agarwal@stxaviers.edu.in',
    phone: '+91 98333 44550',
    office: 'Commerce Wing 103'
  }
};

export const VIKRAM_CHOUDHARY: StudentProfile = {
  id: 'STU20261107',
  password: "vikram123",
  studentId: 'STU20261107',
  name: 'Vikram Choudhary',
  email: 'vikram.c@stxaviers.edu.in',
  phone: '+91 98765 11007',
  avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-B',
  rollNo: '07',
  stream: 'Agriculture Science',
  fatherName: 'Mr. Ram Niwas Choudhary',
  motherName: 'Mrs. Savitri Choudhary',
  parentPhone: '+91 98765 40007',
  bloodGroup: 'A+',
  dob: '2008-01-11',
  academicYear: '2025-2026',
  overallPercentage: 89.0,
  totalSubjects: 5,
  department: 'Class 11 (Agriculture)',
  program: 'Senior Secondary - Agriculture',
  mentor: {
    name: 'Dr. Ramesh Patel',
    designation: 'Class Teacher (PGT Agriculture)',
    department: 'Department of Agricultural Sciences',
    email: 'ramesh.patel@stxaviers.edu.in',
    phone: '+91 98777 66554',
    office: 'Agronomy Lab 205'
  }
};

export const SIDDHARTH_ROY: StudentProfile = {
  id: 'STU20261108',
  password: "siddharth123",
  studentId: 'STU20261108',
  name: 'Siddharth Roy',
  email: 'siddharth.roy@stxaviers.edu.in',
  phone: '+91 98765 11008',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-B',
  rollNo: '08',
  stream: 'Humanities & Arts (History + Pol Science)',
  fatherName: 'Mr. Anupam Roy',
  motherName: 'Mrs. Sharmila Roy',
  parentPhone: '+91 98765 40008',
  bloodGroup: 'O+',
  dob: '2008-11-03',
  academicYear: '2025-2026',
  overallPercentage: 90.5,
  totalSubjects: 5,
  department: 'Class 11 (Humanities)',
  program: 'Senior Secondary - Arts',
  mentor: {
    name: 'Mr. Arvind Pandey',
    designation: 'Class Teacher (PGT History)',
    department: 'Department of Humanities',
    email: 'arvind.pandey@stxaviers.edu.in',
    phone: '+91 98111 22334',
    office: 'Humanities Block 301'
  }
};

export const ADITYA_MUNDRA: StudentProfile = {
  id: 'STU20261109',
  password: "aditya123",
  studentId: 'STU20261109',
  name: 'Aditya Mundra',
  email: 'aditya.mundra@stxaviers.edu.in',
  phone: '+91 98765 11009',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-B',
  rollNo: '09',
  stream: 'Science Stream (PCB + Bio)',
  fatherName: 'Mr. Kailash Mundra',
  motherName: 'Mrs. Shobha Mundra',
  parentPhone: '+91 98765 40009',
  bloodGroup: 'B+',
  dob: '2008-06-30',
  academicYear: '2025-2026',
  overallPercentage: 94.2,
  totalSubjects: 5,
  department: 'Class 11 (Science PCB)',
  program: 'Senior Secondary - Medical',
  mentor: {
    name: 'Mrs. Ananya Gupta',
    designation: 'Class Teacher (PGT Biology)',
    department: 'Academic Section',
    email: 'ananya.gupta@stxaviers.edu.in',
    phone: '+91 98111 22335',
    office: 'Biology Lab 2'
  }
};

export const KAVYA_CHOUDHARY: StudentProfile = {
  id: 'stu_41',
  password: "kavya123",
  studentId: 'STU041',
  name: 'Kavya Choudhary',
  email: 'kavya.choudhary@stxaviers.edu.in',
  phone: '+91 98711 55443',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-A',
  section: 'Section AG (Agriculture Science)',
  rollNo: '01',
  stream: 'Agriculture Science',
  fatherName: 'Mr. Surendra Choudhary',
  motherName: 'Mrs. Geeta Choudhary',
  parentPhone: '+91 98711 55440',
  bloodGroup: 'B+',
  dob: '2008-04-18',
  academicYear: '2026-2027',
  overallPercentage: 92.4,
  totalSubjects: 5,
  mentor: {
    name: 'Dr. Ramesh Patel',
    designation: 'Class Teacher (PGT Agriculture)',
    department: 'Department of Agricultural Sciences',
    email: 'ramesh.patel@stxaviers.edu.in',
    phone: '+91 98777 66554',
    office: 'Agronomy Lab 205'
  }
};

export const DEEPAK_YADAV: StudentProfile = {
  id: 'stu_42',
  password: "deepak123",
  studentId: 'STU042',
  name: 'Deepak Yadav',
  email: 'deepak.yadav@stxaviers.edu.in',
  phone: '+91 98222 66778',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-B',
  section: 'Section AG (Agriculture Science)',
  rollNo: '02',
  stream: 'Agriculture Science',
  fatherName: 'Mr. Raghuvir Yadav',
  motherName: 'Mrs. Kamlesh Yadav',
  parentPhone: '+91 98222 66770',
  bloodGroup: 'O+',
  dob: '2008-07-22',
  academicYear: '2026-2027',
  overallPercentage: 89.2,
  totalSubjects: 5,
  mentor: {
    name: 'Dr. Ramesh Patel',
    designation: 'Class Teacher (PGT Agriculture)',
    department: 'Department of Agricultural Sciences',
    email: 'ramesh.patel@stxaviers.edu.in',
    phone: '+91 98777 66554',
    office: 'Agronomy Lab 205'
  }
};

export const ISHAAN_SHARMA: StudentProfile = {
  id: 'stu_43',
  password: "ishaan123",
  studentId: 'STU043',
  name: 'Ishaan Sharma',
  email: 'ishaan.sharma@stxaviers.edu.in',
  phone: '+91 98222 11223',
  avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-B',
  section: 'Section A (Science PCM)',
  rollNo: '03',
  stream: 'Science Stream (PCM + CS)',
  fatherName: 'Mr. Harish Sharma',
  motherName: 'Mrs. Vandana Sharma',
  parentPhone: '+91 98222 11200',
  bloodGroup: 'A+',
  dob: '2007-09-12',
  academicYear: '2026-2027',
  overallPercentage: 94.0,
  totalSubjects: 5,
  mentor: {
    name: 'Mr. Rajesh Sharma',
    designation: 'Class Teacher (PGT Physics)',
    department: 'Academic Section',
    email: 'rajesh.sharma@stxaviers.edu.in',
    phone: '+91 98123 00998',
    office: 'Physics Lab 1'
  }
};

export const AARAV_PATEL: StudentProfile = {
  id: 'stu_91',
  password: "aarav123",
  studentId: 'STU091',
  name: 'Aarav Patel',
  email: 'aarav.patel@stxaviers.edu.in',
  phone: '+91 98333 44551',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 10-A',
  section: 'Section A (General Secondary)',
  rollNo: '01',
  stream: 'Junior Secondary (CBSE)',
  fatherName: 'Mr. Vikram Patel',
  motherName: 'Mrs. Sunita Patel',
  parentPhone: '+91 98333 44551',
  bloodGroup: 'B+',
  dob: '2011-04-14',
  academicYear: '2026-2027',
  overallPercentage: 91.5,
  totalSubjects: 5,
  mentor: {
    name: 'Mrs. Sangeeta Sen',
    designation: 'Class Teacher (TGT Science)',
    department: 'Secondary Department',
    email: 'sangeeta.sen@stxaviers.edu.in',
    phone: '+91 98111 44550',
    office: 'Secondary Block 101'
  }
};

export const ANANYA_GUPTA: StudentProfile = {
  id: 'stu_92',
  password: "ananya123",
  studentId: 'STU092',
  name: 'Ananya Gupta',
  email: 'ananya.gupta@stxaviers.edu.in',
  phone: '+91 98333 44552',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 10-A',
  section: 'Section A (General Secondary)',
  rollNo: '02',
  stream: 'Junior Secondary (CBSE)',
  fatherName: 'Mr. Rajiv Gupta',
  motherName: 'Mrs. Rekha Gupta',
  parentPhone: '+91 98333 44552',
  bloodGroup: 'O+',
  dob: '2011-08-20',
  academicYear: '2026-2027',
  overallPercentage: 93.8,
  totalSubjects: 5,
  mentor: {
    name: 'Mrs. Sangeeta Sen',
    designation: 'Class Teacher (TGT Science)',
    department: 'Secondary Department',
    email: 'sangeeta.sen@stxaviers.edu.in',
    phone: '+91 98111 44550',
    office: 'Secondary Block 101'
  }
};

export const RITVIK_SEN: StudentProfile = {
  id: 'stu_93',
  password: "ritvik123",
  studentId: 'STU093',
  name: 'Ritvik Sen',
  email: 'ritvik.sen@stxaviers.edu.in',
  phone: '+91 98333 44553',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 10-A',
  section: 'Section A (General Secondary)',
  rollNo: '03',
  stream: 'Junior Secondary (CBSE)',
  fatherName: 'Mr. Alok Sen',
  motherName: 'Mrs. Sharmila Sen',
  parentPhone: '+91 98333 44553',
  bloodGroup: 'A+',
  dob: '2011-03-12',
  academicYear: '2026-2027',
  overallPercentage: 89.4,
  totalSubjects: 5,
  mentor: {
    name: 'Mrs. Sangeeta Sen',
    designation: 'Class Teacher (TGT Science)',
    department: 'Secondary Department',
    email: 'sangeeta.sen@stxaviers.edu.in',
    phone: '+91 98111 44550',
    office: 'Secondary Block 101'
  }
};

export const DIYA_KAPOOR: StudentProfile = {
  id: 'stu_94',
  password: "diya123",
  studentId: 'STU094',
  name: 'Diya Kapoor',
  email: 'diya.kapoor@stxaviers.edu.in',
  phone: '+91 98333 44554',
  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 9-A',
  section: 'Section A (General Secondary)',
  rollNo: '04',
  stream: 'Junior Secondary (CBSE)',
  fatherName: 'Mr. Mohit Kapoor',
  motherName: 'Mrs. Neha Kapoor',
  parentPhone: '+91 98333 44554',
  bloodGroup: 'B+',
  dob: '2011-09-05',
  academicYear: '2026-2027',
  overallPercentage: 92.1,
  totalSubjects: 5,
  mentor: {
    name: 'Mrs. Sangeeta Sen',
    designation: 'Class Teacher (TGT Science)',
    department: 'Secondary Department',
    email: 'sangeeta.sen@stxaviers.edu.in',
    phone: '+91 98111 44550',
    office: 'Secondary Block 101'
  }
};

export const MANAV_JOSHI: StudentProfile = {
  id: 'stu_95',
  password: "manav123",
  studentId: 'STU095',
  name: 'Manav Joshi',
  email: 'manav.joshi@stxaviers.edu.in',
  phone: '+91 98333 44555',
  avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 9-A',
  section: 'Section A (General Secondary)',
  rollNo: '05',
  stream: 'Junior Secondary (CBSE)',
  fatherName: 'Mr. Deepak Joshi',
  motherName: 'Mrs. Meena Joshi',
  parentPhone: '+91 98333 44555',
  bloodGroup: 'AB+',
  dob: '2011-12-19',
  academicYear: '2026-2027',
  overallPercentage: 88.0,
  totalSubjects: 5,
  mentor: {
    name: 'Mrs. Sangeeta Sen',
    designation: 'Class Teacher (TGT Science)',
    department: 'Secondary Department',
    email: 'sangeeta.sen@stxaviers.edu.in',
    phone: '+91 98111 44550',
    office: 'Secondary Block 101'
  }
};

export const TANMAY_SINGH: StudentProfile = {
  id: 'stu_101',
  password: "tanmay123",
  studentId: 'STU101',
  name: 'Tanmay Singh',
  email: 'tanmay.singh@stxaviers.edu.in',
  phone: '+91 98444 55661',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 12-A',
  section: 'Section A (Secondary Board Batch)',
  rollNo: '01',
  stream: 'Secondary Board (CBSE)',
  fatherName: 'Mr. Arvind Singh',
  motherName: 'Mrs. Poonam Singh',
  parentPhone: '+91 98444 55661',
  bloodGroup: 'A+',
  dob: '2010-06-18',
  academicYear: '2026-2027',
  overallPercentage: 95.2,
  totalSubjects: 5,
  mentor: {
    name: 'Mrs. Sunita Rao',
    designation: 'Class Teacher (TGT Mathematics)',
    department: 'Secondary Department',
    email: 'sunita.rao@stxaviers.edu.in',
    phone: '+91 98333 11224',
    office: 'Secondary Wing 204'
  }
};

export const PRIYA_NAIR: StudentProfile = {
  id: 'stu_102',
  password: "priya123",
  studentId: 'STU102',
  name: 'Priya Nair',
  email: 'priya.nair@stxaviers.edu.in',
  phone: '+91 98444 55662',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 12-A',
  section: 'Section A (Secondary Board Batch)',
  rollNo: '02',
  stream: 'Secondary Board (CBSE)',
  fatherName: 'Mr. Suresh Nair',
  motherName: 'Mrs. Geeta Nair',
  parentPhone: '+91 98444 55662',
  bloodGroup: 'AB+',
  dob: '2010-11-05',
  academicYear: '2026-2027',
  overallPercentage: 92.4,
  totalSubjects: 5,
  mentor: {
    name: 'Mrs. Sunita Rao',
    designation: 'Class Teacher (TGT Mathematics)',
    department: 'Secondary Department',
    email: 'sunita.rao@stxaviers.edu.in',
    phone: '+91 98333 11224',
    office: 'Secondary Wing 204'
  }
};

export const RHEA_CHOPRA: StudentProfile = {
  id: 'stu_103',
  password: "rhea123",
  studentId: 'STU103',
  name: 'Rhea Chopra',
  email: 'rhea.chopra@stxaviers.edu.in',
  phone: '+91 98444 55663',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 12-A',
  section: 'Section A (Secondary Board Batch)',
  rollNo: '03',
  stream: 'Secondary Board (CBSE)',
  fatherName: 'Mr. Vivek Chopra',
  motherName: 'Mrs. Payal Chopra',
  parentPhone: '+91 98444 55663',
  bloodGroup: 'B+',
  dob: '2010-04-22',
  academicYear: '2026-2027',
  overallPercentage: 94.0,
  totalSubjects: 5,
  mentor: {
    name: 'Mrs. Sunita Rao',
    designation: 'Class Teacher (TGT Mathematics)',
    department: 'Secondary Department',
    email: 'sunita.rao@stxaviers.edu.in',
    phone: '+91 98333 11224',
    office: 'Secondary Wing 204'
  }
};

export const ADITYA_VERMA: StudentProfile = {
  id: 'stu_104',
  password: "aditya123",
  studentId: 'STU104',
  name: 'Aditya Verma',
  email: 'aditya.verma@stxaviers.edu.in',
  phone: '+91 98444 55664',
  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 12-A',
  section: 'Section A (Secondary Board Batch)',
  rollNo: '04',
  stream: 'Secondary Board (CBSE)',
  fatherName: 'Mr. Manish Verma',
  motherName: 'Mrs. Suman Verma',
  parentPhone: '+91 98444 55664',
  bloodGroup: 'O+',
  dob: '2010-09-14',
  academicYear: '2026-2027',
  overallPercentage: 90.6,
  totalSubjects: 5,
  mentor: {
    name: 'Mrs. Sunita Rao',
    designation: 'Class Teacher (TGT Mathematics)',
    department: 'Secondary Department',
    email: 'sunita.rao@stxaviers.edu.in',
    phone: '+91 98333 11224',
    office: 'Secondary Wing 204'
  }
};

export const POOJA_SINGH: StudentProfile = {
  id: 'stu_105',
  password: "pooja123",
  studentId: 'STU105',
  name: 'Pooja Singh',
  email: 'pooja.singh@stxaviers.edu.in',
  phone: '+91 98444 55665',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 10-A',
  section: 'Section A (Secondary Board Batch)',
  rollNo: '05',
  stream: 'Secondary Board (CBSE)',
  fatherName: 'Mr. Rakesh Singh',
  motherName: 'Mrs. Vandana Singh',
  parentPhone: '+91 98444 55665',
  bloodGroup: 'A-',
  dob: '2010-01-30',
  academicYear: '2026-2027',
  overallPercentage: 91.8,
  totalSubjects: 5,
  mentor: {
    name: 'Mrs. Sunita Rao',
    designation: 'Class Teacher (TGT Mathematics)',
    department: 'Secondary Department',
    email: 'sunita.rao@stxaviers.edu.in',
    phone: '+91 98333 11224',
    office: 'Secondary Wing 204'
  }
};

export const NEHA_SINGHAL: StudentProfile = {
  id: 'stu_44',
  password: "neha123",
  studentId: 'STU044',
  name: 'Neha Singhal',
  email: 'neha.singhal@stxaviers.edu.in',
  phone: '+91 98222 11244',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-B',
  section: 'Section C (Commerce & IP)',
  rollNo: '04',
  stream: 'Commerce Stream (Accounts + BST + Eco)',
  fatherName: 'Mr. Pradeep Singhal',
  motherName: 'Mrs. Rekha Singhal',
  parentPhone: '+91 98222 11240',
  bloodGroup: 'B+',
  dob: '2007-10-15',
  academicYear: '2026-2027',
  overallPercentage: 92.8,
  totalSubjects: 5,
  mentor: {
    name: 'Mr. Sanjay Agarwal',
    designation: 'Class Teacher (PGT Accountancy)',
    department: 'Commerce Faculty',
    email: 'sanjay.agarwal@stxaviers.edu.in',
    phone: '+91 98333 44550',
    office: 'Commerce Wing 103'
  }
};

export const MEGHA_BANSAL: StudentProfile = {
  id: 'stu_45',
  password: "megha123",
  studentId: 'STU045',
  name: 'Megha Bansal',
  email: 'megha.bansal@stxaviers.edu.in',
  phone: '+91 98222 11245',
  avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-B',
  section: 'Section B (Science PCB)',
  rollNo: '05',
  stream: 'Science Stream (PCB + Bio)',
  fatherName: 'Mr. Ashok Bansal',
  motherName: 'Mrs. Suman Bansal',
  parentPhone: '+91 98222 11241',
  bloodGroup: 'O+',
  dob: '2007-12-08',
  academicYear: '2026-2027',
  overallPercentage: 95.0,
  totalSubjects: 5,
  mentor: {
    name: 'Mrs. Ananya Gupta',
    designation: 'Class Teacher (PGT Biology)',
    department: 'Academic Section',
    email: 'ananya.gupta@stxaviers.edu.in',
    phone: '+91 98111 22335',
    office: 'Biology Lab 2'
  }
};

export const ROHIT_SHARMA: StudentProfile = {
  id: 'stu_46',
  password: "rohit123",
  studentId: 'STU046',
  name: 'Rohit Sharma',
  email: 'rohit.sharma@stxaviers.edu.in',
  phone: '+91 98222 11246',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
  schoolName: "St. Xavier's Senior Secondary School",
  className: 'Class 11-B',
  section: 'Section D (Humanities & Arts)',
  rollNo: '06',
  stream: 'Humanities & Arts (History + Pol Science)',
  fatherName: 'Mr. Sunil Sharma',
  motherName: 'Mrs. Sunita Sharma',
  parentPhone: '+91 98222 11242',
  bloodGroup: 'AB+',
  dob: '2007-05-20',
  academicYear: '2026-2027',
  overallPercentage: 88.5,
  totalSubjects: 5,
  mentor: {
    name: 'Mr. Arvind Pandey',
    designation: 'Class Teacher (PGT History)',
    department: 'Department of Humanities',
    email: 'arvind.pandey@stxaviers.edu.in',
    phone: '+91 98111 22334',
    office: 'Humanities Block 301'
  }
};

export const CLASS_9_STUDENTS: StudentProfile[] = [
  AARAV_PATEL,
  ANANYA_GUPTA,
  RITVIK_SEN,
  DIYA_KAPOOR,
  MANAV_JOSHI
];

export const CLASS_10_STUDENTS: StudentProfile[] = [
  TANMAY_SINGH,
  PRIYA_NAIR,
  RHEA_CHOPRA,
  ADITYA_VERMA,
  POOJA_SINGH
];

export const CLASS_11_STUDENTS: StudentProfile[] = [
  PIYUSH_PANWAR,
  AMAN_VERMA,
  SNEHA_SHARMA,
  ROHAN_MEHRA,
  AYUSH_YADAV,
  HARSHITA_JAIN,
  VIKRAM_CHOUDHARY,
  SIDDHARTH_ROY,
  ADITYA_MUNDRA
];

export const CLASS_12_STUDENTS: StudentProfile[] = [
  KAVYA_CHOUDHARY,
  DEEPAK_YADAV,
  ISHAAN_SHARMA,
  NEHA_SINGHAL,
  MEGHA_BANSAL,
  ROHIT_SHARMA
];

// Backward-compat aliases
export const CLASS_11A_STUDENTS = CLASS_11_STUDENTS;
export const CLASS_11B_STUDENTS = CLASS_11_STUDENTS;
export const CLASS_12A_STUDENTS = CLASS_12_STUDENTS;
export const CLASS_12B_STUDENTS = CLASS_12_STUDENTS;

export const DEMO_STUDENTS: StudentProfile[] = [
  AARAV_PATEL,
  ANANYA_GUPTA,
  RITVIK_SEN,
  DIYA_KAPOOR,
  MANAV_JOSHI,
  TANMAY_SINGH,
  PRIYA_NAIR,
  RHEA_CHOPRA,
  ADITYA_VERMA,
  POOJA_SINGH,
  PIYUSH_PANWAR,
  AMAN_VERMA,
  SNEHA_SHARMA,
  ROHAN_MEHRA,
  AYUSH_YADAV,
  HARSHITA_JAIN,
  VIKRAM_CHOUDHARY,
  SIDDHARTH_ROY,
  ADITYA_MUNDRA,
  KAVYA_CHOUDHARY,
  DEEPAK_YADAV,
  ISHAAN_SHARMA,
  NEHA_SINGHAL,
  MEGHA_BANSAL,
  ROHIT_SHARMA
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    subjectCode: '042',
    subjectName: 'Physics (Theory & Practical)',
    facultyName: 'Mr. Rajesh Sharma',
    totalClasses: 0,
    attendedClasses: 0,
    absentClasses: 0,
    leaveClasses: 0,
    pendingClasses: 0,
    percentage: 0,
    category: 'Core',
    logs: []
  },
  {
    subjectCode: '043',
    subjectName: 'Chemistry (Theory & Lab)',
    facultyName: 'Mrs. Sunita Verma',
    totalClasses: 0,
    attendedClasses: 0,
    absentClasses: 0,
    leaveClasses: 0,
    pendingClasses: 0,
    percentage: 0,
    category: 'Core',
    logs: []
  },
  {
    subjectCode: '041',
    subjectName: 'Mathematics',
    facultyName: 'Mr. Vikram Singh',
    totalClasses: 0,
    attendedClasses: 0,
    absentClasses: 0,
    leaveClasses: 0,
    pendingClasses: 0,
    percentage: 0,
    category: 'Core',
    logs: []
  },
  {
    subjectCode: '083',
    subjectName: 'Computer Science',
    facultyName: 'Mr. Amit Kumar',
    totalClasses: 0,
    attendedClasses: 0,
    absentClasses: 0,
    leaveClasses: 0,
    pendingClasses: 0,
    percentage: 0,
    category: 'Core',
    logs: []
  },
  {
    subjectCode: '301',
    subjectName: 'English Core',
    facultyName: 'Mrs. Rekha Sharma',
    totalClasses: 0,
    attendedClasses: 0,
    absentClasses: 0,
    leaveClasses: 0,
    pendingClasses: 0,
    percentage: 0,
    category: 'Elective',
    logs: []
  }
];

// Per-student distinct attendance maps (All reset to 0/0 for fresh session)
export const DEFAULT_STUDENTS_ATTENDANCE_MAP: Record<string, AttendanceRecord[]> = {};

export const INITIAL_TIMETABLE: TimetableSlot[] = [];

export const INITIAL_LMS_MATERIALS: LMSMaterial[] = [
  {
    id: 'm1',
    subjectCode: '042',
    subjectName: 'Physics',
    title: 'NCERT Chapter 1 & 2 Handwritten Notes & Formula Sheet',
    module: 'Unit 1: Electrostatics',
    fileType: 'pdf',
    fileSize: '3.8 MB',
    uploadedDate: '2026-08-08',
    facultyName: 'Mr. Rajesh Sharma',
    description: 'Comprehensive formula sheet and solved numericals for Gauss Theorem, Capacitance, and Dipoles.',
    downloadCount: 184
  },
  {
    id: 'm2',
    subjectCode: '043',
    subjectName: 'Chemistry',
    title: 'Organic Chemistry Reaction Mechanisms & Mind Map',
    module: 'Unit 3: Haloalkanes & Haloarenes',
    fileType: 'pdf',
    fileSize: '2.5 MB',
    uploadedDate: '2026-08-05',
    facultyName: 'Mrs. Sunita Verma',
    description: 'Visual mind map covering SN1, SN2 mechanisms, named reactions, and conversion problems.',
    downloadCount: 210
  },
  {
    id: 'm3',
    subjectCode: '041',
    subjectName: 'Mathematics',
    title: 'Calculus - 100 Solved Important Questions for Mid-Term',
    module: 'Unit 2: Continuity & Differentiability',
    fileType: 'pdf',
    fileSize: '4.1 MB',
    uploadedDate: '2026-08-02',
    facultyName: 'Mr. Vikram Singh',
    description: 'Previous 10 years CBSE board exam calculus problems with step-by-step marking solutions.',
    downloadCount: 195
  },
  {
    id: 'm4',
    subjectCode: '083',
    subjectName: 'Computer Science',
    title: 'Python File Handling & Stack Program Source Code (.py)',
    module: 'Unit 1: Data Structures in Python',
    fileType: 'doc',
    fileSize: '1.2 MB',
    uploadedDate: '2026-07-28',
    facultyName: 'Mr. Amit Kumar',
    description: 'Complete Python scripts demonstrating push/pop stack operations and text file count functions.',
    downloadCount: 140
  }
];

export const INITIAL_LMS_ASSIGNMENTS: LMSAssignment[] = [
  {
    id: 'a1',
    subjectCode: '042',
    subjectName: 'Physics',
    title: 'Homework #3: Electric Potential & Capacitors Numerical Worksheet',
    assignedDate: '2026-08-05',
    dueDate: '2026-08-18',
    totalMarks: 20,
    status: 'Pending',
    instructions: 'Solve Questions 1 to 15 from NCERT Exemplar Chapter 2 in your Physics homework notebook. Scan and upload as PDF.'
  },
  {
    id: 'a2',
    subjectCode: '043',
    subjectName: 'Chemistry',
    title: 'Lab Record File: Titration Experiment & Salt Analysis',
    assignedDate: '2026-08-01',
    dueDate: '2026-08-12',
    totalMarks: 30,
    status: 'Submitted',
    submissionDate: '2026-08-10',
    fileSubmitted: 'Piyush_Chemistry_Lab_File.pdf',
    instructions: 'Write aim, apparatus, chemical equations, and observations table for KMnO4 titration experiment.'
  },
  {
    id: 'a3',
    subjectCode: '083',
    subjectName: 'Computer Science',
    title: 'Python Practical Assignment: Stack Implementation & SQL Queries',
    assignedDate: '2026-07-20',
    dueDate: '2026-08-02',
    totalMarks: 25,
    status: 'Graded',
    obtainedMarks: 24,
    submissionDate: '2026-08-01',
    fileSubmitted: 'Stack_SQL_Assignment_Piyush.py',
    instructions: 'Write Python functions for push() and pop() on a list of student records. Execute SQL queries for GROUP BY.'
  }
];

export const EXAM_SCHEDULE: ExamScheduleItem[] = [];

export const SEMESTER_RESULTS: SemesterResult[] = [];

export const INITIAL_FEES = {
  summary: {
    total: 48000,
    paid: 36000,
    due: 12000,
    dueDate: '2026-08-31',
    status: 'Partial' as 'Paid' | 'Partial' | 'Pending'
  },
  breakdown: [
    { id: 'f1', category: 'Quarter 2 Tuition & Smart Class Fee', description: 'Academic teaching, lab maintenance & digital smartboard fee', amount: 24000, dueDate: '2026-08-31', status: 'Paid' as const },
    { id: 'f2', category: 'Quarter 2 Bus Transport Charges', description: 'School bus AC route transport charge', amount: 12000, dueDate: '2026-08-31', status: 'Paid' as const },
    { id: 'f3', category: 'CBSE Board Examination Registration Fee', description: 'Official CBSE registration & admit card fee', amount: 3000, dueDate: '2026-08-31', status: 'Pending' as const },
    { id: 'f4', category: 'Science & Computer Lab Maintenance', description: 'Annual lab equipment and software license fee', amount: 9000, dueDate: '2026-08-31', status: 'Pending' as const }
  ],
  transactions: [
    { id: 'tx1', receiptNo: 'STX-REC-2026-1044', date: '2026-07-10', description: 'Quarter 1 Tuition Fee', amount: 24000, paymentMethod: 'UPI' as const, status: 'Success' as const },
    { id: 'tx2', receiptNo: 'STX-REC-2026-1089', date: '2026-07-12', description: 'Quarter 1 Bus Transport', amount: 12000, paymentMethod: 'NetBanking' as const, status: 'Success' as const }
  ]
};

export const INITIAL_HOSTEL_COMPLAINTS: HostelComplaint[] = [
  { id: 'hc1', category: 'Internet', description: 'School Computer Lab Terminal 04 mouse left-click button not responding.', dateSubmitted: '2026-08-10', status: 'In Progress', resolutionNotes: 'IT Lab technician assigned for replacement.' },
  { id: 'hc2', category: 'Electrical', description: 'Room 101 ceiling fan regulator running at full speed only.', dateSubmitted: '2026-08-02', status: 'Resolved', resolutionNotes: 'Electrician replaced capacitor and speed knob.' }
];

export const INITIAL_DOCUMENTS: AcademicDocument[] = [
  { id: 'doc1', title: 'Official Student Bonafide Certificate (2025-26)', type: 'Bonafide Certificate', issueDate: '2026-07-10', status: 'Available', fileSize: '1.2 MB' },
  { id: 'doc2', title: 'Class 10 CBSE Board Pass Certificate & Marksheet', type: 'Grade Sheet', issueDate: '2025-06-15', status: 'Available', fileSize: '2.8 MB' },
  { id: 'doc3', title: 'School Digital Smart ID Card', type: 'ID Card', issueDate: '2025-07-01', status: 'Available', fileSize: '920 KB' },
  { id: 'doc4', title: 'Character & Conduct Certificate Request', type: 'Character Certificate', issueDate: '2026-08-11', status: 'Processing' }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n2',
    title: 'Parent-Teacher Meeting (PTM) Scheduled for Aug 22',
    message: 'Mandatory PTM for Class 11 & Class 12 will be held in respective classrooms from 09:00 AM to 01:00 PM.',
    category: 'General',
    timestamp: 'Yesterday',
    isRead: false,
    priority: 'High'
  },
  {
    id: 'n3',
    title: 'Physics Notes & Worksheet Uploaded by Mr. Rajesh Sharma',
    message: 'New NCERT Electrostatics notes & formula sheet available in LMS Study Material.',
    category: 'Academic',
    timestamp: '2 days ago',
    isRead: true,
    priority: 'Medium'
  }
];

export const INITIAL_FEEDBACKS: FeedbackSubmission[] = [
  {
    id: 'fb1',
    category: 'Subject & Faculty',
    targetName: 'Physics (Mr. Rajesh Sharma)',
    rating: 5,
    feedbackText: 'Sir explains electrostatics numericals with practical demonstration. Very helpful.',
    isAnonymous: false,
    submittedAt: '2026-08-05',
    status: 'Resolved',
    adminResponse: 'Thank you for your feedback! Appreciated by the Vice Principal.'
  }
];

export const ACADEMIC_CALENDAR_EVENTS: AcademicCalendarEvent[] = [
  { id: 'cal1', date: '2026-08-15', title: 'Independence Day School Celebration', category: 'Holiday', description: 'Flag hoisting & cultural performances at 08:00 AM in School Grounds.', isImportant: true },
  { id: 'cal2', date: '2026-08-22', title: 'Quarterly Parent-Teacher Meeting (PTM)', category: 'Academic Milestone', description: 'Class Teachers discuss Unit Test performance with parents.', isImportant: true },
  { id: 'cal3', date: '2026-08-31', title: 'Quarter 2 School Fee Due Date', category: 'Fee Due', description: 'Last date for tuition and bus fee submission.', isImportant: true },
  { id: 'cal4', date: '2026-09-02', title: 'Senior Secondary Mid-Term Exams Begin', category: 'Exam', description: 'Theory exams for Class 11 & 12.', isImportant: true },
  { id: 'cal5', date: '2026-10-15', title: 'Annual Inter-House Sports & Athletic Meet', category: 'Sports & Fest', description: 'Track & field events for Red, Blue, Green & Gold houses.' }
];

export const MENTOR_LOGS: MentorLog[] = [
  {
    id: 'ml1',
    date: '2026-07-28',
    topic: 'Class 11 Academic Stream Orientation & Discipline',
    summary: 'Discussed CBSE syllabus distribution, lab practical notebook requirements, and daily study schedule.',
    actionItems: '1. Complete Physics Lab File experiment 1.\n2. Submit parental consent form for sports meet.',
    mentorName: 'Mr. Rajesh Sharma',
    status: 'Completed'
  }
];

export const INITIAL_DAILY_CLASS_REPORTS: DailyClassAttendanceReport[] = [];

