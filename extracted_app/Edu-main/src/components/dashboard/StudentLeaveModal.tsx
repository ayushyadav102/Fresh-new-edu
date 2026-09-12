import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import { X, UploadCloud, CheckCircle2, Clock } from 'lucide-react';
import { Modal } from '../common/Modal';

export const StudentLeaveModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { applyForLeave, studentLeaves, students } = useERP();
  const { student: authStudent } = useAuth();
  const student = students.find(s => s.studentId === authStudent?.studentId) || authStudent;

  const [type, setType] = useState('Medical');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const myLeaves = studentLeaves.filter(l => l.studentId === student?.id || l.studentId === student?.studentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) return;
    setSubmitting(true);
    
    // calc days roughly
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    applyForLeave({
      studentId: student?.studentId || 'STU-XXX',
      studentName: student?.name || 'Student',
      rollNo: student?.rollNo,
      className: student?.className || 'Class X',
      section: student?.section || 'A',
      type,
      startDate,
      endDate,
      days,
      reason,
      documentName: type === 'Medical' ? 'medical_certificate.pdf' : undefined,
      documentSize: type === 'Medical' ? '1.2 MB' : undefined
    });

    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setStartDate('');
        setEndDate('');
        setReason('');
      }, 2000);
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave Application">
      {success ? (
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Application Submitted!</h3>
          <p className="text-sm text-slate-500 mt-2">Your leave request has been sent to your class teacher.</p>
        </div>
      ) : (
        <div className="p-4 sm:p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Leave Type</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Medical">Medical Leave</option>
                <option value="Family">Family Function</option>
                <option value="Urgent">Urgent Personal</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason (Required)</label>
              <textarea 
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder="Explain the reason for leave..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-hidden focus:border-blue-500 resize-none"
                required
              />
            </div>

            {type === 'Medical' && (
              <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-600">Upload Medical Certificate</span>
                <span className="text-[10px] text-slate-400">PDF, JPG (Max 5MB)</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting...' : 'Submit Leave Application'}
            </button>
          </form>

          {myLeaves.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">Recent Applications</h4>
              <div className="space-y-3">
                {myLeaves.map(leave => (
                  <div key={leave.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h5 className="text-[11px] font-bold text-slate-800">{leave.type} ({leave.days} Days)</h5>
                      <p className="text-[10px] text-slate-500">{leave.startDate} to {leave.endDate}</p>
                    </div>
                    <div>
                      {leave.status === 'Pending' ? (
                        <span className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      ) : leave.status === 'Approved' ? (
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Approved
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-bold">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
