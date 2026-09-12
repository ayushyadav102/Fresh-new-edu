import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { DailyClassAttendanceReport, StudentProfile } from '../../types';
import { DEMO_STUDENTS } from '../../data/mockData';
import { downloadOrShareCSV } from '../../utils/fileExportUtils';
import {
  UserCheck,
  Users,
  Download,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Clock,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  FileText,
  X,
  Printer,
  ShieldCheck,
  FileCheck,
  Eye
} from 'lucide-react';

export const PrincipalDailyAttendanceView: React.FC = () => {
  const { dailyClassReports, deleteDailyClassReport, acknowledgeDailyClassReport, students, classes } = useERP();
  const schoolName = "St. Xavier's Senior Secondary School";
  const allStudentsList: StudentProfile[] = students && students.length > 0 ? students : DEMO_STUDENTS;

  const d = new Date(); const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0'); const todayStr = `${year}-${month}-${day}`;
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [classFilter, setClassFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReportForRoster, setSelectedReportForRoster] = useState<DailyClassAttendanceReport | null>(null);
  const [rosterFilter, setRosterFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'LEAVE'>('ALL');
  const [rosterSearch, setRosterSearch] = useState('');

  // Filter reports by date & criteria
  const filteredReports = dailyClassReports.filter((rep) => {
    const matchesDate = selectedDate ? rep.date === selectedDate : true;
    const matchesClass =
      classFilter === 'All'
        ? true
        : rep.className.toLowerCase().includes(classFilter.toLowerCase()) ||
          rep.section.toLowerCase().includes(classFilter.toLowerCase()) ||
          rep.stream.toLowerCase().includes(classFilter.toLowerCase());

    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : rep.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rep.submittedByTeacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rep.stream.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rep.section.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDate && matchesClass && matchesSearch;
  });

  // Calculate high-level summary metrics
  const totalClassesReported = filteredReports.length;
  const totalEnrolledSum = filteredReports.reduce((acc, curr) => acc + (Number(curr.totalStudents) || 0), 0);
  const totalPresentSum = filteredReports.reduce((acc, curr) => acc + (Number(curr.presentStudents) || 0), 0);
  const totalAbsentSum = filteredReports.reduce((acc, curr) => acc + (Number(curr.absentStudents) || 0), 0);
  const totalFacultiesSum = filteredReports.reduce((acc, curr) => acc + (Number(curr.facultiesPresentCount) || 0), 0);
  const overallAvgPct =
    totalEnrolledSum > 0 ? Number(((totalPresentSum / totalEnrolledSum) * 100).toFixed(1)) : 0;

  // Single Class Detailed CSV/Excel Download Handler
  const handleDownloadClassExcel = (report: DailyClassAttendanceReport) => {
    let headers = [
      'Roll No',
      'Student ID',
      'Student Full Name',
      'Class',
      'Stream / Section',
      'Attendance Status',
      'Date',
      'Parent Contact Phone',
      'Father Name',
      'Email Address'
    ];

    let rows: (string | number)[][] = [];

    if (report.studentsDetail && report.studentsDetail.length > 0) {
      headers.push('RFID / In-Time', 'Overall Aggregate %');
      rows = report.studentsDetail.map((stu) => [
        stu.rollNo,
        stu.studentId,
        `"${stu.name}"`,
        `"${report.className}"`,
        `"${report.section || report.stream}"`,
        `"${stu.status}"`,
        report.date,
        `"${stu.parentPhone || ''}"`,
        `"${stu.fatherName || 'Guardian'}"`,
        `"${stu.studentId.toLowerCase()}@stxaviers.edu.in"`,
        `"${stu.inTime || 'N/A'}"`,
        `${stu.overallPercentage || 0}%`
      ]);
    } else {
      const repClsClean = report.className.replace(/^Class\s*/i, '').trim();

      // Match students belonging to this class
      const matchedStudents = allStudentsList.filter((s) => {
        const stuClsClean = s.className.replace(/^Class\s*/i, '').trim();
        return (
          stuClsClean.includes(repClsClean) ||
          repClsClean.includes(stuClsClean) ||
          s.className === report.className
        );
      });

      const studentsToExport = matchedStudents.length > 0 ? matchedStudents : allStudentsList.slice(0, report.totalStudents);

      rows = studentsToExport.map((stu, index) => {
        // Determine status based on present count
        const isPresent = index < report.presentStudents;
        const status = isPresent ? 'Present' : 'Absent';

        return [
          stu.rollNo || (index + 1),
          stu.studentId,
          `"${stu.name}"`,
          `"${stu.className}"`,
          `"${stu.stream || report.stream}"`,
          status,
          report.date,
          `"${stu.parentPhone || ''}"`,
          `"${stu.fatherName || ''}"`,
          `"${stu.email || ''}"`
        ];
      });
    }

    const summaryBlock = [
      [`${(schoolName || "ST. XAVIER'S SENIOR SECONDARY SCHOOL").toUpperCase()} - DAILY SECTION ATTENDANCE REGISTER`],
      [`OFFICIAL PRINCIPAL DESK ARCHIVAL COPY • REFERENCE ID: ${report.id}`],
      [`Report Date: ${report.date}`, `Submission Time: ${report.submissionTime}`],
      [`Class & Section: ${report.className} (${report.section} - ${report.stream})`],
      [`Submitting Teacher: ${report.submittedByTeacherName} (Teacher ID: ${report.teacherId || 'N/A'})`, `Teacher Self Status: ${report.teacherSelfStatus || 'Present in Class'}`],
      [`Subject Taught: ${report.subjectTaught || 'General Session'}`, `Period: ${report.periodTaught || 'Period 1'}`],
      [`Total Class Strength: ${report.totalStudents}`, `Present Students: ${report.presentStudents}`, `Absent Students: ${report.absentStudents}`, `Attendance Rate: ${report.attendancePercentage}%`],
      [`Faculties Present Today (${report.facultiesPresentCount}): ${report.facultiesPresentNames?.join(' | ') || 'All Assigned Subject Faculty'}`],
      [`Remarks / Daily Notes: "${report.remarks || 'Standard academic session'}"`],
      [`Desk Status: ${report.status || 'Verified by Principal Desk'}`],
      [],
      headers
    ];

    const csvContent =
      summaryBlock.map((r) => r.join(',')).join('\n') +
      '\n' +
      rows.map((r) => r.join(',')).join('\n');

    downloadOrShareCSV({
      filename: `Attendance_${report.className.replace(/\s+/g, '_')}_${(report.section || '').replace(/\s+/g, '_')}_${report.date}.csv`,
      title: `Class Attendance - ${report.className} (${report.date})`,
      csvContent
    });
  };

  // Master All Classes Excel / CSV Download Handler
  const handleDownloadAllClassesExcel = () => {
    const headers = [
      'Class Name',
      'Section',
      'Stream',
      'Date',
      'Total Students',
      'Present Students',
      'Absent Students',
      'Attendance Rate (%)',
      'Faculties Present',
      'Submitted By Teacher',
      'Submission Time',
      'Remarks'
    ];

    const rows = filteredReports.map((rep) => [
      `"${rep.className}"`,
      `"${rep.section}"`,
      `"${rep.stream}"`,
      rep.date,
      rep.totalStudents,
      rep.presentStudents,
      rep.absentStudents,
      `${rep.attendancePercentage}%`,
      rep.facultiesPresentCount,
      `"${rep.submittedByTeacherName}"`,
      `"${rep.submissionTime}"`,
      `"${rep.remarks || ''}"`
    ]);

    const summaryBlock = [
      ['ST. XAVIER SENIOR SECONDARY SCHOOL - DAILY INSTITUTIONAL ATTENDANCE MASTER SHEET'],
      [`Generated Date: ${selectedDate}`, `Total Classes Logged: ${totalClassesReported}`],
      [`School Overall Students: ${totalEnrolledSum}`, `Total Present: ${totalPresentSum}`, `Total Absent: ${totalAbsentSum}`, `Overall Attendance: ${overallAvgPct}%`],
      [`Total Faculties on Duty: ${totalFacultiesSum}`],
      [],
      headers
    ];

    const csvContent =
      summaryBlock.map((r) => r.join(',')).join('\n') +
      '\n' +
      rows.map((r) => r.join(',')).join('\n');

    downloadOrShareCSV({
      filename: `Daily_School_Attendance_Master_${selectedDate}.csv`,
      title: `Daily School Attendance Master - ${selectedDate}`,
      csvContent
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Master Action Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/40 to-white dark:from-slate-900 dark:via-amber-950/20 dark:to-slate-800 border border-amber-200/80 dark:border-amber-900/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-600/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-serif">
                Daily Class & Faculty Attendance Dashboard
              </h2>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Submissions
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              Live updates from Class Teachers: Total Students, Present, Absent, and Faculties on duty.
            </p>
          </div>
        </div>

        {/* Master Excel Download Button */}
        <button
          onClick={handleDownloadAllClassesExcel}
          disabled={filteredReports.length === 0}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer ease-in-out active:scale-[0.98] duration-150"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Download All Classes Excel (.csv)</span>
        </button>
      </div>

      {/* 5 Big High-Contrast Metric Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        {/* Classes Reported */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Classes Reported</span>
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 font-mono">
            {totalClassesReported}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1 block">
            For {selectedDate}
          </span>
        </div>

        {/* Total Students */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Total Students</span>
          </p>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">
            {totalEnrolledSum}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1 block">
            Roster Enrollment
          </span>
        </div>

        {/* Present Students */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Present Today</span>
          </p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {totalPresentSum}
          </p>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold mt-1 block">
            {overallAvgPct}% Attendance Rate
          </span>
        </div>

        {/* Absent Students */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 shadow-2xs">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Absent Students</span>
          </p>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 font-mono">
            {totalAbsentSum}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1 block">
            Across reported classes
          </span>
        </div>

        {/* Faculties Present */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 shadow-2xs col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Faculties Present</span>
          </p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
            {totalFacultiesSum}
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1 block">
            Teachers on duty today
          </span>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search class, stream, teacher name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Date Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-0 font-bold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
            />
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-transparent border-0 font-bold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
            >
              <option value="All">All Classes ({dailyClassReports.length})</option>
              <option value="11">Class 11</option>
              <option value="12">Class 12</option>
              <option value="Commerce">Commerce</option>
              <option value="Science">Science</option>
              <option value="Agriculture">Agriculture</option>
            </select>
          </div>
        </div>
      </div>

      {/* Live Class Attendance Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>Class Submissions Live Cards ({filteredReports.length})</span>
          </p>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Click "Download Excel" on any card for student-level breakdown
          </span>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-neutral-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              No Attendance Reports Found for {selectedDate}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Teachers have not submitted daily attendance logs for this selected date yet, or they match a different filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => {
              const pct = report.attendancePercentage;

              return (
                <div
                  key={report.id}
                  className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 shadow-md hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group ease-in-out active:scale-[0.98] duration-150"
                >
                  {/* Card Top Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-mono border border-purple-200 dark:border-purple-800">
                          {report.section || 'General'} • {report.stream}
                        </span>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white font-serif mt-1">
                          {report.className}
                        </h3>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono shadow-2xs ${
                          pct >= 90
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : pct >= 75
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {pct}% Rate
                      </span>
                    </div>

                    {/* Clean & High-Visibility Numbers Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-700">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase">
                          Total Students
                        </span>
                        <span className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5 block">
                          {report.totalStudents}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">
                          Present
                        </span>
                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono mt-0.5 block">
                          {report.presentStudents}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/60">
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block uppercase">
                          Absent
                        </span>
                        <span className="text-lg font-black text-rose-700 dark:text-rose-300 font-mono mt-0.5 block">
                          {report.absentStudents}
                        </span>
                      </div>
                    </div>

                    {/* Faculty In-Charge Presence & Verification Card */}
                    <div className="mt-3 p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/60 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-purple-600" />
                          <span>Faculty In-Charge:</span>
                        </span>
                        <span className={`font-black text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                          report.teacherSelfStatus === 'Absent'
                            ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : report.teacherSelfStatus === 'On Duty'
                            ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {report.teacherSelfStatus || 'Present in Class'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-purple-800 dark:text-purple-300 pt-0.5">
                        <span className="font-extrabold truncate">
                          {report.submittedByTeacherName} {report.teacherId ? `(${report.teacherId})` : ''}
                        </span>
                        {report.subjectTaught && (
                          <span className="text-[10px] font-medium bg-white/80 dark:bg-[#0a0a0a]/80 px-2 py-0.5 rounded-md border border-purple-100 dark:border-purple-900">
                            {report.subjectTaught} {report.periodTaught ? `• ${report.periodTaught.split(' ')[0]}` : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remarks if any */}
                    {report.remarks && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2 italic bg-slate-50 dark:bg-neutral-900/40 p-2 rounded-lg">
                        "{report.remarks}"
                      </p>
                    )}
                  </div>

                  {/* Card Footer with Submitting Teacher Info & Excel Download */}
                  <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
                        <span>Verified by {report.submittedByTeacherName}</span>
                      </p>
                      <p className="text-[10px] font-mono">
                        {report.date} • {report.submissionTime}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap justify-end">
                      {report.studentsDetail && report.studentsDetail.length > 0 && (
                        <button
                          onClick={() => setSelectedReportForRoster(report)}
                          className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
                          title="View complete section student attendance roster"
                        >
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>Roster ({report.studentsDetail.length})</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadClassExcel(report)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ease-in-out active:scale-[0.98] duration-150"
                        title="Download complete student attendance excel sheet"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Excel Sheet</span>
                      </button>

                      <button
                        onClick={() => acknowledgeDailyClassReport(report.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer shadow-2xs active:scale-[0.98] ${
                          report.status === 'Verified by Principal'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-700 border-slate-200 dark:border-neutral-700'
                        }`}
                        title="Principal Signature & Approval"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{report.status === 'Verified by Principal' ? 'Signed' : 'Sign'}</span>
                      </button>

                      <button
                        onClick={() => deleteDailyClassReport(report.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAILED STUDENT ROSTER INSPECTION MODAL FOR PRINCIPAL */}
      {selectedReportForRoster && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-neutral-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-neutral-800 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-neutral-800 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shadow-md shrink-0">
                  <FileSpreadsheet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black tracking-tight font-serif">
                      {selectedReportForRoster.className} Attendance Roster
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider border border-white/30 font-mono">
                      {selectedReportForRoster.section} • {selectedReportForRoster.stream}
                    </span>
                  </div>
                  <p className="text-xs text-white/85 font-medium mt-0.5">
                    Submitted by {selectedReportForRoster.submittedByTeacherName} ({selectedReportForRoster.teacherId || 'Faculty'}) • {selectedReportForRoster.date} at {selectedReportForRoster.submissionTime}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReportForRoster(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 custom-scrollbar">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Total Enrolled</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white font-mono">{selectedReportForRoster.totalStudents}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">Present</div>
                  <div className="text-xl font-black text-emerald-800 dark:text-emerald-200 font-mono">
                    {selectedReportForRoster.presentStudents} ({selectedReportForRoster.attendancePercentage}%)
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300">Absent</div>
                  <div className="text-xl font-black text-rose-800 dark:text-rose-200 font-mono">{selectedReportForRoster.absentStudents}</div>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center">
                  <div className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300">Faculty Status</div>
                  <div className="text-sm font-black text-purple-900 dark:text-purple-200 mt-1">{selectedReportForRoster.teacherSelfStatus || 'Present in Class'}</div>
                </div>
              </div>

              {/* Remarks if any */}
              {selectedReportForRoster.remarks && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-700 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Teacher Remarks: </span>
                  <span className="text-slate-600 dark:text-slate-400 italic">"{selectedReportForRoster.remarks}"</span>
                </div>
              )}

              {/* Roster Table */}
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Complete Section Student Attendance ({selectedReportForRoster.studentsDetail?.length || 0} Pupils)</span>
                  </h3>

                  {/* Filter Pills */}
                  <div className="flex rounded-lg border border-slate-200 dark:border-neutral-700 p-0.5 bg-slate-100 dark:bg-neutral-800 text-[10px] font-bold">
                    {(['ALL', 'PRESENT', 'ABSENT', 'LEAVE'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setRosterFilter(mode)}
                        className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                          rosterFilter === mode ? 'bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900">
                  <div className="overflow-x-auto max-h-[280px] custom-scrollbar">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase sticky top-0 z-10 border-b border-slate-200 dark:border-neutral-700">
                        <tr>
                          <th className="py-2.5 px-3">Roll</th>
                          <th className="py-2.5 px-3">Student Name</th>
                          <th className="py-2.5 px-3">RFID Punch</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3">Father Name</th>
                          <th className="py-2.5 px-3">Parent Contact</th>
                          <th className="py-2.5 px-3 text-right">Aggregate %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                        {(selectedReportForRoster.studentsDetail || []).filter((s) => {
                          if (rosterFilter === 'PRESENT') return s.status === 'Present';
                          if (rosterFilter === 'ABSENT') return s.status === 'Absent';
                          if (rosterFilter === 'LEAVE') return s.status === 'Leave' || s.status === 'Medical Leave';
                          return true;
                        }).map((stu) => {
                          const isAbsent = stu.status === 'Absent';
                          const isLeave = stu.status === 'Leave' || stu.status === 'Medical Leave';

                          return (
                            <tr
                              key={stu.studentId}
                              className={`hover:bg-slate-50/80 dark:hover:bg-neutral-800/50 ${
                                isAbsent ? 'bg-rose-50/40 dark:bg-rose-950/20' : isLeave ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">{stu.rollNo}</td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900 dark:text-white">{stu.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{stu.studentId}</div>
                              </td>
                              <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-slate-300 font-medium">{stu.inTime}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    isAbsent
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                      : isLeave
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  }`}
                                >
                                  {stu.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-[11px] text-slate-700 dark:text-slate-300">{stu.fatherName}</td>
                              <td className="py-2.5 px-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">{stu.parentPhone}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">{stu.overallPercentage}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadClassExcel(selectedReportForRoster)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Excel (.csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>Print Slip</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    acknowledgeDailyClassReport(selectedReportForRoster.id);
                    setSelectedReportForRoster((prev) => (prev ? { ...prev, status: 'Verified by Principal' } : null));
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedReportForRoster.status === 'Verified by Principal'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{selectedReportForRoster.status === 'Verified by Principal' ? '✓ Signed by Principal' : 'Acknowledge & Sign'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReportForRoster(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
