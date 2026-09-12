import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { 
  IndianRupee, AlertTriangle, HandHelping, Search, 
  Settings2, Download, Send, Phone, MessageSquare, 
  Eye, FileText, CheckCircle2, ChevronRight, Filter, Building, X, Users, LayoutDashboard, Trash2,
  MessageCircle, Pencil, Check, Bell
} from 'lucide-react';

export const PrincipalFeesModule: React.FC = () => {
  const { students, dispatchFeeNotice, feeRoster, addStudentToFeeRoster, removeStudentFromFeeRoster, updateStudentFeeInRoster, feeRequests, approveFeeRequest, bursarMessages, markBursarMessagesAsRead, sendBursarMessage } = useERP();
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [filterClass, setFilterClass] = useState('All');
  
  const [selectedStudentName, setSelectedStudentName] = useState('Aarav Patel');
  const [parentName, setParentName] = useState('Mr. Rajesh Patel (Father)');
  const [parentPhone, setParentPhone] = useState('+91 98451 22890');
  const [dueAmount, setDueAmount] = useState('₹18,500');
  
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editableAmount, setEditableAmount] = useState('18500');
  

  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [activeChatStudent, setActiveChatStudent] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  
  const unreadMessagesCount = bursarMessages?.filter((m: any) => !m.read)?.length || 0;

  const [isReviewDeskOpen, setIsReviewDeskOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState<any>(null);

  
  
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  
  const [isMainDispatched, setIsMainDispatched] = useState(false);
  const [rosterDispatchedState, setRosterDispatchedState] = useState<Record<string, boolean>>({});

  const handleSelectStudent = (name: string, parent: string, phone: string, amount: string, grade: string = 'Class') => {
    setSelectedStudentName(name);
    setParentName(parent);
    setParentPhone(phone);
    setDueAmount(amount);
    setEditableAmount(amount.replace(/[^0-9]/g, ''));
    setIsStudentModalOpen(false);
    
    // Add to roster if not exists
    const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    addStudentToFeeRoster({
      name,
      grade,
      dueAmount: amount,
      initials,
      colorClass: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
      subtitleText: 'Selected Now',
      subtitleColor: 'text-rose-600'
    });
  };
  
  const handleSaveAmount = () => {
    const formatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(editableAmount) || 0);
    setDueAmount(formatted);
    setIsEditingAmount(false);
    if (updateStudentFeeInRoster) {
      updateStudentFeeInRoster(selectedStudentName, formatted);
    }
  };

  const handleWhatsApp = () => {
    const text = `Dear ${parentName},\nThis is a gentle reminder from Principal Desk that a fee of ${dueAmount} is due for your ward ${selectedStudentName}. Kindly clear the dues at the earliest.\n\nThank you.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setRosterDispatchedState(prev => ({ ...prev, [selectedStudentName]: true }));
  };
  
  const handleDirectDispatch = () => {
    dispatchFeeNotice(selectedStudentName, dueAmount);
    setIsMainDispatched(true);
    setRosterDispatchedState(prev => ({ ...prev, [selectedStudentName]: true }));
    
    setTimeout(() => {
      setIsMainDispatched(false);
      // setRosterDispatchedState(prev => ({ ...prev, [selectedStudentName]: false })); // Keep it as Sent in roster
    }, 3000);
  };
  
  const handleRosterDispatch = (name: string, amount: string) => {
    dispatchFeeNotice(name, amount);
    setRosterDispatchedState(prev => ({ ...prev, [name]: true }));
    // We can leave it as 'Sent' indefinitely or clear it after 3s. Let's keep it Sent so the principal knows it was sent.
  };
  


  const [reliefSlider, setReliefSlider] = useState(0);

  return (
    <div className="w-full max-w-2xl mx-auto pb-10 space-y-2 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="flex bg-slate-100 dark:bg-neutral-800 rounded-full p-1 mb-2 max-w-sm mx-auto">
        <button className="flex-1 py-2 rounded-full text-sm font-bold bg-white dark:bg-neutral-900 text-blue-600 shadow-sm border border-slate-200 dark:border-neutral-700 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Principal Desk
        </button>
        <button 
          onClick={() => {
            setIsMessagesModalOpen(true);
            if (markBursarMessagesAsRead) markBursarMessagesAsRead();
          }}
          className="flex-1 py-2 rounded-full text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 relative"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366]" /> Student Messages
          {unreadMessagesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-[#0a0a0a]">
              {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
          FY 2026-27 • TERM 3 SESSION
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-md text-[10px] font-bold">
          Audit Synchronized: 08:30 AM
        </div>
      </div>

      {/* Interactive Actionable Counters */}
      <div className="grid grid-cols-2 gap-2">
        {/* Card 1: Fully Cleared */}
        <div 
          className="bg-emerald-50/40 dark:bg-emerald-900/10 p-3 rounded-[14px] border border-emerald-200 dark:border-emerald-800 shadow-sm relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => alert("Filtering roster: Fully Cleared Students")}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Fully Cleared</h3>
            <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded">Settled</span>
          </div>
          <h2 className="text-xl font-black text-emerald-700 dark:text-emerald-300">1,154 Pupils</h2>
          <p className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-500 mt-1">93.1% Compliant • Admit Cards Unlocked</p>
        </div>

        {/* Card 2: Due Soon */}
        <div 
          className="bg-amber-50/40 dark:bg-amber-900/10 p-3 rounded-[14px] border border-amber-200 dark:border-amber-800 shadow-sm relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => alert("Filtering roster: Upcoming grace period. Ready for Soft Reminders.")}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider">Due Soon</h3>
            <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded">Grace Period</span>
          </div>
          <h2 className="text-xl font-black text-amber-700 dark:text-amber-400">52 Pupils</h2>
          <p className="text-[10px] font-bold text-amber-600/80 dark:text-amber-500 mt-1">Due in &lt; 72 Hrs • ₹9.4L Anticipated</p>
        </div>

        {/* Card 3: Critical Overdue */}
        <div 
          className="bg-rose-50/40 dark:bg-rose-900/10 p-3 rounded-[14px] border border-rose-200 dark:border-rose-800 shadow-sm relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => alert("Filtering roster: High-priority defaulters. Ready for Formal Demand Notice.")}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Critical Overdue</h3>
            <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> Notice Queue</span>
          </div>
          <h2 className="text-xl font-black text-rose-700 dark:text-rose-400">34 Actionable</h2>
          <p className="text-[10px] font-bold text-rose-600/80 dark:text-rose-500 mt-1">₹14.2L Pending • 2nd Notice Stage</p>
        </div>

        {/* Card 4: Hardship Relief */}
        <div 
          className="bg-indigo-50/40 dark:bg-indigo-900/10 p-3 rounded-[14px] border border-indigo-200 dark:border-indigo-800 shadow-sm relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => setIsReviewDeskOpen(true)}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Relief Apps</h3>
            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded">Applications</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <h2 className="text-xl font-black text-indigo-700 dark:text-indigo-400">{feeRequests?.filter(r => r.status === "PENDING").length || 0} Requests</h2>
          </div>
          <p className="text-[10px] font-bold text-indigo-600/80 dark:text-indigo-500 mt-1">Awaiting Principal Sanction</p>
        </div>
      </div>

      {/* Main Action Desk */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="bg-slate-50 dark:bg-neutral-900/50 p-3 border-b border-slate-200 dark:border-neutral-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
              <span className="text-sm">⚡</span>
            </div>
            Executive Dispatch Desk
          </h3>
          
          <button 
            onClick={() => setIsStudentModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            Choose Student
          </button>
        </div>
        
        {/* Selected Student Card */}
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-start bg-slate-50/50 dark:bg-neutral-900/20 p-3 rounded-xl border border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-200 dark:border-indigo-800/50">
                {selectedStudentName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{selectedStudentName}</h4>
                  <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded">Overdue</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Roll #01 • Grade 9-A • PRN: EDX26-9041</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              {isEditingAmount ? (
                <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 p-1 rounded-md border border-slate-200 dark:border-neutral-700 shadow-sm">
                  <span className="text-slate-400 font-bold ml-1">₹</span>
                  <input 
                    type="number" 
                    value={editableAmount} 
                    onChange={(e) => setEditableAmount(e.target.value)}
                    className="w-20 text-sm font-black text-rose-600 bg-transparent outline-none p-0"
                    autoFocus
                  />
                  <button onClick={handleSaveAmount} className="bg-emerald-100 text-emerald-700 p-1 rounded">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => setIsEditingAmount(true)}>
                  <h4 className="font-black text-rose-600 text-lg">{dueAmount}</h4>
                  <Pencil className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              )}
              <p className="text-[10px] font-bold text-slate-500 mt-1">Due: 10 Dec 2026</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-xl p-3 border border-slate-100 dark:border-neutral-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-xs">{parentName}</p>
                <p className="text-slate-500 text-[11px] font-medium">{parentPhone}</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-neutral-700 flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <Phone className="w-3.5 h-3.5" />
              </button>
              <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-neutral-700 flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Legal Demand Protocol</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={handleWhatsApp} className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 hover:border-emerald-300 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl text-xs flex flex-col items-center gap-1 transition-colors">
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                WhatsApp+SMS
              </button>
              <button onClick={() => alert('Opening relief plan setup...')} className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 hover:border-amber-300 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl text-xs flex flex-col items-center gap-1 transition-colors">
                <HandHelping className="w-4 h-4 text-amber-500" />
                Relief Plan
              </button>
              <button onClick={() => alert('Generating PDF...')} className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 hover:border-blue-300 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl text-xs flex flex-col items-center gap-1 transition-colors">
                <FileText className="w-4 h-4 text-slate-500" />
                Challan PDF
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-neutral-800">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Principal Discretionary Relief</span>
              </div>
              <span className="text-xs font-black text-amber-600">{reliefSlider}% (₹{(parseInt(editableAmount) * (reliefSlider / 100)).toLocaleString()})</span>
            </div>
            <div className="px-1">
              <input 
                type="range" 
                min="0" 
                max="25" 
                step="5"
                value={reliefSlider}
                onChange={(e) => setReliefSlider(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1">
                <span>0%</span>
                <span>Max Permissible: 25%</span>
              </div>
            </div>
          </div>

          <div className="pt-3 space-y-2">
            <button 
              onClick={handleDirectDispatch} 
              className={`w-full font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] text-sm ${
                isMainDispatched
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#0047AB] hover:bg-[#003380] text-white'
              }`}
            >
              {isMainDispatched ? (
                <><CheckCircle2 className="w-4 h-4" /> Dispatched Successfully</>
              ) : (
                <><Send className="w-4 h-4" /> Dispatch Direct Notice (Push + SMS)</>
              )}
            </button>
            <button onClick={() => setIsPreviewModalOpen(true)} className="w-full bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all text-xs hover:underline">
              <Eye className="w-4 h-4" /> Preview Official Letterhead Notice
            </button>
          </div>
        </div>
      </div>

      {/* Actionable Overdue Roster & Dispatch Log */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500"></div>
            Actionable Overdue Roster
          </h3>
          <span className="text-xs font-medium text-slate-500">86 Pending</span>
        </div>

        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-2xl p-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm">86 Default Reminders</h4>
              <p className="text-xs font-medium text-rose-600/80 dark:text-rose-400/80">Cumulative: ₹14.20 Lakhs</p>
            </div>
          </div>
          <button onClick={() => alert("Broadcasting to all 86 defaults")} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" /> Broadcast All
          </button>
        </div>
        


        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm divide-y divide-slate-100 dark:divide-neutral-800">
          {feeRoster.map((student, idx) => (
            <div key={idx} className="p-3 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${student.colorClass} font-bold flex items-center justify-center text-sm border`}>{student.initials}</div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">Grade {student.grade} • <span className={student.subtitleColor}>{student.subtitleText}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 dark:text-white mr-1">{student.dueAmount}</span>
                <button onClick={() => handleRosterDispatch(student.name, student.dueAmount)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 ${rosterDispatchedState[student.name] ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40'}`}>
                  {rosterDispatchedState[student.name] ? <><Check className="w-3 h-3" /> Sent</> : <><Bell className="w-3 h-3" /> Remind</>}
                </button>
                <button 
                  onClick={() => removeStudentFromFeeRoster(student.name)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove from roster"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Selection Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-slate-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 dark:border-neutral-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Select Student
                </h3>
                <p className="text-xs text-slate-500 mt-1">Filter by class and choose a student to send fee reminders</p>
              </div>
              <button 
                onClick={() => setIsStudentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex gap-2 overflow-x-auto">
              {['All', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(cls => (
                <button
                  key={cls}
                  onClick={() => setFilterClass(cls)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    filterClass === cls 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {students
                .filter(s => filterClass === 'All' || s.className.includes(filterClass.replace('Class ', '')))
                .map((student, idx) => {
                  const fakeDue = idx % 3 === 0 ? '₹18,500' : idx % 3 === 1 ? '₹21,500' : '₹19,000';
                  const initials = student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                  const colors = [
                    'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50',
                    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
                    'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/50',
                    'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
                    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                  ];
                  const colorClass = colors[idx % colors.length];

                  return (
                    <div 
                      key={student.studentId}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-800/50 rounded-xl cursor-pointer border border-transparent transition-colors group"
                      onClick={() => handleSelectStudent(student.name, student.fatherName || 'Parent Name', student.phone || '+91 98451 22890', fakeDue, student.className)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${colorClass} font-bold flex items-center justify-center text-sm border shrink-0`}>
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{student.name}</h4>
                          <p className="text-xs text-slate-500 font-medium">Grade {student.className} • Roll {student.rollNo}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-black text-slate-900 dark:text-white text-sm">{fakeDue}</span>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded">Overdue</span>
                      </div>
                    </div>
                  );
              })}
              {students.filter(s => filterClass === 'All' || s.className.includes(filterClass.replace('Class ', ''))).length === 0 && (
                <div className="text-center p-8 text-slate-500">
                  <p className="text-sm">No students found in {filterClass}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Official Letterhead Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-neutral-800">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                Official Letterhead Preview
              </h3>
              <button onClick={() => setIsPreviewModalOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 bg-slate-50 dark:bg-neutral-900/50 m-4 rounded-xl border border-slate-200 dark:border-neutral-800">
              {/* School Header */}
              <div className="text-center mb-6 border-b-2 border-slate-300 dark:border-neutral-700 pb-4">
                <h1 className="text-xl font-black text-[#0047AB] dark:text-blue-500 uppercase tracking-wider">EduX International School</h1>
                <p className="text-[11px] text-slate-500 font-medium">Affiliation No: 43012 • 45, Vidya Nagar, New Delhi</p>
              </div>

              {/* Notice Body */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                  <span>Ref: EDX/FEE/26/904</span>
                  <span>Date: {new Date().toLocaleDateString('en-IN')}</span>
                </div>

                <div className="pt-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white uppercase">To, The Parent / Guardian of</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{selectedStudentName}</p>
                  <p className="text-xs text-slate-500 font-medium">Grade 9-A • {parentPhone}</p>
                </div>

                <h3 className="text-center font-black underline uppercase text-sm my-4 text-slate-900 dark:text-white">Sub: Notice for Overdue Academic Fee</h3>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                  Dear Parent, <br/><br/>
                  This is a statutory notification from the Principal's Desk regarding the outstanding fee balance for the current academic session. 
                  According to our records, a total amount of <span className="font-black text-rose-600">{dueAmount}</span> is pending clearance.
                </p>

                <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 p-4 rounded-lg my-4 text-center">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Payable Amount</p>
                  <h2 className="text-3xl font-black text-rose-600">{dueAmount}</h2>
                  <p className="text-[10px] text-rose-500 font-medium mt-1">Due Date: 10 December 2026</p>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                  We request you to kindly remit the pending dues on or before the due date to avoid any hindrance in generating the official examination roll numbers and practical access clearances.
                </p>
              </div>

              {/* Signatures */}
              <div className="mt-12 flex justify-between items-end border-t border-slate-200 dark:border-neutral-800 pt-4">
                <div className="text-center">
                  <div className="h-10"></div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white border-t border-slate-400 pt-1">Accountant</p>
                </div>
                <div className="text-center">
                  <p className="font-cursive text-xl text-blue-800 dark:text-blue-400 mb-1">Dr. A. Swaminathan</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white border-t border-slate-400 pt-1">Principal / Administrator</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-neutral-800 flex justify-end gap-3">
              <button onClick={() => setIsPreviewModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">Close</button>
              <button className="px-5 py-2 text-sm font-bold text-white bg-[#0047AB] hover:bg-[#003380] rounded-xl flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Financial Hardship Review Desk Modal */}
      {isReviewDeskOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden animate-in fade-in duration-300 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-100 text-base flex items-center gap-2">
                <HandHelping className="w-5 h-5 text-indigo-600" />
                Student Financial Hardship Review Desk
              </h3>
              <button onClick={() => setIsReviewDeskOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {feeRequests?.filter(r => r.status === 'PENDING').length === 0 && (
                  <div className="text-center p-8 text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-medium">No pending requests</p>
                    <p className="text-xs">All hardship applications have been processed.</p>
                  </div>
                )}
                
                {feeRequests?.filter(r => r.status === 'PENDING').map(req => (
                  <div key={req.id} className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{req.studentName}</h4>
                        <p className="text-xs font-medium text-slate-500">Grade {req.className} • Roll {req.rollNo} • {req.termName}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-rose-600 text-sm block">{req.originalAmount}</span>
                        <span className="text-[10px] font-bold text-slate-500">Total Due</span>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-neutral-900 p-3 rounded-lg border border-slate-100 dark:border-neutral-800 mb-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Category:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{req.category}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Proposed Initial Payment:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{req.proposedAmount || 'N/A'}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 dark:border-neutral-800">
                        <span className="text-xs text-slate-500 block mb-1">Parent Remarks:</span>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 italic">"{req.remarks}"</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          // Approve logic
                          if (approveFeeRequest) {
                            // Create terms based on category
                            let terms = [];
                            let rawAmt = Number(req.originalAmount.replace(/[^0-9]/g, ''));
                            if (req.category === '2 parts') {
                              terms = [
                                { amount: Math.floor(rawAmt/2), dueDate: '15th This Month' },
                                { amount: Math.ceil(rawAmt/2), dueDate: '15th Next Month' }
                              ];
                            } else if (req.category === '3 parts') {
                              terms = [
                                { amount: Math.floor(rawAmt/3), dueDate: '15th This Month' },
                                { amount: Math.floor(rawAmt/3), dueDate: '15th Next Month' },
                                { amount: rawAmt - Math.floor(rawAmt/3)*2, dueDate: '15th Month 3' }
                              ];
                            } else {
                              terms = [
                                { amount: rawAmt, dueDate: 'End of Term' }
                              ];
                            }
                            approveFeeRequest(req.id, terms);
                          }
                        }} 
                        className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Student Messages Modal */}
      {isMessagesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-[#E5DDD5] dark:bg-[#0a0a0a] w-full max-w-2xl h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
            
            {/* Header */}
            <div className="p-3 bg-[#075E54] text-white flex justify-between items-center z-10 shadow-md">
              <div className="flex items-center gap-3">
                {activeChatStudent && (
                  <button onClick={() => setActiveChatStudent(null)} className="p-1 hover:bg-white/10 rounded-full mr-1">
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                )}
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  {activeChatStudent ? <Users className="w-5 h-5 text-white" /> : <MessageCircle className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">
                    {activeChatStudent ? activeChatStudent : 'Student Queries Inbox'}
                  </h3>
                  <p className="text-[11px] text-white/80">
                    {activeChatStudent ? 'Student • Online' : 'Select a conversation to reply'}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsMessagesModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto relative bg-[#E5DDD5] dark:bg-[#0a0a0a]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')", opacity: 0.9 }}>
              
              {!activeChatStudent ? (
                /* Conversation List View */
                <div className="p-0">
                  {!bursarMessages || bursarMessages.length === 0 ? (
                    <div className="text-center p-12 text-slate-500">
                      <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-50" />
                      <p className="font-bold text-lg">No messages yet</p>
                      <p className="text-sm">Messages sent by students will appear here.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                      {Array.from(new Set((bursarMessages || []).map(m => m.studentName))).map(studentName => {
                        const msgs = (bursarMessages || []).filter((m: any) => m.studentName === studentName);
                        const lastMsg = msgs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
                        const unread = msgs.filter(m => !m.read && m.sender !== 'principal').length;
                        
                        return (
                          <div 
                            key={studentName as string} 
                            onClick={() => {
                              setActiveChatStudent(studentName as string);
                            }}
                            className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                          >
                            <div className="w-12 h-12 bg-slate-200 dark:bg-neutral-800 rounded-full flex items-center justify-center text-lg font-bold text-slate-500">
                              {(studentName as string).substring(0,2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <div>
                                  <h4 className="font-bold text-slate-900 dark:text-white truncate leading-tight">{studentName as string}</h4>
                                  <p className="text-[10px] font-semibold text-[#00A884]">{lastMsg.className} • Roll {lastMsg.rollNo}</p>
                                </div>
                                <span className={`text-[10px] whitespace-nowrap ml-2 ${unread ? 'text-[#00A884] font-bold' : 'text-slate-400'}`}>
                                  {new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-500 truncate pr-2">
                                  {lastMsg.sender === 'principal' ? 'You: ' : ''}{lastMsg.message}
                                </p>
                                {unread > 0 && (
                                  <span className="bg-[#00A884] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                                    {unread}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Active Chat View */
                <div className="p-4 space-y-3 pb-4">
                  <div className="text-center mb-4">
                    <span className="bg-[#D4EAF7] text-[#4A6470] text-[10px] font-bold py-1 px-3 rounded-lg shadow-sm">
                      End-to-end encrypted with {activeChatStudent}
                    </span>
                  </div>
                  
                  {(bursarMessages || [])
                    .filter((m: any) => m.studentName === activeChatStudent)
                    .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                    .map((msg: any) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'principal' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm relative ${msg.sender === 'principal' ? 'bg-[#DCF8C6] dark:bg-[#005C4B] text-slate-900 dark:text-white rounded-tr-none' : 'bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                          
                          {msg.sender === 'principal' && (
                            <div className="absolute top-0 right-[-8px] w-0 h-0 border-t-[10px] border-t-[#DCF8C6] dark:border-t-[#005C4B] border-r-[10px] border-r-transparent"></div>
                          )}
                          {msg.sender !== 'principal' && (
                            <div className="absolute top-0 left-[-8px] w-0 h-0 border-t-[10px] border-t-white dark:border-t-neutral-800 border-l-[10px] border-l-transparent"></div>
                          )}
                          
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          
                          <div className="flex justify-end items-center gap-1 mt-1">
                            <span className={`text-[9px] ${msg.sender === 'principal' ? 'text-[#667781] dark:text-[#8696A0]' : 'text-slate-400'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            {msg.sender === 'principal' && (
                              <CheckCircle2 className="w-3 h-3 text-[#53bdeb]" />
                            )}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Input Bar (Only visible in active chat) */}
            {activeChatStudent && (
              <div className="p-3 bg-[#F0F0F0] dark:bg-neutral-900 flex gap-2 items-end z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                <textarea 
                  rows={1}
                  placeholder="Type a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      // Submit reply
                      const sendBursarMsg = sendBursarMessage;
                      if (replyText.trim() && sendBursarMsg) {
                        const studentInfo = (bursarMessages || []).find((m: any) => m.studentName === activeChatStudent);
                        sendBursarMsg({
                          studentName: activeChatStudent,
                          className: studentInfo?.className || '',
                          rollNo: studentInfo?.rollNo || '',
                          message: replyText,
                          sender: 'principal'
                        });
                        setReplyText('');
                      }
                    }
                  }}
                  className="flex-1 bg-white dark:bg-[#2A2F32] border-0 rounded-3xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#25D366] resize-none max-h-32 min-h-[44px]"
                ></textarea>
                <button 
                  disabled={!replyText.trim()}
                  onClick={() => {
                      const sendBursarMsg = sendBursarMessage;
                      if (replyText.trim() && sendBursarMsg) {
                        const studentInfo = (bursarMessages || []).find((m: any) => m.studentName === activeChatStudent);
                        sendBursarMsg({
                          studentName: activeChatStudent,
                          className: studentInfo?.className || '',
                          rollNo: studentInfo?.rollNo || '',
                          message: replyText,
                          sender: 'principal'
                        });
                        setReplyText('');
                      }
                  }}
                  className="w-11 h-11 bg-[#00A884] disabled:bg-slate-300 disabled:dark:bg-neutral-700 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-colors"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
};
