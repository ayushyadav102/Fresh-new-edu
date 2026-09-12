import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, boolean, date } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('student'), // student, teacher, principal, superadmin
  createdAt: timestamp('created_at').defaultNow(),
});

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  enrollmentNo: text('enrollment_no').unique().notNull(),
  className: text('class_name').notNull(),
  section: text('section').notNull(),
  rollNo: integer('roll_no'),
});

export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  date: date('date').notNull(),
  status: text('status').notNull(), // 'present', 'absent', 'late', 'half-day'
  markedBy: integer('marked_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const fees = pgTable('fees', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').references(() => students.id).notNull(),
  amount: integer('amount').notNull(),
  dueDate: date('due_date').notNull(),
  status: text('status').notNull(), // 'paid', 'pending', 'overdue'
  receiptNo: text('receipt_no'),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const teachers = pgTable('teachers', {
  id: serial('id').primaryKey(),
  teacherId: text('teacher_id').unique().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject').notNull(),
  classTeacherOf: text('class_teacher_of'),
  designation: text('designation'),
  qualification: text('qualification'),
  experienceYears: integer('experience_years'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  classId: text('class_id').unique().notNull(),
  name: text('name').notNull(),
  section: text('section').notNull(),
  classTeacherId: text('class_teacher_id'),
  roomNo: text('room_no'),
  totalStudents: integer('total_students'),
  academicYear: text('academic_year'),
});

export const timetable = pgTable('timetable', {
  id: serial('id').primaryKey(),
  slotId: text('slot_id').unique(),
  day: text('day').notNull(),
  period: integer('period').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  subject: text('subject').notNull(),
  teacherId: text('teacher_id'),
  className: text('class_name').notNull(),
  room: text('room'),
});

export const homework = pgTable('homework', {
  id: serial('id').primaryKey(),
  homeworkId: text('homework_id').unique(),
  title: text('title').notNull(),
  description: text('description'),
  subject: text('subject').notNull(),
  className: text('class_name').notNull(),
  assignedDate: text('assigned_date').notNull(),
  dueDate: text('due_date').notNull(),
  assignedBy: text('assigned_by'),
  maxMarks: integer('max_marks'),
  attachmentUrl: text('attachment_url'),
});

export const notices = pgTable('notices', {
  id: serial('id').primaryKey(),
  noticeId: text('notice_id').unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  date: text('date').notNull(),
  category: text('category').notNull(),
  targetAudience: text('target_audience'), // all, student, teacher, parents
  postedBy: text('posted_by'),
  isUrgent: boolean('is_urgent').default(false),
});

export const examMarks = pgTable('exam_marks', {
  id: serial('id').primaryKey(),
  studentId: text('student_id').notNull(),
  studentName: text('student_name'),
  className: text('class_name').notNull(),
  examType: text('exam_type').notNull(), // Unit Test 1, Mid-Term, Final
  subject: text('subject').notNull(),
  marksObtained: integer('marks_obtained').notNull(),
  maxMarks: integer('max_marks').notNull(),
  grade: text('grade'),
  academicYear: text('academic_year'),
});

export const attendanceReports = pgTable('attendance_reports', {
  id: serial('id').primaryKey(),
  reportId: text('report_id').unique(),
  date: text('date').notNull(),
  time: text('time'),
  className: text('class_name').notNull(),
  section: text('section'),
  totalStudents: integer('total_students').notNull(),
  presentCount: integer('present_count').notNull(),
  absentCount: integer('absent_count').notNull(),
  attendancePercentage: text('attendance_percentage'),
  subjectTaught: text('subject_taught'),
  periodTaught: text('period_taught'),
  submittedByTeacherName: text('submitted_by_teacher_name'),
  submittedByTeacherId: text('submitted_by_teacher_id'),
});

export const hostelComplaints = pgTable('hostel_complaints', {
  id: serial('id').primaryKey(),
  complaintId: text('complaint_id').unique(),
  studentId: text('student_id').notNull(),
  studentName: text('student_name'),
  roomNo: text('room_no'),
  category: text('category').notNull(),
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  status: text('status').default('Open'), // Open, In Progress, Resolved
  priority: text('priority').default('Medium'),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

export const feedbacks = pgTable('feedbacks', {
  id: serial('id').primaryKey(),
  feedbackId: text('feedback_id').unique(),
  submitterRole: text('submitter_role').notNull(),
  submitterId: text('submitter_id'),
  submitterName: text('submitter_name'),
  category: text('category').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  rating: integer('rating'),
  status: text('status').default('Pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  docId: text('doc_id').unique(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  fileType: text('file_type'),
  fileUrl: text('file_url').notNull(),
  fileSize: text('file_size'),
  uploadedBy: text('uploaded_by'),
  targetRole: text('target_role'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const lmsMaterials = pgTable('lms_materials', {
  id: serial('id').primaryKey(),
  materialId: text('material_id').unique(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  className: text('class_name').notNull(),
  type: text('type').notNull(), // PDF, Video, Link, Document
  url: text('url').notNull(),
  description: text('description'),
  uploadedBy: text('uploaded_by'),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

export const certificates = pgTable('certificates', {
  id: serial('id').primaryKey(),
  certId: text('cert_id').unique(),
  studentId: text('student_id').notNull(),
  studentName: text('student_name'),
  title: text('title').notNull(),
  type: text('type').notNull(), // Transfer Certificate, Character, Sports, Academic
  issueDate: date('issue_date'),
  issuedBy: text('issued_by'),
  status: text('status').default('Issued'),
  downloadUrl: text('download_url'),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  eventId: text('event_id').unique(),
  title: text('title').notNull(),
  description: text('description'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  location: text('location'),
  organizer: text('organizer'),
  targetAudience: text('target_audience'),
});

export const libraryBooks = pgTable('library_books', {
  id: serial('id').primaryKey(),
  bookId: text('book_id').unique(),
  isbn: text('isbn'),
  title: text('title').notNull(),
  author: text('author').notNull(),
  category: text('category'),
  totalCopies: integer('total_copies').default(1),
  availableCopies: integer('available_copies').default(1),
  shelfLocation: text('shelf_location'),
});
