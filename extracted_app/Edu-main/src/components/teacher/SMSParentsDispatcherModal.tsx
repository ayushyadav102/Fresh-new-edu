import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, X, MessageSquare, Send, Bell, Phone, Radio, 
  ShieldCheck, Check, CheckCircle2, AlertTriangle, UserPlus, 
  Edit3, Smartphone, ExternalLink, RefreshCw, Copy
} from 'lucide-react';
import { StudentProfile } from '../../types';
import { useERP } from '../../context/ERPContext';
import { UserAvatar } from '../common/UserAvatar';

interface SMSParentsDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  classCode: string;
  classStream?: string;
  section?: string;
  subjectName?: string;
  periodName?: string;
  teacherName?: string;
  initialTemplate?: 'standard' | 'low_attendance' | 'custom';
  absentStudentIds: string[];
  allClassStudents: StudentProfile[];
  onToggleStudentAbsent?: (studentId: string) => void;
}

export const SMSParentsDispatcherModal: React.FC<SMSParentsDispatcherModalProps> = ({
  isOpen,
  onClose,
  classCode,
  classStream = 'PCM',
  section = 'A',
  subjectName = 'Physics',
  periodName = 'Period 1',
  teacherName = 'Dr. Rajesh Sharma',
  initialTemplate = 'standard',
  absentStudentIds,
  allClassStudents,
  onToggleStudentAbsent
}) => {
  const { updateStudentProfile, getStudentAttendanceSummary } = useERP();

  // Template tab selection
  const [selectedTemplate, setSelectedTemplate] = useState<'standard' | 'low_attendance' | 'custom'>(initialTemplate);
  const [customNote, setCustomNote] = useState<string>(
    `Dear Parent, your ward [Student Name] (Roll [Roll]) is absent today in [Class] without prior intimation. Please send clarification to Class Teacher [Teacher]. - EduX St. Xavier's`
  );

  // Selected recipient IDs for dispatch (checkbox state)
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<Set<string>>(new Set());

  // Mother toggle per student (whether to send to mother too)
  const [motherToggles, setMotherToggles] = useState<Record<string, boolean>>({});

  // Dispatch status per student ('QUEUED' | 'SENT')
  const [dispatchStatus, setDispatchStatus] = useState<Record<string, 'QUEUED' | 'SENT'>>({});

  // Delivery channels
  const [channelSms, setChannelSms] = useState(true);
  const [channelWhatsapp, setChannelWhatsapp] = useState(true);
  const [channelAppPush, setChannelAppPush] = useState(true);

  // SMS Credit balance
  const [smsCredits, setSmsCredits] = useState<number>(() => {
    const saved = localStorage.getItem('edux_sms_credits');
    return saved ? parseInt(saved, 10) : 4850;
  });

  // Sending state and feedback
  const [isSending, setIsSending] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [smsTrayOpen, setSmsTrayOpen] = useState(false);
  const [whatsappTrayOpen, setWhatsappTrayOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testNumber, setTestNumber] = useState('+91 98123 00998');
  const [testSent, setTestSent] = useState(false);
  const [copiedStudentId, setCopiedStudentId] = useState<string | null>(null);
  const [openedSmsIds, setOpenedSmsIds] = useState<Set<string>>(new Set());

  // Clean phone number for native SMS app
  const getCleanPhoneForSms = (rawPhone?: string) => {
    if (!rawPhone) return '+919876543210';
    const cleaned = rawPhone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.length === 10) return `+91${cleaned}`;
    return `+${cleaned}`;
  };

  // Build native SMS URI (compatible with Android Google/Samsung Messages & iOS Apple Messages)
  const getNativeSmsHref = (phone: string, message: string) => {
    const cleanPhone = getCleanPhoneForSms(phone);
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const delimiter = isIOS ? '&' : '?';
    return `sms:${cleanPhone}${delimiter}body=${encodeURIComponent(message)}`;
  };

  // Copy helper
  const handleCopyText = (text: string, id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedStudentId(id);
    setTimeout(() => setCopiedStudentId(null), 2500);
  };

  // Mark SMS as opened
  const markSmsOpened = (studentId: string) => {
    setOpenedSmsIds((prev) => new Set(prev).add(studentId));
    setDispatchStatus((prev) => ({ ...prev, [studentId]: 'SENT' }));
  };

  // Parent Edit/Add Modal State
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);
  const [editFatherName, setEditFatherName] = useState('');
  const [editFatherPhone, setEditFatherPhone] = useState('');
  const [editMotherName, setEditMotherName] = useState('');
  const [editMotherPhone, setEditMotherPhone] = useState('');

  // Sync recipient selection whenever absentStudentIds changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (absentStudentIds.length > 0) {
        setSelectedRecipientIds(new Set(absentStudentIds));
      } else {
        // If no students are marked absent yet, clear or default to empty
        setSelectedRecipientIds(new Set());
      }
      setSelectedTemplate(initialTemplate);
      setSuccessBanner(null);
      setWhatsappTrayOpen(false);
    }
  }, [isOpen, absentStudentIds, initialTemplate]);

  // Real absent students from ERP class roster
  const absentStudents = useMemo(() => {
    if (absentStudentIds.length === 0) return [];
    return allClassStudents.filter((s) => absentStudentIds.includes(s.studentId));
  }, [allClassStudents, absentStudentIds]);

  // Students to display in the list (all absent students, or quick-picker if 0)
  const displayStudents = useMemo(() => {
    if (absentStudents.length > 0) {
      return absentStudents;
    }
    // If no students are absent yet, show all class students as selectable options
    return allClassStudents.slice(0, 8);
  }, [absentStudents, allClassStudents]);

  if (!isOpen) return null;

  // Toggle recipient checkbox
  const toggleRecipient = (id: string) => {
    setSelectedRecipientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle Mother channel
  const toggleMother = (id: string) => {
    setMotherToggles((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Generate personalized message for a student
  const getPersonalizedMessage = (stu: StudentProfile) => {
    const summary = getStudentAttendanceSummary(stu.studentId);
    const attPct = summary?.percentage !== undefined ? summary.percentage.toFixed(1) : (stu.overallPercentage || 84.0).toFixed(1);
    const roll = stu.rollNo || '01';

    if (selectedTemplate === 'standard') {
      return `Dear Parent, your ward ${stu.name} is absent today (${todayFormatted}) in ${periodName} (${subjectName}) without prior notice. Please send clarification or medical slip to Class Teacher ${teacherName}. - EduX St. Xavier's`;
    }
    if (selectedTemplate === 'low_attendance') {
      return `Dear Parent, your ward ${stu.name} (Roll ${roll}) has attendance of ${attPct}% which is below mandatory CBSE 75% cutoff threshold. Statutory absentee alert active. Please contact Class Teacher ${teacherName} immediately. - EduX St. Xavier's`;
    }
    // Custom template interpolation
    return customNote
      .replace(/\[Student Name\]/g, stu.name)
      .replace(/\[Roll\]/g, roll)
      .replace(/\[Attendance%\]/g, `${attPct}%`)
      .replace(/\[Class\]/g, `Class ${classCode}-${section}`)
      .replace(/\[Teacher\]/g, teacherName)
      .replace(/\[Date\]/g, todayFormatted);
  };

  // Open Edit Parent modal
  const handleOpenEditParent = (stu: StudentProfile) => {
    setEditingStudent(stu);
    setEditFatherName(stu.fatherName || `Mr. ${stu.name.split(' ').pop() || ''}`);
    setEditFatherPhone(stu.parentPhone || stu.emergencyContact || stu.phone || '+91 98765 43210');
    setEditMotherName(stu.motherName || `Mrs. ${stu.name.split(' ').pop() || ''}`);
    setEditMotherPhone(stu.emergencyContact || stu.parentPhone || '+91 98765 43211');
  };

  // Save Parent edits
  const handleSaveParentEdit = () => {
    if (!editingStudent) return;
    updateStudentProfile(editingStudent.studentId, {
      fatherName: editFatherName,
      parentPhone: editFatherPhone,
      motherName: editMotherName,
      emergencyContact: editMotherPhone
    });
    setEditingStudent(null);
  };

  // Dispatch alerts handler - opens native Mobile SMS app with pre-written message
  const handleSendAlerts = () => {
    const targetIds = Array.from(selectedRecipientIds);
    if (targetIds.length === 0) return;

    setIsSending(true);

    // Identify target student objects
    const targetStudents = displayStudents.filter((s) => targetIds.includes(s.studentId));
    const firstStu = targetStudents[0];

    setTimeout(() => {
      // Deduct credits if SMS is enabled
      const totalRecipients = targetIds.reduce((count, id) => {
        return count + (motherToggles[id] ? 2 : 1);
      }, 0);

      if (channelSms) {
        const newCredits = Math.max(0, smsCredits - totalRecipients);
        setSmsCredits(newCredits);
        localStorage.setItem('edux_sms_credits', newCredits.toString());
      }

      // Mark status as SENT
      const updatedStatus: Record<string, 'QUEUED' | 'SENT'> = {};
      targetIds.forEach((id) => {
        updatedStatus[id] = 'SENT';
      });
      setDispatchStatus((prev) => ({ ...prev, ...updatedStatus }));

      // Always open Mobile SMS Queue Tray so teacher can easily send to each parent
      setSmsTrayOpen(true);
      if (channelWhatsapp) {
        setWhatsappTrayOpen(true);
      }

      setIsSending(false);

      // Launch native SMS App for the first recipient with pre-written message
      if (firstStu) {
        const firstPhone = firstStu.parentPhone || firstStu.emergencyContact || '+91 98765 43210';
        const firstMsg = getPersonalizedMessage(firstStu);
        markSmsOpened(firstStu.studentId);
        
        // Open Mobile SMS App via native URI
        window.location.href = getNativeSmsHref(firstPhone, firstMsg);

        setSuccessBanner(
          `📱 Mobile SMS Compose Screen open ho chuki hai! Message pre-written ready hai — bas phone me 'Send' dabayein. Baaki ${
            targetIds.length > 1 ? `${targetIds.length - 1} parents ke liye niche list se 1-tap karein.` : 'alert dispatched!'
          }`
        );
      }
    }, 400);
  };

  // Clean phone number for wa.me link
  const getCleanPhoneForWhatsApp = (rawPhone?: string) => {
    if (!rawPhone) return '919876543210';
    const digits = rawPhone.replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  // Handle Test to Self - launches teacher's own SMS app with pre-written test alert
  const handleSendTest = () => {
    const sampleStu = displayStudents[0] || allClassStudents[0];
    const sampleMsg = sampleStu ? getPersonalizedMessage(sampleStu) : customNote;
    
    setTestSent(true);

    // Launch native SMS app on device
    window.location.href = getNativeSmsHref(testNumber, sampleMsg);

    setTimeout(() => {
      setTestSent(false);
      setTestModalOpen(false);
    }, 2200);
  };

  // Absent student names string for alert banner
  const absentStudentNames = absentStudents.map((s) => s.name).join(' & ');

  return (
    <div 
      id="sms-parents-dispatcher-modal" 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-[#0f0f11] w-full max-w-xl rounded-[28px] border border-slate-200 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* TOP BAR */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-2 shrink-0 bg-slate-50/50 dark:bg-neutral-900/50">
          <button
            id="sms-dispatcher-back-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Centered auto-draft badge */}
          <div className="px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/60 flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-700 dark:text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>
              {absentStudents.length > 0
                ? `AUTO-DRAFTED (${absentStudents.length} ABSENTEE${absentStudents.length > 1 ? 'S' : ''})`
                : 'SELECT ABSENTEES TO DISPATCH'}
            </span>
          </div>

          <button
            id="sms-dispatcher-close-btn"
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar">
          
          {/* MAIN HEADER */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <MessageSquare className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                SMS Parents Dispatcher
              </h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
                  CLASS {classCode} {classStream}
                </span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  • {periodName} Roll Call Alert
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC ALERT BANNER (Matching Screenshot 2) */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {absentStudents.length > 0 ? (
                    <span>{absentStudents.length} student{absentStudents.length > 1 ? 's' : ''} marked Absent today</span>
                  ) : (
                    <span>0 students marked Absent in roll register</span>
                  )}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                  {absentStudents.length > 0 ? (
                    <span>
                      <strong className="text-slate-900 dark:text-white">{absentStudentNames}</strong>. Mandatory CBSE absentee telecommunication rules active.
                    </span>
                  ) : (
                    <span>You can select students below to send them alerts or warnings immediately.</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px]">
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>Airtel DLT Active</span>
              </div>
              <div className="font-black text-blue-600 dark:text-blue-400">
                {smsCredits.toLocaleString()} SMS <span className="font-semibold text-slate-500 text-[10px]">credits</span>
              </div>
            </div>
          </div>

          {/* SUCCESS BANNER */}
          {successBanner && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs font-medium text-emerald-900 dark:text-emerald-200">
                {successBanner}
              </div>
            </div>
          )}

          {/* 1. SELECT ALERT TEMPLATE CARD */}
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Select Alert Template</span>
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 text-[10px] font-extrabold tracking-wide border border-slate-200 dark:border-neutral-700">
                CBSE DLT Validated
              </span>
            </div>

            {/* Template Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100/90 dark:bg-neutral-800">
              <button
                id="template-tab-standard"
                type="button"
                onClick={() => setSelectedTemplate('standard')}
                className={`px-2 py-2 rounded-lg text-center transition-all cursor-pointer ${
                  selectedTemplate === 'standard'
                    ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className="text-[11px] leading-tight">STANDARD</div>
                <div className="text-[9px] opacity-75 leading-tight mt-0.5">{periodName} Absent</div>
              </button>

              <button
                id="template-tab-low-attendance"
                type="button"
                onClick={() => setSelectedTemplate('low_attendance')}
                className={`px-2 py-2 rounded-lg text-center transition-all cursor-pointer ${
                  selectedTemplate === 'low_attendance'
                    ? 'bg-white dark:bg-neutral-900 text-amber-600 dark:text-amber-400 shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className="text-[11px] leading-tight">&lt; 75% WARNING</div>
                <div className="text-[9px] opacity-75 leading-tight mt-0.5">Statutory Alert</div>
              </button>

              <button
                id="template-tab-custom"
                type="button"
                onClick={() => setSelectedTemplate('custom')}
                className={`px-2 py-2 rounded-lg text-center transition-all cursor-pointer ${
                  selectedTemplate === 'custom'
                    ? 'bg-white dark:bg-neutral-900 text-purple-600 dark:text-purple-400 shadow-xs font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className="text-[11px] leading-tight">CUSTOM</div>
                <div className="text-[9px] opacity-75 leading-tight mt-0.5">Custom Note</div>
              </button>
            </div>

            {/* Template Preview Box */}
            <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-neutral-800/60 border border-blue-100 dark:border-neutral-700/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  DLT HEADER: EDUSCH • TID: 170716
                </span>
                <span>
                  {selectedTemplate === 'custom' ? customNote.length : 142} Chars (1 SMS)
                </span>
              </div>

              {selectedTemplate === 'custom' ? (
                <div className="space-y-1.5">
                  <textarea
                    id="sms-custom-template-input"
                    rows={3}
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full p-2 text-xs bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    placeholder="Type custom note..."
                  />
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                    <span className="text-slate-400 font-semibold">Tokens:</span>
                    {['[Student Name]', '[Roll]', '[Attendance%]', '[Class]', '[Teacher]'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCustomNote((prev) => `${prev} ${t}`)}
                        className="px-1.5 py-0.5 rounded-sm bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-slate-300 font-mono text-[9px] hover:bg-slate-50"
                      >
                        +{t}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                  "{getPersonalizedMessage(displayStudents[0] || allClassStudents[0])}"
                </p>
              )}

              {/* Action Toolbar for Preview Message */}
              <div className="pt-2 border-t border-blue-100 dark:border-neutral-700/60 flex items-center justify-between gap-2 flex-wrap">
                <div className="text-[10px] text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1">
                  <span>📱 Pre-written for Mobile SMS App</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      const sampleStu = displayStudents[0] || allClassStudents[0];
                      const msg = sampleStu ? getPersonalizedMessage(sampleStu) : customNote;
                      handleCopyText(msg, 'preview', e);
                    }}
                    className="px-2 py-1 rounded-md bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {copiedStudentId === 'preview' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedStudentId === 'preview' ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                  <a
                    href={getNativeSmsHref(testNumber, displayStudents[0] ? getPersonalizedMessage(displayStudents[0]) : customNote)}
                    className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                    title="Open in Mobile SMS App"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Test Open in SMS</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 2. RECIPIENT ABSENTEES CARD */}
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>
                  Recipient Absentees ({absentStudents.length > 0 ? absentStudents.length : displayStudents.length})
                </span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Uncheck to omit</span>
            </div>

            {/* List of absent students */}
            <div className="space-y-3">
              {displayStudents.map((stu) => {
                const isSelected = selectedRecipientIds.has(stu.studentId);
                const summary = getStudentAttendanceSummary(stu.studentId);
                const attPct = summary?.percentage !== undefined ? summary.percentage : (stu.overallPercentage || 84.0);
                const isCritical = attPct < 75;
                const status = dispatchStatus[stu.studentId] || 'QUEUED';
                const isMotherEnabled = !!motherToggles[stu.studentId];

                const fatherName = stu.fatherName || `Mr. ${stu.name.split(' ').pop() || ''} (Father)`;
                const fatherPhone = stu.parentPhone || stu.emergencyContact || '+91 98765 43210';
                const motherName = stu.motherName || `Mrs. ${stu.name.split(' ').pop() || ''}`;
                const motherPhone = stu.emergencyContact || stu.parentPhone || '+91 98765 43211';

                return (
                  <div
                    key={stu.studentId}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-slate-50/60 dark:bg-neutral-800/40 border-slate-200 dark:border-neutral-700/80'
                        : 'bg-white dark:bg-neutral-900 border-slate-200/60 dark:border-neutral-800 opacity-60'
                    }`}
                  >
                    {/* Top Row: Avatar, Name, Roll, Attendance Badge & Checkbox */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <UserAvatar avatar={stu.avatar} name={stu.name} role="student" size="md" />
                          {isCritical && (
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[8px] font-black shadow-xs">
                              !
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                              {stu.name}
                            </h4>
                            <span className="px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                              Roll {stu.rollNo || '01'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className={`text-[11px] font-bold ${
                                isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {attPct.toFixed(1)}% Attendance
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase ${
                                isCritical
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                  : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-slate-300'
                              }`}
                            >
                              {isCritical ? 'CRITICAL' : 'Normal'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Checkbox to include/omit */}
                      <button
                        type="button"
                        onClick={() => toggleRecipient(stu.studentId)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-neutral-800 text-transparent border border-slate-300 dark:border-neutral-700'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>

                    {/* Optional Note Row */}
                    <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 text-[11px] text-purple-700 dark:text-purple-300 italic flex items-center justify-between gap-2">
                      <span>Note: Biometric RFID missing at entry gate • Marked Absent in Period 1</span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditParent(stu)}
                        className="text-[10px] font-bold text-blue-600 dark:text-blue-400 not-italic hover:underline shrink-0 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> Edit Contact
                      </button>
                    </div>

                    {/* Guardians List Box */}
                    <div className="mt-2.5 space-y-1.5">
                      {/* Father Row */}
                      <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-neutral-800/50 border border-blue-100/60 dark:border-neutral-700 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px]">
                            👤
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <span>{fatherName}</span>
                              <span className="px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[9px] font-bold">
                                Father
                              </span>
                            </div>
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                              {fatherPhone}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {/* Native Mobile SMS Button - Opens phone's SMS app with pre-written message */}
                          <a
                            href={getNativeSmsHref(fatherPhone, getPersonalizedMessage(stu))}
                            onClick={() => markSmsOpened(stu.studentId)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                            title="Open in Mobile SMS App"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>SMS</span>
                          </a>

                          {/* Copy Pre-written SMS Text */}
                          <button
                            type="button"
                            onClick={(e) => handleCopyText(getPersonalizedMessage(stu), `father-${stu.studentId}`, e)}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Copy Pre-written SMS Text"
                          >
                            {copiedStudentId === `father-${stu.studentId}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* WhatsApp Direct Chat Button */}
                          <a
                            href={`https://wa.me/${getCleanPhoneForWhatsApp(fatherPhone)}?text=${encodeURIComponent(getPersonalizedMessage(stu))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                            title="Direct WhatsApp"
                          >
                            <span className="text-xs">💬</span>
                            <span>WA</span>
                          </a>

                          {/* Call Button */}
                          <a
                            href={`tel:${fatherPhone.replace(/\s+/g, '')}`}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-700 border border-slate-200 dark:border-neutral-600 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 transition-colors"
                            title="Call Guardian"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-wider uppercase ${
                              openedSmsIds.has(stu.studentId) || status === 'SENT'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-200/80 text-slate-600 dark:bg-neutral-700 dark:text-slate-300'
                            }`}
                          >
                            {openedSmsIds.has(stu.studentId) ? 'OPENED' : status}
                          </span>
                        </div>
                      </div>

                      {/* Mother Row with Toggle & Actions */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800/30 border border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px]">
                            👩
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {motherName} <span className="text-[10px] text-slate-400">(Mother)</span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{motherPhone}</div>
                          </div>
                        </div>

                        {/* Mother Actions */}
                        <div className="flex items-center gap-1.5">
                          {isMotherEnabled && (
                            <>
                              <a
                                href={getNativeSmsHref(motherPhone, getPersonalizedMessage(stu))}
                                onClick={() => markSmsOpened(stu.studentId)}
                                className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center gap-1 hover:bg-blue-100 transition-colors"
                                title="Open Mobile SMS for Mother"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>SMS</span>
                              </a>
                              <a
                                href={`https://wa.me/${getCleanPhoneForWhatsApp(motherPhone)}?text=${encodeURIComponent(getPersonalizedMessage(stu))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                                title="WhatsApp Mother"
                              >
                                <span className="text-xs">💬</span>
                                <span>WA</span>
                              </a>
                            </>
                          )}

                          {/* Mother toggle switch */}
                          <button
                            type="button"
                            onClick={() => toggleMother(stu.studentId)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                              isMotherEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-neutral-700'
                            }`}
                            title="Send to Mother as well"
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                isMotherEnabled ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. DELIVERY CHANNELS CARD */}
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 space-y-2.5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Delivery Channels</span>
            </h3>

            {/* Channel 1: Priority SMS */}
            <label className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    Send Priority SMS
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    DLT Header: EDUSCH • 100% Guaranteed Delivery
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={channelSms}
                onChange={(e) => setChannelSms(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </label>

            {/* Channel 2: WhatsApp Guardian Bot */}
            <label className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <span className="text-sm">💬</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5">
                    <span>WhatsApp Guardian Bot</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold">
                      +₹0.12/msg
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Includes interactive medical excuse reply button
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={channelWhatsapp}
                onChange={(e) => setChannelWhatsapp(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
            </label>

            {/* Channel 3: Parent App Push */}
            <label className="p-3 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-neutral-700 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    EduX Parent App Push
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Free Real-time Push Alert on Parent Portal
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={channelAppPush}
                onChange={(e) => setChannelAppPush(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded-sm border-slate-300 focus:ring-purple-500 cursor-pointer"
              />
            </label>
          </div>

          {/* MOBILE SMS DISPATCH QUEUE TRAY (Native Device SMS with Pre-filled Text) */}
          {(smsTrayOpen || channelSms) && selectedRecipientIds.size > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50/90 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>Mobile SMS Dispatch Queue ({selectedRecipientIds.size} Guardians)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSmsTrayOpen(!smsTrayOpen)}
                  className="text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {smsTrayOpen ? 'Minimize' : 'Expand Queue'}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-blue-200/80 dark:border-neutral-800 text-[11px] text-blue-900 dark:text-blue-200 flex items-start gap-2 leading-relaxed">
                <span className="text-base shrink-0">📱</span>
                <span>
                  <strong>Mobile SMS Workflow:</strong> Niche kisi bhi guardian ke <strong>"Open in Mobile SMS"</strong> par tap karein. Aapke phone ke SMS app me number aur poora message pehle se typed open hoga, fir aapko bas <strong>'Send'</strong> dabana hai!
                </span>
              </div>

              {smsTrayOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {displayStudents
                    .filter((s) => selectedRecipientIds.has(s.studentId))
                    .map((stu) => {
                      const fatherPhone = stu.parentPhone || '+91 98765 43210';
                      const motherPhone = stu.emergencyContact || '+91 98765 43211';
                      const isMotherOn = motherToggles[stu.studentId];
                      const msg = getPersonalizedMessage(stu);
                      const isOpened = openedSmsIds.has(stu.studentId);
                      const isCopied = copiedStudentId === `sms-tray-${stu.studentId}`;

                      return (
                        <div
                          key={stu.studentId}
                          className={`p-3 rounded-xl border transition-all ${
                            isOpened
                              ? 'bg-emerald-50/70 dark:bg-neutral-900 border-emerald-300 dark:border-emerald-800'
                              : 'bg-white dark:bg-neutral-900 border-blue-200 dark:border-neutral-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                <span>{stu.name}</span>
                                <span className="text-[10px] font-semibold text-slate-500">Roll {stu.rollNo}</span>
                                {isOpened && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold">
                                    ✓ Opened in SMS
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                Parent: {stu.fatherName || 'Guardian'} ({fatherPhone})
                              </div>
                              {isMotherOn && (
                                <div className="text-[10px] text-slate-500 truncate">
                                  Mother: {stu.motherName || 'Mother'} ({motherPhone})
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => handleCopyText(msg, `sms-tray-${stu.studentId}`, e)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 hover:bg-slate-50 text-slate-500 dark:text-slate-400 shrink-0 cursor-pointer"
                              title="Copy Pre-written SMS"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="mt-2.5 flex items-center gap-2">
                            <a
                              href={getNativeSmsHref(fatherPhone, msg)}
                              onClick={() => markSmsOpened(stu.studentId)}
                              className="flex-1 py-2 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>📱 Open in Mobile SMS</span>
                            </a>

                            {isMotherOn && (
                              <a
                                href={getNativeSmsHref(motherPhone, msg)}
                                onClick={() => markSmsOpened(stu.studentId)}
                                className="py-2 px-2.5 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center gap-1 border border-slate-200 dark:border-neutral-700 transition-colors"
                                title="Send SMS to Mother"
                              >
                                <span>👩 Mother</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* WHATSAPP TRAY (Direct Click-to-Chat links when dispatched) */}
          {whatsappTrayOpen && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <span className="text-sm">💬</span>
                  <span>WhatsApp Direct Chat Dispatch Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWhatsappTrayOpen(false)}
                  className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Hide
                </button>
              </div>
              <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/80">
                Click any parent below to open WhatsApp Web or mobile app with the pre-filled template message:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {displayStudents
                  .filter((s) => selectedRecipientIds.has(s.studentId))
                  .map((stu) => {
                    const phone = stu.parentPhone || stu.emergencyContact || '+91 98765 43210';
                    const link = `https://wa.me/${getCleanPhoneForWhatsApp(phone)}?text=${encodeURIComponent(getPersonalizedMessage(stu))}`;
                    return (
                      <a
                        key={stu.studentId}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between gap-2 hover:bg-emerald-100/50 dark:hover:bg-neutral-800 transition-colors group"
                      >
                        <div className="truncate">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {stu.name}'s Parent
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{phone}</div>
                        </div>
                        <span className="px-2 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 group-hover:bg-emerald-700 shrink-0">
                          <span>Send WA</span>
                          <ExternalLink className="w-3 h-3" />
                        </span>
                      </a>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* STICKY FOOTER ACTIONS */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Test to Self Button */}
            <button
              id="sms-test-to-self-btn"
              type="button"
              onClick={() => setTestModalOpen(true)}
              className="px-3.5 py-3 rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors shrink-0 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Test to Self</span>
            </button>

            {/* Send Alerts / Open in Mobile SMS App Primary Button */}
            <button
              id="sms-send-alerts-btn"
              type="button"
              disabled={selectedRecipientIds.size === 0 || isSending}
              onClick={handleSendAlerts}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer ${
                selectedRecipientIds.size === 0
                  ? 'bg-slate-200 dark:bg-neutral-800 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
              }`}
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Opening Mobile SMS App...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>📱 Open in Mobile SMS App ({selectedRecipientIds.size} Guardians)</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            📱 Message pre-written ready milega • Teacher phone me Send dabayega to SMS jayega
          </div>
        </div>
      </div>

      {/* EDIT PARENT CONTACT MODAL */}
      {editingStudent && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Parent Contact • {editingStudent.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Father's Name
                </label>
                <input
                  type="text"
                  value={editFatherName}
                  onChange={(e) => setEditFatherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Primary Mobile / WhatsApp No.
                </label>
                <input
                  type="text"
                  value={editFatherPhone}
                  onChange={(e) => setEditFatherPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Mother's Name
                </label>
                <input
                  type="text"
                  value={editMotherName}
                  onChange={(e) => setEditMotherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Mother's Mobile No. (Optional)
                </label>
                <input
                  type="text"
                  value={editMotherPhone}
                  onChange={(e) => setEditMotherPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveParentEdit}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TEST TO SELF MODAL */}
      {testModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-sm rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-blue-600" />
                <span>Test Alert to Self</span>
              </h3>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Verify how the alert appears before broadcasting to guardians. A test message will be sent to your registered phone.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Your Phone Number
              </label>
              <input
                type="text"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>

            {testSent && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Test SMS & WhatsApp ping sent successfully!</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTest}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Send Test</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
