import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import { ProfilePhotoModal } from '../common/ProfilePhotoModal';
import { DataModeBadge } from '../common/DataModeBadge';
import { fetchWithAuth } from '../../lib/api-client';
import { 
  MessageSquare, Send, Database, Building2, 
  Users, 
  BookOpen, 
  IndianRupee, 
  Calendar, 
  GraduationCap,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  TrendingUp,
  Award,
  Download,
  Edit2,
  Save,
  X
} from 'lucide-react';

interface SchoolData {
  id: string;
  name: string;
  location: string;
  logo: string | null;
  onboardedDate: string;
  duration: string;
  revenueGenerated: number;
  monthlyRecurringRevenue: number;
  studentCapacity: number;
  enrolledStudents: number;
  teacherCount: number;
  subjectCount: number;
  status: 'Active' | 'Trial' | 'Suspended';
  principalName: string;
  contactEmail: string;
  contactPhone: string;
}

// Initial Data matching the app's real configuration but with 0 payment
const INITIAL_SCHOOLS: SchoolData[] = [
  {
    id: 'SCH-001',
    name: "St. Xavier's Senior Secondary School",
    location: "New Delhi, India",
    logo: "/logo.png",
    onboardedDate: "12 Jan 2025",
    duration: "1 Year, 8 Months",
    revenueGenerated: 0,
    monthlyRecurringRevenue: 0,
    studentCapacity: 3000,
    enrolledStudents: 2450,
    teacherCount: 112,
    subjectCount: 24,
    status: 'Active',
    principalName: "Dr. Arvind Swaminathan",
    contactEmail: "admin@stxaviers.edu.in",
    contactPhone: "+91 98765 43210"
  }
];


const DatabaseAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: 'Hello! I am connected to your live Cloud SQL Database. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetchWithAuth('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages.slice(1) })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error.' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Network error.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-neutral-900 w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 flex flex-col overflow-hidden" style={{ height: '500px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-100" />
              <div>
                <h3 className="font-bold text-sm">Database AI Assistant</h3>
                <p className="text-[10px] text-blue-100 font-medium">Cloud SQL Connected</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-neutral-950">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>
          
          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-800">
            <div className="flex gap-2 relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about students, fees..."
                className="flex-1 bg-slate-100 dark:bg-neutral-800 border border-transparent focus:border-blue-500 dark:focus:border-blue-500 text-slate-900 dark:text-white rounded-xl px-4 py-2 text-sm outline-hidden"
              />
              <button 
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 transition-all text-white p-4 rounded-full shadow-xl flex items-center gap-2"
        >
          <Database className="w-6 h-6" />
          <span className="font-bold pr-2 hidden sm:block">Ask Database</span>
        </button>
      )}
    </div>
  );
};

export const SuperAdminPortal: React.FC = () => {
  const { superAdmin } = useAuth();
  const [showAdminPhotoModal, setShowAdminPhotoModal] = useState(false);
  const [schools, setSchools] = useState<SchoolData[]>(INITIAL_SCHOOLS);
  
  // Edit State
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<SchoolData | null>(null);

  const totalRevenue = schools.reduce((acc, sch) => acc + sch.revenueGenerated, 0);
  const totalMRR = schools.reduce((acc, sch) => acc + sch.monthlyRecurringRevenue, 0);
  const totalStudents = schools.reduce((acc, sch) => acc + sch.enrolledStudents, 0);
  const totalTeachers = schools.reduce((acc, sch) => acc + sch.teacherCount, 0);

  const handleDownloadCSV = () => {
    const headers = [
      'School ID', 'Name', 'Location', 'Status', 'Revenue Collected (INR)', 'MRR (INR)', 
      'Capacity', 'Enrolled', 'Teachers', 'Subjects', 'Principal', 'Email', 'Phone'
    ];
    
    const rows = schools.map(s => [
      s.id, 
      `"${s.name}"`, 
      `"${s.location}"`, 
      s.status, 
      s.revenueGenerated, 
      s.monthlyRecurringRevenue,
      s.studentCapacity, 
      s.enrolledStudents, 
      s.teacherCount, 
      s.subjectCount,
      `"${s.principalName}"`, 
      s.contactEmail, 
      s.contactPhone
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'EduX_Schools_Data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditClick = (school: SchoolData) => {
    setEditingSchoolId(school.id);
    setEditFormData({ ...school });
  };

  const handleCancelEdit = () => {
    setEditingSchoolId(null);
    setEditFormData(null);
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      setSchools(schools.map(s => s.id === editFormData.id ? editFormData : s));
      setEditingSchoolId(null);
      setEditFormData(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editFormData) return;
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'number') {
      parsedValue = value === '' ? 0 : Number(value);
    }

    setEditFormData({
      ...editFormData,
      [name]: parsedValue
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
              My SaaS Empire
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-serif">
            Platform Owner Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium max-w-xl">
            Welcome to your master control panel. Monitor every school using your app, track your revenue, staff capacities, and overall platform growth in one place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handleDownloadCSV}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] duration-150 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            Download CSV Data
          </button>
          
          {/* Profile Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-neutral-900/70 border border-slate-200 dark:border-neutral-700/80 shrink-0">
            <UserAvatar
              avatar={superAdmin?.avatar}
              name={superAdmin?.name || 'Owner'}
              role="superadmin"
              size="md"
              editable={true}
              onEdit={() => setShowAdminPhotoModal(true)}
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white block text-sm">
                {superAdmin?.name || 'Ayush'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                  Platform Founder
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Revenue & Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-md flex flex-col justify-center">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <IndianRupee className="w-4 h-4" />
            <span className="text-[10px] uppercase font-black tracking-wider">Total Revenue Generated</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            ₹{totalRevenue.toLocaleString()}
          </span>
        </div>
        
        <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-md flex flex-col justify-center">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] uppercase font-black tracking-wider">Monthly Income (MRR)</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            ₹{totalMRR.toLocaleString()}/mo
          </span>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-md flex flex-col justify-center">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
            <GraduationCap className="w-4 h-4" />
            <span className="text-[10px] uppercase font-black tracking-wider">Total Students Enrolled</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalStudents.toLocaleString()}
          </span>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-md flex flex-col justify-center">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
            <Building2 className="w-4 h-4" />
            <span className="text-[10px] uppercase font-black tracking-wider">Active Client Schools</span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {schools.length} Schools
          </span>
        </div>
      </div>

      {/* Cloud Infrastructure & Multi-Device Sync Panel - SuperAdmin Exclusive */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-white">
                Cloud Database & Multi-Device Sync Pipeline
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase tracking-wider">
                Protected • SuperAdmin Only
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl font-normal">
              Students, teachers and unauthorized users cannot see or touch this. Use this control to switch between Local Mock Data and Google Cloud Firestore, or to seed the cloud database.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto justify-end">
          <DataModeBadge />
        </div>
      </div>

      {/* Client Schools List */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          My App's Client Schools
        </h2>
        
        <div className="grid grid-cols-1 gap-5">
          {schools.map((school) => (
            <div key={school.id} className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-md overflow-hidden flex flex-col transition-all hover:shadow-lg relative">
              
              {editingSchoolId === school.id && editFormData ? (
                // --- EDIT MODE ---
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 pb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Edit2 className="w-5 h-5 text-blue-600" /> Edit School Data: {school.id}
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={handleCancelEdit} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                      <button onClick={handleSaveEdit} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors">
                        <Save className="w-4 h-4" /> Save
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">School Name</label>
                      <input type="text" name="name" value={editFormData.name} onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-hidden" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Location</label>
                      <input type="text" name="location" value={editFormData.location} onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-hidden" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Status</label>
                      <select name="status" value={editFormData.status} onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-hidden">
                        <option value="Active">Active</option>
                        <option value="Trial">Trial</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Total Revenue Collected (₹)</label>
                      <input type="number" name="revenueGenerated" value={editFormData.revenueGenerated} onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-hidden" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">MRR (₹)</label>
                      <input type="number" name="monthlyRecurringRevenue" value={editFormData.monthlyRecurringRevenue} onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-hidden" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Enrolled Students</label>
                      <input type="number" name="enrolledStudents" value={editFormData.enrolledStudents} onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-hidden" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Student Capacity</label>
                      <input type="number" name="studentCapacity" value={editFormData.studentCapacity} onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-hidden" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Total Teachers</label>
                      <input type="number" name="teacherCount" value={editFormData.teacherCount} onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-hidden" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Subjects</label>
                      <input type="number" name="subjectCount" value={editFormData.subjectCount} onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-hidden" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Principal Name</label>
                      <input type="text" name="principalName" value={editFormData.principalName} onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-hidden" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Contact Email</label>
                      <input type="email" name="contactEmail" value={editFormData.contactEmail} onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-hidden" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Contact Phone</label>
                      <input type="text" name="contactPhone" value={editFormData.contactPhone} onChange={handleChange} className="w-full p-2 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-sm text-slate-900 dark:text-white focus:border-blue-500 outline-hidden" />
                    </div>
                  </div>
                </div>
              ) : (
                // --- VIEW MODE ---
                <>
                  <button 
                    onClick={() => handleEditClick(school)}
                    className="absolute top-4 right-4 p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
                    title="Edit School Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* School Header */}
                  <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 flex items-center justify-center p-2 shrink-0 shadow-xs">
                      {school.logo ? (
                        <img src={school.logo} alt={school.name} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pr-10">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-neutral-700">
                          ID: {school.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                          school.status === 'Active' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {school.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                          {school.status}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
                        {school.name}
                      </h3>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {school.location}
                      </p>
                    </div>
                  </div>

                  {/* Business Metrics */}
                  <div className="p-5 sm:p-6 bg-slate-50/50 dark:bg-neutral-900/30 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-slate-100 dark:border-neutral-800">
                    <div className="space-y-1">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <Calendar className="w-3 h-3" /> Time Used
                      </span>
                      <p className="text-base font-black text-slate-900 dark:text-white">{school.duration}</p>
                      <p className="text-[10px] font-medium text-slate-400">Since {school.onboardedDate}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">
                        <IndianRupee className="w-3 h-3" /> Total Paid
                      </span>
                      <p className="text-base font-black text-emerald-700 dark:text-emerald-400">₹{school.revenueGenerated.toLocaleString()}</p>
                      <p className="text-[10px] font-medium text-slate-400">MRR: ₹{school.monthlyRecurringRevenue}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-500 uppercase tracking-wider">
                        <Users className="w-3 h-3" /> Teachers
                      </span>
                      <p className="text-base font-black text-slate-900 dark:text-white">{school.teacherCount} Staff</p>
                    </div>
                    <div className="space-y-1">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-500 uppercase tracking-wider">
                        <BookOpen className="w-3 h-3" /> Subjects
                      </span>
                      <p className="text-base font-black text-slate-900 dark:text-white">{school.subjectCount} Subjects</p>
                    </div>
                  </div>

                  {/* Capacity & Contact */}
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                    <div className="flex-1 w-full max-w-md">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Student Capacity Used</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {school.enrolledStudents} / {school.studentCapacity}
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{ width: `${Math.min((school.enrolledStudents / school.studentCapacity) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="shrink-0 space-y-1.5 bg-slate-100 dark:bg-neutral-900 p-4 rounded-xl border border-slate-200 dark:border-neutral-800 w-full sm:w-auto">
                      <p className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-500" />
                        {school.principalName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> {school.contactEmail}
                      </p>
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> {school.contactPhone}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <ProfilePhotoModal
        isOpen={showAdminPhotoModal}
        onClose={() => setShowAdminPhotoModal(false)}
        targetRole="superadmin"
      />
          <DatabaseAIChat />
    </div>
  );
};
