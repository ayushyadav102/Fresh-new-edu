import React, { useState, useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { StaffDailyAttendanceLog, StaffLeaveApplication } from '../../types';
import {
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileCheck,
  Filter,
  Search,
  Plus,
  TrendingUp,
  Check,
  X,
  Send,
  UserCheck,
  UserX,
  Sparkles,
  BarChart2,
  CalendarCheck,
  ArrowUpRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const PrincipalStaffView: React.FC = () => {
  const {
    staffAttendanceLogs,
    staffLeaves,
    staffMonthlyTrends,
    teachers,
    updateStaffAttendanceStatus,
    markAllStaffPresent,
    approveStaffLeave,
    rejectStaffLeave,
    submitStaffLeave
  } = useERP();

  // Internal Subtabs
  const [staffSubTab, setStaffSubTab] = useState<'attendance' | 'leaves' | 'trends'>('attendance');

  // Attendance Filters
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'Late' | 'Absent' | 'On Leave'>('All');
  const [staffSearch, setStaffSearch] = useState('');

  // Leave Management Filters
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [leaveSearch, setLeaveSearch] = useState('');

  // Modals & Dialogs
  const [isSubmitLeaveModalOpen, setIsSubmitLeaveModalOpen] = useState(false);
  const [selectedLeaveForReview, setSelectedLeaveForReview] = useState<StaffLeaveApplication | null>(null);
  const [leaveDecisionRemarks, setLeaveDecisionRemarks] = useState('');

  // New Leave Form State
  const [newLeaveTeacherId, setNewLeaveTeacherId] = useState(teachers[0]?.id || 'T001');
  const [newLeaveType, setNewLeaveType] = useState<StaffLeaveApplication['leaveType']>('Casual Leave (CL)');
  const [newLeaveStartDate, setNewLeaveStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLeaveEndDate, setNewLeaveEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLeaveDays, setNewLeaveDays] = useState(1);
  const [newLeaveReason, setNewLeaveReason] = useState('');
  const [newLeaveSubstitute, setNewLeaveSubstitute] = useState('Mr. Vikram Singh');

  // KPI Calculations
  const totalStaffCount = staffAttendanceLogs.length;
  const presentStaffCount = useMemo(() => staffAttendanceLogs.filter((s) => s.status === 'Present').length, [staffAttendanceLogs]);
  const lateStaffCount = useMemo(() => staffAttendanceLogs.filter((s) => s.status === 'Late').length, [staffAttendanceLogs]);
  const onLeaveStaffCount = useMemo(() => staffAttendanceLogs.filter((s) => s.status === 'On Leave').length, [staffAttendanceLogs]);
  const absentStaffCount = useMemo(() => staffAttendanceLogs.filter((s) => s.status === 'Absent').length, [staffAttendanceLogs]);

  const dailyAttendanceRate = useMemo(() => {
    if (totalStaffCount === 0) return 0;
    return Number((((presentStaffCount + lateStaffCount) / totalStaffCount) * 100).toFixed(1));
  }, [totalStaffCount, presentStaffCount, lateStaffCount]);

  const pendingLeavesCount = useMemo(() => {
    return staffLeaves.filter((l) => l.status === 'Pending').length;
  }, [staffLeaves]);

  // Filtered Attendance Logs
  const filteredAttendanceLogs = useMemo(() => {
    return staffAttendanceLogs.filter((log) => {
      const matchSearch =
        log.teacherName.toLowerCase().includes(staffSearch.toLowerCase()) ||
        log.teacherId.toLowerCase().includes(staffSearch.toLowerCase()) ||
        log.department.toLowerCase().includes(staffSearch.toLowerCase());
      const matchDept = deptFilter === 'All' || log.department === deptFilter;
      const matchStatus = statusFilter === 'All' || log.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  }, [staffAttendanceLogs, staffSearch, deptFilter, statusFilter]);

  // Filtered Leaves
  const filteredLeaves = useMemo(() => {
    return staffLeaves.filter((lv) => {
      const matchSearch =
        lv.teacherName.toLowerCase().includes(leaveSearch.toLowerCase()) ||
        lv.applicationNo.toLowerCase().includes(leaveSearch.toLowerCase()) ||
        lv.reason.toLowerCase().includes(leaveSearch.toLowerCase());
      const matchStatus = leaveStatusFilter === 'All' || lv.status === leaveStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [staffLeaves, leaveSearch, leaveStatusFilter]);

  // Unique departments for filter
  const departmentsList = useMemo(() => {
    const set = new Set(staffAttendanceLogs.map((l) => l.department));
    return ['All', ...Array.from(set)];
  }, [staffAttendanceLogs]);

  const handleCreateLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === newLeaveTeacherId) || teachers[0];

    submitStaffLeave({
      teacherId: teacher.teacherId || teacher.id,
      teacherName: teacher.name,
      department: teacher.department || 'Science & Core',
      designation: teacher.designation || 'Senior PGT Faculty',
      avatar: teacher.avatar || '',
      leaveType: newLeaveType,
      startDate: newLeaveStartDate,
      endDate: newLeaveEndDate,
      totalDays: Number(newLeaveDays),
      reason: newLeaveReason || 'Personal / Academic leave duty',
      substituteTeacherName: newLeaveSubstitute
    });

    setIsSubmitLeaveModalOpen(false);
    setNewLeaveReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                STAFF & HR DESK
              </span>
              <span className="text-xs font-bold text-slate-500">Live Faculty Operations</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Staff Attendance & Leave Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily biometric attendance logs, substitution assignments, leave sanction desk, and faculty absenteeism analytics
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => markAllStaffPresent(selectedDate)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-[0.98] duration-150 ease-in-out"
            >
              <UserCheck className="w-4 h-4" />
              <span>Verify & Mark All Present</span>
            </button>

            <button
              onClick={() => setIsSubmitLeaveModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-purple-600/20 active:scale-[0.98] duration-150 ease-in-out"
            >
              <Plus className="w-4 h-4" />
              <span>Apply Staff Leave</span>
            </button>
          </div>
        </div>

        {/* Subtab Navigation */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto">
          {[
            { id: 'attendance', label: 'Daily Faculty Attendance', icon: Users, badge: `${dailyAttendanceRate}% Present` },
            { id: 'leaves', label: 'Leave Sanction Desk', icon: FileCheck, badge: `${pendingLeavesCount} Pending` },
            { id: 'trends', label: 'Absenteeism & Punctuality Trends', icon: TrendingUp, badge: 'Analytics' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = staffSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStaffSubTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-slate-100/80 dark:bg-neutral-900/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Faculty</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalStaffCount}</p>
          <p className="text-[10px] text-slate-400 font-medium">All Academic Departments</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Present Today</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{presentStaffCount}</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">On duty in classrooms</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Late Arrivals</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{lateStaffCount}</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Checked in &gt; 08:00 AM</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Sanctioned Leave</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{onLeaveStaffCount}</p>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Substitutes deployed</p>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-1.5 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Uninformed Absent</span>
            <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-600">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-600 dark:text-red-400">{absentStaffCount}</p>
          <p className="text-[10px] text-red-500 font-bold">Action notice required</p>
        </div>
      </div>

      {/* TAB 1: DAILY FACULTY ATTENDANCE LOGS */}
      {staffSubTab === 'attendance' && (
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Daily Faculty Attendance Registry</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {dailyAttendanceRate}% Overall Turnout
                </span>
              </div>
              <p className="text-xs text-slate-500">Live RFID & biometric school turnstile check-ins</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search faculty or code..."
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 w-48"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Department & Subject</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Gate & Method</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Remarks / Substitute</th>
                  <th className="py-3 px-4 text-right">Quick Status Switch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredAttendanceLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors active:scale-[0.98] duration-150 ease-in-out">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black flex items-center justify-center text-xs">
                          {log.teacherName.split(' ')[1]?.[0] || 'T'}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">{log.teacherName}</p>
                          <p className="text-[10px] font-mono text-slate-400 font-normal">{log.teacherId} • {log.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">{log.department}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {log.checkInTime || <span className="text-slate-400 font-normal">--:--</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {log.gateLocation || 'Main Gate'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          log.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : log.status === 'Late'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : log.status === 'On Leave'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs">
                      {log.substitutionAssigned ? (
                        <div className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                          <Briefcase className="w-3 h-3" />
                          <span>Sub: {log.substitutionAssigned}</span>
                        </div>
                      ) : (
                        <span className="text-[11px]">{log.remarks || 'Regular classroom timetable'}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(['Present', 'Late', 'Absent', 'On Leave'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => updateStaffAttendanceStatus(log.id, st)}
                            className={`px-2 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${
                              log.status === st
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                                : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                            title={`Mark as ${st}`}
                          >
                            {st === 'On Leave' ? 'Leave' : st}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF LEAVE MANAGEMENT */}
      {staffSubTab === 'leaves' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">Staff Leave Sanction & Approvals</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {pendingLeavesCount} Pending Applications
                </span>
              </div>
              <p className="text-xs text-slate-500">Review faculty leave requests, reasons and substitute classroom arrangements</p>
            </div>

            <div className="flex items-center gap-2">
              {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setLeaveStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    leaveStatusFilter === st
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLeaves.map((leave) => (
              <div
                key={leave.id}
                className="p-5 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300">
                      {leave.applicationNo}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        leave.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : leave.status === 'Rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">{leave.teacherName}</h4>
                    <p className="text-xs text-slate-500 font-medium">{leave.designation} • {leave.department}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-100 dark:border-neutral-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Leave Type:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{leave.leaveType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Period & Duration:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {leave.startDate} to {leave.endDate} ({leave.totalDays} Day{leave.totalDays === 1 ? '' : 's'})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Substitute Assigned:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{leave.substituteTeacherName || 'Self Adjustment'}</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 dark:border-neutral-700">
                      <span className="text-slate-500 font-bold block mb-0.5">Reason stated:</span>
                      <p className="text-slate-700 dark:text-slate-300 italic">"{leave.reason}"</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Applied on: {leave.appliedDate}</span>

                  {leave.status === 'Pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedLeaveForReview(leave);
                          setLeaveDecisionRemarks('Declined due to ongoing examinations.');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-[0.98] duration-150 ease-in-out"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLeaveForReview(leave);
                          setLeaveDecisionRemarks('Sanctioned with substitute coverage verified.');
                        }}
                        className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-purple-600/20 active:scale-[0.98] duration-150 ease-in-out"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Leave</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-[11px] text-slate-500">
                      <span className="font-semibold block">{leave.principalRemarks || 'Sanctioned'}</span>
                      <span>Decision on: {leave.decisionDate}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MONTHLY ABSENTEEISM & PUNCTUALITY TRENDS */}
      {staffSubTab === 'trends' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Attendance Rate Area Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Monthly Faculty Attendance Rate Trend</h3>
                  <p className="text-xs text-slate-500">Academic session 2026-2027 monthly percentage turnout</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Avg 94.6% Turnout
                </span>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={staffMonthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Attendance Rate']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '1rem',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Area type="monotone" dataKey="attendanceRate" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Absence & Leaves Bar Chart */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-2xs space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Absenteeism vs. Leaves</h3>
                <p className="text-xs text-slate-500">Breakdown of leaves vs. late arrivals</p>
              </div>

              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={staffMonthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '1rem',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="sanctionedLeaves" name="Leaves" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="lateArrivals" name="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absentDays" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800/80 text-xs">
                <p className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Most Punctual Department
                </p>
                <p className="text-purple-700 dark:text-purple-300 text-[11px] mt-0.5">
                  Computer Science Department (98.4% on-time check-in rate)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LEAVE REVIEW & SANCTION */}
      {selectedLeaveForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Principal Leave Sanction</h3>
              <button
                onClick={() => setSelectedLeaveForReview(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-neutral-900/60 space-y-1.5 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">{selectedLeaveForReview.teacherName}</p>
              <p className="text-purple-600 dark:text-purple-400 font-semibold">{selectedLeaveForReview.leaveType}</p>
              <p className="text-slate-500">Duration: {selectedLeaveForReview.startDate} to {selectedLeaveForReview.endDate} ({selectedLeaveForReview.totalDays} Days)</p>
              <p className="text-slate-500 italic">"{selectedLeaveForReview.reason}"</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Principal Remarks / Approval Order</label>
              <textarea
                rows={3}
                value={leaveDecisionRemarks}
                onChange={(e) => setLeaveDecisionRemarks(e.target.value)}
                placeholder="Enter sanction notes, substitute instructions..."
                className="w-full p-2.5 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  rejectStaffLeave(selectedLeaveForReview.id, leaveDecisionRemarks);
                  setSelectedLeaveForReview(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
              >
                Decline Leave
              </button>
              <button
                onClick={() => {
                  approveStaffLeave(selectedLeaveForReview.id, leaveDecisionRemarks);
                  setSelectedLeaveForReview(null);
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-purple-600/20 active:scale-[0.98] duration-150 ease-in-out"
              >
                Approve & Sanction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT STAFF LEAVE */}
      {isSubmitLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-slate-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Apply Staff Leave</h3>
                <p className="text-xs text-slate-500">Record planned leave application on faculty register</p>
              </div>
              <button
                onClick={() => setIsSubmitLeaveModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 active:scale-[0.98] transition-all duration-150 ease-in-out"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLeaveSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Faculty Member</label>
                <select
                  value={newLeaveTeacherId}
                  onChange={(e) => setNewLeaveTeacherId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.designation || 'Teacher'}) - {t.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Leave Type</label>
                  <select
                    value={newLeaveType}
                    onChange={(e) => setNewLeaveType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Casual Leave (CL)">Casual Leave (CL)</option>
                    <option value="Medical Leave (ML)">Medical Leave (ML)</option>
                    <option value="Earned Leave (EL)">Earned Leave (EL)</option>
                    <option value="On-Duty (OD) / Workshop">On-Duty (OD) / Workshop</option>
                    <option value="Maternity / Special Leave">Maternity / Special Leave</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Total Days</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newLeaveDays}
                    onChange={(e) => setNewLeaveDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newLeaveStartDate}
                    onChange={(e) => setNewLeaveStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={newLeaveEndDate}
                    onChange={(e) => setNewLeaveEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Substitute Teacher Arrangement</label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Amit Kumar (takes Period 2 & 4)"
                  value={newLeaveSubstitute}
                  onChange={(e) => setNewLeaveSubstitute(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Reason for Leave</label>
                <textarea
                  rows={2}
                  required
                  placeholder="State reason for absence..."
                  value={newLeaveReason}
                  onChange={(e) => setNewLeaveReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-200 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-purple-600/20 active:scale-[0.98] duration-150 ease-in-out"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
