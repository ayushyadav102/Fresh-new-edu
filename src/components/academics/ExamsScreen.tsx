import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, User, Download, CheckCircle, ShieldCheck, ShieldAlert, BadgeInfo, Building, MonitorPlay } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { OnlineTestGateway } from './OnlineTestGateway';

export const ExamsScreen: React.FC = () => {
  const { exams } = useERP();
  const { student } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'all' | 'board' | 'internal'>('all');
  const [selectedOnlineTest, setSelectedOnlineTest] = useState<any>(null);

  // Filter exams for student view
  const visibleExams = exams.filter(e => {
    if (!student?.className) return true; // fallback
    const tgt = e.targetClass || '';
    
    if (tgt === 'All') return true;
    
    const tgtNum = tgt.match(/\d+/)?.[0];
    const stdNum = student.className.match(/\d+/)?.[0];
    
    return tgtNum && stdNum && tgtNum === stdNum;
  });
  
  const boardExams = visibleExams.filter(e => e.type === 'board_term');
  const internalExams = visibleExams.filter(e => e.type === 'class_test' || e.type === 'practical');

  const displayedExams = activeTab === 'all' 
    ? visibleExams 
    : activeTab === 'board' 
      ? boardExams 
      : internalExams;

  // Next upcoming exam
  const sortedExams = [...visibleExams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextExam = sortedExams.find(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0));

  const getDaysRemaining = (dateString: string) => {
    const diff = differenceInDays(new Date(dateString), new Date());
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} Days`;
  };

  const handleDownloadAdmitCard = () => {
    if (!student) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text('DIGITAL ADMIT PASS', 105, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('Session 2026-27', 105, 28, { align: 'center' });

    // Student Details Box
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, 35, 182, 35, 3, 3, 'FD');

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`Student Name: ${student.name}`, 20, 45);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Class: ${student.className}`, 20, 55);
    doc.text(`Roll No: 01`, 20, 63);
    
    doc.text(`Adm No: ${student.studentId}`, 120, 45);
    doc.text(`Stream: ${student.stream || 'General'}`, 120, 55);
    doc.text(`Assigned Seat: Hall A, Desk #01`, 120, 63);

    // Exams Table
    const tableData = sortedExams.map(exam => [
      format(new Date(exam.date), 'dd MMM yyyy'),
      exam.time,
      exam.title,
      exam.type === 'board_term' ? 'Board Exam' : exam.type === 'practical' ? 'Practical' : 'Unit Test',
      exam.room,
      exam.teacher || exam.invigilator || 'N/A'
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['Date', 'Time', 'Subject / Title', 'Type', 'Room', 'Invigilator']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    // Barcode / Footer
    const finalY = (doc as any).lastAutoTable.finalY || 80;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('This is a digitally generated admit pass. Scan QR/Barcode at the gate.', 105, finalY + 15, { align: 'center' });
    
    // Simulate barcode text
    doc.setFont('courier', 'bold');
    doc.text(`HT-CBSE-2026-${student.className?.replace(/[^a-zA-Z0-9]/g, '') || '11A'}01-${student.name?.split(' ')[0].toUpperCase()}`, 105, finalY + 25, { align: 'center' });

    doc.save(`${student.name?.replace(/\s+/g, '_')}_Admit_Card.pdf`);
  };

  if (selectedOnlineTest) {
    return <OnlineTestGateway test={selectedOnlineTest} onBack={() => setSelectedOnlineTest(null)} role="student" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="student-exam-schedule-container">
      
      {/* Admit Pass Card */}
      <div className="bg-blue-600 rounded-3xl overflow-hidden shadow-xl shadow-blue-900/20 text-white relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full border-[20px] border-white"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-[20px] border-white"></div>
        </div>
        
        <div className="p-5 sm:p-6 relative z-10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold tracking-wider text-xs sm:text-sm text-blue-100 uppercase">
              <BadgeInfo className="w-5 h-5 text-blue-200" />
              Digital CBSE Admit Pass
            </div>
            <div className="bg-blue-500/50 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-400/50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
              <span className="text-xs font-semibold text-white">CBSE Verified</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl font-black shadow-inner">
                {student?.name?.substring(0,2).toUpperCase() || 'PP'}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{student?.name || 'Piyush Panwar'}</h2>
                <p className="text-blue-100 text-sm font-medium mt-0.5">
                  Roll No: <span className="font-bold text-white">01</span> • <span className="font-bold text-white">{student?.className || 'Class 11-A'}</span> (PCM+CS)
                </p>
                <p className="text-blue-200 text-xs mt-0.5">
                  Adm No: {student?.studentId || 'STU-2026-11A01'}
                </p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center min-w-[120px]">
              <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider mb-1">Assigned Seat</p>
              <p className="text-lg font-black text-white leading-tight">Hall A</p>
              <p className="text-sm font-bold text-blue-100">Desk #01</p>
            </div>
          </div>

          <div 
            className="bg-white rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleDownloadAdmitCard}
            title="Click to Download PDF Slip"
          >
            {/* Mock Barcode */}
            <div className="w-full flex justify-between h-12 opacity-80 mb-1 px-4">
              {[...Array(60)].map((_, i) => (
                <div key={i} className={`bg-slate-900 h-full ${Math.random() > 0.5 ? 'w-1' : 'w-0.5'} ${Math.random() > 0.8 ? 'w-1.5' : ''}`}></div>
              ))}
            </div>
            <p className="text-[9px] font-mono font-bold text-slate-500 tracking-[0.2em]">
              HT-CBSE-2026-{student?.className?.replace(/[^a-zA-Z0-9]/g, '') || '11A'}01-{student?.name?.split(' ')[0].toUpperCase() || 'PANWAR'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-blue-400/30">
            <p className="text-xs text-blue-100 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Gate QR Scanner Ready
            </p>
            <button 
              onClick={handleDownloadAdmitCard}
              className="bg-white text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF Slip
            </button>
          </div>
        </div>
      </div>

      {/* Next Upcoming Exam */}
      {nextExam && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Next:</span>
                <span className="font-bold text-slate-900 dark:text-white text-base">{nextExam.title}</span>
                <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase">
                  {nextExam.type === 'board_term' ? 'Board Term' : nextExam.type === 'practical' ? 'Practical' : 'Unit Test'}
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1 flex items-center gap-3 flex-wrap">
                <span>Teacher: {nextExam.teacher || nextExam.invigilator}</span>
                <span className="hidden sm:inline">•</span>
                <span>Room {nextExam.room}</span>
                <span className="hidden sm:inline">•</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{format(new Date(nextExam.date), 'dd MMM')} • {nextExam.time}</span>
              </div>
            </div>
          </div>
          <div className="text-sm font-black text-amber-700 dark:text-amber-500 bg-amber-100/50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-200/50 dark:border-amber-900/40 whitespace-nowrap text-center">
            {getDaysRemaining(nextExam.date)}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
          }`}
        >
          All Exams ({visibleExams.length})
        </button>
        <button
          onClick={() => setActiveTab('board')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'board'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
          }`}
        >
          Board Directives ({boardExams.length})
        </button>
        <button
          onClick={() => setActiveTab('internal')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'internal'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
          }`}
        >
          Teacher Unit Tests ({internalExams.length})
        </button>
      </div>

      <div className="flex items-center justify-between mt-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Synchronized Datesheet (Session 2026-27)
        </h3>
        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Central Verified
        </span>
      </div>

      {/* Exam List */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-neutral-800 before:to-transparent">
        {displayedExams.length === 0 && (
          <div className="text-center py-10 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm relative z-10 w-full md:w-[calc(50%-2.5rem)] md:mx-auto">
             <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
             <p className="text-sm font-bold text-slate-500">No Exams Scheduled</p>
          </div>
        )}
        {displayedExams.map((exam, index) => {
          const isBoard = exam.type === 'board_term';
          const isPractical = exam.type === 'practical';
          
          return (
            <div key={exam.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#0a0a0a] bg-slate-100 dark:bg-neutral-800 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {isBoard ? <ShieldAlert className="w-4 h-4 text-blue-500" /> : <Calendar className="w-4 h-4 text-purple-500" />}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-[#0a0a0a] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
                
                <div className="flex justify-between items-start mb-3">
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${
                    isBoard 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                      : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                  }`}>
                    {isBoard ? 'Principal Directive • CBSE Term' : isPractical ? 'Department Practical & Viva' : 'Teacher Scheduled • Unit-Test'}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{format(new Date(exam.date), 'dd MMM yyyy')}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{exam.time}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {exam.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                      Sub Code: {exam.code} • {exam.invigilator ? `Invigilator: ${exam.invigilator}` : `Set by: ${exam.teacher}`}
                    </p>
                  </div>
                  <div className="bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 text-xs font-black px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-700">
                    {exam.marks} Marks
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-neutral-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                    <MapPin className="w-3.5 h-3.5" /> {exam.room}
                  </div>
                  <div className="flex items-center gap-2">
                    {exam.status === 'ratified' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Ratified by Principal
                      </span>
                    )}
                    {isBoard && (
                      <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Immutable
                      </span>
                    )}
                    {exam.room?.toLowerCase() === 'online' ? (
                      <button 
                        onClick={() => setSelectedOnlineTest(exam)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <MonitorPlay className="w-3.5 h-3.5" /> Enter Test Online
                      </button>
                    ) : (
                      <button className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1">
                        {isBoard ? 'Rules' : isPractical ? 'Rubric' : 'Blueprint'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer Info */}
      <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30 rounded-2xl p-4 sm:p-5">
        <h4 className="text-sm font-bold text-orange-800 dark:text-orange-500 flex items-center gap-2 mb-3">
          <BadgeInfo className="w-4 h-4" />
          Mandatory Hall Protocol for {student?.className || 'Class 11-A'}:
        </h4>
        <ul className="text-xs text-orange-800/80 dark:text-orange-200/80 space-y-2 list-disc pl-4">
          <li>Entry gates lock at <strong>08:45 AM</strong> strictly. Late entry prohibited.</li>
          <li>Physical Admit Slip or verified phone barcode must be shown at Gate #2.</li>
          <li>Desk <strong>Hall A - 01</strong> is allocated with 1.5m CBSE mandatory spacing.</li>
        </ul>
      </div>

    </div>
  );
};
