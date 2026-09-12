import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { UserAvatar } from './UserAvatar';
import { ProfilePhotoModal } from './ProfilePhotoModal';
import { DEMO_TEACHERS } from '../../data/mockData';
import {
  X,
  User,
  Users,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Heart,
  BookOpen,
  Bus,
  Home,
  CheckCircle2,
  Camera,
  ShieldCheck,
  Award,
  Clock,
  UserCheck
} from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profile' | 'switch'; // Keep for backwards compatibility if needed
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose
}) => {
  const { student } = useAuth();
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const classMentor = React.useMemo(() => {
    if (student?.mentor?.name) {
      return {
        name: student.mentor.name,
        designation: student.mentor.designation || 'Class Teacher',
        phone: student.mentor.phone || '+91 98123 00998',
        email: student.mentor.email || 'mentor@stxaviers.edu.in'
      };
    }
    const clsClean = (student?.className || '').replace(/^Class\s*/i, '').trim();
    const found = DEMO_TEACHERS.find(t => {
      const ct = (t.classTeacherOf || '').replace(/^Class\s*/i, '').trim();
      return ct === clsClean || ct.startsWith(clsClean);
    });
    if (found) {
      return {
        name: found.name,
        designation: `Class Teacher (${found.designation || found.department})`,
        phone: found.phone || '+91 98123 00998',
        email: found.email || 'teacher@stxaviers.edu.in'
      };
    }
    return {
      name: 'Faculty Mentor',
      designation: 'Class Teacher',
      phone: '+91 98123 00998',
      email: 'mentor@stxaviers.edu.in'
    };
  }, [student]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight font-serif">
                  Student Profile & Account
                </h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Manage your personal academic bio and credentials
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6">
            <div className="space-y-6">
              {/* Active Student Top Hero Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white dark:from-slate-800 dark:via-blue-950/20 dark:to-slate-900 border border-blue-200/80 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    avatar={student?.avatar}
                    name={student?.name}
                    role="student"
                    size="lg"
                    editable={true}
                    onEdit={() => setShowPhotoModal(true)}
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider">
                        Active Student
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                        ID: {student?.studentId}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                        Roll #{student?.rollNo}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
                      {student?.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {student?.className} • {student?.stream}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {student?.schoolName}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>Change Photo</span>
                  </button>
                </div>
              </div>

              {/* Bento Grid Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    <span>Class & Stream</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {student?.className}
                    </p>
                    <p className="text-xs font-bold text-slate-500">{student?.stream}</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                    <Calendar className="w-4 h-4" />
                    <span>Academic Session</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      2025-2026
                    </p>
                    <p className="text-xs font-bold text-slate-500">Regular Term</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    <span>Overall Percentage</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      91.5% (Grade A1)
                    </p>
                    <p className="text-xs font-bold text-slate-500">Term 1 Result</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-black uppercase tracking-wider">
                    <Clock className="w-4 h-4" />
                    <span>Roll & Status</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      Roll #{student?.rollNo}
                    </p>
                    <p className="text-xs font-bold text-slate-500">Regular • Active</p>
                  </div>
                </div>
              </div>

              {/* Two Column Layout for Details */}
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Personal Information */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-5 shadow-xs">
                  <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-3">
                    <User className="w-4 h-4 text-slate-400" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</p>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{student?.dob}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Blood Group</p>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-black bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400">
                        <Heart className="w-3 h-3" />
                        {student?.bloodGroup}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Student Phone</p>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{student?.phone || 'Not Provided'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email ID</p>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">{student?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Family & Contact */}
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-5 shadow-xs">
                  <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-3">
                    <Users className="w-4 h-4 text-slate-400" />
                    Family & Contact
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Father's Name</p>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{student?.fatherName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mother's Name</p>
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{student?.motherName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Primary Parent Contact</p>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {student?.parentPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Residential Address</p>
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-snug flex items-start gap-2">
                        <Home className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        {student?.address || '123, Green Avenue, Springfield Sector 4, City Center - 400012'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* School Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Mentor Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    <UserCheck className="w-4 h-4" />
                    <span>Assigned Class Mentor</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-1.5">
                    <p className="font-black text-sm text-slate-900 dark:text-white">{classMentor.name}</p>
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300">{classMentor.designation}</p>
                    <div className="pt-2 border-t border-amber-200 dark:border-amber-900 flex flex-wrap gap-3 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      <span>📞 {classMentor.phone}</span>
                      <span>✉️ {classMentor.email}</span>
                    </div>
                  </div>
                </div>

                {/* School Transport & Bus Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs font-black text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                    <Bus className="w-4 h-4" />
                    <span>School Transport & Route</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Bus Route & No</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">Route 04 (City Express)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">Designated Stop</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">Main Gate / Green Park</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Current Session: {student?.name} (Class {student?.className})</span>
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-black transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        targetRole="student"
      />
    </>
  );
};
