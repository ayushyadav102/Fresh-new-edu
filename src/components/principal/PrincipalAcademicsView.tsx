import React, { useMemo, useState, useEffect } from 'react';
import { useERP } from '../../context/ERPContext';
import { ExamMark } from '../../services/examService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Search, Filter, TrendingUp, Sparkles, Download, Lock, FileText, BookOpen, FlaskConical, Lightbulb, Coins, Leaf, Monitor, Landmark, ShieldCheck } from 'lucide-react';
import { calculateGrade } from '../../utils/gradeUtils';

export const PrincipalAcademicsView: React.FC = () => {
  const { students } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [allMarks, setAllMarks] = useState<ExamMark[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<string>('All');
  const [terms, setTerms] = useState<string[]>([]);

  useEffect(() => {
    let unsubscribe = () => {};
    let isUnsubscribed = false;
    
    import('firebase/firestore').then(({ collection, query, onSnapshot }) => {
       import('../../firebase').then(({ db, ensureFirebaseAuth }) => {
          ensureFirebaseAuth().then((user) => {
             if (isUnsubscribed || !user) return;
             const marksRef = collection(db, 'exam_marks');
             const q = query(marksRef);
             unsubscribe = onSnapshot(q, (snapshot) => {
                const marksData = snapshot.docs.map(doc => doc.data() as ExamMark);
                setAllMarks(marksData);
                
                const uniqueTerms = Array.from(new Set(marksData.map(m => m.term || 'Unscheduled')));
                setTerms(uniqueTerms);
                setLoading(false);
             }, (err) => {
                console.warn("Academics view snapshot error:", err);
                setLoading(false);
             });
          });
       });
    });
    
    return () => {
       isUnsubscribed = true;
       unsubscribe();
    };
  }, [selectedTerm]);

  const studentResults = useMemo(() => {
    const map: Record<string, { student: any; subjects: ExamMark[]; totalObtained: number; totalMax: number; percentage: number; grade: string; isVerified: boolean }> = {};
    const filteredMarks = selectedTerm === 'All' ? allMarks : allMarks.filter(m => m.term === selectedTerm);
    
    filteredMarks.forEach(mark => {
       if (!map[mark.studentId]) {
          const stu = students.find(s => s.studentId === mark.studentId) || {
             name: mark.studentName,
             rollNo: mark.rollNo,
             className: mark.classId,
             studentId: mark.studentId,
             stream: 'Unknown'
          };
          map[mark.studentId] = { student: stu, subjects: [], totalObtained: 0, totalMax: 0, percentage: 0, grade: 'N/A', isVerified: true };
       }
       map[mark.studentId].subjects.push(mark);
       map[mark.studentId].totalObtained += mark.totalMarks;
       map[mark.studentId].totalMax += (mark.theoryMax + mark.internalMax);
       if (mark.status !== 'Verified' && mark.status !== 'Approved') {
           map[mark.studentId].isVerified = false;
       }
    });

    Object.values(map).forEach(res => {
       if (res.totalMax > 0) {
          res.percentage = (res.totalObtained / res.totalMax) * 100;
          res.grade = calculateGrade(res.totalObtained, res.totalMax);
       }
    });
    
    // Sort by class and roll no
    return Object.values(map).sort((a, b) => {
        if (a.student.className !== b.student.className) {
            return (a.student.className || '').localeCompare(b.student.className || '');
        }
        return (a.student.rollNo || '').toString().localeCompare((b.student.rollNo || '').toString());
    });
  }, [allMarks, students, selectedTerm]);

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return studentResults;
    const q = searchQuery.toLowerCase();
    return studentResults.filter(res => 
      res.student.name?.toLowerCase().includes(q) || 
      res.student.studentId?.toLowerCase().includes(q) ||
      res.student.rollNo?.toString().toLowerCase().includes(q)
    );
  }, [studentResults, searchQuery]);

  const classGroups = useMemo(() => {
    const groups: Record<string, typeof studentResults> = {};
    filteredResults.forEach(res => {
        const stream = res.student.stream || '';
        const key = `${res.student.className}::${stream}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(res);
    });
    return groups;
  }, [filteredResults]);

  const handleDownloadMasterLedger = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Master Academic Ledger - ${selectedTerm}`, 14, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    const tableData = filteredResults.map(res => [
      res.student.rollNo || '-',
      res.student.studentId,
      res.student.name,
      res.student.className,
      res.student.stream || 'N/A',
      `${res.totalObtained}/${res.totalMax}`,
      `${res.percentage.toFixed(1)}%`,
      res.grade,
      res.isVerified ? 'Verified' : 'Pending'
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Roll No', 'Student ID', 'Name', 'Class', 'Stream', 'Marks', 'Percentage', 'Grade', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [45, 27, 105], textColor: 255 },
      styles: { fontSize: 8 },
    });

    doc.save(`Master_Ledger_${selectedTerm}.pdf`);
  };

  const getGroupDetails = (className: string, stream: string) => {
    const lowerClass = (className || '').toLowerCase();
    const lowerStream = (stream || '').toLowerCase();

    if (lowerClass.includes('9')) return { icon: FileText, iconColor: 'text-blue-600', iconBg: 'bg-blue-50', title: 'Class 9 - Junior Secondary', subtitle: 'Curriculum: CBSE Central Board' };
    if (lowerClass.includes('10')) return { icon: BookOpen, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50', title: 'Class 10 - Secondary Board', subtitle: 'Curriculum: CBSE All-India Secondary' };
    if (lowerClass.includes('11') && (lowerStream.includes('pcm') || lowerStream.includes('cs'))) return { icon: FlaskConical, iconColor: 'text-teal-600', iconBg: 'bg-teal-50', title: 'Class 11 - Science (PCM + CS)', subtitle: 'Physics, Chem, Math, Comp Sci' };
    if (lowerClass.includes('11') && (lowerStream.includes('pcb') || lowerStream.includes('bio'))) return { icon: Lightbulb, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50', title: 'Class 11 - Science (PCB + Bio)', subtitle: 'Physics, Chemistry, Biology' };
    if (lowerClass.includes('11') && (lowerStream.includes('com') || lowerStream.includes('acc'))) return { icon: Coins, iconColor: 'text-amber-600', iconBg: 'bg-amber-50', title: 'Class 11 - Commerce (Accounts+BST+Eco)', subtitle: 'Business & Accounting Ledger' };
    if (lowerClass.includes('12') && lowerStream.includes('agri')) return { icon: Leaf, iconColor: 'text-green-600', iconBg: 'bg-green-50', title: 'Class 12 - Agriculture Science', subtitle: 'Agronomy & Soil Dynamics' };
    if (lowerClass.includes('12') && (lowerStream.includes('pcm') || lowerStream.includes('cs'))) return { icon: Monitor, iconColor: 'text-purple-600', iconBg: 'bg-purple-50', title: 'Class 12 - Science (PCM + CS)', subtitle: 'Physics, Chem, Math, Comp Sci' };
    if (lowerClass.includes('12') && (lowerStream.includes('human') || lowerStream.includes('art'))) return { icon: Landmark, iconColor: 'text-rose-600', iconBg: 'bg-rose-50', title: 'Class 12 - Humanities & Arts', subtitle: 'History, Political Science, Psychology' };

    return { icon: FileText, iconColor: 'text-slate-600', iconBg: 'bg-slate-100', title: className + (stream ? ` - ${stream}` : ''), subtitle: 'General Curriculum' };
  };

  const getGradeStyles = (grade: string) => {
    if (grade.includes('A1+')) return 'bg-emerald-50 text-emerald-700';
    if (grade.includes('A1') || grade.includes('A2')) return 'bg-blue-50 text-blue-600';
    if (grade.includes('B1')) return 'bg-slate-100 text-slate-700';
    if (grade.includes('B2') || grade.includes('C1')) return 'bg-amber-50 text-amber-700';
    return 'bg-rose-50 text-rose-600';
  };

  if (loading) {
     return <div className="p-12 text-center text-slate-500 font-bold">Loading academic ledger...</div>;
  }

  return (
    <div className="bg-[#f8fafc] dark:bg-[#0a0a0a] min-h-screen rounded-[32px] p-4 sm:p-6 space-y-6 pb-24 relative overflow-hidden">
      
      {/* Header Section */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">CBSE Academic Session 2026–27</span>
        </div>
        <h1 className="text-[26px] font-black text-slate-900 dark:text-white mb-1.5 leading-tight">Class-Wise Exam Results &<br/>Marksheets</h1>
        <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed max-w-sm">
          Principal executive oversight: marks verification, statistical moderation, and official digital marksheets ledger.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="relative flex items-center bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-full px-4 py-3 mb-6 shadow-sm">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input 
          type="text" 
          placeholder="Search student, roll number, or class stream..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-[13px] bg-transparent outline-none placeholder:text-slate-400 font-semibold text-slate-900 dark:text-white"
        />
        <div className="w-px h-5 bg-slate-200 dark:bg-neutral-800 mx-3"></div>
        <Filter className="w-4 h-4 text-slate-400 cursor-pointer hover:text-blue-600 transition-colors shrink-0" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">SCHOOL PASS RATE</span>
            <div className="w-6 h-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-md flex items-center justify-center text-emerald-600 dark:text-emerald-400">
               <TrendingUp className="w-3.5 h-3.5"/>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">98.4%</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">+2.1% YoY</span>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">DISTINCTION RATE</span>
            <div className="w-6 h-6 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center justify-center text-blue-600 dark:text-blue-400">
               <Sparkles className="w-3.5 h-3.5"/>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">41.2%</span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">200+ Stud.</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-8">
        <button onClick={handleDownloadMasterLedger} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[13px] shadow-sm transition-all">
           <Download className="w-4 h-4"/> Download Master Ledger
        </button>
        <button className="px-5 sm:px-8 border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-500 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[13px] hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all">
           <Lock className="w-4 h-4"/> Lock CBSE
        </button>
      </div>

      {/* Class Groupings */}
      {Object.entries(classGroups).length === 0 ? (
        <div className="text-center p-10 bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800">
            <p className="text-slate-500 font-semibold text-sm">No exam data synced yet. Ensure teachers have pushed marks from their portals.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(classGroups).map(([key, results]) => {
             const [className, stream] = key.split('::');
             const { icon: GroupIcon, iconColor, iconBg, title, subtitle } = getGroupDetails(className, stream);

             return (
               <div key={key} className="bg-white dark:bg-[#111] border border-slate-200 dark:border-neutral-800 rounded-[28px] overflow-hidden shadow-sm">
                 {/* Group Header */}
                 <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 ${iconBg} rounded-2xl flex items-center justify-center`}>
                          <GroupIcon className={`w-5 h-5 ${iconColor}`} />
                       </div>
                       <div>
                          <h3 className="text-[13px] font-black text-slate-900 dark:text-white leading-tight">{title}</h3>
                          <p className="text-[11px] font-medium text-slate-500 mt-0.5">{subtitle}</p>
                       </div>
                    </div>
                    <span className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap">
                       {results.length} Students
                    </span>
                 </div>

                 {/* Group Table/List */}
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-neutral-900/50">
                           <th className="py-3 px-5 text-[10px] font-bold text-slate-400 tracking-wider w-16">ROLL</th>
                           <th className="py-3 px-2 text-[10px] font-bold text-slate-400 tracking-wider">STUDENT NAME</th>
                           <th className="py-3 px-2 text-[10px] font-bold text-slate-400 tracking-wider text-center">SCORE / GRADE</th>
                           <th className="py-3 px-2 text-[10px] font-bold text-slate-400 tracking-wider text-center">STATUS</th>
                           <th className="py-3 px-5 text-[10px] font-bold text-slate-400 tracking-wider text-right">MARKSHEET</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((res, idx) => {
                           const gradePillStyle = getGradeStyles(res.grade);
                           const isVerified = res.isVerified;
                           // Mock roll padding
                           const rollFormatted = `#${res.student.rollNo?.toString().padStart(2, '0') || String(idx + 1).padStart(2, '0')}`;
                           
                           return (
                             <tr key={res.student.studentId} className="border-t border-slate-100 dark:border-neutral-800/50 group hover:bg-slate-50/50 dark:hover:bg-neutral-900/20 transition-colors">
                                <td className="py-4 px-5 text-[11px] font-black text-slate-400 font-mono align-middle">
                                   {rollFormatted}
                                </td>
                                <td className="py-4 px-2 align-middle">
                                   <p className="text-[13px] font-black text-slate-900 dark:text-white">{res.student.name}</p>
                                   <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{res.student.studentId}</p>
                                </td>
                                <td className="py-4 px-2 align-middle text-center">
                                   <div className="flex items-center justify-center gap-2">
                                      <span className="text-[13px] font-black text-slate-900 dark:text-white">{res.percentage.toFixed(1)}%</span>
                                      <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-black ${gradePillStyle}`}>{res.grade}</span>
                                   </div>
                                </td>
                                <td className="py-4 px-2 align-middle text-center">
                                   <span className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-bold ${isVerified ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20' : 'bg-slate-100 text-slate-600 dark:bg-neutral-800'}`}>
                                      {isVerified ? 'Verified' : 'Pending'}
                                   </span>
                                </td>
                                <td className="py-4 px-5 align-middle text-right">
                                   <button className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-neutral-700 rounded-[8px] text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors">
                                      <Download className="w-3 h-3" /> PDF
                                   </button>
                                </td>
                             </tr>
                           )
                        })}
                      </tbody>
                   </table>
                 </div>
               </div>
             )
          })}
        </div>
      )}

      {/* Footer Signature */}
      <div className="mt-8 bg-[#0f172a] text-white rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
         <div className="flex items-start gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
               <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
               <h4 className="text-[13px] font-black tracking-wide text-white mb-1">Direct Teacher-to-Student Sync Enabled</h4>
               <p className="text-[10px] text-blue-200/70 font-medium">Marks are instantly delivered to students. Real-time principal oversight mode. <span className="font-mono text-blue-300">#SX-2026-CBSE-READ-ONLY</span></p>
            </div>
         </div>
         <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto relative z-10 border-t border-white/10 sm:border-0 pt-4 sm:pt-0">
            <span className="text-[11px] font-medium text-slate-400">Dr. D. Sachdeva (Principal)</span>
            <span className="px-5 py-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-[11px] font-bold shadow-lg">
               Monitoring Mode Active
            </span>
         </div>
         
         {/* Subtle background decoration */}
         <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

    </div>
  );
};
