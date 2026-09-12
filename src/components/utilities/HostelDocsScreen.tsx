import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { Modal } from '../common/Modal';
import { HostelComplaint, AcademicDocument } from '../../types';
import {
  Home,
  FileText,
  Plus,
  Download
} from 'lucide-react';

export const HostelDocsScreen: React.FC = () => {
  const { student } = useAuth();
  const {
    hostelComplaints,
    documents,
    submitHostelComplaint,
    requestDocument
  } = useERP();

  const [activeTab, setActiveTab] = useState<'hostel' | 'documents'>('hostel');

  // Complaint modal state
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState<HostelComplaint['category']>('Internet');
  const [complaintDesc, setComplaintDesc] = useState('');

  // Document request modal state
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [docType, setDocType] = useState<AcademicDocument['type']>('Bonafide Certificate');
  const [docTitle, setDocTitle] = useState('Bonafide Student Certificate (Odd Sem 2024)');

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintDesc.trim()) return;
    submitHostelComplaint(complaintCategory, complaintDesc);
    setComplaintModalOpen(false);
    setComplaintDesc('');
  };

  const handleDocumentRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestDocument(docType, docTitle);
    setDocModalOpen(false);
  };

  const hostel = student?.hostel;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-md transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 font-bold">
              <Home className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">Hostel & Document Vault</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Hostel room allocation, warden contact details, maintenance requests & official document issuance
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-neutral-700">
          <button
            onClick={() => setActiveTab('hostel')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'hostel'
                ? 'bg-white dark:bg-[#0a0a0a] text-rose-700 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hostel Details
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-white dark:bg-[#0a0a0a] text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Academic Documents ({documents.length})
          </button>
        </div>
      </div>

      {activeTab === 'hostel' ? (
        <div className="space-y-6">
          {/* Hostel Room Card */}
          <div className="bg-gradient-to-br from-rose-900 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-900/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                  Hostel Accomodation
                </span>
                <h2 className="text-2xl font-bold font-serif text-white">{hostel?.block || 'Aryabhata Block B'}</h2>
                <p className="text-xs text-rose-200">
                  Room Number: <span className="font-bold text-white text-sm">{hostel?.roomNo || 'B-312'}</span> • {hostel?.bedNo || 'Bed 02'}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-2 text-xs">
                <p className="text-rose-200 font-bold uppercase text-[10px]">Hostel Warden Contact</p>
                <p className="font-bold text-white">{hostel?.wardenName}</p>
                <p className="text-slate-300 font-mono">{hostel?.wardenPhone}</p>
              </div>
            </div>
          </div>

          {/* Complaints Portal Section */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-md transition-colors">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg font-serif">Maintenance & Hostel Complaints</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Log room repair, internet, or electrical complaints directly to warden</p>
              </div>

              <button
                onClick={() => setComplaintModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
              >
                <Plus className="w-4 h-4" />
                <span>Log New Complaint</span>
              </button>
            </div>

            <div className="space-y-3">
              {hostelComplaints.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                      {c.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">{c.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span>Logged on {c.dateSubmitted}</span>
                    {c.resolutionNotes && <span className="text-slate-600 dark:text-slate-400 italic">{c.resolutionNotes}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Academic Documents Vault */
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-md transition-colors">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-neutral-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg font-serif">Academic Documents Vault</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official digital certificates verified with University QR signature</p>
            </div>

            <button
              onClick={() => setDocModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
            >
              <Plus className="w-4 h-4" />
              <span>Request New Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 hover:bg-white dark:hover:bg-slate-800 transition-all flex flex-col justify-between active:scale-[0.98] duration-150 ease-in-out"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold">
                      <FileText className="w-5 h-5" />
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      doc.status === 'Available'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}>
                      {doc.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{doc.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Type: {doc.type} • Issued: {doc.issueDate}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-neutral-700/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{doc.fileSize || 'Processing'}</span>
                  {doc.status === 'Available' ? (
                    <button
                      onClick={() => alert(`Downloading verified document: ${doc.title}`)}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98] transition-all duration-150 ease-in-out"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </button>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">In Registrar Queue</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log Hostel Complaint Modal */}
      <Modal
        isOpen={complaintModalOpen}
        onClose={() => setComplaintModalOpen(false)}
        title="Log Hostel Maintenance Request"
      >
        <form onSubmit={handleComplaintSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Complaint Category
            </label>
            <select
              value={complaintCategory}
              onChange={(e) => setComplaintCategory(e.target.value as HostelComplaint['category'])}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-rose-600 focus:outline-hidden"
            >
              <option value="Internet">Internet / Wi-Fi Connectivity</option>
              <option value="Plumbing">Plumbing & Water Leakage</option>
              <option value="Electrical">Electrical / Fan / AC Switch</option>
              <option value="Cleanliness">Room Cleanliness & Housekeeping</option>
              <option value="Carpentry">Furniture & Lock Repair</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Describe Issue Details
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide exact details (e.g. Room B-312 sink tap leaking water)..."
              value={complaintDesc}
              onChange={(e) => setComplaintDesc(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-rose-600 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setComplaintModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-all duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-xs cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
            >
              Register Complaint
            </button>
          </div>
        </form>
      </Modal>

      {/* Request Document Modal */}
      <Modal
        isOpen={docModalOpen}
        onClose={() => setDocModalOpen(false)}
        title="Apply for Academic Certificate"
      >
        <form onSubmit={handleDocumentRequestSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Document Type
            </label>
            <select
              value={docType}
              onChange={(e) => {
                const val = e.target.value as AcademicDocument['type'];
                setDocType(val);
                setDocTitle(`${val} (Academic Year 2024-25)`);
              }}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:outline-hidden"
            >
              <option value="Bonafide Certificate">Bonafide Certificate</option>
              <option value="Character Certificate">Character & Conduct Certificate</option>
              <option value="Migration Certificate">Migration Certificate</option>
              <option value="Provisional Degree">Provisional Grade Card</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Certificate Title
            </label>
            <input
              type="text"
              required
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setDocModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-all duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-xs cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
