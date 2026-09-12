import React, { useState } from 'react';
import { Lock, Search, Bell, FileText, CheckCircle, ShieldCheck, ArrowLeft, Building, User, LockKeyhole } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { format } from 'date-fns';

export const PrincipalExamsModule: React.FC = () => {
  const { exams, updateExamItem } = useERP();
  const [activeTab, setActiveTab] = useState<'all' | '10' | '11-a'>('all');

  const pendingExams = exams.filter(e => e.status === 'pending_approval');
  
  // Hardcoded UI items for Master Datesheet as requested
  const staticExams = [
    {
      id: 'ex-1',
      code: '041',
      status: 'Sealed & Gazetted',
      statusColor: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
      borderColor: 'border-l-[6px] border-l-emerald-500',
      date: '10 Mar 2027',
      time: '09:00 - 12:00 PM',
      title: 'Mathematics',
      subtitle: 'Class 10-A & 10-B (Secondary Board)',
      col1Label: 'ROOM ASSIGNMENT',
      col1Value: 'Rooms 301 & 302 (Secondary)',
      col2Label: 'CHIEF INVIGILATORS',
      col2Value: 'Dr. Neha Kapoor & Mrs. Sangeeta'
    },
    {
      id: 'ex-2',
      code: '042',
      status: 'Locked by Principal',
      statusColor: 'text-blue-700 bg-blue-50 border border-blue-200',
      borderColor: 'border-l-[6px] border-l-blue-600',
      date: '12 Mar 2027',
      time: '09:00 - 12:00 PM',
      title: 'Physics (Theory & Practical)',
      subtitle: 'Class 11-A (Science PCM + CS)',
      col1Label: 'HALL LOCATION',
      col1Value: 'Auditorium Hall A (Desk 01-40)',
      col2Label: 'CHIEF INVIGILATOR',
      col2Value: 'Mr. Vikram Singh'
    },
    {
      id: 'ex-3',
      code: '055',
      status: 'Locked by Principal',
      statusColor: 'text-blue-700 bg-blue-50 border border-blue-200',
      borderColor: 'border-l-[6px] border-l-blue-600',
      date: '14 Mar 2027',
      time: '09:00 - 12:00 PM',
      title: 'Accountancy',
      subtitle: 'Class 11-C (Commerce Block)',
      col1Label: 'ROOM ASSIGNMENT',
      col1Value: 'Room 105 (Commerce Wing)',
      col2Label: 'CHIEF INVIGILATOR',
      col2Value: 'Mr. Sanjay Agarwal'
    },
    {
      id: 'ex-4',
      code: '043',
      status: 'Scheduled',
      statusColor: 'text-amber-700 bg-amber-50 border border-amber-200',
      borderColor: 'border-l-[6px] border-l-amber-500',
      date: '15 Mar 2027',
      time: '09:00 - 12:00 PM',
      title: 'Chemistry (Theory)',
      subtitle: 'Class 11-A & 11-B (Science)',
      col1Label: 'HALL / WING',
      col1Value: 'Science Wing 204',
      col2Label: 'INVIGILATOR',
      col2Value: 'Mrs. Sunita Verma'
    },
    {
      id: 'ex-5',
      code: '041',
      status: 'Scheduled',
      statusColor: 'text-amber-700 bg-amber-50 border border-amber-200',
      borderColor: 'border-l-[6px] border-l-amber-500',
      date: '19 Mar 2027',
      time: '09:00 - 12:00 PM',
      title: 'Mathematics',
      subtitle: 'Class 11-A (PCM + CS)',
      col1Label: 'HALL / WING',
      col1Value: 'Auditorium Hall A',
      col2Label: 'INVIGILATOR',
      col2Value: 'Mrs. Sangeeta Sen'
    },
    {
      id: 'ex-6',
      code: '301',
      status: 'Scheduled',
      statusColor: 'text-amber-700 bg-amber-50 border border-amber-200',
      borderColor: 'border-l-[6px] border-l-amber-500',
      date: '22 Mar 2027',
      time: '09:00 - 12:00 PM',
      title: 'English Core',
      subtitle: 'Class 11-A & 11-B Common',
      col1Label: 'HALL / WING',
      col1Value: 'Room 101 (Senior Science Wing)',
      col2Label: 'INVIGILATOR',
      col2Value: 'Mrs. Rekha'
    }
  ];

  const handleRatify = (examId: string) => {
    updateExamItem(examId, { status: 'ratified' });
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 font-sans" id="principal-master-exam-schedule-container">
      
      {/* Top Header */}
      <div className="bg-[#243f7d] pt-4 pb-6 px-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-wide">Master Datesheet & Exams</h1>
              <p className="text-blue-200 text-[11px] font-medium tracking-wide mt-0.5">
                Dr. Arvind Sen • Principal / Head of School
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-white" />
            <div className="relative">
              <Bell className="w-5 h-5 text-white" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full border border-[#243f7d]"></div>
            </div>
            <FileText className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="flex items-center gap-2 pl-10 mt-2">
          <div className="bg-[#38528c] px-3 py-1.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
            CBSE Board Code: 830114
          </div>
          <div className="bg-[#594d3a] px-3 py-1.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 text-amber-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Annual 2026-27 Sealed
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Metrics */}
        <div className="flex gap-2">
          <div className="bg-white rounded-xl p-3 border border-slate-100 flex-1 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">CLASSES</p>
              <Building className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-800 leading-none">12</p>
            <p className="text-[9px] text-emerald-600 font-bold mt-1.5">Class 9 - 12 Sync</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-100 flex-1 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">INVIGILATORS</p>
              <User className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-800 leading-none">24</p>
            <p className="text-[9px] text-slate-500 font-bold mt-1.5">100% Mobilized</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-100 flex-1 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider leading-tight w-[60%]">CONFLICT CHECK</p>
              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 leading-none">0</p>
            <p className="text-[9px] text-emerald-600 font-bold mt-1.5">Zero Overlaps</p>
          </div>
        </div>

        {/* Seal Button */}
        <button className="w-full bg-[#2563eb] text-white rounded-xl py-3.5 font-bold shadow-md flex items-center justify-center gap-2 text-[13px] tracking-wide">
          <LockKeyhole className="w-4 h-4" /> Seal & Publish Master Datesheet to Digilocker & App
        </button>

        {/* Pending Actions */}
        {pendingExams.length > 0 && (
          <div className="bg-[#fffbeb] border border-amber-200 rounded-2xl p-4 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-extrabold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                Immediate Action Required
              </h3>
              <span className="text-[10px] bg-[#fef3c7] text-[#d97706] border border-amber-200 px-2.5 py-0.5 rounded-full font-bold">
                {pendingExams.length} Pending Submission
              </span>
            </div>

            {pendingExams.map(exam => (
              <div key={exam.id} className="bg-white rounded-xl p-3.5 border border-amber-100 flex items-center justify-between gap-3 shadow-sm">
                <div>
                  <h4 className="font-bold text-slate-800 text-[13px]">Class {exam.targetClass} • {exam.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    {exam.type === 'practical' ? 'Practical Matrix' : 'Unit-Test Matrix'} ({exam.marks} M) • Submitted by {exam.createdBy || exam.teacher}
                  </p>
                </div>
                <button 
                  onClick={() => handleRatify(exam.id)}
                  className="bg-[#2563eb] hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
                >
                  Ratify Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 pt-2 pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === 'all'
                ? 'bg-[#2563eb] text-white'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            All (12 Classes)
          </button>
          <button
            onClick={() => setActiveTab('10')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === '10'
                ? 'bg-[#2563eb] text-white'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            Class 10 (Secondary)
          </button>
          <button
            onClick={() => setActiveTab('11-a')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeTab === '11-a'
                ? 'bg-[#2563eb] text-white'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            Class 11-A (PCM)
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
            MASTER BOARD & TERM CALENDAR (2026-27)
          </h3>
          <button className="text-[11px] font-bold text-blue-600 hover:underline">
            Reorder Shifts
          </button>
        </div>

        {/* Exam List */}
        <div className="space-y-3">
          {staticExams.map((exam) => (
            <div key={exam.id} className={`bg-white rounded-xl shadow-sm overflow-hidden ${exam.borderColor}`}>
              <div className="p-4 border border-slate-100 border-l-0 rounded-r-xl">
                
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      Sub Code: {exam.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${exam.statusColor}`}>
                      {exam.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-black text-slate-900">{exam.date}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{exam.time}</p>
                  </div>
                </div>

                <h4 className="text-lg font-black text-slate-900 mt-1">
                  {exam.title}
                </h4>
                <p className="text-[13px] text-[#2563eb] font-semibold mb-4">
                  {exam.subtitle}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{exam.col1Label}</p>
                    <p className="text-[11px] font-bold text-slate-700">{exam.col1Value}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{exam.col2Label}</p>
                    <p className="text-[11px] font-bold text-slate-700">{exam.col2Value}</p>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Hall Capacity & Vault Security */}
        <div className="pt-4 pb-2">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-4 h-4 text-[#2563eb]" />
            <h3 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest">
              HALL CAPACITY & VAULT SECURITY
            </h3>
            <span className="ml-auto text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              CCTV Online
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-bold text-slate-700">Auditorium Hall A</span>
                <span className="text-[11px] font-bold text-slate-500">40 / 50 Desks (80%)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-[#2563eb] h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-bold text-slate-700">Science Wing 204</span>
                <span className="text-[11px] font-bold text-amber-600">38 / 40 Desks (95%)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>

            <div className="bg-slate-100 rounded-xl p-3 flex items-center justify-between border border-slate-200 mt-4">
              <div className="flex items-center gap-2">
                <LockKeyhole className="w-4 h-4 text-emerald-600" />
                <span className="text-[12px] font-semibold text-slate-700">Question Paper Vault: Dual OTP Seal</span>
              </div>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-200 px-3 py-1 rounded">
                Active
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
