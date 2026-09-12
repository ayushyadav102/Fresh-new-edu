import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from './Modal';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Sparkles,
  User,
  GraduationCap,
  UserCheck
} from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: 'student' | 'teacher' | 'principal' | 'superadmin';
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  targetRole
}) => {
  const {
    role,
    student,
    teacher,
    principal,
    superAdmin,
    updateProfile,
    updateTeacherProfile,
    updatePrincipalProfile,
    updateSuperAdminProfile
  } = useAuth();
  const activeRole = targetRole || role;

  const currentAvatar =
    activeRole === 'superadmin'
      ? superAdmin?.avatar
      : activeRole === 'principal'
      ? principal?.avatar
      : activeRole === 'teacher'
      ? teacher?.avatar
      : student?.avatar;

  const currentName =
    activeRole === 'superadmin'
      ? superAdmin?.name
      : activeRole === 'principal'
      ? principal?.name
      : activeRole === 'teacher'
      ? teacher?.name
      : student?.name;

  const [preview, setPreview] = useState<string>(currentAvatar || '');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPreview(currentAvatar || '');
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, currentAvatar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Selected image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreview(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to load image from your gallery.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (activeRole === 'superadmin') {
      updateSuperAdminProfile({ avatar: preview });
    } else if (activeRole === 'principal') {
      updatePrincipalProfile({ avatar: preview });
    } else if (activeRole === 'teacher') {
      updateTeacherProfile({ avatar: preview });
    } else {
      updateProfile({ avatar: preview });
    }
    setSuccessMsg('Profile picture updated successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 800);
  };

  const handleRemove = () => {
    setPreview('');
    if (activeRole === 'superadmin') {
      updateSuperAdminProfile({ avatar: '' });
    } else if (activeRole === 'principal') {
      updatePrincipalProfile({ avatar: '' });
    } else if (activeRole === 'teacher') {
      updateTeacherProfile({ avatar: '' });
    } else {
      updateProfile({ avatar: '' });
    }
    setSuccessMsg('Profile picture removed. Initials will be displayed.');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 800);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        activeRole === 'superadmin'
          ? 'Update Super Admin Profile Picture'
          : activeRole === 'principal'
          ? 'Update Principal Profile Picture'
          : activeRole === 'teacher'
          ? 'Update Faculty Profile Picture'
          : 'Update Student Profile Picture'
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        {/* Subtitle & Instructions */}
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 text-center">
          Select a photo from your phone or computer gallery to set as your official profile picture.
        </p>

        {/* Live Circular Preview / Initials Badge */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative group">
            {preview && preview.trim() !== '' ? (
              <img
                src={preview}
                alt={currentName || 'Profile Preview'}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-500/30 dark:ring-blue-400/40 shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-3xl ring-4 ring-blue-500/20 shadow-xl uppercase tracking-wider">
                {getInitials(currentName)}
              </div>
            )}

            {/* Quick click on avatar to open gallery */}
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-2 border-white dark:border-slate-900 transition-transform active:scale-95 cursor-pointer duration-150 ease-in-out"
              title="Browse Gallery"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-3 font-extrabold text-slate-900 dark:text-white text-base">
            {currentName}
          </p>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {activeRole === 'superadmin'
              ? 'Super Admin / Platform Owner'
              : activeRole === 'principal'
              ? 'Principal / Institutional Leadership'
              : activeRole === 'teacher'
              ? 'Teacher / Faculty Account'
              : 'Student Account'}
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="gallery-photo-input"
        />

        {/* Gallery Selection Drop/Click Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-5 text-center bg-slate-50 dark:bg-neutral-900/50 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all cursor-pointer group shadow-2xs ease-in-out active:scale-[0.98] duration-150"
        >
          <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform active:scale-[0.98] duration-150 ease-in-out">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm font-black text-slate-900 dark:text-white">
            Click here to choose photo from Gallery
          </p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Supports PNG, JPG, JPEG, WEBP (Max 5MB)
          </p>
        </div>

        {/* Alerts & Feedback */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-neutral-800">
          {preview ? (
            <button
              onClick={handleRemove}
              type="button"
              className="px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors ease-in-out active:scale-[0.98] duration-150"
            >
              <Trash2 className="w-4 h-4" />
              <span>Remove Photo</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-neutral-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
            >
              Save Photo
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
