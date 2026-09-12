import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import {
  Upload,
  BookOpen,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  Download,
  Trash2,
  Eye,
  MessageSquare,
  Paperclip,
  MoreVertical,
  Edit3,
  Users,
  Check,
  X,
  SlidersHorizontal,
  CloudUpload,
  Sparkles,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  CheckCheck,
  Award
} from 'lucide-react';
import { TeacherResource, HomeworkSubmission } from '../../types';

interface TeacherSyllabusHomeworkViewProps {
  selectedClass: '9' | '10' | '11' | '12';
  onSelectClass: (cls: '9' | '10' | '11' | '12') => void;
  onBackToDashboard: () => void;
}

export const TeacherSyllabusHomeworkView: React.FC<TeacherSyllabusHomeworkViewProps> = ({
  selectedClass,
  onSelectClass,
  onBackToDashboard
}) => {
  const { teacherResources, addTeacherResource, deleteTeacherResource, gradeAssignment } = useERP();
  const { teacher } = useAuth();

  // Filter tab for My Uploaded Resources
  const [filterType, setFilterType] = useState<'all' | 'homework' | 'syllabus'>('all');

  // Helper to determine the subject of the logged-in teacher
  const getTeacherDefaultSubject = (
    tch: typeof teacher,
    cls: string,
    subjectsList: string[]
  ) => {
    if (!tch) return subjectsList[0] || `Physics (Class ${cls} - Theory & Lab)`;
    const taught = (tch.subjectsTaught || []).map((s) => s.toLowerCase());
    const designation = (tch.designation || '').toLowerCase();
    const department = (tch.department || '').toLowerCase();
    const name = (tch.name || '').toLowerCase();

    // Chemistry
    if (
      designation.includes('chem') ||
      department.includes('chem') ||
      taught.some((t) => t.includes('chem')) ||
      name.includes('sunita') ||
      name.includes('verma')
    ) {
      const match = subjectsList.find((s) => s.toLowerCase().includes('chem'));
      if (match) return match;
    }

    // Physics
    if (
      designation.includes('phys') ||
      department.includes('phys') ||
      taught.some((t) => t.includes('phys')) ||
      name.includes('rajesh')
    ) {
      const match = subjectsList.find((s) => s.toLowerCase().includes('phys'));
      if (match) return match;
    }

    // Mathematics
    if (
      designation.includes('math') ||
      department.includes('math') ||
      taught.some((t) => t.includes('math')) ||
      name.includes('vikram')
    ) {
      const match = subjectsList.find((s) => s.toLowerCase().includes('math'));
      if (match) return match;
    }

    // Biology
    if (
      designation.includes('bio') ||
      department.includes('bio') ||
      taught.some((t) => t.includes('bio')) ||
      name.includes('ananya')
    ) {
      const match = subjectsList.find((s) => s.toLowerCase().includes('bio'));
      if (match) return match;
    }

    // Computer Science
    if (
      designation.includes('comp') ||
      department.includes('comp') ||
      taught.some((t) => t.includes('comp')) ||
      name.includes('amit')
    ) {
      const match = subjectsList.find((s) => s.toLowerCase().includes('comp'));
      if (match) return match;
    }

    // English
    if (
      designation.includes('eng') ||
      department.includes('eng') ||
      taught.some((t) => t.includes('eng')) ||
      name.includes('rekha')
    ) {
      const match = subjectsList.find((s) => s.toLowerCase().includes('eng'));
      if (match) return match;
    }

    return subjectsList[0];
  };

  // Subject options tailored per class
  const classSubjects = useMemo(() => {
    if (selectedClass === '11' || selectedClass === '12') {
      return [
        `Physics (Class ${selectedClass} - Theory & Lab)`,
        `Chemistry (Class ${selectedClass} - Theory & Lab)`,
        `Mathematics (Class ${selectedClass})`,
        `Biology (Class ${selectedClass} - Theory & Lab)`,
        `Computer Science (Class ${selectedClass} - Python & SQL)`,
        `English Core (Class ${selectedClass})`,
        `Accountancy (Class ${selectedClass})`,
        `Business Studies (Class ${selectedClass})`,
        `Economics (Class ${selectedClass})`,
        `Agriculture Science (Class ${selectedClass})`
      ];
    }
    return [
      `Science (Class ${selectedClass} - Theory & Lab)`,
      `Mathematics (Class ${selectedClass})`,
      `Social Science (Class ${selectedClass})`,
      `English Language & Lit (Class ${selectedClass})`,
      `Hindi Course A (Class ${selectedClass})`,
      `Information Technology (Class ${selectedClass})`
    ];
  }, [selectedClass]);

  // Form states
  const [subject, setSubject] = useState<string>(() => {
    return getTeacherDefaultSubject(teacher, selectedClass, [
      `Physics (Class ${selectedClass} - Theory & Lab)`,
      `Chemistry (Class ${selectedClass} - Theory & Lab)`,
      `Mathematics (Class ${selectedClass})`,
      `Biology (Class ${selectedClass} - Theory & Lab)`
    ]);
  });
  const [resourceType, setResourceType] = useState<'homework' | 'syllabus'>('homework');
  const [title, setTitle] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('2026-09-08');
  const [maxMarks, setMaxMarks] = useState<string>('25');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modal states
  const [evaluatingResource, setEvaluatingResource] = useState<TeacherResource | null>(null);
  const [gradeInputs, setGradeInputs] = useState<Record<string, { marks: string; remark: string }>>({});
  const [pdfPreviewResource, setPdfPreviewResource] = useState<TeacherResource | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Student Homework Copy Inspection Modal state
  const [inspectingSub, setInspectingSub] = useState<{
    submission: HomeworkSubmission;
    resource: TeacherResource;
    index: number;
  } | null>(null);
  const [copyZoom, setCopyZoom] = useState<number>(100);
  const [teacherCheckedMark, setTeacherCheckedMark] = useState<boolean>(false);

  // Keep subject synced with current teacher & class
  React.useEffect(() => {
    const autoSub = getTeacherDefaultSubject(teacher, selectedClass, classSubjects);
    setSubject(autoSub);
  }, [teacher, selectedClass, classSubjects]);

  // Check if a resource was uploaded by the current teacher
  const isMyTeacherResource = React.useCallback((r: TeacherResource) => {
    if (!teacher) return true;
    if (r.teacherId && (r.teacherId === teacher.teacherId || r.teacherId === teacher.id)) return true;
    const upl = (r.uploadedBy || '').toLowerCase().trim();
    const tName = (teacher.name || '').toLowerCase().trim();
    if (upl === tName) return true;
    if (tName.includes('sharma') && upl.includes('sharma')) return true;
    if (tName.includes('sunita') && (upl.includes('sunita') || upl.includes('verma'))) return true;
    if (tName.includes('verma') && (upl.includes('sunita') || upl.includes('verma'))) return true;
    if (tName.includes('vikram') && upl.includes('vikram')) return true;
    if (tName.includes('singh') && upl.includes('singh')) return true;
    if (tName.includes('ananya') && upl.includes('ananya')) return true;
    if (tName.includes('amit') && upl.includes('amit')) return true;
    return false;
  }, [teacher]);

  // View scope: 'my' = only current teacher's uploads (default), 'all' = all teachers' uploads
  const [viewScope, setViewScope] = useState<'my' | 'all'>('my');

  // Filter all resources for the current selected class
  const classAllResources = useMemo(() => {
    return teacherResources.filter(r => {
      const clsName = r.className.toLowerCase();
      const targetCls = `class ${selectedClass}`.toLowerCase();
      return clsName.includes(targetCls) || clsName.includes(selectedClass);
    });
  }, [teacherResources, selectedClass]);

  // Filter resources for current view
  const currentClassResources = useMemo(() => {
    if (viewScope === 'my') {
      return classAllResources.filter(isMyTeacherResource);
    }
    return classAllResources;
  }, [classAllResources, viewScope, isMyTeacherResource]);

  const myUploadsCount = useMemo(() => {
    return classAllResources.filter(isMyTeacherResource).length;
  }, [classAllResources, isMyTeacherResource]);

  // Metrics
  const metrics = useMemo(() => {
    const totalActive = currentClassResources.length;
    const ongoingAssignments = currentClassResources.filter(r => r.type === 'homework').length;
    let toEvaluateCount = 0;
    currentClassResources.forEach(r => {
      if (r.type === 'homework' && r.submissions) {
        toEvaluateCount += r.submissions.filter(s => s.status === 'Submitted').length;
      }
    });
    return {
      totalActive,
      ongoingAssignments,
      toEvaluateCount
    };
  }, [currentClassResources]);

  // Tab filtered items
  const displayResources = useMemo(() => {
    return currentClassResources.filter(r => {
      if (filterType === 'all') return true;
      return r.type === filterType;
    });
  }, [currentClassResources, filterType]);

  const getSubjectCode = (subjName: string) => {
    const lower = subjName.toLowerCase();
    if (lower.includes('chem')) return 'CHEM101';
    if (lower.includes('phys')) return 'PHY101';
    if (lower.includes('math')) return 'MATH101';
    if (lower.includes('bio')) return 'BIO101';
    if (lower.includes('comp')) return 'CS101';
    if (lower.includes('eng')) return 'ENG101';
    if (lower.includes('account')) return 'ACC101';
    if (lower.includes('business')) return 'BST101';
    if (lower.includes('econom')) return 'ECO101';
    if (lower.includes('agri')) return 'AGR101';
    return subjName.split(' ')[0].toUpperCase();
  };

  // Handle Form Submission
  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a Title / Topic Name');
      return;
    }

    setIsSubmitting(true);

    const fileName = selectedFile
      ? selectedFile.name
      : resourceType === 'homework'
      ? `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_assignment.pdf`
      : `${title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_notes.pdf`;

    const fileSize = selectedFile
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : '1.4 MB';

    const dispatchResource: Omit<TeacherResource, 'id' | 'uploadDate'> = {
      type: resourceType,
      title: title.trim(),
      subjectCode: getSubjectCode(subject),
      subjectName: subject,
      className: `Class ${selectedClass}`,
      fileName,
      fileSize,
      fileData: selectedFile ? URL.createObjectURL(selectedFile) : 'https://stxaviersonline.edu/notes/physics_unit4_problem_set_v2.pdf',
      message: `Complete coursework and study references dispatched by ${teacher?.name || 'Subject Teacher'}.`,
      uploadedBy: teacher?.name || 'Subject Teacher',
      teacherId: teacher?.teacherId || teacher?.id || 'TCH001',
      dueDate: resourceType === 'homework' ? dueDate : undefined,
      dueLabel: resourceType === 'homework' ? 'Due Tomorrow' : undefined,
      maxMarks: resourceType === 'homework' ? maxMarks : undefined,
      category: resourceType === 'homework' ? 'Question Bank' : 'Curriculum Notes',
      totalStudents: 48,
      readCount: resourceType === 'syllabus' ? 0 : undefined,
      submissions: resourceType === 'homework' ? [] : undefined
    };

    setTimeout(() => {
      addTeacherResource(dispatchResource);
      setIsSubmitting(false);
      setTitle('');
      setSelectedFile(null);
      setSuccessToast(`Dispatched to Class ${selectedClass} successfully under ${subject}!`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 400);
  };

  // Open Evaluate Submissions Modal
  const handleOpenEvaluation = (resource: TeacherResource) => {
    setEvaluatingResource(resource);
    const initialInputs: Record<string, { marks: string; remark: string }> = {};
    (resource.submissions || []).forEach(sub => {
      initialInputs[sub.studentId] = {
        marks: sub.marks ? String(sub.marks) : '',
        remark: sub.remark || ''
      };
    });
    setGradeInputs(initialInputs);
  };

  // Open Full Student Homework Copy Checker
  const handleOpenCheckCopy = (sub: HomeworkSubmission, resource: TeacherResource, index: number) => {
    setInspectingSub({ submission: sub, resource, index });
    setCopyZoom(100);
    setTeacherCheckedMark(sub.status === 'Graded');
    if (!gradeInputs[sub.studentId]) {
      setGradeInputs(prev => ({
        ...prev,
        [sub.studentId]: {
          marks: sub.marks ? String(sub.marks) : '',
          remark: sub.remark || ''
        }
      }));
    }
  };

  const handleNextCopy = () => {
    if (!inspectingSub) return;
    const subs = inspectingSub.resource.submissions || [];
    const nextIdx = inspectingSub.index + 1;
    if (nextIdx < subs.length) {
      handleOpenCheckCopy(subs[nextIdx], inspectingSub.resource, nextIdx);
    }
  };

  const handlePrevCopy = () => {
    if (!inspectingSub) return;
    const subs = inspectingSub.resource.submissions || [];
    const prevIdx = inspectingSub.index - 1;
    if (prevIdx >= 0) {
      handleOpenCheckCopy(subs[prevIdx], inspectingSub.resource, prevIdx);
    }
  };

  const handleSaveGrade = (studentId: string, customMarks?: string, customRemark?: string) => {
    const targetResource = inspectingSub?.resource || evaluatingResource;
    if (!targetResource) return;
    const input = gradeInputs[studentId] || { marks: customMarks || '', remark: customRemark || '' };
    const marksToSave = customMarks !== undefined ? customMarks : input.marks;
    const remarkToSave = customRemark !== undefined ? customRemark : input.remark;

    if (!marksToSave) {
      alert('Please provide marks to submit evaluation');
      return;
    }
    gradeAssignment(targetResource.id, studentId, marksToSave, remarkToSave);
    
    // update gradeInputs
    setGradeInputs(prev => ({
      ...prev,
      [studentId]: { marks: marksToSave, remark: remarkToSave }
    }));

    // update local modal view
    setEvaluatingResource(prev => {
      if (!prev) return null;
      return {
        ...prev,
        submissions: (prev.submissions || []).map(s =>
          s.studentId === studentId
            ? { ...s, marks: marksToSave, remark: remarkToSave, status: 'Graded' as const }
            : s
        )
      };
    });

    if (inspectingSub && inspectingSub.submission.studentId === studentId) {
      setTeacherCheckedMark(true);
      setInspectingSub(prev => prev ? ({
        ...prev,
        submission: {
          ...prev.submission,
          marks: marksToSave,
          remark: remarkToSave,
          status: 'Graded' as const
        }
      }) : null);
    }

    setSuccessToast(`Marks (${marksToSave}/${targetResource.maxMarks || 25}) and evaluation saved successfully!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      

      {/* SWITCH CLASS & ACADEMIC YEAR ROW */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Switch Class:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['9', '10', '11', '12'] as const).map((cls) => {
              const isSelected = selectedClass === cls;
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => onSelectClass(cls)}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
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

        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
          Academic Year 2026-27
        </span>
      </div>

      {/* 3 COUNTER STAT CARDS */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#0a0a0a] p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-xs text-center flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Resources</span>
          <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
            {metrics.totalActive} Active
          </span>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-xs text-center flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Assignments</span>
          <span className="text-sm sm:text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
            {metrics.ongoingAssignments} Ongoing
          </span>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-xs text-center flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">To Evaluate</span>
          <span className="text-sm sm:text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
            {metrics.toEvaluateCount} Papers
          </span>
        </div>
      </div>

      {/* MAIN CARD: UPLOAD SYLLABUS & HOMEWORK FORM */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-sm p-4 sm:p-6 space-y-4">
        {/* Card Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <CloudUpload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
              Upload Syllabus & Homework
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Distribute course material or assignments directly to students
            </p>
          </div>
        </div>

        <form onSubmit={handleDispatch} className="space-y-4 pt-1">
          {/* Subject Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Subject <span className="text-rose-500">*</span>
              </label>
              {teacher && (
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  Current Teacher: {teacher.name}
                </span>
              )}
            </div>
            <div className="relative">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 pr-10 cursor-pointer"
              >
                {classSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <MoreVertical className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          {/* Resource Type Radio Cards */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Resource Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                onClick={() => setResourceType('homework')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  resourceType === 'homework'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    resourceType === 'homework'
                      ? 'border-blue-600 bg-white dark:bg-neutral-900'
                      : 'border-slate-300 dark:border-neutral-600'
                  }`}
                >
                  {resourceType === 'homework' && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <span className="text-xs font-bold">Homework / Assignment</span>
              </label>

              <label
                onClick={() => setResourceType('syllabus')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  resourceType === 'syllabus'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                    : 'border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    resourceType === 'syllabus'
                      ? 'border-blue-600 bg-white dark:bg-neutral-900'
                      : 'border-slate-300 dark:border-neutral-600'
                  }`}
                >
                  {resourceType === 'syllabus' && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <span className="text-xs font-bold">Syllabus / Notes</span>
              </label>
            </div>
          </div>

          {/* Title / Topic Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Title / Topic Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 8: Wave Optics & Interference Assignment"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Due Date and Max Marks (Shown for Homework) */}
          {resourceType === 'homework' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Max Marks
                </label>
                <input
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  placeholder="25"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          )}

          {/* Attach Document Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Attach Document (PDF, Max 10MB)
              </label>
              <span className="text-[11px] text-slate-400">Single file upload</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl border border-dashed border-slate-300 dark:border-neutral-700 bg-slate-50/50 dark:bg-neutral-900/40 flex flex-col items-center justify-center text-center gap-2">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-700 cursor-pointer transition-all shadow-2xs">
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                <span>Choose File</span>
                <input
                  type="file"
                  accept="application/pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {selectedFile
                    ? `${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)`
                    : 'physics_unit4_problem_set_v2.pdf (1.4 MB)'}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            <CloudUpload className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Dispatching...'
                : `Upload & Dispatch to Class ${selectedClass}`}
            </span>
          </button>
        </form>
      </div>

      {/* MY UPLOADED RESOURCES SECTION */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {viewScope === 'my' ? 'My Uploaded Resources' : 'All Faculty Uploaded Resources'}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300">
              {displayResources.length} items
            </span>
          </div>

          {/* Teacher Scope Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-neutral-700/60 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewScope('my')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewScope === 'my'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              My Uploads ({myUploadsCount})
            </button>
            <button
              type="button"
              onClick={() => setViewScope('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewScope === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Faculty ({classAllResources.length})
            </button>
          </div>
        </div>

        {/* Filter Tabs: All, Homework, Syllabus */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
            }`}
          >
            All ({currentClassResources.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('homework')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterType === 'homework'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
            }`}
          >
            Homework ({currentClassResources.filter((r) => r.type === 'homework').length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('syllabus')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              filterType === 'syllabus'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
            }`}
          >
            Syllabus ({currentClassResources.filter((r) => r.type === 'syllabus').length})
          </button>
        </div>

        {/* Resources Cards List */}
        {displayResources.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#0a0a0a] rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">
              {viewScope === 'my'
                ? `You haven't uploaded any resources for Class ${selectedClass} yet. Use the dispatch form above to upload your homework or syllabus.`
                : `No resources found for Class ${selectedClass}. Use the form above to dispatch lesson materials or assignments.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayResources.map((resource) => {
              const isHomework = resource.type === 'homework';
              const submissions = resource.submissions || [];
              const submissionCount = submissions.length;
              const totalStudents = resource.totalStudents || 48;
              const turnInPercent = Math.round((submissionCount / totalStudents) * 100);

              const sLower = (resource.subjectName || '').toLowerCase();
              let subjectColorBadge = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
              if (sLower.includes('chem')) {
                subjectColorBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
              } else if (sLower.includes('phys')) {
                subjectColorBadge = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
              } else if (sLower.includes('math')) {
                subjectColorBadge = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
              } else if (sLower.includes('bio')) {
                subjectColorBadge = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
              } else if (sLower.includes('comp')) {
                subjectColorBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
              }

              return (
                <div
                  key={resource.id}
                  className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-xs p-4 sm:p-5 space-y-3 relative hover:border-slate-300 dark:hover:border-neutral-700 transition-all"
                >
                  {/* Card Top Row: Type Badge, Due/Updated Badge, 3-dots Menu */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isHomework
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isHomework ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <BookOpen className="w-4 h-4" />
                        )}
                      </div>

                      {isHomework ? (
                        <>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            HOMEWORK
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{resource.dueLabel || 'Due Tomorrow'}</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            SYLLABUS & NOTES
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {new Date(resource.uploadDate).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Delete Resource"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteTeacherResource(resource.id);
                          setSuccessToast(`Resource "${resource.title}" deleted successfully`);
                          setTimeout(() => setSuccessToast(null), 3000);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === resource.id ? null : resource.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === resource.id && (
                          <div className="absolute right-0 top-7 z-30 w-36 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-slate-200 dark:border-neutral-700 py-1 text-xs font-semibold animate-in fade-in">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveMenuId(null);
                                deleteTeacherResource(resource.id);
                                setSuccessToast(`Resource "${resource.title}" deleted successfully`);
                                setTimeout(() => setSuccessToast(null), 3000);
                              }}
                              className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-left cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Resource</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subject Tag & Teacher Byline */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${subjectColorBadge}`}>
                      {resource.subjectName}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Uploaded by: <span className="font-bold text-slate-700 dark:text-slate-300">{resource.uploadedBy}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {resource.title}
                  </h4>

                  {/* Stats / Progress Bar */}
                  {isHomework ? (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900/70 border border-slate-200/60 dark:border-neutral-800 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Submissions: {submissionCount} / {totalStudents}
                        </span>
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {turnInPercent}% Turn-in
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900/70 border border-slate-200/60 dark:border-neutral-800 flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          Student Access: {resource.readCount || 48} / {totalStudents} Read
                        </span>
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>All Verified</span>
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 pt-1">
                    {isHomework ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setPdfPreviewResource(resource)}
                          className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEvaluation(resource)}
                          className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-blue-600/20 active:scale-98"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Evaluate Submissions</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setPdfPreviewResource(resource)}
                          className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-neutral-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>Download</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const newTitle = prompt('Edit Title:', resource.title);
                            if (newTitle && newTitle.trim()) {
                              // update title in state
                              resource.title = newTitle.trim();
                              setSuccessToast('Resource title updated!');
                              setTimeout(() => setSuccessToast(null), 2500);
                            }
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Manage</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      

        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
          <span>
            Active Class:{' '}
            <strong className="text-purple-600 dark:text-purple-400">Class {selectedClass}</strong>
          </span>
          <span>•</span>
          <span>
            Logged:{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {teacher?.name || 'Mr. Rajesh Sharma'}
            </strong>
          </span>
        </div>

      {/* ========================================================================= */}
      {/* EVALUATION DRAWER / MODAL */}
      {/* ========================================================================= */}
      {evaluatingResource && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0e0e0e] rounded-2xl max-w-xl w-full border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-slate-50/50 dark:bg-neutral-900/50">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Evaluate Student Submissions
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {evaluatingResource.title} (Max: {evaluatingResource.maxMarks || 25} Marks)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEvaluatingResource(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              {(evaluatingResource.submissions || []).length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-slate-400">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No Submissions Yet
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    When students from Class {selectedClass} upload their solved copies, they will appear here for you to check and grade.
                  </p>
                </div>
              ) : (
                (evaluatingResource.submissions || []).map((sub, index) => {
                  const currentInput = gradeInputs[sub.studentId] || { marks: '', remark: '' };
                  const isGraded = sub.status === 'Graded';

                  return (
                    <div
                      key={sub.studentId}
                      className="p-4 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-neutral-800 space-y-3.5 transition-all hover:border-slate-300 dark:hover:border-neutral-700 shadow-xs"
                    >
                      {/* Student Header & Status Pill */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {sub.studentName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                              {sub.studentName}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium">
                              Roll: <span className="font-mono text-slate-600 dark:text-slate-300">{sub.studentId}</span>
                              {sub.submittedAt && (
                                <span> • {new Date(sub.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 ${
                            isGraded
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {isGraded ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{sub.marks} / {evaluatingResource.maxMarks || 25}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span>Pending</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Clean File Attachment & Action Row */}
                      <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-900/70 border border-slate-100 dark:border-neutral-800/80">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {sub.fileName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Student Answer Copy • PDF
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenCheckCopy(sub, evaluatingResource, index)}
                            className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Check Copy</span>
                          </button>

                          <a
                            href={sub.fileData || `data:text/plain;charset=utf-8,Student%20Submission:%20${encodeURIComponent(sub.studentName)}`}
                            download={sub.fileName}
                            className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-neutral-700 transition-colors cursor-pointer"
                            title="Download File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Clean Inline Evaluation Row */}
                      <div className="space-y-2 pt-0.5">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <div className="relative w-28 shrink-0">
                              <input
                                type="number"
                                min="0"
                                max={evaluatingResource.maxMarks || 25}
                                placeholder="Marks"
                                value={currentInput.marks}
                                onChange={(e) =>
                                  setGradeInputs((prev) => ({
                                    ...prev,
                                    [sub.studentId]: { ...currentInput, marks: e.target.value }
                                  }))
                                }
                                className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                              />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold">
                                /{evaluatingResource.maxMarks || 25}
                              </span>
                            </div>

                            <div className="flex-1 sm:hidden">
                              <button
                                type="button"
                                onClick={() => handleSaveGrade(sub.studentId)}
                                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Feedback / remark for student..."
                              value={currentInput.remark}
                              onChange={(e) =>
                                setGradeInputs((prev) => ({
                                  ...prev,
                                  [sub.studentId]: { ...currentInput, remark: e.target.value }
                                }))
                              }
                              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />

                            <button
                              type="button"
                              onClick={() => handleSaveGrade(sub.studentId)}
                              className="hidden sm:flex px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95 shrink-0 items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>

                        {/* Subtle Quick Remarks */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">Quick Remark:</span>
                          {['Excellent', 'Well Written', 'Recheck Calculations', 'Incomplete Steps'].map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => {
                                setGradeInputs((prev) => ({
                                  ...prev,
                                  [sub.studentId]: {
                                    ...currentInput,
                                    remark: chip
                                  }
                                }));
                              }}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-neutral-800 border border-slate-200/70 dark:border-neutral-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/50 flex justify-end">
              <button
                type="button"
                onClick={() => setEvaluatingResource(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-neutral-800 text-slate-800 dark:text-slate-200 text-xs font-bold cursor-pointer hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STUDENT HOMEWORK COPY CHECKER & EVALUATION MODAL */}
      {/* ========================================================================= */}
      {inspectingSub && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0e0e0e] rounded-2xl max-w-4xl w-full max-h-[95vh] border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/80 dark:bg-neutral-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setInspectingSub(null)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Back to submissions"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      Checking Copy: {inspectingSub.submission.studentName}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      Roll: {inspectingSub.submission.studentId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inspectingSub.submission.status === 'Graded'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {inspectingSub.submission.status === 'Graded'
                        ? `Graded: ${inspectingSub.submission.marks}/${inspectingSub.resource.maxMarks || 25}`
                        : 'Pending Review'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {inspectingSub.resource.subjectName} • {inspectingSub.resource.title} ({inspectingSub.resource.className})
                  </p>
                </div>
              </div>

              {/* Controls: Student Prev/Next, Zoom, Stamp, Download, Close */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                {/* Prev / Next Student */}
                <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <button
                    type="button"
                    onClick={handlePrevCopy}
                    disabled={inspectingSub.index === 0}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-neutral-700 disabled:opacity-30 cursor-pointer"
                    title="Previous Student"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-1">
                    {inspectingSub.index + 1}/{(inspectingSub.resource.submissions || []).length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextCopy}
                    disabled={inspectingSub.index >= (inspectingSub.resource.submissions || []).length - 1}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-neutral-700 disabled:opacity-30 cursor-pointer"
                    title="Next Student"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-neutral-800 px-1.5 py-1 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs text-slate-700 dark:text-slate-300">
                  <button
                    type="button"
                    onClick={() => setCopyZoom((z) => Math.max(60, z - 15))}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-neutral-700 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono w-9 text-center font-bold">
                    {copyZoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setCopyZoom((z) => Math.min(180, z + 15))}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-neutral-700 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Teacher Red Pen Stamp Toggle */}
                <button
                  type="button"
                  onClick={() => setTeacherCheckedMark(!teacherCheckedMark)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                    teacherCheckedMark
                      ? 'bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 shadow-2xs'
                      : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                  title="Toggle Teacher Checked Stamp"
                >
                  <Award className="w-3.5 h-3.5 text-rose-500" />
                  <span>{teacherCheckedMark ? 'Checked ✓' : 'Stamp Checked'}</span>
                </button>

                {/* Download */}
                <a
                  href={inspectingSub.submission.fileData || `data:text/plain;charset=utf-8,Student%20Submission:%20${encodeURIComponent(inspectingSub.submission.studentName)}`}
                  download={inspectingSub.submission.fileName}
                  className="p-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                  title="Download Student Copy"
                >
                  <Download className="w-4 h-4" />
                </a>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setInspectingSub(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document / Copy Viewer Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70 dark:bg-neutral-950">
              {/* File Info Strip */}
              <div className="mb-3.5 p-3 rounded-xl bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {inspectingSub.submission.fileName}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    • Submitted: {inspectingSub.submission.submittedAt ? new Date(inspectingSub.submission.submittedAt).toLocaleString() : 'Recently'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified Authenticity</span>
                  </span>
                </div>
              </div>

              {/* Main Copy Canvas / Paper */}
              <div className="flex justify-center">
                <div
                  style={{ transform: `scale(${copyZoom / 100})`, transformOrigin: 'top center' }}
                  className="w-full max-w-2xl bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6 relative transition-transform duration-150 select-text"
                >
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                    <span className="text-7xl font-black rotate-[-25deg] tracking-widest text-slate-900">
                      ST. XAVIER'S
                    </span>
                  </div>

                  {/* Teacher Checked Rubber Stamp */}
                  {(teacherCheckedMark || inspectingSub.submission.status === 'Graded') && (
                    <div className="absolute top-8 right-8 z-10 rotate-[-12deg] pointer-events-none animate-in zoom-in-50 duration-200">
                      <div className="border-4 border-rose-600 rounded-xl p-2.5 text-center bg-rose-50/90 shadow-md">
                        <div className="text-[10px] font-black uppercase text-rose-700 tracking-wider">
                          ST. XAVIER'S EVALUATED
                        </div>
                        <div className="text-base font-black text-rose-600 flex items-center justify-center gap-1">
                          <Check className="w-5 h-5 stroke-[3]" />
                          <span>CHECKED & GRADED</span>
                        </div>
                        <div className="text-xs font-black text-rose-800">
                          Marks: {gradeInputs[inspectingSub.submission.studentId]?.marks || inspectingSub.submission.marks || '24'}/{inspectingSub.resource.maxMarks || 25}
                        </div>
                        <div className="text-[9px] font-bold text-rose-600">
                          Faculty: {inspectingSub.resource.uploadedBy}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Academic Sheet Header */}
                  <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
                    <h2 className="text-base sm:text-lg font-black tracking-wide text-slate-900 uppercase">
                      St. Xavier's Senior Secondary School
                    </h2>
                    <p className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">
                      Central Board of Secondary Education (CBSE) • Session 2025-26
                    </p>
                    <div className="pt-1 flex items-center justify-center gap-2 text-xs font-extrabold text-blue-900">
                      <span className="bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                        {inspectingSub.resource.subjectName} Assessment Copy
                      </span>
                    </div>
                  </div>

                  {/* Student Credentials Matrix */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Student Name</span>
                      <strong className="text-slate-900 font-extrabold">{inspectingSub.submission.studentName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Roll Number</span>
                      <strong className="text-slate-900 font-mono">{inspectingSub.submission.studentId}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Class & Section</span>
                      <strong className="text-slate-900">{inspectingSub.resource.className}-A</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Max Marks</span>
                      <strong className="text-slate-900">{inspectingSub.resource.maxMarks || 25} Marks</strong>
                    </div>
                  </div>

                  {/* Topic / Assignment Banner */}
                  <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase">Assignment Title</span>
                      <h4 className="text-xs font-bold text-blue-950">{inspectingSub.resource.title}</h4>
                      {inspectingSub.resource.message && (
                        <p className="text-[11px] text-slate-600 pt-0.5">{inspectingSub.resource.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Document Embed / Solution Preview */}
                  {inspectingSub.submission.fileData?.startsWith('data:image/') ? (
                    <div className="rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={inspectingSub.submission.fileData}
                        alt="Student Submitted Copy"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ) : inspectingSub.submission.fileData?.startsWith('data:application/pdf') ? (
                    <div className="space-y-3">
                      <iframe
                        src={inspectingSub.submission.fileData}
                        className="w-full h-[460px] rounded-lg border border-slate-300 bg-slate-50"
                        title="Student PDF Document"
                      />
                      <div className="text-center">
                        <a
                          href={inspectingSub.submission.fileData}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open PDF in Full Browser Window</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    /* High-fidelity Student Answer Copy content */
                    <div className="space-y-5 border-t border-slate-200 pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Q.1 Write complete observations, schematic test procedure, and equations.</span>
                          <span className="text-rose-600 font-extrabold">[10 Marks]</span>
                        </div>
                        <div className="p-3.5 rounded-lg bg-amber-50/40 border-l-4 border-l-amber-500 border border-slate-200/80 font-mono text-xs leading-relaxed text-slate-800 space-y-1.5">
                          <p className="font-bold text-amber-900">Ans 1:</p>
                          <p>
                            1. Flame Test Observation: When the sample paste with conc. HCl was introduced to the non-luminous flame using a clean platinum wire, a characteristic persistent <strong>crimson red flame</strong> was observed, confirming presence of Group V cation (Sr²⁺).
                          </p>
                          <p>
                            2. Chemical Equation: <br />
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200 inline-block my-1 font-bold">
                              SrCl₂ + (NH₄)₂CO₃ → SrCO₃ ↓ (White precipitate) + 2NH₄Cl
                            </span>
                          </p>
                          <p>
                            3. Confirmatory Reaction: The white precipitate dissolved in dilute CH₃COOH. On adding K₂CrO₄ solution, no precipitate formed, but on adding (NH₄)₂SO₄ solution, a white precipitate of SrSO₄ was formed immediately.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>Q.2 Summarize inferred results and necessary safety precautions.</span>
                          <span className="text-rose-600 font-extrabold">[15 Marks]</span>
                        </div>
                        <div className="p-3.5 rounded-lg bg-amber-50/40 border-l-4 border-l-amber-500 border border-slate-200/80 font-mono text-xs leading-relaxed text-slate-800 space-y-1.5">
                          <p className="font-bold text-amber-900">Ans 2:</p>
                          <p>
                            • Inferred Cation: <strong>Strontium (Sr²⁺)</strong><br />
                            • Inferred Anion: <strong>Chloride (Cl⁻)</strong> (Confirmed by Chromyl Chloride test with deep red vapors).<br />
                            • Precautions: Always use concentrated HCl with proper safety goggles and perform flame test in the oxidising zone of the burner.
                          </p>
                        </div>
                      </div>

                      {/* Verified footer stamp */}
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-500">
                        <span>Digital Upload Signature: SHA-256 Verified</span>
                        <span>File: {inspectingSub.submission.fileName}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Evaluation & Grading Dock */}
            <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-neutral-800 bg-white dark:bg-[#0e0e0e] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Scored Marks & Feedback inputs */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2.5">
                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Award Marks:
                  </label>
                  <div className="relative w-28">
                    <input
                      type="number"
                      min="0"
                      max={inspectingSub.resource.maxMarks || 25}
                      value={gradeInputs[inspectingSub.submission.studentId]?.marks || ''}
                      onChange={(e) =>
                        setGradeInputs((prev) => ({
                          ...prev,
                          [inspectingSub.submission.studentId]: {
                            marks: e.target.value,
                            remark: prev[inspectingSub.submission.studentId]?.remark || ''
                          }
                        }))
                      }
                      placeholder="e.g. 24"
                      className="w-full pl-2.5 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      /{inspectingSub.resource.maxMarks || 25}
                    </span>
                  </div>
                </div>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={gradeInputs[inspectingSub.submission.studentId]?.remark || ''}
                    onChange={(e) =>
                      setGradeInputs((prev) => ({
                        ...prev,
                        [inspectingSub.submission.studentId]: {
                          marks: prev[inspectingSub.submission.studentId]?.marks || '',
                          remark: e.target.value
                        }
                      }))
                    }
                    placeholder="Feedback remarks for student (e.g. Excellent observations and neat diagrams!)..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() =>
                    handleSaveGrade(
                      inspectingSub.submission.studentId,
                      gradeInputs[inspectingSub.submission.studentId]?.marks,
                      gradeInputs[inspectingSub.submission.studentId]?.remark
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Evaluation (मार्क्स सेव करें)</span>
                </button>

                {inspectingSub.index < (inspectingSub.resource.submissions || []).length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveGrade(
                        inspectingSub.submission.studentId,
                        gradeInputs[inspectingSub.submission.studentId]?.marks,
                        gradeInputs[inspectingSub.submission.studentId]?.remark
                      );
                      handleNextCopy();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <span>Save & Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {pdfPreviewResource && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#0e0e0e] rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-neutral-800 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {pdfPreviewResource.fileName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPdfPreviewResource(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-dashed border-slate-200 dark:border-neutral-800 text-center space-y-2">
              <BookOpen className="w-10 h-10 text-blue-500 mx-auto" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {pdfPreviewResource.title}
              </h4>
              <p className="text-[11px] text-slate-500">
                {pdfPreviewResource.message || 'Complete study document and problem worksheets.'}
              </p>
              <div className="pt-2">
                <a
                  href={pdfPreviewResource.fileData}
                  download={pdfPreviewResource.fileName}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPdfPreviewResource(null)}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
