import React, { useState, useEffect } from 'react';
import { Camera, User, GraduationCap, UserCheck } from 'lucide-react';

interface UserAvatarProps {
  avatar?: string;
  name?: string;
  role?: 'student' | 'teacher' | 'principal' | 'superadmin';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onEdit?: () => void;
  className?: string;
  ringColor?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name = 'User',
  role = 'student',
  size = 'md',
  editable = false,
  onEdit,
  className = '',
  ringColor
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [avatar]);

  const getInitials = (str: string) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 sm:w-18 sm:h-18 text-xl',
    xl: 'w-24 h-24 text-2xl'
  };

  const gradientClass =
    role === 'superadmin'
      ? 'bg-gradient-to-tr from-indigo-700 via-purple-700 to-pink-700'
      : role === 'principal'
      ? 'bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-700'
      : role === 'teacher'
      ? 'bg-gradient-to-tr from-purple-700 via-indigo-700 to-blue-700'
      : 'bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-600';

  const defaultRing =
    ringColor ||
    (role === 'superadmin'
      ? 'ring-indigo-400/30'
      : role === 'principal'
      ? 'ring-amber-400/40'
      : role === 'teacher'
      ? 'ring-purple-400/30'
      : 'ring-blue-500/30');

  const hasValidAvatar = Boolean(avatar && typeof avatar === 'string' && avatar.trim() !== '' && !imgError);

  return (
    <div className={`relative inline-block shrink-0 group ${className}`}>
      {hasValidAvatar ? (
        <img
          src={avatar}
          alt={name}
          className={`${sizeClasses[size]} rounded-2xl object-cover ring-2 ${defaultRing} shadow-sm`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-2xl ${gradientClass} text-white flex items-center justify-center font-black tracking-tight ring-2 ${defaultRing} shadow-sm select-none uppercase`}
        >
          {getInitials(name)}
        </div>
      )}

      {editable && onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          type="button"
          aria-label="Upload Photo from Gallery"
          title="Change photo from gallery"
          className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md border-2 border-white dark:border-slate-900 transition-transform active:scale-90 cursor-pointer flex items-center justify-center ease-in-out duration-150"
        >
          <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      )}
    </div>
  );
};
