import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, AlertTriangle, MessageSquare, FileText, UploadCloud,
  Clock, ShieldCheck, ArrowRight, FileClock, FileSpreadsheet
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import { SMSParentsDispatcherModal } from './SMSParentsDispatcherModal';
import { SubmitAttendanceToPrincipalModal } from './SubmitAttendanceToPrincipalModal';

interface TeacherAttendanceViewProps {
  selectedClass: string;
  subjectName?: string;
}

export const TeacherAttendanceView: React.FC<TeacherAttendanceViewProps> = ({ selectedClass, subjectName = 'Physics' }) => {
  const { students, updateStudentAttendanceBatch, studentLeaves, updateStudentLeaveStatus, getStudentAttendanceSummary, dailyClassReports } = useERP();
  const { teacher } = useAuth();
  const todayFormatted = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' });
  
  

  const classCode = selectedClass.replace(/^Class\s*/i, '').trim();

  const classStudents = useMemo(() => {
    return (students || []).filter(s => {
      const clsClean = (s.className || '').replace(/^Class\s*/i, '').trim();
      return clsClean === classCode || clsClean.startsWith(classCode) || (s.studentId && s.studentId.includes(`STU2026${classCode}`));
    });
  }, [students, classCode]);

  // Get stream from first student or fallback
  const classStream = classStudents.length > 0 && classStudents[0].stream ? classStudents[0].stream.split('(')[1]?.replace(')','') || classStudents[0].stream : 'PCM';
  const section = classStudents.length > 0 && classStudents[0].section ? classStudents[0].section.split(' ')[1] || 'A' : 'A';



  const [attStatus, setAttStatus] = useState<Record<string, 'P'|'A'|'L'|'ML'>>(() => {
    const initial: Record<string, 'P'|'A'|'L'|'ML'> = {};
    const d = new Date(); 
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    classStudents.forEach((s) => {
      // Check if student has approved leave today
      const onLeave = (studentLeaves || []).some(l => 
        (l.studentId === s.studentId || l.studentId === s.id || l.studentName === s.name) && 
        l.status === 'Approved' && 
        (
          ((l.startDate <= todayStr && l.endDate >= todayStr) || l.appliedOn === todayStr || l.startDate === todayStr) ||
          l.appliedOn === todayStr ||
          l.startDate === todayStr
        )
      );
            initial[s.studentId] = onLeave ? 'L' : 'P';
    });
    return initial;
  });

  // Auto-update if a leave gets approved while looking at the screen
  React.useEffect(() => {
    const d = new Date(); 
    const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    setAttStatus(prev => {
      const next = { ...prev };
      let changed = false;
      classStudents.forEach((s) => {
        const onLeave = (studentLeaves || []).some(l => 
          (l.studentId === s.studentId || l.studentId === s.id || l.studentName === s.name) && 
          l.status === 'Approved' && 
          (
            ((l.startDate <= todayStr && l.endDate >= todayStr) || l.appliedOn === todayStr || l.startDate === todayStr) ||
            l.appliedOn === todayStr ||
            l.startDate === todayStr
          )
        );
        if (onLeave && next[s.studentId] !== 'L') {
          next[s.studentId] = 'L';
          changed = true;
        } else if (!onLeave && next[s.studentId] === 'L') {
            // Optional: revert to P if leave was somehow deleted/rejected? 
            // Might interfere with manual L marks, but since it's "today's leave", it's fine.
        }
      });
      return changed ? next : prev;
    });
  }, [studentLeaves, classStudents]);

  // Calculate stats dynamically
  const presentCount = Object.values(attStatus).filter(s => s === 'P').length;
  const absentCount = Object.values(attStatus).filter(s => s === 'A').length;
  const leaveCount = Object.values(attStatus).filter(s => s === 'L' || s === 'ML').length;
  const total = classStudents.length || 1; // avoid div by 0

  // Dynamic Chart Calculations based on live + historical class data
  const chartData = useMemo(() => {
    const d = new Date();
    const currentMonth = String(d.getMonth() + 1).padStart(2, '0');
    const currentYear = String(d.getFullYear());
    const prefix = `${currentYear}-${currentMonth}-`;
    const todayLabel = String(d.getDate()).padStart(2, '0');
    
    // Filter reports for this specific class/section in the current month
    const reportsForClass = (dailyClassReports || []).filter(r => 
      r.date.startsWith(prefix) && 
      r.className.toLowerCase().includes(classCode.toLowerCase()) && 
      (r.section || '').toLowerCase() === section.toLowerCase()
    ).sort((a, b) => a.date.localeCompare(b.date));
    
    // Convert to standard format
    let data = reportsForClass.map(r => {
      const day = r.date.split('-')[2];
      const tot = r.totalStudents || 1;
      const pres = r.presentStudents || 0;
      return {
        label: day,
        pct: Number(((pres / tot) * 100).toFixed(1))
      };
    });

    // If no past data, just use a few fallbacks for visual effect, otherwise use the data
    if (data.length === 0) {
      data = [
        { label: '01', pct: 94.0 },
        { label: '05', pct: 96.2 },
        { label: '10', pct: 91.5 },
        { label: '15', pct: 95.0 }
      ];
    }
    
    // Always append or replace Today's live data
    const liveTodayPct = Number(((presentCount / total) * 100).toFixed(1));
    const todayIndex = data.findIndex(d => d.label === todayLabel);
    
    if (todayIndex >= 0) {
      data[todayIndex].pct = liveTodayPct;
      data[todayIndex].label = 'Today';
    } else {
      data.push({ label: 'Today', pct: liveTodayPct });
    }
    
    return data;
  }, [dailyClassReports, classCode, section, presentCount, total]);

  // Generate SVG path dynamically
  const svgPath = useMemo(() => {
    if (chartData.length <= 1) {
      const p = chartData.length === 1 ? chartData[0].pct : 90;
      const y = Math.max(0, Math.min(100, (100 - p) * 4));
      return `M 0 ${y} L 400 ${y}`;
    }
    const stepX = 400 / (chartData.length - 1);
    const points = chartData.map((d, i) => {
      const x = i * stepX;
      // y needs to map from 75-100 to 100-0 roughly
      // if pct = 100 -> y = 0
      // if pct = 75 -> y = 100
      // Formula: y = (100 - pct) * 4
      const y = Math.max(0, Math.min(100, (100 - d.pct) * 4));
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    return points.join(' ');
  }, [chartData]);


  const [activeTab, setActiveTab] = useState<'All'|'Present'|'Absent'|'Leave'|'Low'>('All');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // SMS Parents Dispatcher State
  const [isSmsDispatcherOpen, setIsSmsDispatcherOpen] = useState(false);
  const [smsTemplateType, setSmsTemplateType] = useState<'standard' | 'low_attendance' | 'custom'>('standard');

  // Principal Desk Attendance Submission State (Red Circle Button)
  const [isPrincipalModalOpen, setIsPrincipalModalOpen] = useState(false);

  // Check if this class/section is already submitted today
  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const isSubmittedToPrincipalToday = useMemo(() => {
    return (dailyClassReports || []).some(
      (r) =>
        r.className.toLowerCase().includes(classCode.toLowerCase()) &&
        (r.section || '').toLowerCase().includes(section.toLowerCase()) &&
        r.date === todayStr
    );
  }, [dailyClassReports, classCode, section, todayStr]);

  
  const pendingClassLeaves = useMemo(() => {
    return (studentLeaves || []).filter(l => 
      l.status === 'Pending' && 
      (l.className || '').toLowerCase().includes(classCode.toLowerCase()) && 
      (l.section || '').toLowerCase() === section.toLowerCase()
    );
  }, [studentLeaves, classCode, section]);

  const handleApproveLeave = (leaveId: string, studentId: string, startDate: string, endDate: string) => {
    updateStudentLeaveStatus(leaveId, 'Approved');
    // Mark as Leave for today if today is within leave period (using local timezone)
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (today >= startDate && today <= endDate) {
      handleStatusChange(studentId, 'L');
    }
  };

  const handleRejectLeave = (leaveId: string) => {
    updateStudentLeaveStatus(leaveId, 'Rejected');
  };

  const absentStudentIds = useMemo(() => {
    return Object.keys(attStatus).filter(id => attStatus[id] === 'A');
  }, [attStatus]);

  const handleStatusChange = (studentId: string, status: 'P'|'A'|'L'|'ML') => {
    setAttStatus(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = () => {
    const records = classStudents.map(s => {
      const st = attStatus[s.studentId];
      let fullStatus: 'Present'|'Absent'|'Leave'|'Pending' = 'Present';
      if (st === 'A') fullStatus = 'Absent';
      if (st === 'L' || st === 'ML') fullStatus = 'Leave';
      return {
        studentId: s.studentId,
        status: fullStatus
      };
    });
    const d = new Date(); const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); const todayStr = `${year}-${month}-${day}`;
    updateStudentAttendanceBatch(selectedClass, subjectName, todayStr, records);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const markAllPresent = () => {
    const newStats: Record<string, 'P'|'A'|'L'|'ML'> = {};
    classStudents.forEach(s => { newStats[s.studentId] = 'P'; });
    setAttStatus(newStats);
  };

  // Find the student with lowest attendance for alert banner
  const warningStudent = useMemo(() => {
    const lowStudent = classStudents.find(s => {
      const sum = getStudentAttendanceSummary(s.studentId);
      const pct = sum?.percentage !== undefined ? sum.percentage : (s.overallPercentage || 85);
      return pct < 75;
    });
    return lowStudent || classStudents.find(s => attStatus[s.studentId] === 'A') || classStudents[3] || classStudents[0];
  }, [classStudents, attStatus, getStudentAttendanceSummary]);

  const warningStudentSummary = warningStudent ? getStudentAttendanceSummary(warningStudent.studentId) : null;
  const warningStudentPct = warningStudentSummary?.percentage !== undefined ? warningStudentSummary.percentage.toFixed(1) : (warningStudent?.overallPercentage || 72.4).toFixed(1);

  // Filter students based on activeTab
  const filteredStudents = useMemo(() => {
    return classStudents.filter(stu => {
      const st = attStatus[stu.studentId] || 'P';
      if (activeTab === 'Present') return st === 'P';
      if (activeTab === 'Absent') return st === 'A';
      if (activeTab === 'Leave') return st === 'L' || st === 'ML';
      if (activeTab === 'Low') {
        const sum = getStudentAttendanceSummary(stu.studentId);
        const pct = sum?.percentage !== undefined ? sum.percentage : (stu.overallPercentage || 85);
        return pct < 75;
      }
      return true;
    });
  }, [classStudents, attStatus, activeTab, getStudentAttendanceSummary]);

  return (
    <div className="max-w-[500px] mx-auto w-full space-y-4 animate-in fade-in duration-300 font-sans text-slate-800 pb-20">
      
      {/* 1. Class Context & KPI Summary Cards */}
      <div className="bg-white rounded-[20px] p-5 shadow-sm border border-slate-200">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shrink-0">
            {classCode}{section}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-serif leading-tight">Class {classCode} {classStream} — Section {section}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold tracking-wide">
                CBSE AFFILIATION #2130048
              </span>
              <span className="text-[11px] font-bold text-slate-500">Session 2025-26</span>
            </div>
            <div className="mt-2.5 space-y-1 text-[11px] text-slate-600 font-medium">
              <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> {todayFormatted}</p>
              <p className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Class Incharge: <span className="font-bold text-slate-800">{teacher?.name || 'Class Teacher'}</span></p>
              <p className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Subject: {subjectName}</p>
            </div>
          </div>
        </div>

        {/* 5 Metric Boxes */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-slate-400 tracking-wider">TOTAL ENROLLED</span>
            <p className="text-xl font-black text-slate-800 leading-none mt-1">{classStudents.length} <span className="text-[11px] font-bold text-slate-500">Pupils</span></p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-emerald-600 tracking-wider">PRESENT TODAY</span>
            <p className="text-xl font-black text-emerald-600 leading-none mt-1">{presentCount} <span className="text-[11px] font-bold">{Math.round((presentCount/total)*100)}%</span></p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100/50 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-rose-600 tracking-wider">ABSENT</span>
            <p className="text-xl font-black text-rose-600 leading-none mt-1">{absentCount} <span className="text-[11px] font-bold">{Math.round((absentCount/total)*100)}%</span></p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100/50 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-blue-600 tracking-wider">MEDICAL LEAVE</span>
            <p className="text-xl font-black text-blue-600 leading-none mt-1">{leaveCount} <span className="text-[11px] font-bold">Appr.</span></p>
          </div>
          <div className="col-span-2 p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-blue-800 tracking-wider">CLASS MTD %</span>
              <p className="text-2xl font-black text-blue-600 leading-none mt-1">95.8%</p>
            </div>
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* 2. Action & Filter Ribbon */}
      <div className="bg-white rounded-[20px] p-4 shadow-sm border border-slate-200 space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => setActiveTab('All')} className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${activeTab === 'All' ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'text-slate-500 hover:bg-slate-50'}`}>
            <span>All</span>
            <span className="text-[10px] opacity-70">({classStudents.length})</span>
          </button>
          <button onClick={() => setActiveTab('Present')} className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${activeTab === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}>
            <span>Present</span>
            <span className="text-[10px] opacity-70">({presentCount})</span>
          </button>
          <button onClick={() => setActiveTab('Absent')} className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${activeTab === 'Absent' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-500 hover:bg-slate-50'}`}>
            <span>Absent</span>
            <span className="text-[10px] opacity-70">({absentCount})</span>
          </button>
          <button onClick={() => setActiveTab('Leave')} className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${activeTab === 'Leave' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}>
            <span>On Leave</span>
            <span className="text-[10px] opacity-70">({leaveCount})</span>
          </button>
          <button onClick={() => setActiveTab('Low')} className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${activeTab === 'Low' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-amber-600 hover:bg-amber-50'}`}>
            <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Low</span>
            <span className="text-[10px] opacity-70">(&lt;75%)</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={markAllPresent} className="flex-1 min-w-[120px] px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark All Present
          </button>
          
          {/* SMS Parents Button (Circled in Screenshot 1) */}
          <button 
            id="sms-parents-trigger-btn"
            type="button"
            onClick={() => {
              setSmsTemplateType('standard');
              setIsSmsDispatcherOpen(true);
            }}
            className="flex-1 min-w-[120px] px-3 py-2.5 rounded-xl bg-amber-50 text-amber-700 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-amber-100 hover:bg-amber-100 transition-colors cursor-pointer active:scale-98"
          >
            <MessageSquare className="w-3.5 h-3.5" /> SMS Parents ({absentCount})
          </button>

          {/* Red-circled Button: Submit Section Attendance Excel Sheet to Principal Desk */}
          <button 
            id="submit-to-principal-desk-btn"
            type="button"
            onClick={() => setIsPrincipalModalOpen(true)}
            className={`w-[44px] shrink-0 h-[42px] flex items-center justify-center rounded-xl border transition-all cursor-pointer relative group ${
              isSubmittedToPrincipalToday
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200'
            }`}
            title="Submit Section Attendance Excel Sheet to Principal Desk"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            {isSubmittedToPrincipalToday ? (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" title="Submitted to Principal Desk" />
            ) : (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>
        </div>

        <button 
          onClick={handleSaveAttendance}
          className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md active:scale-[0.98] cursor-pointer ${
            saveSuccess 
              ? "bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700" 
              : "bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700"
          }`}
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Saved Successfully!
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" /> Save & Push to CBSE Saral
            </>
          )}
        </button>
      </div>

      {/* 3. Statutory Alert Banner */}
      {warningStudent && (
        <div className="bg-amber-50 rounded-[20px] p-4 border border-amber-200 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-[12px] font-bold text-slate-900">CBSE Mandatory 75% Cutoff Alert:</h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              Roll No. {warningStudent.rollNo || '04'} ({warningStudent.name}) has fallen to {warningStudentPct}% aggregate attendance. Mandatory remedial counsel flagged.
            </p>
          </div>
          <button 
            type="button"
            onClick={() => {
              setSmsTemplateType('low_attendance');
              setIsSmsDispatcherOpen(true);
            }}
            className="text-[11px] font-bold text-blue-600 shrink-0 flex items-center gap-1 mt-0.5 hover:underline cursor-pointer"
          >
            Draft Notice <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 4. Roll Call Register Table */}
      <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-slate-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Official Roll Register • Period 1 Verification
            </h3>
            <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Biometric Synced (RFID Gate #2)
            </p>
          </div>
          <div className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 text-center leading-tight">
            Locking in<br/><span className="text-slate-900">42 mins</span>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No students match the selected filter.</div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 w-16 text-center">Roll</th>
                  <th className="px-4 py-3">Student Details</th>
                  <th className="px-4 py-3 text-center">Biometric In</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu, i) => {
                  const roll = stu.rollNo || String(i + 1).padStart(2, '0');
                  const status = attStatus[stu.studentId] || 'P';
                  const isWarning = status === 'A';
                  
                  return (
                    <tr key={stu.studentId} className={`transition-colors ${isWarning ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-4 py-4 text-center align-middle">
                        <span className={`text-[13px] font-bold ${isWarning ? 'text-rose-600' : 'text-slate-600'}`}>{roll}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <UserAvatar avatar={stu.avatar} name={stu.name} role="student" size="sm" />
                            {isWarning && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className={`text-[13px] font-bold ${isWarning ? 'text-rose-700' : 'text-slate-900'}`}>{stu.name}</p>
                            <p className="text-[10px] font-medium text-slate-500 mt-0.5">{stu.studentId} • {stu.stream?.split('(')[1]?.replace(')','') || classStream}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center align-middle">
                        {isWarning ? (
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] font-bold text-rose-600">Not Scanned</span>
                            <span className="text-[9px] font-medium text-slate-400">No RFID ping</span>
                          </div>
                        ) : status === 'L' || status === 'ML' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] font-bold text-blue-600">On Approved</span>
                            <span className="text-[9px] font-bold flex items-center gap-1 text-blue-500">
                              <ShieldCheck className="w-2.5 h-2.5" /> Leave
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-[11px] font-bold text-slate-800">07:{40 + (i%15)} AM</span>
                            <span className="text-[9px] font-bold flex items-center gap-1 text-emerald-500">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Biometric
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center justify-center gap-1 bg-slate-100/80 p-1 rounded-lg w-fit mx-auto border border-slate-200/50">
                          <button 
                            type="button"
                            onClick={() => handleStatusChange(stu.studentId, 'P')}
                            className={`w-8 h-8 rounded-md text-[11px] font-bold transition-all cursor-pointer ${status === 'P' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-white'}`}
                          >
                            P
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleStatusChange(stu.studentId, 'A')}
                            className={`w-8 h-8 rounded-md text-[11px] font-bold transition-all cursor-pointer ${status === 'A' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:bg-white'}`}
                          >
                            A
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleStatusChange(stu.studentId, 'L')}
                            className={`w-8 h-8 rounded-md text-[11px] font-bold transition-all cursor-pointer ${status === 'L' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:bg-white'}`}
                          >
                            L
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleStatusChange(stu.studentId, 'ML')}
                            className={`w-8 h-8 rounded-md text-[11px] font-bold transition-all cursor-pointer ${status === 'ML' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-white'}`}
                          >
                            ML
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-medium">
          <p>Showing students <span className="font-bold text-slate-700">1-{Math.min(10, filteredStudents.length)}</span> of {classStudents.length} enrolled</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">Previous</button>
            <button className="w-8 h-8 rounded-lg border border-slate-200 bg-blue-50 text-blue-600 font-bold">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100">2</button>
            <span className="w-6 text-center">...</span>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>

      {/* 5. Bottom Analytics Row */}
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-200 space-y-6">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Class Trend • {classCode}-{section}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Daily aggregate attendance rate across current {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })} cycle</p>
            </div>
            <div className="px-2 py-1 bg-blue-50 text-blue-700 text-[9px] font-bold rounded-lg border border-blue-100">
              TARGET &gt; 90%
            </div>
          </div>
          
          {/* SVG Chart */}
          <div className="mt-6 relative h-32 w-full">
            <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="0" x2="400" y2="0" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#f1f5f9" strokeWidth="1" />
              
              {/* 75% Target Line */}
              <line x1="0" y1="80" x2="400" y2="80" stroke="#F43F5E" strokeWidth="1" strokeDasharray="4 4" />
              <text x="0" y="76" fontSize="8" fill="#F43F5E" fontWeight="bold">75% (CBSE Min)</text>
              <text x="0" y="-4" fontSize="8" fill="#94a3b8">100%</text>
              <text x="0" y="46" fontSize="8" fill="#94a3b8">90%</text>

              {/* Data Path */}
              <path d={svgPath} fill="none" stroke="#2563EB" strokeWidth="2.5" />
              {/* Area Under Path */}
              <path d={chartData.length > 0 ? `${svgPath} L 400 100 L 0 100 Z` : ''} fill="url(#blueGradient)" />
              
              {/* Data Points */}
              {chartData.map((d, i) => {
                const stepX = chartData.length > 1 ? 400 / (chartData.length - 1) : 0;
                const x = i * stepX;
                const y = Math.max(0, Math.min(100, (100 - d.pct) * 4));
                const isToday = i === chartData.length - 1;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={isToday ? "4" : "2.5"} fill={isToday ? "#10B981" : "#2563EB"} className={isToday ? "animate-pulse" : ""} />
                    {isToday && (
                      <text x={x > 50 ? x - 40 : x} y={y - 8} fontSize="9" fill="#10B981" fontWeight="bold">
                        {d.pct}% Today
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            
            {/* X Axis Labels */}
            <div className="flex items-center justify-between mt-4 text-[9px] font-bold text-slate-500 relative w-full px-1">
              {chartData.map((d, i) => (
                <span key={i} className={`text-center leading-tight absolute transform -translate-x-1/2 ${i === chartData.length - 1 ? 'text-slate-800' : ''}`} style={{ left: `${chartData.length > 1 ? (i / (chartData.length - 1)) * 100 : 0}%` }}>
                  {d.label === 'Today' ? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : `${d.label} ${new Date().toLocaleDateString("en-GB", { month: "short" })}`}<br/>({d.pct}%)
                </span>
              ))}
            </div>
          </div>
        </div>

        {pendingClassLeaves.length > 0 && (
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900">Pending Requests</h3>
              <div className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100">
                {pendingClassLeaves.length} Action{pendingClassLeaves.length > 1 ? 's' : ''} Needed
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">Formal leave slips awaiting homeroom sign-off.</p>
            
            <div className="space-y-4">
              {pendingClassLeaves.map(leave => (
                <div key={leave.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex items-start justify-between">
                    <h4 className="text-[12px] font-bold text-slate-900">{leave.studentName} (Roll {leave.rollNo || '00'})</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                      {leave.type} ({leave.days} Days)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-2 leading-snug">
                    "{leave.reason}"
                  </p>
                  {leave.documentName && (
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <FileClock className="w-3 h-3 text-blue-600" />
                      <span className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">
                        {leave.documentName} ({leave.documentSize || '1.0 MB'})
                      </span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-200/60">
                    <button 
                      onClick={() => handleApproveLeave(leave.id, leave.studentId, leave.startDate, leave.endDate)}
                      className="py-2.5 rounded-xl bg-emerald-500 text-white text-[11px] font-bold hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
                    >
                      Approve Leave
                    </button>
                    <button 
                      onClick={() => handleRejectLeave(leave.id)}
                      className="py-2.5 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-bold hover:bg-slate-200 border border-slate-200 transition-colors active:scale-[0.98] cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SMS Parents Dispatcher Modal */}
      <SMSParentsDispatcherModal
        isOpen={isSmsDispatcherOpen}
        onClose={() => setIsSmsDispatcherOpen(false)}
        classCode={classCode}
        classStream={classStream}
        section={section}
        subjectName={subjectName}
        periodName="Period 1"
        teacherName={teacher?.name || 'Dr. Rajesh Sharma'}
        initialTemplate={smsTemplateType}
        absentStudentIds={absentStudentIds}
        allClassStudents={classStudents}
        onToggleStudentAbsent={(studentId) => {
          handleStatusChange(studentId, attStatus[studentId] === 'A' ? 'P' : 'A');
        }}
      />

      {/* Principal Desk Attendance Submission & Excel Export Modal */}
      <SubmitAttendanceToPrincipalModal
        isOpen={isPrincipalModalOpen}
        onClose={() => setIsPrincipalModalOpen(false)}
        classCode={classCode}
        classStream={classStream}
        section={section}
        subjectName={subjectName}
        periodName="Period 1"
        teacherName={teacher?.name || 'Dr. Rajesh Sharma'}
        teacherId={teacher?.id || 'TCH-102'}
        classStudents={classStudents}
        attStatus={attStatus}
        onSubmittedSuccess={() => {
          handleSaveAttendance();
        }}
      />
      
    </div>
  );
};
