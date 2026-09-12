import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import {
  CheckCircle2, AlertCircle, Edit3, Download, CreditCard, Clock,
  FileText, Phone, MessageCircle, HelpCircle, ShieldCheck,
  ChevronRight, Building, Check
, X , Send } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const FeesScreen: React.FC = () => {
  const { student: authStudent } = useAuth();
  const { students, feeNotices, acknowledgeFeeNotice, feeRoster, studentInstallments, submitFeeRequest, feeRequests, sendBursarMessage, bursarMessages } = useERP();
  const student = students.find(s => s.studentId === authStudent?.studentId) || authStudent || students[0];

    const [isPaying, setIsPaying] = useState(false);
  const studentFeeData = feeRoster?.find(r => r.name === student?.name);
  const currentDue = studentFeeData?.dueAmount || '₹18,500';

  
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [isReliefModalOpen, setIsReliefModalOpen] = useState(false);
  const [reliefCategory, setReliefCategory] = useState('2 parts');
  const [proposedAmount, setProposedAmount] = useState('');
  const [remarks, setRemarks] = useState('');

  const myInstallments = studentInstallments ? studentInstallments[student?.name || ''] : undefined;
  const myPendingRequest = feeRequests ? feeRequests.find(r => r.studentName === student?.name && r.status === 'PENDING') : undefined;

  const handleRequestSubmit = () => {
    if (submitFeeRequest) {
      submitFeeRequest({
        studentName: student?.name,
        className: student?.className,
        rollNo: student?.rollNo,
        termName: 'Term 3',
        originalAmount: currentDue,
        category: reliefCategory,
        proposedAmount: proposedAmount,
        remarks: remarks
      });
    }
    setIsReliefModalOpen(false);
  };




  const handleCallBursar = () => {
    window.location.href = 'tel:+919876543210';
  };

  const handleWhatsAppBursar = () => {
    setIsMsgModalOpen(true);
  };
  
  const submitBursarMessage = () => {
    if (msgText.trim() && sendBursarMessage) {
      sendBursarMessage({
        studentName: student?.name,
        className: student?.className,
        rollNo: student?.rollNo,
        message: msgText,
        sender: 'student'
      });
      setMsgText('');
    }
  };
  
  const myMessages = bursarMessages?.filter((m: any) => m.studentName === student?.name).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) || [];


  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      alert("Payment Gateway Triggered: Razorpay/Cashfree modal would open here.");
      setIsPaying(false);
    }, 800);
  };

  const downloadReceipt = (term: string) => {
    const doc = new jsPDF('p', 'mm', 'a5');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text("ST. XAVIER'S SENIOR SECONDARY SCHOOL", 74, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("OFFICIAL FEE PAYMENT RECEIPT", 74, 22, { align: 'center' });
    doc.setDrawColor(200);
    doc.line(10, 27, 138, 27);
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt No: REC-${Math.floor(Math.random() * 10000)}`, 10, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 80, 35);
    doc.text(`Student Name: ${student?.name}`, 10, 45);
    doc.text(`Class: ${student?.className}`, 10, 52);
    doc.text(`Roll No: ${student?.rollNo || 'N/A'}`, 80, 52);
    doc.text(`Term: ${term}`, 10, 65);
    doc.text(`Amount Paid: INR 20,500`, 10, 72);
    doc.text(`Status: SETTLED`, 10, 79);
    doc.save(`Receipt_${term.replace(' ', '_')}.pdf`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-6 space-y-2.5 animate-in fade-in duration-300">
      {/* Top Banner (Role Toggle simulation context) */}
      <div className="flex bg-slate-100 dark:bg-neutral-800 rounded-full p-1 mb-2 max-w-sm mx-auto">
        <button className="flex-1 py-2 rounded-full text-sm font-semibold text-slate-500 dark:text-slate-400 opacity-50 cursor-not-allowed">
          Principal Desk
        </button>
        <button className="flex-1 py-2 rounded-full text-sm font-bold bg-blue-600 text-white shadow-sm">
          Parent & Student
        </button>
      </div>

      {/* Student Profile Card */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-neutral-800 p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img 
              src={student?.avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6"} 
              alt="Student" 
              className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-neutral-800 shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 border-2 border-white dark:border-[#0a0a0a]">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{student?.name || 'Aarav Patel'}</h2>
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-md">Roll #{student?.rollNo || '01'}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{student?.className || 'Class 9th'} • CBSE Reg #EDX26-9041</p>
          </div>
        </div>
        <div className="hidden sm:block p-2 bg-slate-50 dark:bg-neutral-800 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Demand Card */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-rose-200 dark:border-rose-900/30 p-3 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider">Term 3 Payment Demand</h3>
            </div>
            <p className="text-sm text-slate-500">Term 3 Balance Due</p>
          </div>
          <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Buffer Active
          </span>
        </div>

        <div className="flex items-end justify-between mb-2">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{currentDue}</h1>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Due: 10 Dec 2026</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-2">
          <div className="h-2.5 w-full bg-slate-100 dark:bg-neutral-800 rounded-full overflow-hidden flex">
            <div className="h-full bg-blue-600" style={{ width: '50%' }}></div>
            <div className="h-full bg-rose-500" style={{ width: '25%' }}></div>
          </div>
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-blue-600">Paid: ₹36,000</span>
            <span className="text-rose-600">Due: {currentDue}</span>
            <span className="text-slate-500">Upcoming: ₹18,000</span>
          </div>
        </div>

        <button 
          onClick={handlePayment}
          disabled={isPaying}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
        >
          {isPaying ? 'Processing...' : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay Full {currentDue} (UPI / NetBanking / Cards)
            </>
          )}
        </button>

                {myInstallments ? (
          <div className="mt-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3">
            <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approved Installments
            </h4>
            <div className="space-y-2">
              {myInstallments.map((inst, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Installment {idx + 1} ({inst.dueDate})</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{inst.amount}</span>
                </div>
              ))}
            </div>
          </div>
        ) : myPendingRequest ? (
          <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              ⏳ Relief Request Pending Review — Submitted today. Principal desk will review and update your payable slab.
            </p>
          </div>
        ) : (
          <button onClick={() => setIsReliefModalOpen(true)} className="w-full mt-3 py-2 border border-indigo-200 hover:bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/30 text-xs font-semibold rounded-full transition-colors flex items-center justify-center gap-1.5">
            Need flexibility? Request Split Installment or Fee Relief &rarr;
          </button>
        )}

      </div>

      {/* Dynamic Principal Fee Notices */}
      {feeNotices.filter(n => n.studentName === student.name).map((notice) => (
        <div key={notice.id} className={`rounded-2xl p-3 border relative overflow-hidden transition-all duration-500 animate-in slide-in-from-top-4 fade-in ${notice.isAcknowledged ? 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 opacity-70' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/50'}`}>
          <div className={`absolute top-0 left-0 w-1 h-full ${notice.isAcknowledged ? 'bg-slate-400' : 'bg-blue-600'}`}></div>
          
          <div className="flex items-start gap-3 mb-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${notice.isAcknowledged ? 'bg-slate-200 dark:bg-neutral-800 text-slate-500' : 'bg-blue-600 text-white'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Direct Principal Notice</h3>
                <span className="text-xs text-slate-500 font-medium">Just Now</span>
              </div>
              <p className={`text-xs font-medium ${notice.isAcknowledged ? 'text-slate-500' : 'text-blue-600 dark:text-blue-400'}`}>Dr. Arvind Swaminathan • Principal Desk</p>
            </div>
          </div>
          
          <div className={`bg-white dark:bg-neutral-900 rounded-xl p-2.5 border mb-2 shadow-sm ${notice.isAcknowledged ? 'border-slate-100 dark:border-neutral-800' : 'border-blue-100 dark:border-neutral-800'}`}>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              "Digital Statutory Fee Notice for <strong>{notice.studentName}</strong>. Kindly clear all academic and laboratory dues of <strong>{notice.amount}</strong> immediately to ensure unhindered generation of the official CBSE Exam Roll and Practical Access Clearance."
            </p>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
              <span className="text-[11px] text-slate-500">Dispatch Ref: #P-NOTIF-{notice.id.substring(notice.id.length - 4)}</span>
              <span className="text-[11px] font-bold text-blue-600">Official Seal Verified</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-blue-300 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Challan PDF
            </button>
            <button 
              onClick={() => acknowledgeFeeNotice(notice.id)}
              disabled={notice.isAcknowledged}
              className={`flex-1 font-bold py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 ${
                notice.isAcknowledged 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 opacity-100 cursor-not-allowed' 
                  : 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200'
              }`}
            >
              {notice.isAcknowledged ? (
                <><Check className="w-4 h-4" /> Acknowledged</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Acknowledge</>
              )}
            </button>
          </div>
        </div>
      ))}
      
      {/* Fee Schedule */}
      <div>
        <div className="flex justify-between items-center mb-2 px-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Academic Fee Schedule</h3>
          <span className="text-xs font-medium text-slate-500">Session 2026-27</span>
        </div>
        
        <div className="space-y-2.5">
          {/* Term 3 (Active) */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-rose-200 dark:border-rose-900/30 p-2.5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 pl-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <h4 className="font-bold text-slate-900 dark:text-white">Term 3 (Dec 2026)</h4>
              </div>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md">DUE NOW</span>
            </div>
            
            <div className="pl-5 space-y-2">
              <p className="text-[10px] font-bold text-slate-500 tracking-wider">ITEMIZED HEADS</p>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Tuition & Curricular Fee</span>
                <span className="font-medium text-slate-900 dark:text-white">₹10,500</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>STEM Robotics & Science Lab</span>
                <span className="font-medium text-slate-900 dark:text-white">₹3,000</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Smart Classroom & Cloud Infra</span>
                <span className="font-medium text-slate-900 dark:text-white">₹2,000</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Board Mock Exam & Paper Levy</span>
                <span className="font-medium text-slate-900 dark:text-white">₹1,500</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Sports Arena & Physical Education</span>
                <span className="font-medium text-slate-900 dark:text-white">₹1,500</span>
              </div>
              
              <div className="flex justify-between text-sm font-bold pt-2 mt-2 border-t border-slate-100 dark:border-neutral-800 text-blue-600 dark:text-blue-400">
                <span>Total Term Payable</span>
                <span>{currentDue}</span>
              </div>
            </div>
          </div>

          {/* Term 4 */}
          <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-2xl border border-slate-200 dark:border-neutral-800 p-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 opacity-60">
                <Clock className="w-4 h-4 text-slate-500" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300">Term 4 (Feb 2027)</h4>
              </div>
              <span className="px-2 py-0.5 bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-md">UPCOMING</span>
            </div>
            <div className="flex justify-between items-center pl-5 opacity-60">
              <span className="font-bold text-slate-700 dark:text-slate-300">₹17,000</span>
              <span className="text-[11px] font-medium text-slate-500">Window opens Jan 25</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bursar Support */}
      <div className="bg-slate-50 dark:bg-neutral-900/50 rounded-2xl border border-slate-200 dark:border-neutral-800 p-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
          <Building className="w-4 h-4 text-blue-600" /> Bursar Office Support
        </h3>
        <p className="text-xs text-slate-500 mb-2 leading-relaxed">
          Have queries regarding fee vouchers, sibling concession forms, or bank clearing receipts? Contact finance desk directly.
        </p>
        <div className="flex gap-2.5 mb-2">
          <button onClick={handleCallBursar} className="flex-1 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 shadow-sm hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors">
            <Phone className="w-3.5 h-3.5" /> Call Bursar
          </button>
          <button onClick={handleWhatsAppBursar} className="flex-1 bg-[#25D366]/10 border border-[#25D366]/30 py-2 rounded-xl text-xs font-bold text-[#128C7E] dark:text-[#25D366] flex items-center justify-center gap-2 shadow-sm hover:bg-[#25D366]/20 transition-colors">
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Desk
          </button>
        </div>
        <button className="w-full text-xs font-bold text-blue-600 hover:underline flex items-center justify-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" /> View Fee Concession Policy & FAQs
        </button>
      </div>


      {/* Installment / Relief Modal */}
      {isReliefModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Submit Fee Installment or Hardship Relief Request</h3>
              <button onClick={() => setIsReliefModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="bg-slate-50 dark:bg-neutral-900 p-3 rounded-xl border border-slate-100 dark:border-neutral-800">
                <p className="text-xs text-slate-500 mb-1">Student Details</p>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{student?.name}, Grade {student?.className}, Roll #{student?.rollNo}</h4>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200 dark:border-neutral-800">
                  <span className="text-xs text-slate-500">Current Term Due</span>
                  <span className="font-bold text-rose-600">Term 3: {currentDue}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Relief Category</label>
                  <select 
                    value={reliefCategory}
                    onChange={(e) => setReliefCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="2 parts">Split into 2 Monthly Installments (50% now, 50% next month)</option>
                    <option value="3 parts">Split into 3 Monthly Installments (33% each)</option>
                    <option value="waiver">Request Principal Discretionary Waiver (Financial Hardship / Medical)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Proposed Initial Payment</label>
                  <input 
                    type="text" 
                    placeholder="e.g. ₹9,250 payable today"
                    value={proposedAmount}
                    onChange={(e) => setProposedAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">Parent / Student Remarks</label>
                  <textarea 
                    rows={2}
                    placeholder="Brief reason for request (e.g. temporary delayed business cashflow, medical expense)"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-neutral-800 flex gap-3">
              <button onClick={() => setIsReliefModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleRequestSubmit} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}


      {/* WhatsApp Message Modal */}
      {isMsgModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center bg-slate-900/50 backdrop-blur-sm sm:p-4">
          <div className="bg-[#E5DDD5] dark:bg-[#0a0a0a] w-full h-[90vh] sm:h-[600px] sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-200 flex flex-col relative">
            
            <div className="p-3 sm:p-4 bg-[#075E54] text-white flex justify-between items-center z-10 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Fees Office</h3>
                  <p className="text-[11px] text-white/80">Online</p>
                </div>
              </div>
              <button onClick={() => setIsMsgModalOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 z-0" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')", opacity: 0.9 }}>
              <div className="text-center mb-4">
                <span className="bg-[#D4EAF7] text-[#4A6470] text-[10px] font-bold py-1 px-3 rounded-lg shadow-sm">
                  Messages are end-to-end encrypted with Principal Desk
                </span>
              </div>
              
              {myMessages.length === 0 ? (
                <div className="text-center p-4">
                  <div className="bg-[#FFF3C7] dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-xs p-3 rounded-xl shadow-sm inline-block max-w-[90%] text-left">
                    Send a message to the Fees Office to discuss your fee status, installments, or waivers.
                  </div>
                </div>
              ) : (
                myMessages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'principal' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-sm relative ${msg.sender === 'principal' ? 'bg-white dark:bg-neutral-800 text-slate-800 dark:text-slate-200 rounded-tl-none' : 'bg-[#DCF8C6] dark:bg-[#005C4B] text-slate-900 dark:text-white rounded-tr-none'}`}>
                      {msg.sender === 'principal' && (
                        <div className="absolute top-0 left-[-8px] w-0 h-0 border-t-[10px] border-t-white dark:border-t-neutral-800 border-l-[10px] border-l-transparent"></div>
                      )}
                      {msg.sender === 'student' && (
                        <div className="absolute top-0 right-[-8px] w-0 h-0 border-t-[10px] border-t-[#DCF8C6] dark:border-t-[#005C4B] border-r-[10px] border-r-transparent"></div>
                      )}
                      
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      
                      <div className="flex justify-end items-center gap-1 mt-1">
                        <span className={`text-[9px] ${msg.sender === 'principal' ? 'text-slate-400' : 'text-[#667781] dark:text-[#8696A0]'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        {msg.sender === 'student' && (
                          <CheckCircle2 className="w-3 h-3 text-[#53bdeb]" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-3 bg-[#F0F0F0] dark:bg-neutral-900 flex gap-2 items-end z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
              <textarea 
                rows={1}
                placeholder="Type a message..."
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitBursarMessage();
                  }
                }}
                className="flex-1 bg-white dark:bg-[#2A2F32] border-0 rounded-3xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#25D366] resize-none max-h-32 min-h-[44px]"
              ></textarea>
              <button 
                onClick={submitBursarMessage} 
                disabled={!msgText.trim()}
                className="w-11 h-11 bg-[#00A884] disabled:bg-slate-300 disabled:dark:bg-neutral-700 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-colors"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};
