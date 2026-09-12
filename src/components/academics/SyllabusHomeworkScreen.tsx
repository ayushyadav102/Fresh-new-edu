import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  Search,
  SlidersHorizontal,
  ChevronRight,
  MessageSquare,
  FileSpreadsheet,
  FileCheck2,
  X,
  Paperclip,
  Check,
  ArrowLeft,
  AlertCircle,
  Eye
} from 'lucide-react';
import { TeacherResource } from '../../types';
import { isStudentEnrolledInSubject, getStudentEnrolledSubjects } from '../../utils/subjectStreamMatcher';

interface SyllabusHomeworkScreenProps {
  onBack?: () => void;
}

export const SyllabusHomeworkScreen: React.FC<SyllabusHomeworkScreenProps> = ({ onBack }) => {
  const { teacherResources, submitAssignment, getStudentAttendance } = useERP();
  const { student } = useAuth();

  const [activeTab, setActiveTab] = useState<'homework' | 'syllabus'>('homework');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');

  // Modal States
  const [selectedTaskForSubmit, setSelectedTaskForSubmit] = useState<TeacherResource | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [solutionText, setSolutionText] = useState('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [promptViewResource, setPromptViewResource] = useState<TeacherResource | null>(null);
  const [annotatedPdfView, setAnnotatedPdfView] = useState<{
    title: string;
    score: string;
    remark: string;
    fileName: string;
    teacher: string;
  } | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Student class normalization
  const studentClass = student?.className || 'Class 11';

  // Enrolled subjects
  const enrolledAttendance = useMemo(() => {
    if (!student) return [];
    return getStudentAttendance(student.id);
  }, [student, getStudentAttendance]);

  // Subject filter pills list based on student stream
  const filterPillSubjects = useMemo(() => {
    if (!student) return ['All Subjects', 'Physics', 'Mathematics', 'Chemistry', 'Computer Science', 'English'];
    const enrolled = getStudentEnrolledSubjects(student);
    const shortNames = enrolled.map(s => s.shortName);
    return ['All Subjects', ...shortNames];
  }, [student]);

  // Filter resources for current student (matching class AND enrolled subject)
  const classResources = useMemo(() => {
    return teacherResources.filter(res => {
      const clsName = (res.className || '').toLowerCase().trim();
      const targetCls = (studentClass || 'Class 11').toLowerCase().trim();
      const resNum = clsName.replace(/\D/g, '');
      const targetNum = targetCls.replace(/\D/g, '');
      const classMatches = (resNum && targetNum && resNum === targetNum) || clsName.includes(targetCls) || targetCls.includes(clsName);
      if (!classMatches) return false;

      // Ensure student is actually enrolled in this resource's subject!
      if (student && !isStudentEnrolledInSubject(student, res.subjectName, student.className)) {
        return false;
      }
      return true;
    });
  }, [teacherResources, studentClass, student]);

  // Homework resources (Pending & Evaluated)
  const homeworkResources = useMemo(() => {
    return classResources.filter(r => r.type === 'homework');
  }, [classResources]);

  // Syllabus & Notes resources
  const syllabusResources = useMemo(() => {
    return classResources.filter(r => r.type === 'syllabus');
  }, [classResources]);

  // Filtered syllabus by subject pill and search
  const filteredSyllabusResources = useMemo(() => {
    return syllabusResources.filter(res => {
      if (selectedSubject !== 'All Subjects') {
        const subName = (res.subjectName || '').toLowerCase();
        const sel = selectedSubject.toLowerCase();
        if (!subName.includes(sel)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (res.title || '').toLowerCase().includes(q);
        const matchSubject = (res.subjectName || '').toLowerCase().includes(q);
        const matchTeacher = (res.uploadedBy || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSubject && !matchTeacher) return false;
      }

      return true;
    });
  }, [syllabusResources, selectedSubject, searchQuery]);

  // Counts per subject for pills
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const targetResources = activeTab === 'homework' ? homeworkResources : syllabusResources;
    targetResources.forEach(res => {
      const sName = (res.subjectName || '').toLowerCase();
      filterPillSubjects.forEach(pill => {
        if (pill !== 'All Subjects' && sName.includes(pill.toLowerCase())) {
          counts[pill] = (counts[pill] || 0) + 1;
        }
      });
    });
    return counts;
  }, [activeTab, homeworkResources, syllabusResources, filterPillSubjects]);

  // Helper: check if submission strictly belongs to the currently active student
  const isCurrentStudentSubmission = (s: { studentId?: string; studentName?: string }) => {
    if (!student) return false;
    const currentId = (student.id || student.studentId || '').trim().toLowerCase();
    const subId = (s.studentId || '').trim().toLowerCase();
    if (currentId && subId && currentId === subId) {
      return true;
    }
    if (student.name && s.studentName) {
      const currentName = student.name.trim().toLowerCase();
      const subName = s.studentName.trim().toLowerCase();
      if (currentName === subName) return true;
    }
    return false;
  };

  // Pending Tasks (Homework not yet graded or requiring action for this student)
  const pendingTasks = useMemo(() => {
    return homeworkResources.filter(res => {
      // Subject pill filter
      if (selectedSubject !== 'All Subjects') {
        const subName = (res.subjectName || '').toLowerCase();
        const sel = selectedSubject.toLowerCase();
        if (!subName.includes(sel)) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (res.title || '').toLowerCase().includes(q);
        const matchSubject = (res.subjectName || '').toLowerCase().includes(q);
        const matchTeacher = (res.uploadedBy || '').toLowerCase().includes(q);
        if (!matchTitle && !matchSubject && !matchTeacher) return false;
      }

      // Exclude tasks that have already been graded for THIS student
      const isGradedForMe = (res.submissions || []).some(
        s => isCurrentStudentSubmission(s) && s.status === 'Graded'
      );
      if (isGradedForMe) return false;

      return true;
    });
  }, [homeworkResources, selectedSubject, searchQuery, student]);

  // Evaluated Tasks (Only real graded submissions for THIS student)
  const evaluatedTasks = useMemo(() => {
    const list: Array<{
      resource: TeacherResource;
      marks: string | number;
      remark: string;
      submissionDate: string;
    }> = [];

    // Only include actual graded submissions for the active student
    homeworkResources.forEach(res => {
      const mySub = (res.submissions || []).find(
        s => isCurrentStudentSubmission(s) && s.status === 'Graded'
      );
      if (mySub) {
        list.push({
          resource: res,
          marks: mySub.marks || '19 / 20',
          remark: mySub.remark || 'Good work! Evaluated by subject faculty.',
          submissionDate: mySub.submittedAt
        });
      }
    });

    return list;
  }, [homeworkResources, student]);

  // Curriculum documents (Official syllabus uploaded by faculty)
  const curriculumDocs = useMemo(() => {
    return syllabusResources.map(s => ({
      id: s.id,
      title: s.title,
      subtitle: `${s.subjectName} • ${s.fileSize || 'PDF'}`,
      fileName: s.fileName,
      fileData: s.fileData,
      isBlueprint: s.title.toLowerCase().includes('weightage') || s.title.toLowerCase().includes('blueprint')
    }));
  }, [syllabusResources]);

  // Computed metrics
  const evaluatedCount = evaluatedTasks.length;
  const totalHwCount = homeworkResources.length;
  const evaluatedPercent = totalHwCount > 0 ? Math.round((evaluatedCount / totalHwCount) * 100) : 0;

  // Handle student file submit
  const handleFileSubmit = () => {
    if (!selectedTaskForSubmit) return;
    if (!uploadFile && !solutionText.trim()) {
      setSubmissionError('Please select a solution file (PDF/Image) or type your answer text.');
      return;
    }

    setSubmissionError(null);
    const studentId = student?.id || student?.studentId || 'STU001';
    const studentName = student?.name || 'Student';

    if (uploadFile) {
      const reader = new FileReader();
      reader.onload = () => {
        submitAssignment(
          selectedTaskForSubmit.id,
          uploadFile.name,
          reader.result as string,
          studentId,
          studentName
        );
        setSelectedTaskForSubmit(null);
        setUploadFile(null);
        setSolutionText('');
        setSuccessToast('Assignment submitted successfully for teacher evaluation!');
        setTimeout(() => setSuccessToast(null), 4000);
      };
      reader.readAsDataURL(uploadFile);
    } else {
      submitAssignment(
        selectedTaskForSubmit.id,
        `${selectedTaskForSubmit.title.slice(0, 15)}_answer.txt`,
        `data:text/plain;charset=utf-8,${encodeURIComponent(solutionText)}`,
        studentId,
        studentName
      );
      setSelectedTaskForSubmit(null);
      setSolutionText('');
      setSuccessToast('Assignment submitted successfully for teacher evaluation!');
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* SUCCESS TOAST */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* TOP NAVIGATION BACK BAR */}
      {onBack && (
        <div className="flex items-center justify-between pb-0.5">
          
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Student Academic Portal
          </span>
        </div>
      )}

      {/* TOP HEADER CARD (Matches Screenshot 2) */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                Syllabus & Homework
              </h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                St. Xavier's Sec. School • {studentClass} PCM (Term 2)
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed max-w-xl">
                Access class materials and assignment submissions securely. Verified by your CBSE subject teachers.
              </p>
            </div>
          </div>

          {/* 3 STATS METRICS (Pending, Checked, Subjects) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-neutral-800">
            <div className="text-center px-2.5 py-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
              <span className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
                Pending
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                {pendingTasks.length} Due
              </span>
            </div>

            <div className="text-center px-2.5 py-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30">
              <span className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
                Checked
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                {evaluatedCount} ({evaluatedPercent}%)
              </span>
            </div>

            <div className="text-center px-2.5 py-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
              <span className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
                Subjects
              </span>
              <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400">
                {enrolledAttendance.length || 6} Units
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS TOGGLE: HOMEWORK vs SYLLABUS & NOTES (Matches Screenshot 2) */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-neutral-900 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('homework')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'homework'
              ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Homework ({homeworkResources.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('syllabus')}
          className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'syllabus'
              ? 'bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Syllabus & Notes</span>
        </button>
      </div>

      {/* SEARCH AND SUBJECT FILTER PILLS (Matches Screenshot 2) */}
      <div className="space-y-2.5">
        {/* Search input with filter icon */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignment, topic, teacher..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-slate-200/80 dark:border-neutral-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          />
          <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Horizontal Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filterPillSubjects.map((sub) => {
            const isSelected = selectedSubject === sub;
            const count = subjectCounts[sub] || 0;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubject(sub)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                    : 'bg-white dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-700'
                }`}
              >
                <span>{sub}</span>
                {count > 0 && sub !== 'All Subjects' && (
                  <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected
                      ? 'bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900'
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HOMEWORK CONTENT */}
      {/* ========================================================================= */}
      {activeTab === 'homework' && (
        <div className="space-y-6">
          {/* 1. PENDING TASKS SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Pending Tasks
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {pendingTasks.length} Action Required
                </span>
              </div>

              <span className="text-[11px] font-medium text-slate-400">
                Auto-synced
              </span>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#0a0a0a] rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800 space-y-2">
                <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto" />
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  All Caught Up!
                </h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  {searchQuery || selectedSubject !== 'All Subjects'
                    ? 'No pending homework matching your active search/subject filters.'
                    : `No pending homework assignments found for ${studentClass}. Assignments posted by your teachers will appear here automatically.`}
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingTasks.map((task) => {
                  const sName = (task.subjectName || '').toLowerCase();
                  const isPhysics = sName.includes('physic');
                  const isMath = sName.includes('math');
                  const isChem = sName.includes('chem');

                  const borderAccent = isPhysics
                    ? 'border-l-amber-500'
                    : isMath
                    ? 'border-l-blue-500'
                    : isChem
                    ? 'border-l-emerald-500'
                    : 'border-l-purple-500';

                  const badgeBg = isPhysics
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    : isMath
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : isChem
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300';

                  const mySubmission = (task.submissions || []).find((s) =>
                    isCurrentStudentSubmission(s)
                  );
                  const isSubmitted = !!mySubmission;

                  return (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-[#111113] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-neutral-700 p-4 sm:p-5 space-y-3.5 transition-all"
                    >
                      {/* Top row: Subject badge, Teacher, Due */}
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${badgeBg}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                            {task.subjectName || 'Subject Homework'}
                          </span>
                          <span className="text-slate-500 dark:text-neutral-400 font-medium text-xs">
                            {task.uploadedBy || 'Subject Teacher'}
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                          <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{task.dueLabel || (task.dueDate ? `Due ${task.dueDate}` : 'Due Soon')}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-neutral-100 leading-snug">
                        {task.title}
                      </h3>

                      {/* Description */}
                      {task.message && (
                        <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                          {task.message}
                        </p>
                      )}

                      {/* Attached Document Box */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-900/70 border border-slate-100 dark:border-neutral-800/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-slate-900 dark:text-neutral-100 truncate">
                              {task.fileName || 'assignment_document.pdf'}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium block">
                              {task.fileSize || '1.5 MB'} • {task.category || 'Assignment'}
                            </span>
                          </div>
                        </div>

                        <a
                          href={task.fileData}
                          download={task.fileName || 'assignment.pdf'}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-700 text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs"
                          title="Download Document"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setPromptViewResource(task)}
                          className="flex-1 py-2 px-3.5 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-neutral-400" />
                          <span>View Instructions</span>
                        </button>

                        {isSubmitted ? (
                          <div className="flex-1 py-2 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Submitted for Review</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTaskForSubmit(task);
                              setUploadFile(null);
                              setSolutionText('');
                              setSubmissionError(null);
                            }}
                            className="flex-1 py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs shadow-blue-600/20"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Submit Solution →</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. RECENT EVALUATIONS SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Recent Evaluations
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Graded
                </span>
              </div>

              <span className="text-xs font-bold text-slate-400">
                {evaluatedTasks.length} Graded
              </span>
            </div>

            {evaluatedTasks.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-[#0a0a0a] rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800 space-y-1.5">
                <FileCheck2 className="w-8 h-8 text-slate-300 dark:text-neutral-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No Evaluated Submissions Yet
                </h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  When your teachers grade your submitted assignments, their marks and evaluation remarks will appear here.
                </p>
              </div>
            ) : (
              evaluatedTasks.map(({ resource, marks, remark, submissionDate }) => (
                <div
                  key={resource.id}
                  className="bg-white dark:bg-[#111113] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-neutral-700 p-4 sm:p-5 space-y-3.5 transition-all"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300">
                        {resource.subjectName}
                      </span>
                      <span className="text-slate-500 dark:text-neutral-400 font-medium text-xs">
                        {resource.uploadedBy}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{marks} Marks</span>
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-neutral-100 leading-snug">
                    {resource.title}
                  </h3>

                  {/* Teacher Feedback Remark Box */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5 leading-relaxed">
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                        Teacher Feedback
                      </span>
                      <span className="font-medium">{remark}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-400 font-medium text-[11px]">
                      {submissionDate ? `Evaluated: ${new Date(submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Evaluated recently'}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setAnnotatedPdfView({
                          title: resource.title,
                          score: String(marks),
                          remark,
                          fileName: resource.fileName || 'assignment_evaluated.pdf',
                          teacher: resource.uploadedBy
                        })
                      }
                      className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Checked Copy →</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 3. CURRICULUM DOCUMENTS SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  Curriculum Documents
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  CBSE 2026
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('syllabus')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                All Units
              </button>
            </div>

            {curriculumDocs.length === 0 ? (
              <div className="p-6 text-center bg-white dark:bg-[#0a0a0a] rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800 space-y-1.5">
                <BookOpen className="w-8 h-8 text-slate-300 dark:text-neutral-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  No Curriculum Documents Available
                </h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Official syllabus documents and unit blueprints uploaded by teachers for {studentClass} will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {curriculumDocs.slice(0, 4).map((doc, idx) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = doc.fileData;
                      a.download = doc.fileName;
                      a.click();
                    }}
                    className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-3.5 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-neutral-700 transition-all cursor-pointer shadow-xs group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          idx % 2 === 0
                            ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {idx % 2 === 0 ? (
                          <FileText className="w-5 h-5" />
                        ) : (
                          <FileSpreadsheet className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                          {doc.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {doc.subtitle}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SYLLABUS & NOTES CONTENT */}
      {/* ========================================================================= */}
      {activeTab === 'syllabus' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Official Syllabus, Notes & Study Material</span>
            </h2>
            <span className="text-xs font-bold text-slate-400">
              {filteredSyllabusResources.length} Documents Available
            </span>
          </div>

          {filteredSyllabusResources.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0a0a0a] rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800 space-y-2">
              <BookOpen className="w-10 h-10 text-slate-300 dark:text-neutral-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Syllabus or Notes Found
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {selectedSubject !== 'All Subjects'
                  ? `No syllabus or notes found for ${selectedSubject}. Try selecting "All Subjects" or clearing your search.`
                  : `Lesson notes, syllabus copies, and formula reference sheets dispatched by your teachers for ${studentClass} will appear here in real-time.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredSyllabusResources.map((res) => {
                const sLower = (res.subjectName || '').toLowerCase();
                let subBadgeColor = 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
                if (sLower.includes('chem')) {
                  subBadgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
                } else if (sLower.includes('phys')) {
                  subBadgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
                } else if (sLower.includes('math')) {
                  subBadgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
                }

                return (
                  <div
                    key={res.id}
                    className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200/80 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-3 hover:border-slate-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            {res.category || 'SYLLABUS & NOTES'}
                          </span>
                          {res.subjectName && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${subBadgeColor}`}>
                              {res.subjectName}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(res.uploadDate).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {res.title}
                      </h3>

                      {res.uploadedBy && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Teacher: <strong className="text-slate-800 dark:text-slate-200">{res.uploadedBy}</strong>
                        </div>
                      )}

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {res.message || 'Complete lesson overview and curriculum blueprint.'}
                      </p>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium pt-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {res.fileName} • {res.fileSize || '1.4 MB'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
                      <a
                        href={res.fileData}
                        download={res.fileName}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT SOLUTION */}
      {/* ========================================================================= */}
      {selectedTaskForSubmit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#111113] rounded-2xl max-w-lg w-full border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-neutral-100">
                    Submit Homework Solution
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-neutral-400">
                    Upload your solved copy for teacher review
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedTaskForSubmit(null);
                  setUploadFile(null);
                  setSolutionText('');
                  setSubmissionError(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Task Details Strip */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-100 dark:border-neutral-800/80 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-neutral-100">
                    {selectedTaskForSubmit.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                    {selectedTaskForSubmit.subjectName}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-neutral-400">
                  <span>Teacher: <strong>{selectedTaskForSubmit.uploadedBy || 'Subject Teacher'}</strong></span>
                  <span>•</span>
                  <span>Due: <strong className="text-amber-600 dark:text-amber-400">{selectedTaskForSubmit.dueLabel || 'Soon'}</strong></span>
                </div>
              </div>

              {/* Error state */}
              {submissionError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{submissionError}</span>
                </div>
              )}

              {/* File Drop / Select Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block">
                  Upload Solved Document or Photos
                </label>

                {!uploadFile ? (
                  <label className="group relative block p-6 rounded-xl border border-slate-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-500/50 bg-slate-50/50 dark:bg-neutral-900/40 transition-all cursor-pointer text-center">
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setUploadFile(f);
                          setSubmissionError(null);
                        }
                      }}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-neutral-200">
                      Click to choose file or drag here
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                      PDF, PNG, JPG files up to 25 MB supported
                    </p>
                  </label>
                ) : (
                  <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-900 dark:text-neutral-100 truncate">
                          {uploadFile.name}
                        </span>
                        <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                          {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUploadFile(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Solution Summary / Notes input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-neutral-300 block">
                  Student Notes / Summary (Optional)
                </label>
                <textarea
                  value={solutionText}
                  onChange={(e) => {
                    setSolutionText(e.target.value);
                    setSubmissionError(null);
                  }}
                  rows={3}
                  placeholder="Type any clarifications, question numbers solved, or notes for your teacher..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedTaskForSubmit(null);
                  setUploadFile(null);
                  setSolutionText('');
                  setSubmissionError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFileSubmit}
                disabled={!uploadFile && !solutionText.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-600/20 disabled:opacity-40 disabled:pointer-events-none cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Solution</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW PROMPT / GUIDE */}
      {/* ========================================================================= */}
      {promptViewResource && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0e0e0e] rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-neutral-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                Assignment Instructions
              </h3>
              <button
                type="button"
                onClick={() => setPromptViewResource(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Topic Title
                </span>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white block mt-0.5">
                  {promptViewResource.title}
                </span>
                <span className="text-slate-500 block text-[11px] mt-1">
                  Teacher: {promptViewResource.uploadedBy} • Subject: {promptViewResource.subjectName}
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Instructions from Teacher:
                </span>
                <p className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-slate-700 dark:text-slate-300 leading-relaxed">
                  {promptViewResource.message ||
                    'Please solve all questions systematically. Ensure step-by-step working and diagrams are clearly legible.'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                  {promptViewResource.fileName}
                </span>
                <a
                  href={promptViewResource.fileData}
                  download={promptViewResource.fileName}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPromptViewResource(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW ANNOTATED PDF & EVALUATION */}
      {/* ========================================================================= */}
      {annotatedPdfView && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0e0e0e] rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-neutral-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  Teacher Evaluation & Annotated PDF
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAnnotatedPdfView(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {annotatedPdfView.title}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-black bg-emerald-600 text-white">
                  Score: {annotatedPdfView.score}
                </span>
              </div>
              <p className="text-emerald-900 dark:text-emerald-300 font-medium">
                {annotatedPdfView.remark}
              </p>
              <span className="text-[10px] text-slate-500 block">
                Evaluator: {annotatedPdfView.teacher}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-dashed border-slate-200 dark:border-neutral-800 text-center space-y-2">
              <FileText className="w-8 h-8 text-blue-500 mx-auto" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {annotatedPdfView.fileName}
              </span>
              <p className="text-[11px] text-slate-400">
                Verified assignment record with teacher feedback marks.
              </p>
              <a
                href={`data:text/plain;charset=utf-8,Teacher%20Evaluation%20for%20${encodeURIComponent(annotatedPdfView.title)}%0AScore:%20${encodeURIComponent(annotatedPdfView.score)}%0ARemark:%20${encodeURIComponent(annotatedPdfView.remark)}`}
                download={annotatedPdfView.fileName}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Verified Record</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setAnnotatedPdfView(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
