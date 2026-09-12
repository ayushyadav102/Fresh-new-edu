import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { Calendar, Download, Plus, MapPin, CheckCircle, Clock, ShieldAlert, Edit2, User, MonitorPlay } from 'lucide-react';
import { format } from 'date-fns';
import { OnlineTestGateway } from '../academics/OnlineTestGateway';

export const TeacherExamsModule = ({ teacher, selectedClass }: { teacher: any, selectedClass: string }) => {
  const { exams, addExamItem, updateExamItem, students } = useERP();
  const [activeTab, setActiveTab] = useState<'all' | 'teacher' | 'principal'>('all');
  const [selectedOnlineTest, setSelectedOnlineTest] = useState<any>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form state
  const [testTitle, setTestTitle] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [testMarks, setTestMarks] = useState('25');
  const [testDate, setTestDate] = useState('');
  const [testTime, setTestTime] = useState('');
  const [testRoom, setTestRoom] = useState('');
  const [testType, setTestType] = useState<'class_test' | 'practical'>('class_test');

  
  
  const getSubjectOptions = () => {
    let options: {label: string, value: string}[] = [];
    
    if (teacher?.subjectsTaught && Array.isArray(teacher.subjectsTaught) && teacher.subjectsTaught.length > 0) {
      options = teacher.subjectsTaught.map((sub: string) => {
        let code = '';
        const lowerSub = sub.toLowerCase();
        if (lowerSub.includes('physics')) code = '042';
        else if (lowerSub.includes('chemistry')) code = '043';
        else if (lowerSub.includes('math')) code = '041';
        else if (lowerSub.includes('english')) code = '301';
        else if (lowerSub.includes('accountancy')) code = '055';
        else if (lowerSub.includes('business')) code = '054';
        else if (lowerSub.includes('economics')) code = '030';
        else if (lowerSub.includes('computer')) code = '083';
        else if (lowerSub.includes('biology')) code = '044';
        
        const label = code && !sub.match(/\d+/) ? `${sub} ${code}` : sub;
        return { label, value: label };
      });
    } else {
      if (selectedClass.includes('11') || selectedClass.includes('12')) {
        if (selectedClass.includes('A') || selectedClass.includes('B')) {
          options = [
            { label: 'Physics 042', value: 'Physics 042' },
            { label: 'Chemistry 043', value: 'Chemistry 043' },
            { label: 'Mathematics 041', value: 'Mathematics 041' },
            { label: 'English Core 301', value: 'English Core 301' },
            { label: 'Computer Science 083', value: 'Computer Science 083' },
          ];
        } else if (selectedClass.includes('C') || selectedClass.includes('D')) {
           options = [
            { label: 'Accountancy 055', value: 'Accountancy 055' },
            { label: 'Business Studies 054', value: 'Business Studies 054' },
            { label: 'Economics 030', value: 'Economics 030' },
            { label: 'Mathematics 041', value: 'Mathematics 041' },
            { label: 'English Core 301', value: 'English Core 301' },
          ];
        } else {
           options = [
            { label: 'Physics 042', value: 'Physics 042' },
            { label: 'Chemistry 043', value: 'Chemistry 043' },
            { label: 'Mathematics 041', value: 'Mathematics 041' },
            { label: 'English Core 301', value: 'English Core 301' },
            { label: 'Accountancy 055', value: 'Accountancy 055' },
            { label: 'Business Studies 054', value: 'Business Studies 054' },
          ];
        }
      } else {
        options = [
          { label: 'Science 086', value: 'Science 086' },
          { label: 'Mathematics 041', value: 'Mathematics 041' },
          { label: 'Social Science 087', value: 'Social Science 087' },
          { label: 'English 184', value: 'English 184' },
          { label: 'Hindi 002', value: 'Hindi 002' },
        ];
      }
    }
    return options;
  };

  const subjectOptions = getSubjectOptions();

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTitle || !testSubject || !testDate) return;
    
    addExamItem({
      title: testTitle,
      type: testType,
      code: testSubject.split(' ')[testSubject.split(' ').length - 1] || 'GEN',
      marks: parseInt(testMarks),
      date: testDate,
      time: testTime,
      room: testRoom,
      teacher: teacher.name,
      status: 'pending_approval',
      targetClass: selectedClass,
      createdBy: teacher.name
    });
    
    setShowScheduleModal(false);
    // Reset
    setTestTitle('');
    setTestDate('');
    setTestTime('');
    setTestRoom('');
  };

  const myExams = exams.filter(e => e.targetClass === selectedClass);
  const teacherExams = myExams.filter(e => e.type === 'class_test' || e.type === 'practical');
  const principalExams = myExams.filter(e => e.type === 'board_term');
  
  const displayedExams = activeTab === 'all' ? myExams : activeTab === 'teacher' ? teacherExams : principalExams;
  const sortedExams = [...displayedExams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Personal duties mock
  const personalDuties = exams.filter(e => e.invigilator === teacher.name || e.teacher === teacher.name).length;

  if (selectedOnlineTest) {
    return <OnlineTestGateway test={selectedOnlineTest} onBack={() => setSelectedOnlineTest(null)} role="teacher" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Card */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-neutral-800 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 font-bold flex items-center justify-center text-xs">
              {selectedClass.split('-')[0]}
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Class {selectedClass}</h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 ml-2">
              Central Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Room 101 • 9 Enrolled • Senior Wing
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject Faculty Team:</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Mr. Vikram (Maths) • Mrs. Sunita (Chem) • Mrs. Rekha (Eng)
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowScheduleModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Schedule Class Test / Practical
        </button>
      </div>

      {/* Duty Slip Card */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BadgeIcon className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            <h4 className="font-bold text-slate-900 dark:text-white">Your Personal Invigilation Duty Slip</h4>
            <span className="text-[10px] bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded font-bold">
              {personalDuties} Orders Assigned
            </span>
          </div>
          <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-3 border border-amber-100 dark:border-amber-900/40">
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-1">Next Upcoming Duty:</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Class 10-A • Sanskrit (Sub Code: 110)</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> 10 Sep 2026 • <MapPin className="w-3.5 h-3.5 ml-1" /> Room 301 (Sec. Block)
            </p>
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-3">
          <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
            08:45 AM Shift
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Orders Sanctioned by Dr. Arvind Sen</p>
          <button className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-1 mt-1">
            <Download className="w-3.5 h-3.5" /> Duty Slip (PDF)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 border-b border-slate-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 border-b-2 text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'all'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          All Class {selectedClass} ({myExams.length})
        </button>
        <button
          onClick={() => setActiveTab('teacher')}
          className={`px-4 py-2 border-b-2 text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'teacher'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Teacher Scheduled ({teacherExams.length})
        </button>
        <button
          onClick={() => setActiveTab('principal')}
          className={`px-4 py-2 border-b-2 text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'principal'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          Principal Directives ({principalExams.length})
        </button>
      </div>

      {/* Internal Tests Header */}
      {(activeTab === 'all' || activeTab === 'teacher') && (
        <div className="flex items-center justify-between mt-4">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Internal Tests & Practicals (By You)
          </h3>
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
            {teacherExams.length} Slots Configured
          </span>
        </div>
      )}

      {/* List */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-neutral-800 before:to-transparent">
        {sortedExams.map((exam) => {
          const isBoard = exam.type === 'board_term';
          const isPractical = exam.type === 'practical';

          return (
            <div key={exam.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-[#0a0a0a] bg-slate-100 dark:bg-neutral-800 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {isBoard ? <ShieldAlert className="w-4 h-4 text-blue-500" /> : <Calendar className="w-4 h-4 text-purple-500" />}
              </div>
              
              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-[#0a0a0a] p-4 rounded-2xl border shadow-sm transition-all ${
                isBoard ? 'border-blue-200 dark:border-blue-900/50' : 'border-purple-200 dark:border-purple-900/50'
              }`}>
                
                <div className="flex justify-between items-start mb-3">
                  <div className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${
                    isBoard 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' 
                      : isPractical 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                  }`}>
                    {isBoard ? 'Principal Directive' : isPractical ? 'Department Practical' : 'Class Unit-Test'}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{format(new Date(exam.date), 'dd MMM yyyy')}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Sub Code: {exam.code}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {exam.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                      {isBoard ? `Chief Invigilator: ${exam.invigilator}` : exam.type === 'practical' ? `Lab In-charge: ${exam.teacher}` : `Coordinator: ${exam.teacher}`}
                      {(!isBoard && exam.teacher === teacher.name) && " (You)"}
                    </p>
                  </div>
                  <div className="bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 text-xs font-black px-2 py-1 rounded-lg border border-slate-200 dark:border-neutral-700">
                    {exam.marks} Marks
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-neutral-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {exam.time}
                    <MapPin className="w-3.5 h-3.5 ml-2" /> {exam.room}
                  </div>
                  <div className="flex items-center gap-2">
                    {exam.status === 'pending_approval' && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Pending Ratification
                      </span>
                    )}
                    {exam.status === 'ratified' && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Ratified
                      </span>
                    )}
                    {isBoard ? (
                      <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Locked
                      </span>
                    ) : exam.room?.toLowerCase() === 'online' ? (
                      <button 
                        onClick={() => setSelectedOnlineTest(exam)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <MonitorPlay className="w-3.5 h-3.5" /> Manage Test
                      </button>
                    ) : (
                      <button className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1">
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-neutral-800">
            <div className="p-5 border-b border-slate-200 dark:border-neutral-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Schedule Internal Exam</h2>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Exam Type</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setTestType('class_test')} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${testType === 'class_test' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>Unit Test</button>
                  <button type="button" onClick={() => setTestType('practical')} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${testType === 'practical' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>Practical</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Subject</label>
                <select value={testSubject} onChange={(e) => setTestSubject(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm" required>
                  <option value="">Select Subject</option>
                  {subjectOptions.map((opt, i) => (
                    <option key={i} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Test Title</label>
                <input type="text" value={testTitle} onChange={(e) => setTestTitle(e.target.value)} placeholder="e.g. Wave Optics & Numericals" className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm" required />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm" required />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time</label>
                  <input type="text" value={testTime} onChange={(e) => setTestTime(e.target.value)} placeholder="09:30 AM" className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm" required />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marks</label>
                  <input type="number" value={testMarks} onChange={(e) => setTestMarks(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm" required />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Room</label>
                  <input type="text" value={testRoom} onChange={(e) => setTestRoom(e.target.value)} placeholder="e.g. Room 101" className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl text-sm" required />
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98] mt-2">
                Submit for Principal Ratification
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Fake icon component to fix import if missing
const BadgeIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/></svg>
);
