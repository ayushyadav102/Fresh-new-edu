import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { requireAuth } from './src/middleware/auth';
import { db } from './src/db/index';
import * as schema from './src/db/schema';
import { sql } from 'drizzle-orm';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Enable CORS for API consumers and Vercel deployments
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper for local date string
function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// In-Memory Primary State (Keeps fast sync for API clients)
const fallbackReports: any[] = [
  {
    id: 'DCR-101',
    date: '2026-08-27',
    time: '08:30 AM',
    classId: 'c10a',
    className: 'Class 10',
    section: 'A',
    totalStudents: 42,
    presentCount: 39,
    absentCount: 3,
    attendancePercentage: 92.8,
    absentRollNos: [4, 17, 28],
    absentStudentNames: ['Aarav Patel', 'Neha Sharma', 'Rohan Gupta'],
    submittedByTeacherId: 'TCH-001',
    submittedByTeacherName: 'Mrs. Sunita Sharma',
    facultiesPresentCount: 6,
    remarks: 'Morning assembly conducted. 3 students on verified leave.'
  },
  {
    id: 'DCR-102',
    date: '2026-08-27',
    time: '08:45 AM',
    classId: 'c10b',
    className: 'Class 10',
    section: 'B',
    totalStudents: 40,
    presentCount: 38,
    absentCount: 2,
    attendancePercentage: 95.0,
    absentRollNos: [11, 23],
    absentStudentNames: ['Dev Malhotra', 'Ananya Roy'],
    submittedByTeacherId: 'TCH-002',
    submittedByTeacherName: 'Mr. Rajesh Verma',
    facultiesPresentCount: 6,
    remarks: 'All students present for Physics Lab practical.'
  }
];

const fallbackStudents = [
  { id: 'STU-001', studentId: 'STU-001', name: 'Aarav Patel', rollNo: 1, class: 'Class 10', className: 'Class 10', section: 'A', gender: 'Male', parentContact: '+91 98765 43210', status: 'Active', attendance: 94.5, feesDue: 0 },
  { id: 'STU-002', studentId: 'STU-002', name: 'Ananya Roy', rollNo: 2, class: 'Class 10', className: 'Class 10', section: 'A', gender: 'Female', parentContact: '+91 98765 43211', status: 'Active', attendance: 98.2, feesDue: 1500 },
  { id: 'STU-003', studentId: 'STU-003', name: 'Rohan Gupta', rollNo: 3, class: 'Class 10', className: 'Class 10', section: 'B', gender: 'Male', parentContact: '+91 98765 43212', status: 'Active', attendance: 88.0, feesDue: 0 },
  { id: 'STU-004', studentId: 'STU-004', name: 'Sneha Verma', rollNo: 4, class: 'Class 11', className: 'Class 11', section: 'Science', gender: 'Female', parentContact: '+91 98765 43213', status: 'Active', attendance: 96.0, feesDue: 2000 },
  { id: 'STU-005', studentId: 'STU-005', name: 'Dev Malhotra', rollNo: 5, class: 'Class 12', className: 'Class 12', section: 'Commerce', gender: 'Male', parentContact: '+91 98765 43214', status: 'Active', attendance: 91.5, feesDue: 0 }
];

const fallbackTeachers = [
  { id: 'TCH-001', name: 'Mrs. Sunita Sharma', subject: 'Mathematics', email: 'sunita.sharma@edux.org', phone: '+91 98111 22334', assignedClasses: ['Class 10-A', 'Class 11-Science'], experience: '8 Years', status: 'Active' },
  { id: 'TCH-002', name: 'Mr. Rajesh Verma', subject: 'Physics', email: 'rajesh.verma@edux.org', phone: '+91 98111 22335', assignedClasses: ['Class 11-Science', 'Class 12-Science'], experience: '12 Years', status: 'Active' },
  { id: 'TCH-003', name: 'Ms. Priya Sen', subject: 'English', email: 'priya.sen@edux.org', phone: '+91 98111 22336', assignedClasses: ['Class 10-A', 'Class 10-B'], experience: '5 Years', status: 'Active' }
];

const fallbackHomework = [
  { id: 'HW-001', title: 'Quadratic Equations Exercise 4.2', subject: 'Mathematics', className: 'Class 10', dueDate: '2026-08-30', description: 'Complete questions 1 to 15 in homework notebook.', assignedBy: 'Mrs. Sunita Sharma' },
  { id: 'HW-002', title: 'Ray Optics Numerical Worksheet', subject: 'Physics', className: 'Class 12', dueDate: '2026-08-31', description: 'Solve numerical problems on lens formula and prism.', assignedBy: 'Mr. Rajesh Verma' }
];

const fallbackNotices = [
  { id: 'NOT-001', title: 'Half-Yearly Examination Schedule', date: '2026-09-01', category: 'Academic', description: 'Half-Yearly examinations will commence from September 10th. Timetable published.', postedBy: 'Principal Office' },
  { id: 'NOT-002', title: 'Parent-Teacher Meeting (PTM)', date: '2026-09-05', category: 'General', description: 'PTM for Classes 10th and 12th scheduled this Saturday from 9:00 AM to 1:00 PM.', postedBy: 'Admin Desk' }
];

const fallbackLogs: any[] = [];
const fallbackChatMessages: any[] = [];
const fallbackTimetable: any[] = [];

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'connected',
    firestore: 'connected (client-side SDK)',
    database: 'Google Cloud Firestore & Cloud Storage',
    provider: 'Google Cloud Platform (Firebase)',
    storageBucket: 'ornate-chemist-rq6d2.firebasestorage.app',
    databaseId: 'ai-studio-remixremixunicam-5ec5f1d3-ba00-4d7a-890a-65c5007066bb',
    security: 'requireAuth active on all school data routes'
  });
});

// Save single attendance report
app.post('/api/attendance/reports', requireAuth, (req, res) => {
  const reportData = req.body;
  if (!reportData || !reportData.id) {
    return res.status(400).json({ error: 'Invalid report data' });
  }

  const existingIdx = fallbackReports.findIndex((r) => r.id === reportData.id);
  if (existingIdx >= 0) {
    fallbackReports[existingIdx] = { ...fallbackReports[existingIdx], ...reportData };
  } else {
    fallbackReports.unshift(reportData);
  }

  res.json({ success: true, report: reportData, synced: true });
});

// Mark Batch Class/Period Attendance
app.post('/api/attendance/mark', requireAuth, (req, res) => {
  const { className, subjectName, subjectCode, date, time, records, teacherName, teacherId, topic } = req.body;
  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Records array is required' });
  }

  const totalStudents = records.length;
  const presentCount = records.filter((r: any) => r.status === 'Present').length;
  const absentCount = records.filter((r: any) => r.status === 'Absent').length;
  const pct = totalStudents > 0 ? Number(((presentCount / totalStudents) * 100).toFixed(1)) : 100;
  const absentList = records.filter((r: any) => r.status === 'Absent');

  const reportId = `DCR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const reportData = {
    id: reportId,
    date: date || getLocalDateString(),
    time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    classId: (className || 'Class 10').toLowerCase().replace(/\s+/g, ''),
    className: className || 'Class 10',
    section: 'A',
    totalStudents,
    presentCount,
    absentCount,
    presentStudents: presentCount,
    absentStudents: absentCount,
    attendancePercentage: pct,
    absentRollNos: absentList.map((r: any) => r.rollNo || r.roll || 0),
    absentStudentNames: absentList.map((r: any) => r.studentName || r.name || r.studentId),
    submittedByTeacherId: teacherId || 'TCH-001',
    submittedByTeacherName: teacherName || 'Subject Teacher',
    facultiesPresentCount: 1,
    subjectTaught: subjectName || 'Subject Lecture',
    periodTaught: `Period - ${subjectName || 'Lecture'}`,
    remarks: `Live attendance marked by ${teacherName || 'Faculty'}`
  };

  fallbackReports.unshift(reportData);

  for (const rec of records) {
    const logId = `LOG-${rec.studentId}-${date}-${(subjectName || 'Sub').replace(/\s+/g, '')}`;
    const logItem = {
      id: logId,
      date: date || getLocalDateString(),
      time: time || '10:00 AM',
      studentId: rec.studentId,
      studentName: rec.studentName || rec.name || rec.studentId,
      rollNo: rec.rollNo || rec.roll || 0,
      className: className || 'Class 10',
      section: 'A',
      subjectName: subjectName || 'General Subject',
      subjectCode: subjectCode || '042',
      status: rec.status || 'Present',
      markedByTeacherName: teacherName || 'Faculty',
      markedByTeacherId: teacherId || 'TCH-001',
      topic: topic || `Regular Class Session (${subjectName})`,
      source: 'Mobile / Live App'
    };
    fallbackLogs.unshift(logItem);
  }

  res.json({
    success: true,
    message: `Attendance marked successfully for ${records.length} students!`,
    report: reportData,
    synced: true
  });
});

// Single Student Attendance Log
app.post('/api/attendance/student-log', requireAuth, (req, res) => {
  const { studentId, studentName, rollNo, className, section, subjectName, subjectCode, date, time, status, topic, teacherName } = req.body;
  const logId = `LOG-${studentId}-${date}-${(subjectName || 'Sub').replace(/\s+/g, '')}`;
  const logData = {
    id: logId,
    date: date || getLocalDateString(),
    time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    studentId: studentId || 'STU-001',
    studentName: studentName || 'Student',
    rollNo: rollNo || 1,
    className: className || 'Class 10',
    section: section || 'A',
    subjectName: subjectName || 'Physics',
    subjectCode: subjectCode || '042',
    status: status || 'Present',
    markedByTeacherName: teacherName || 'Faculty',
    topic: topic || 'Class Lecture',
    source: 'Mobile / Quick Mark'
  };

  fallbackLogs.unshift(logData);
  res.json({ success: true, log: logData, synced: true });
});

// Get Attendance Logs for Student
app.get('/api/attendance/logs/:studentId', requireAuth, (req, res) => {
  const { studentId } = req.params;
  const logs = fallbackLogs.filter((l) => l.studentId === studentId);
  res.json(logs);
});

// Get Attendance Reports
app.get('/api/attendance/reports', requireAuth, (req, res) => {
  res.json(fallbackReports);
});

// Get Students
app.get('/api/students', requireAuth, (req, res) => {
  res.json(fallbackStudents);
});

// Add Student
app.post('/api/students', requireAuth, (req, res) => {
  const newStudent = req.body;
  if (!newStudent.id) newStudent.id = `STU-${Date.now()}`;
  fallbackStudents.push(newStudent);
  res.json({ success: true, student: newStudent, synced: true });
});

// Get Teachers
app.get('/api/teachers', requireAuth, (req, res) => {
  res.json(fallbackTeachers);
});

// Get Homework
app.get('/api/homework', requireAuth, (req, res) => {
  res.json(fallbackHomework);
});

// Add Homework
app.post('/api/homework', requireAuth, (req, res) => {
  const newHw = req.body;
  if (!newHw.id) newHw.id = `HW-${Date.now()}`;
  fallbackHomework.unshift(newHw);
  res.json({ success: true, homework: newHw, synced: true });
});

// Get Notices
app.get('/api/notices', requireAuth, (req, res) => {
  res.json(fallbackNotices);
});

// Add Notice
app.post('/api/notices', requireAuth, (req, res) => {
  const newNotice = req.body;
  if (!newNotice.id) newNotice.id = `NOT-${Date.now()}`;
  fallbackNotices.unshift(newNotice);
  res.json({ success: true, notice: newNotice, synced: true });
});

// Timetable Endpoints
app.get('/api/timetable', requireAuth, (req, res) => {
  res.json(fallbackTimetable);
});

app.post('/api/timetable/sync', requireAuth, (req, res) => {
  const { slots } = req.body;
  if (Array.isArray(slots)) {
    for (const slot of slots) {
      if (slot && slot.id) {
        const idx = fallbackTimetable.findIndex((s) => s.id === slot.id);
        if (idx >= 0) {
          fallbackTimetable[idx] = { ...fallbackTimetable[idx], ...slot };
        } else {
          fallbackTimetable.push(slot);
        }
      }
    }
  }
  res.json({ success: true, count: fallbackTimetable.length, synced: true });
});

// Chat Endpoints
app.get('/api/chat/messages', requireAuth, (req, res) => {
  res.json(fallbackChatMessages);
});

app.post('/api/chat/messages', requireAuth, (req, res) => {
  const msgData = req.body;
  if (!msgData || !msgData.id) {
    return res.status(400).json({ error: 'Message id and body required' });
  }
  fallbackChatMessages.push(msgData);
  res.json({ success: true, message: msgData, synced: true });
});

// Google Gemini AI Routes
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
  }
} catch (e) {
  console.log("Gemini initialization skipped - API key may be missing");
}

async function callGeminiWithRetry(params: any, maxRetries = 3) {
  if (!ai) throw new Error('Google Gemini AI is not configured.');
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      if (i === maxRetries - 1) throw err;
      const isTransient = err?.status === 'UNAVAILABLE' || err?.message?.includes('503') || err?.message?.includes('high demand');
      if (isTransient) {
        console.log(`Gemini API busy (503). Retrying ${i + 1}/${maxRetries} in ${1500 * (i + 1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, 1500 * (i + 1)));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Failed after retries");
}

app.post('/api/gemini/generate-quiz', requireAuth, async (req, res) => {
  if (!ai) return res.status(500).json({ error: 'Google Gemini AI is not configured.' });
  
  try {
    const { topic, marks } = req.body;
    const numQuestions = Math.min(Math.max(Math.floor(marks / 2), 2), 10); // Rough estimate of questions

    const response = await callGeminiWithRetry({
      model: "gemini-3.8-flash",
      contents: `Generate a short quiz for students on the topic: "${topic}". Total marks for this test is ${marks}. Make around ${numQuestions} questions. Include a mix of Multiple Choice Questions (MCQ) and Short Answer Questions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, description: "'mcq' or 'short_answer'" },
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Only required for mcq type"
                  },
                  correctAnswer: { type: Type.STRING, description: "The correct answer or grading rubric for short_answer" },
                  marks: { type: Type.INTEGER }
                },
                required: ["id", "type", "question", "correctAnswer", "marks"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const quizData = JSON.parse(response.text || '{}');
    res.json(quizData);
  } catch (error: any) {
    console.error("Gemini Generate Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/gemini/grade-quiz', requireAuth, async (req, res) => {
  if (!ai) return res.status(500).json({ error: 'Google Gemini AI is not configured.' });
  
  try {
    const { questions, studentAnswers, totalMarks } = req.body;
    
    const response = await callGeminiWithRetry({
      model: "gemini-3.8-flash",
      contents: `You are an expert teacher. Grade the following student test submission.
      
      Questions & Rubric:
      ${JSON.stringify(questions)}

      Student Answers:
      ${JSON.stringify(studentAnswers)}
      
      Evaluate the short answers carefully based on the rubric. Calculate the total score out of ${totalMarks}. Provide a short feedback message.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Total marks obtained by the student" },
            feedback: { type: Type.STRING, description: "A brief, encouraging feedback message for the student based on their performance." },
            questionFeedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Question ID" },
                  isCorrect: { type: Type.BOOLEAN },
                  marksAwarded: { type: Type.NUMBER },
                  comment: { type: Type.STRING }
                }
              }
            }
          },
          required: ["score", "feedback", "questionFeedback"]
        }
      }
    });

    const gradingData = JSON.parse(response.text || '{}');
    res.json(gradingData);
  } catch (error: any) {
    console.error("Gemini Grade Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/chat', requireAuth, async (req, res) => {
  if (!ai) return res.status(500).json({ error: 'Gemini AI is not configured.' });
  
  try {
    const { message, history } = req.body;
    
    // First, let's get some basic stats from the real Cloud SQL database
    let stats = "";
    try {
      const studentCount = await db.select({ count: sql<number>`count(*)` }).from(schema.students);
      const userCount = await db.select({ count: sql<number>`count(*)` }).from(schema.users);
      const feeCount = await db.select({ count: sql<number>`count(*)` }).from(schema.fees);
      const attendanceCount = await db.select({ count: sql<number>`count(*)` }).from(schema.attendance);
      
      stats = `
Real Cloud SQL Database Stats:
- Users: ${userCount[0].count}
- Students: ${studentCount[0].count}
- Fee Records: ${feeCount[0].count}
- Attendance Records: ${attendanceCount[0].count}
`;
    } catch (dbErr) {
      console.error("DB stats error:", dbErr);
      stats = "Database is connected but currently empty or initializing.";
    }

    const systemPrompt = `You are the EduX AI Database Assistant. You are integrated directly into the Super Admin panel of the EduX School ERP.
Your job is to answer questions about the actual Cloud SQL database.
Currently, the frontend uses dummy data for testing, but you are connected to the REAL database.
Here is the current real data summary:
${stats}

If the database has 0 records for something, tell the user that the real database is currently empty because they are using dummy data on the frontend right now. Be helpful, concise, and professional.`;

    const response = await callGeminiWithRetry({
      model: "gemini-3.5-flash",
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I will act as the Database Assistant." }] },
        ...(history || []).map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        })),
        { role: "user", parts: [{ text: message }] }
      ]
    });
    
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Fallback for unmatched API routes
app.all('/api/*all', (req, res) => {
  res.status(404).json({ error: 'API route not found', path: req.path });
});

// Start Express + Vite Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
