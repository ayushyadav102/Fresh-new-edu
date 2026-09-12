import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { subscribeToStudentMarks, ExamMark } from '../../services/examService';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { Award, Printer, Download, CheckCircle2, ShieldCheck, FileSpreadsheet, Lock, Check, Sparkles, AlertTriangle, ArrowLeftRight, Info, Trophy } from 'lucide-react';
import { calculateGrade } from '../../utils/gradeUtils';

export const ResultsScreen: React.FC = () => {
  const { student } = useAuth();
  const [selectedSem, setSelectedSem] = useState<string>('Term 1 (Unit & Mid)');
  const [allMarks, setAllMarks] = useState<ExamMark[]>([]);
  const [availableTerms, setAvailableTerms] = useState<string[]>(['Term 1 (Unit & Mid)', 'Term 2 (Pre-Board)']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student) return;
    setLoading(true);
    const unsubscribe = subscribeToStudentMarks(student.studentId, undefined, (fetchedMarks) => {
       setAllMarks(fetchedMarks);
       
       const uniqueTerms = Array.from(new Set(fetchedMarks.map(m => m.term).filter(Boolean))) as string[];
       if (uniqueTerms.length > 0) {
           setAvailableTerms(uniqueTerms);
           setSelectedSem(prev => uniqueTerms.includes(prev) ? prev : uniqueTerms[0]);
       }
       setLoading(false);
    });
    return () => unsubscribe();
  }, [student]);

  const marks = allMarks.filter(m => (m.term || 'Unscheduled') === selectedSem);
  const verifiedMarks = marks.filter(m => m.isPublished === true || m.status === 'Approved' || m.status === 'Verified' || m.status === 'Retest Needed');
  const totalObtainedMarks = verifiedMarks.reduce((sum, s) => sum + (s.totalMarks || 0), 0);
  const totalMaxMarks = verifiedMarks.reduce((sum, s) => sum + ((s.theoryMax !== undefined ? s.theoryMax : 70) + (s.internalMax !== undefined ? s.internalMax : 30)), 0);
  const termPercentage = totalMaxMarks > 0 ? ((totalObtainedMarks / totalMaxMarks) * 100).toFixed(1) : '0.0';
  
  let overallGrade = 'N/A';
  if (totalMaxMarks > 0) {
      overallGrade = calculateGrade(totalObtainedMarks, totalMaxMarks);
  }

  const handleDownloadMarksheet = () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text("ST. XAVIER'S SENIOR SECONDARY SCHOOL", 105, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("OFFICIAL CUMULATIVE MARKSHEET & PROGRESS REPORT", 105, 28, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Student Name: ${student?.name}`, 20, 45);
      doc.text(`Roll No: ${student?.rollNo}`, 20, 52);
      doc.text(`Class: ${student?.className}`, 20, 59);
      doc.text(`Session: 2026-2027`, 110, 45);
      doc.text(`Term: ${selectedSem}`, 110, 52);
      doc.text(`Student ID: ${student?.studentId}`, 110, 59);
      doc.setDrawColor(200);
      doc.line(20, 65, 190, 65);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Score: ${totalObtainedMarks} / ${totalMaxMarks}  (${termPercentage}%)`, 20, 75);
      doc.text(`Grade: ${overallGrade}`, 110, 75);

      const tableData = verifiedMarks.map(sub => [
        sub.subjectName,
        (sub.internalMarks || 0).toString(),
        (sub.theoryMarks || 0).toString(),
        sub.totalMarks.toString(),
        sub.grade || calculateGrade(sub.totalMarks, sub.theoryMax + sub.internalMax)
      ]);

      autoTable(doc, {
        startY: 90,
        head: [['Subject Name', 'Internal', 'Theory', 'Total (100)', 'Grade']],
        body: tableData,
        foot: [['', '', 'Grand Total', `${totalObtainedMarks} / ${totalMaxMarks}`, `${termPercentage}%`]],
        theme: 'grid',
        headStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
        footStyles: { fillColor: [248, 250, 252], textColor: [15, 23, 42], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'center', fontStyle: 'bold' },
          4: { halign: 'center', fontStyle: 'bold', textColor: [21, 128, 61] }
        }
      });
      
      const finalY = (doc as any).lastAutoTable.finalY + 30;
      doc.setDrawColor(100);
      doc.line(30, finalY, 70, finalY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text("CLASS TEACHER", 50, finalY + 5, { align: 'center' });
      doc.line(140, finalY, 180, finalY);
      doc.text("PRINCIPAL / CONTROLLER", 160, finalY + 5, { align: 'center' });
      doc.save(`Marksheet_${student?.studentId || 'Report'}_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Could not generate PDF.');
    }
  };

  const isDistinction = parseFloat(termPercentage) >= 75;

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-10 max-w-[600px] mx-auto w-full text-slate-900 dark:text-white">
      
      {/* Session Active & Student Profile Info Card */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-[24px] border border-slate-200 dark:border-neutral-800 p-5 shadow-sm">
         <div className="flex justify-between items-start mb-5">
            <div>
               <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 rounded-full tracking-wide">Session 2026–2027 Active</span>
               </div>
               <h1 className="text-xl font-black text-slate-900 dark:text-white mb-0.5">{student?.name || 'Student'}</h1>
               <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Roll No: {student?.rollNo} • {student?.className}</p>
            </div>
            <select 
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-neutral-700 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-neutral-900 focus:ring-0 shadow-sm outline-none cursor-pointer"
            >
               {availableTerms.map(term => (
                 <option key={term} value={term}>{term}</option>
               ))}
            </select>
         </div>
         
         <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 dark:bg-neutral-900 rounded-xl p-3 border border-slate-100 dark:border-neutral-800">
               <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">STREAM</p>
               <p className="font-bold text-slate-900 dark:text-white text-[13px]">{student?.stream || 'PCM+CS'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-neutral-900 rounded-xl p-3 border border-slate-100 dark:border-neutral-800">
               <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">STUDENT ID</p>
               <p className="font-bold text-slate-900 dark:text-white text-[13px]">{student?.studentId}</p>
            </div>
            <div className="bg-slate-50 dark:bg-neutral-900 rounded-xl p-3 border border-slate-100 dark:border-neutral-800 relative overflow-hidden">
               <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">EXAM TERM</p>
               <p className="font-bold text-blue-600 dark:text-blue-400 text-[13px] whitespace-nowrap">{selectedSem.split(' ')[0]} Marksheet</p>
            </div>
         </div>
      </div>

      {/* Evaluation Status Card */}
      <div className="bg-[#2D1B69] rounded-[24px] p-5 text-white shadow-lg relative overflow-hidden">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 text-white" />
             </div>
             <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#E0D8FE]">EVALUATION STATUS</h2>
          </div>
          <div className="px-3 py-1 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full text-[10px] font-bold tracking-wide">
             {verifiedMarks.length > 0 ? 'CBSE Verified' : 'Pending'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[#3D2B79] rounded-2xl p-4 border border-[#4D3B89]">
             <p className="text-[#A594F9] text-[11px] font-semibold mb-1">Overall Percentage</p>
             <div className="flex items-baseline gap-1.5 mb-1">
               <h3 className="text-3xl font-black">{termPercentage}%</h3>
               <span className="text-[11px] text-[#A594F9] font-medium">/ 100</span>
             </div>
             <p className="text-[9px] text-teal-400 font-bold flex items-center gap-1">Grade {overallGrade}</p>
          </div>
          <div className="bg-[#3D2B79] rounded-2xl p-4 border border-[#4D3B89]">
             <p className="text-[#A594F9] text-[11px] font-semibold mb-1">Total Marks</p>
             <div className="flex items-baseline gap-1.5 mb-1">
               <h3 className="text-3xl font-black">{totalObtainedMarks}</h3>
               <span className="text-[11px] text-[#A594F9] font-medium">/ {totalMaxMarks || 500}</span>
             </div>
             <p className="text-[9px] text-[#A594F9] font-medium">{verifiedMarks.length} Subjects Evaluated</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-[11px] font-medium px-1">
           <div className="flex items-center gap-1.5">
              {isDistinction ? (
                <>
                  <span className="text-amber-400 text-sm">★</span> 
                  <span className="text-[#E0D8FE]">Excellent Performance (Distinction)</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> 
                  <span className="text-[#E0D8FE]">Good Academic Progress</span>
                </>
              )}
           </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2.5">
        <button onClick={handleDownloadMarksheet} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[11px] font-bold transition-colors shadow-sm">
          <Download className="w-3.5 h-3.5" /> Official Marksheet
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800 text-purple-700 dark:text-purple-400 rounded-full text-[11px] font-semibold transition-colors border border-purple-200 dark:border-purple-900/50 shadow-sm">
          <Printer className="w-3.5 h-3.5" /> CBSE Transcript
        </button>
      </div>

      {/* Subject Wise Breakdown Header */}
      <div className="flex items-center justify-between pt-2 mb-1">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
          SUBJECT WISE BREAKDOWN
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-blue-600 font-bold cursor-pointer hover:underline flex items-center gap-1">
            CBSE Rubric <Info className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Subjects List */}
      <div className="space-y-4">
        {verifiedMarks.length === 0 && !loading ? (
           <div className="text-center p-8 bg-white dark:bg-[#0a0a0a] rounded-[24px] border border-slate-200 dark:border-neutral-800 shadow-sm">
              <p className="text-sm text-slate-500 font-semibold">No evaluated marks available yet for {selectedSem}.</p>
           </div>
        ) : verifiedMarks.map((mark, index) => {
          
          let tMarks = mark.theoryMarks || 0;
          let iMarks = mark.internalMarks || 0;
          let totalScore = mark.totalMarks;
          let grade = mark.grade || calculateGrade(totalScore, (mark.theoryMax ?? 70) + (mark.internalMax ?? 30));

          let circleClass = "bg-white text-blue-700 border border-blue-100 shadow-sm";
          let borderClass = "border-slate-200 dark:border-neutral-800";
          let totalBg = "bg-[#f8faff] border-[#e2e8f0] dark:bg-blue-900/20 dark:border-blue-800";
          let gradePillClass = "bg-blue-600 text-white";
          
          const isHighest = totalScore >= 90;
          const isRetest = mark.status === 'Retest Needed' || totalScore < (0.33 * (mark.theoryMax + (mark.internalMax || 0)));
          
          if (isHighest) {
              circleClass = "bg-amber-100 text-amber-700 border-amber-200";
              borderClass = "border-amber-400";
              totalBg = "bg-amber-50 border-amber-200 dark:bg-amber-900/20";
              gradePillClass = "bg-amber-500 text-white";
          } else if (isRetest) {
              circleClass = "bg-rose-100 text-rose-700 border-rose-200";
              borderClass = "border-rose-200 dark:border-rose-900/50";
              totalBg = "bg-rose-50 border-rose-200 dark:bg-rose-900/20 text-rose-700";
              gradePillClass = "bg-rose-600 text-white";
          }
          
          return (
            <div key={mark.id} className={`bg-white dark:bg-[#0a0a0a] rounded-[24px] border-2 ${borderClass} p-5 shadow-sm relative transition-all`}>
              
              {isHighest && (
                 <div className="absolute -top-3 right-6 px-2.5 py-0.5 bg-amber-400 text-amber-950 text-[9px] font-black uppercase rounded-full shadow-sm flex items-center gap-1 tracking-wider border border-amber-300">
                    <Trophy className="w-2.5 h-2.5" /> EXCELLENCE
                 </div>
              )}
              
              <div className="flex gap-4">
                
                {/* Index Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${circleClass}`}>
                  {(index + 1).toString().padStart(2, '0')}
                </div>

                <div className="flex-1">
                   {/* Subject and Status Header */}
                   <div className="flex justify-between items-start mb-4">
                     <div>
                       <h4 className="text-[15px] font-black text-slate-900 dark:text-white leading-tight">{mark.subjectName}</h4>
                       <p className="text-[10px] text-slate-400 font-mono mt-0.5">Code: {mark.subjectCode} • Evaluated by {mark.teacherId}</p>
                     </div>
                     {!isRetest ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 tracking-wide">
                          <Check className="w-3 h-3" /> Verified
                        </span>
                     ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-full text-[10px] font-bold border border-rose-200 dark:border-rose-800 tracking-wide">
                          <AlertTriangle className="w-3 h-3" /> Retest
                        </span>
                     )}
                   </div>
                   
                   {/* Marks Grid matching dynamic configuration */}
                   <div className="flex items-start gap-3">
                     
                     {(mark.internalMax || 0) > 0 ? (
                       <>
                         {/* Theory */}
                         <div className="flex flex-col flex-1 max-w-[90px]">
                           <label className={`text-[9px] font-black uppercase mb-1.5 tracking-wider ml-1 ${isRetest ? 'text-rose-600' : 'text-slate-500'}`}>
                             THEORY ({mark.theoryMax})
                           </label>
                           <div className={`h-[42px] bg-slate-50 dark:bg-neutral-900 border ${isRetest ? 'border-rose-300' : 'border-[#e2e8f0] dark:border-neutral-700'} rounded-xl flex items-center justify-center overflow-hidden shadow-sm`}>
                             <span className={`text-lg font-black ${isRetest ? 'text-rose-700' : 'text-slate-900 dark:text-white'}`}>{tMarks}</span>
                           </div>
                           {isRetest && (
                             <p className="text-[8px] text-rose-500 font-bold mt-1.5 text-center">&lt; 33% Pass Mark</p>
                           )}
                         </div>
                            
                         {/* Internal */}
                         <div className="flex flex-col flex-1 max-w-[90px]">
                           <label className="text-[9px] font-black uppercase mb-1.5 tracking-wider ml-1 text-slate-500">
                             INTERNAL ({mark.internalMax})
                           </label>
                           <div className="h-[42px] bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                             <span className="text-lg font-black text-slate-900 dark:text-white">{iMarks}</span>
                           </div>
                         </div>
                       </>
                     ) : (
                       /* Single Test Score Field */
                       <div className="flex flex-col flex-1 max-w-[120px]">
                         <label className={`text-[9px] font-black uppercase mb-1.5 tracking-wider ml-1 ${isRetest ? 'text-rose-600' : 'text-slate-500'}`}>
                           TEST SCORE ({mark.theoryMax})
                         </label>
                         <div className={`h-[42px] bg-slate-50 dark:bg-neutral-900 border ${isRetest ? 'border-rose-300' : 'border-[#e2e8f0] dark:border-neutral-700'} rounded-xl flex items-center justify-center overflow-hidden shadow-sm`}>
                           <span className={`text-lg font-black ${isRetest ? 'text-rose-700' : 'text-slate-900 dark:text-white'}`}>{tMarks}</span>
                         </div>
                         {isRetest && (
                           <p className="text-[8px] text-rose-500 font-bold mt-1.5 text-center">&lt; 33% Pass Mark</p>
                         )}
                       </div>
                     )}
                        
                     {/* Total */}
                     <div className="flex flex-col flex-1 max-w-[100px]">
                       <label className={`text-[9px] font-black uppercase mb-1.5 tracking-wider ml-1 ${isRetest ? 'text-rose-600' : 'text-slate-500'}`}>
                         TOTAL (100)
                       </label>
                       <div className={`h-[42px] rounded-xl flex items-center justify-center gap-1.5 border shadow-sm ${totalBg}`}>
                         <span className={`text-lg font-black ${isRetest ? 'text-rose-700' : 'text-slate-900 dark:text-white'}`}>{totalScore}</span>
                         {grade && grade !== 'N/A' && (
                           <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-black tracking-wide ${gradePillClass}`}>
                             {grade}
                           </span>
                         )}
                       </div>
                     </div>
                   </div>

                   {/* Remarks / Footer */}
                   <div className="mt-5 pt-3 border-t border-slate-100 dark:border-neutral-800 flex justify-between items-center">
                     <p className="text-[11px] text-slate-500 dark:text-slate-400 flex-1 truncate pr-2">"{mark.remarks || 'Satisfactory academic performance.'}"</p>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
};
