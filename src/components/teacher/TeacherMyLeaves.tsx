import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import { FileStack, Plus, X, Calendar, AlertCircle, FileText } from 'lucide-react';
import { StaffLeaveApplication } from '../../types';

export const TeacherMyLeaves: React.FC = () => {
  const { teacher } = useAuth();
  const { staffLeaves, submitStaffLeave } = useERP();
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState<StaffLeaveApplication['leaveType']>('Casual Leave (CL)');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const myLeaves = (staffLeaves || []).filter(l => l.teacherId === teacher?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher || !startDate || !endDate || !reason) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    submitStaffLeave({
      teacherId: teacher.id,
      teacherName: teacher.name,
      designation: 'Teacher',
      department: 'Academics',
      avatar: teacher.avatar || '',
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
    });

    setShowApplyModal(false);
    setStartDate('');
    setEndDate('');
    setReason('');
    setLeaveType('Casual Leave (CL)');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <FileStack className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            My Leaves
          </h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Apply for leave and track your application status
          </p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Apply Leave
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myLeaves.length > 0 ? (
          myLeaves.map(leave => (
            <div key={leave.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-slate-200 dark:border-neutral-800 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                    ${leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                      leave.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 
                      'bg-amber-100 text-amber-700'}`}
                  >
                    {leave.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{leave.appliedDate}</p>
                </div>
              </div>
              
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{leave.leaveType}</h3>
              <p className="text-xs text-slate-500 font-medium mb-3 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {leave.startDate} to {leave.endDate} ({leave.totalDays} Days)
              </p>
              
              <div className="bg-slate-50 dark:bg-[#0a0a0a] rounded-lg p-3 border border-slate-100 dark:border-neutral-800">
                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 line-clamp-2">
                  {leave.reason}
                </p>
              </div>
              
              {leave.principalRemarks && (
                <div className="mt-3 flex items-start gap-2 text-[11px] text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg">
                  <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <p><span className="font-bold">Principal:</span> {leave.principalRemarks}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-neutral-800 rounded-3xl bg-slate-50 dark:bg-[#0a0a0a]">
            <div className="w-16 h-16 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-neutral-800 mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">No Leave History</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">You haven't applied for any leaves yet.</p>
          </div>
        )}
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-neutral-800">
            <div className="p-6 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Apply for Leave</h3>
                <p className="text-xs font-semibold text-slate-500">Submit application to Principal</p>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">Leave Type</label>
                <select 
                  value={leaveType} 
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  required
                >
                  <option value="Casual Leave (CL)">Casual Leave (CL)</option>
                  <option value="Medical Leave (ML)">Medical Leave (ML)</option>
                  <option value="Earned Leave (EL)">Earned Leave (EL)</option>
                  <option value="Duty Leave (Conference/CBSE)">Duty Leave (Conference/CBSE)</option>
                  <option value="Special Maternity/Paternity">Special Maternity/Paternity</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1">Reason</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide a brief reason for your leave..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] resize-none"
                  required
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-indigo-800 dark:text-indigo-300">
                  Your leave application will be sent to the Principal for approval. You will be notified once a decision is made.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 px-4 py-3 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-xl text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
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
