import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MessageSquare,
  ArrowLeft,
  Search,
  Moon,
  Sun,
  MoreVertical,
  ShieldCheck,
  Pin,
  Download,
  Eye,
  Maximize2,
  Check,
  CheckCheck,
  Play,
  Pause,
  Mic,
  Plus,
  Send,
  Smile,
  ThumbsUp,
  Lightbulb,
  FileText,
  Image as ImageIcon,
  Video,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  Share2,
  Bookmark,
  Award,
  Radio,
  Lock,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChatMessage } from '../../types';
import {
  subscribeToChatMessages,
  sendChatMessage,
  toggleMessageReactionInFirestore,
  toggleTeacherVerificationInFirestore,
  INITIAL_DEMO_MESSAGES,
  getCachedChatMessages,
  normalizeClassCode
} from '../../services/chatService';
import { uploadFileToCloudStorage } from '../../services/cloudDbService';

interface ChatBoxScreenProps {
  onBack?: () => void;
  isTeacherView?: boolean;
  selectedClass?: string;
  onSelectClass?: (cls: string) => void;
}

const CLASS_MENTORS_INFO: Record<'9' | '10' | '11' | '12', { name: string; dept: string }> = {
  '9': { name: 'Mrs. Sangeeta Sen', dept: 'TGT Science • Class Teacher 9-A' },
  '10': { name: 'Mrs. Sunita Rao', dept: 'TGT Mathematics • Class Teacher 10-A' },
  '11': { name: 'Dr. Rajesh Sharma', dept: 'PGT Physics • HOD Science & Class Teacher 11-A' },
  '12': { name: 'Mrs. Sunita Verma', dept: 'PGT Chemistry • Class Teacher 12-A' }
};

export const ChatBoxScreen: React.FC<ChatBoxScreenProps> = ({ onBack, isTeacherView: explicitTeacherView, selectedClass, onSelectClass }) => {
  const { role, student, teacher } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isTeacher = explicitTeacherView !== undefined ? explicitTeacherView : role === 'teacher';

  // Teacher class switcher state: allows faculty to switch active chat context among their classes
  const [teacherSelectedClass, setTeacherSelectedClass] = useState<string>(() => {
    if (selectedClass) return normalizeClassCode(selectedClass);
    if (teacher?.classTeacherOf) return normalizeClassCode(teacher.classTeacherOf);
    return '11';
  });

  // Sync when selectedClass prop changes from outside (e.g. TeacherPortalScreen class selector)
  useEffect(() => {
    if (selectedClass) {
      setTeacherSelectedClass(normalizeClassCode(selectedClass));
    }
  }, [selectedClass]);

  // Active normalized class code ('9' | '10' | '11' | '12')
  // For students: STRICTLY locked to their enrolled class (cannot switch or access other classes)
  // For teachers: locked to teacherSelectedClass
  const activeClassCode = useMemo<'9' | '10' | '11' | '12'>(() => {
    if (isTeacher) {
      return normalizeClassCode(teacherSelectedClass);
    }
    return normalizeClassCode(student?.className || '11');
  }, [isTeacher, teacherSelectedClass, student]);

  // Dynamic class name computation
  const currentClassName = useMemo(() => {
    return `Class ${activeClassCode}`;
  }, [activeClassCode]);

  // Dynamic class badge (e.g. 9A, 10A, 11A, 12A)
  const classBadge = useMemo(() => {
    if (!isTeacher && student?.section) {
      const sec = student.section.replace(/[^A-Za-z]/g, '').toUpperCase() || 'A';
      return `${activeClassCode}${sec}`;
    }
    return `${activeClassCode}A`;
  }, [activeClassCode, isTeacher, student]);

  // Dynamic active mentor info for the active class
  const activeMentor = useMemo(() => {
    const defaultForClass = CLASS_MENTORS_INFO[activeClassCode] || CLASS_MENTORS_INFO['11'];
    if (isTeacher && teacher) {
      const isClassTeacher = normalizeClassCode(teacher.classTeacherOf) === activeClassCode;
      return {
        name: isClassTeacher ? teacher.name : defaultForClass.name,
        dept: isClassTeacher ? (teacher.designation || 'Class Incharge') : defaultForClass.dept,
        isSelf: isClassTeacher
      };
    }
    if (student?.mentor?.name && normalizeClassCode(student?.className) === activeClassCode) {
      return {
        name: student.mentor.name,
        dept: student.mentor.designation || defaultForClass.dept,
        isSelf: false
      };
    }
    return {
      name: defaultForClass.name,
      dept: defaultForClass.dept,
      isSelf: false
    };
  }, [isTeacher, teacher, student, activeClassCode]);

  // Active channel/group tabs
  const [activeChannel, setActiveChannel] = useState<'main' | 'lab' | 'announcements'>('main');

  // Filter chips
  const [activeFilter, setActiveFilter] = useState<'all' | 'photos' | 'clips'>('all');

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 3-dots menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Plus menu (attachments)
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);

  // Modals
  const [previewNoteModal, setPreviewNoteModal] = useState(false);
  const [videoModal, setVideoModal] = useState(false);
  const [gradeModal, setGradeModal] = useState(false);
  const [pinnedModal, setPinnedModal] = useState(false);

  // Audio player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0); // 0 to 24 seconds
  const audioIntervalRef = useRef<any>(null);

  // Input state
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const voiceTimerRef = useRef<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Local storage file attachment state (Gallery, File Manager PDF, Video)
  const [pendingAttachment, setPendingAttachment] = useState<{
    type: 'image' | 'pdf' | 'video';
    file: File;
    fileName: string;
    fileSize: string;
    url: string;
  } | null>(null);

  const [selectedImageModal, setSelectedImageModal] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // Hidden file input refs for gallery, file manager PDF, and video
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Helper format file size
  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  // Local file selection handler (Gallery, PDF, Video)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'pdf' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = formatFileSize(file.size);

    if (fileType === 'image' || fileType === 'pdf') {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const res = loadEvt.target?.result as string;
        setPendingAttachment({
          type: fileType,
          file,
          fileName: file.name,
          fileSize: sizeStr,
          url: res
        });
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'video') {
      if (file.size < 15 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          const res = loadEvt.target?.result as string;
          setPendingAttachment({
            type: 'video',
            file,
            fileName: file.name,
            fileSize: sizeStr,
            url: res
          });
        };
        reader.readAsDataURL(file);
      } else {
        const objectUrl = URL.createObjectURL(file);
        setPendingAttachment({
          type: 'video',
          file,
          fileName: file.name,
          fileSize: sizeStr,
          url: objectUrl
        });
      }
    }

    // Reset input so re-selecting same file triggers event
    e.target.value = '';
    setIsPlusMenuOpen(false);
  };

  // Messages state initialized from cache for activeClassCode and kept in real-time sync via Firestore
  const [messages, setMessages] = useState<ChatMessage[]>(() => getCachedChatMessages(activeClassCode));
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync messages immediately when activeClassCode changes (e.g. when teacher switches class or student profile loads)
  useEffect(() => {
    setMessages(getCachedChatMessages(activeClassCode));
  }, [activeClassCode]);

  // Real-time Firestore synchronization strictly scoped to activeClassCode
  useEffect(() => {
    const unsubscribe = subscribeToChatMessages(
      activeClassCode,
      (liveMessages: ChatMessage[]) => {
        if (liveMessages && liveMessages.length > 0) {
          setMessages(liveMessages);
        }
        setIsLiveConnected(true);
      },
      (error) => {
        console.warn(`Realtime chat fallback for Class ${activeClassCode}:`, error);
        setIsLiveConnected(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [activeClassCode]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Audio Playback Simulation
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      clearInterval(audioIntervalRef.current);
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      audioIntervalRef.current = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 24) {
            clearInterval(audioIntervalRef.current);
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    };
  }, []);

  // Voice recording toggle with class isolation
  const handleToggleVoiceRecord = () => {
    if (isRecordingVoice) {
      clearInterval(voiceTimerRef.current);
      setIsRecordingVoice(false);
      // Auto post voice note strictly for the active class
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        classCode: activeClassCode,
        className: currentClassName,
        section: classBadge.slice(-1) || 'A',
        channel: activeChannel,
        senderId: isTeacher ? (teacher?.teacherId || teacher?.id || 'fac-teacher') : (student?.id || student?.studentId || 'stu-self'),
        senderName: isTeacher ? (teacher?.name || 'Faculty Mentor') : (student?.name || 'Student'),
        senderRole: isTeacher ? 'faculty' : 'student',
        isFaculty: isTeacher,
        rollNumber: isTeacher ? undefined : (student?.rollNo ? `Roll ${student.rollNo}` : undefined),
        avatarText: isTeacher
          ? (teacher?.name ? teacher.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'TC')
          : (student?.name ? student.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'ST'),
        avatarBg: isTeacher ? 'bg-indigo-600 text-white' : 'bg-blue-100 text-blue-700',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: Date.now(),
        text: 'Voice note query regarding numerical problem:',
        status: 'delivered',
        attachmentType: 'audio_note',
        attachmentData: {
          title: `Voice doubt (${voiceSeconds || 12}s)`,
          duration: `0:${(voiceSeconds || 12).toString().padStart(2, '0')}`,
          statusText: 'Audio Doubt Sent'
        }
      };
      setMessages((prev) => [...prev, newMsg]);
      setVoiceSeconds(0);
      // Broadcast to Firestore strictly for this class
      sendChatMessage(newMsg);
    } else {
      setIsRecordingVoice(true);
      setVoiceSeconds(0);
      voiceTimerRef.current = setInterval(() => {
        setVoiceSeconds((s) => s + 1);
      }, 1000);
    }
  };

  // Reactions Handler with real-time broadcast and class isolation
  const handleReactionClick = (msgId: string, reactionKey: 'thankYou' | 'helpful' | 'thumbsUp') => {
    const currentMsg = messages.find((m) => m.id === msgId);
    const currentReactions = currentMsg?.reactions || {};
    const currentCount = currentReactions[reactionKey] || 0;
    const userReacted = currentReactions.userReacted || {};
    const hasReacted = !!userReacted[reactionKey];

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId) return msg;
        return {
          ...msg,
          reactions: {
            ...currentReactions,
            [reactionKey]: hasReacted ? Math.max(0, currentCount - 1) : currentCount + 1,
            userReacted: {
              ...userReacted,
              [reactionKey]: !hasReacted
            }
          }
        };
      })
    );

    // Broadcast reaction update to Firestore for the active class
    const currentUserId = isTeacher ? 'fac-sharma' : (student?.id || 'stu-user');
    toggleMessageReactionInFirestore(msgId, reactionKey, currentUserId, currentReactions, activeClassCode);
  };

  // Teacher verify note handler with real-time broadcast and class isolation
  const handleVerifyNote = (msgId: string) => {
    const target = messages.find((m) => m.id === msgId);
    const newStatus = !target?.verifiedByTeacher;

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId) return msg;
        return {
          ...msg,
          verifiedByTeacher: newStatus
        };
      })
    );

    // Sync verification status to Firestore for this class
    toggleTeacherVerificationInFirestore(msgId, !newStatus, activeClassCode);
  };

  // Send message - Instant broadcast to Google Cloud Firestore & Cloud Storage scoped to activeClassCode
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !pendingAttachment) return;

    const messageText = inputText.trim() || (
      pendingAttachment?.type === 'image' ? 'Shared Photo from Gallery' :
      pendingAttachment?.type === 'pdf' ? `Shared Document: ${pendingAttachment.fileName}` :
      pendingAttachment?.type === 'video' ? `Shared Video Clip: ${pendingAttachment.fileName}` : ''
    );

    let attachmentType: ChatMessage['attachmentType'] = 'none';
    let attachmentData: any = undefined;

    if (pendingAttachment) {
      attachmentType = pendingAttachment.type;
      let finalUrl = pendingAttachment.url;

      // Upload directly to Google Cloud Storage (Firebase)
      if (pendingAttachment.file) {
        try {
          const uploadResult = await uploadFileToCloudStorage(
            pendingAttachment.file,
            `chat/${activeClassCode}/${activeChannel}/${Date.now()}_${pendingAttachment.fileName}`
          );
          if (uploadResult?.url) {
            finalUrl = uploadResult.url;
          }
        } catch (uploadErr) {
          console.warn('Cloud Storage upload fallback to Data URL:', uploadErr);
        }
      }

      attachmentData = {
        title: pendingAttachment.fileName,
        fileName: pendingAttachment.fileName,
        fileSize: pendingAttachment.fileSize,
        url: finalUrl
      };
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      classCode: activeClassCode,
      className: currentClassName,
      section: classBadge.slice(-1) || 'A',
      channel: activeChannel,
      senderId: isTeacher ? (teacher?.teacherId || teacher?.id || 'fac-teacher') : (student?.id || student?.studentId || 'stu-self'),
      senderName: isTeacher ? (teacher?.name || 'Faculty Mentor') : (student?.name || 'Student'),
      senderRole: isTeacher ? 'faculty' : 'student',
      isFaculty: isTeacher,
      rollNumber: isTeacher ? undefined : (student?.rollNo ? `Roll ${student.rollNo}` : undefined),
      avatarText: isTeacher
        ? (teacher?.name ? teacher.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'TC')
        : (student?.name ? student.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'ST'),
      avatarBg: isTeacher ? 'bg-indigo-600 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      text: messageText,
      status: 'delivered',
      attachmentType,
      attachmentData,
      reactions: {}
    };

    // Immediate optimistic UI update
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setPendingAttachment(null);
    setShowEmojiPicker(false);

    // Broadcast message to Google Cloud Firestore strictly for activeClassCode
    await sendChatMessage(newMsg);
  };

  // Quick emoji insertion
  const handleInsertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Filtered messages with STRICT class isolation
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // 1. Strict Class Isolation - messages from other classes NEVER appear
      const msgClass = normalizeClassCode(msg.classCode || msg.className);
      if (msgClass !== activeClassCode) {
        return false;
      }

      // 2. Channel check (main, lab, announcements)
      if (msg.channel && msg.channel !== activeChannel) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText = msg.text.toLowerCase().includes(q);
        const matchSender = msg.senderName.toLowerCase().includes(q);
        if (!matchText && !matchSender) return false;
      }

      // 4. Attachment type filter
      if (activeFilter === 'photos') {
        return msg.attachmentType === 'derivation_note' || msg.attachmentType === 'image';
      }
      if (activeFilter === 'clips') {
        return msg.attachmentType === 'faculty_video' || msg.attachmentType === 'video';
      }
      return true;
    });
  }, [messages, activeClassCode, activeChannel, searchQuery, activeFilter]);

  return (
    <div id="study-hub-chat-screen" className="flex flex-col h-full max-w-4xl mx-auto pb-4 animate-in fade-in duration-200">
      {/* 1. TOP APP BAR (Pixel-matched with Screenshots 1 & 2) */}
      <header className="bg-white dark:bg-[#0a0a0a] border-b border-slate-200/90 dark:border-neutral-800 sticky top-0 z-30 px-3 py-2.5 sm:px-4 sm:py-3 transition-colors">
        <div className="flex items-center justify-between gap-2">
          {/* Left info & back */}
          <div className="flex items-center gap-2.5 min-w-0">
            

            {/* Dynamic class circular badge */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                {classBadge}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900"></span>
            </div>

            {/* Title & Subtitle */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  {currentClassName} • Section {classBadge.includes('B') ? 'B' : 'A'}
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 hidden sm:inline-block"></span>
                <span 
                  id="chat-live-sync-indicator"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-full"
                  title="Real-time synchronized across all students and teachers via Cloud Firestore"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                {isTeacher ? `Active Class • ${activeMentor.name} (Incharge)` : `${activeMentor.name} (${activeMentor.dept})`}
              </p>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              id="chat-search-toggle-btn"
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors ${
                isSearchOpen ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300' : ''
              }`}
              title="Search Messages"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              id="chat-theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="relative">
              <button
                id="chat-menu-btn"
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                title="More Options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-800 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-neutral-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Study Group Settings</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{currentClassName} (CBSE 2026-27)</p>
                  </div>
                  <button
                    onClick={() => {
                      setPinnedModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Pin className="w-3.5 h-3.5 text-blue-500" /> Pinned Resources (3)
                  </button>
                  <button
                    onClick={() => {
                      setPreviewNoteModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-purple-500" /> View Handwritten Notes
                  </button>
                  <button
                    onClick={() => {
                      setVideoModal(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Video className="w-3.5 h-3.5 text-rose-500" /> Watch Faculty Demo Video
                  </button>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-500" /> Share NCERT Study Invite
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar Collapsible */}
        {isSearchOpen && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-neutral-800 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search formulas, derivations, or student doubts..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-200"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="text-xs text-slate-500 font-semibold px-2 py-1 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        )}
      </header>

      {/* Class Isolation Bar & Faculty Class Switcher */}
      {isTeacher ? (
        <div id="teacher-class-switcher-bar" className="px-3 py-2 bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1 mr-1">
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Switch Class Chatroom:</span>
            </span>
            {(['9', '10', '11', '12'] as const).map((cCode) => (
              <button
                key={cCode}
                id={`teacher-select-class-${cCode}-btn`}
                type="button"
                onClick={() => {
                  setTeacherSelectedClass(cCode);
                  if (onSelectClass) onSelectClass(cCode);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeClassCode === cCode
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-700 border border-slate-200 dark:border-neutral-700'
                }`}
              >
                Class {cCode}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 shrink-0">
            <Lock className="w-3 h-3 text-emerald-600" />
            Class {activeClassCode} Isolated
          </span>
        </div>
      ) : (
        <div id="student-class-isolation-bar" className="px-3 py-1.5 bg-blue-50/70 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/50 flex items-center justify-between gap-2 text-[11px]">
          <span className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 truncate">
            <Lock className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Strict Class Isolation: Confined to <strong>{currentClassName} Section {classBadge.includes('B') ? 'B' : 'A'}</strong></span>
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-medium shrink-0 hidden sm:inline">
            No cross-class leakage
          </span>
        </div>
      )}

      {/* 2. CHANNEL / SUB-GROUP TABS PILLS (Screenshot 1 & 2 matching) */}
      <div className="px-3 pt-2 pb-1 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-md border-b border-slate-100 dark:border-neutral-800/80 sticky top-[60px] z-20 overflow-x-auto no-scrollbar flex items-center gap-2">
        <button
          id="channel-tab-main"
          type="button"
          onClick={() => setActiveChannel('main')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
            activeChannel === 'main'
              ? 'bg-blue-600 text-white ring-2 ring-blue-600/20'
              : 'bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <span>{currentClassName} Main ({filteredMessages.length})</span>
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
            {filteredMessages.length}
          </span>
        </button>

        <button
          id="channel-tab-lab"
          type="button"
          onClick={() => setActiveChannel('lab')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
            activeChannel === 'lab'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-800 hover:bg-slate-50'
          }`}
        >
          <span className="text-sm">🧪</span>
          <span>Physics Lab & Numericals</span>
        </button>

        <button
          id="channel-tab-announcements"
          type="button"
          onClick={() => setActiveChannel('announcements')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
            activeChannel === 'announcements'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-800 hover:bg-slate-50'
          }`}
        >
          <span className="text-sm">📢</span>
          <span>Faculty Announcements</span>
        </button>
      </div>

      {/* 3. MODERATED ACADEMIC SPHERE BANNER (Screenshot 2 exact match) */}
      <div className="px-3 pt-2">
        <div className="bg-white dark:bg-[#0d0d0d] rounded-2xl p-3 border border-slate-200/80 dark:border-neutral-800 shadow-2xs flex items-start gap-2.5">
          <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                CBSE MODERATED ACADEMIC SPHERE
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-0.5">
              Faculty Mentor <strong className="text-slate-800 dark:text-slate-200 font-bold">{activeMentor.name} ({activeMentor.dept})</strong> online. Use strictly for doubts, homework assistance, & NCERT syllabus sync.
            </p>
          </div>
        </div>
      </div>

      {/* 4. PINNED BY FACULTY MENTOR BANNER (Screenshot 1 & 2 match) */}
      <div className="px-3 pt-2">
        <div className="bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl p-2.5 px-3 border border-blue-200/70 dark:border-blue-900/60 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <Pin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 fill-blue-600 dark:fill-blue-400" />
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
                PINNED BY FACULTY MENTOR
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                NCERT Exemplar Solutions Ch-8 Electromagnetic Waves...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">3.2 MB</span>
            <button
              type="button"
              onClick={() => setPinnedModal(true)}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-300 text-xs font-bold shadow-2xs border border-blue-200 dark:border-blue-800 hover:bg-blue-50 flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. CONTENT FILTER CHIPS (Screenshot 2 exact match) */}
      <div className="px-3 pt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          All Messages
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('photos')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === 'photos'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Photos & Boards (24)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('clips')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeFilter === 'clips'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Lecture Clips (8)</span>
        </button>
      </div>

      {/* 6. DAY DIVIDER (Screenshot match) */}
      <div className="flex items-center justify-center my-3 px-3">
        <div className="px-3.5 py-1 rounded-full bg-slate-100 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 shadow-2xs">
          Today • CBSE Unit Test Prep Session
        </div>
      </div>

      {/* 7. MESSAGES STREAM CONTAINER */}
      <div className="flex-1 px-3 space-y-4 overflow-y-auto">
        {filteredMessages.map((msg) => {
          const isSenderFaculty = msg.senderRole === 'faculty' || msg.isFaculty;

          return (
            <div
              key={msg.id}
              id={`chat-msg-${msg.id}`}
              className={`flex flex-col gap-1.5 animate-in fade-in duration-200 ${
                isSenderFaculty ? 'items-end' : 'items-start'
              }`}
            >
              {/* SENDER INFO HEADER */}
              <div
                className={`flex items-center gap-2 text-xs px-1 ${
                  isSenderFaculty ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    msg.avatarBg
                  }`}
                >
                  {msg.avatarText}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    {msg.senderName}
                  </span>

                  {msg.rollNumber && (
                    <span className="px-1.5 py-0.2 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-neutral-700">
                      {msg.rollNumber}
                    </span>
                  )}

                  {isSenderFaculty && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-500" />
                      Faculty Mentor {isTeacher ? '(You)' : ''}
                    </span>
                  )}

                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {msg.timestamp}
                  </span>
                </div>
              </div>

              {/* MESSAGE CONTENT BUBBLE */}
              <div
                className={`max-w-[92%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isSenderFaculty
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-blue-500/10'
                    : 'bg-white dark:bg-[#111] text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-neutral-800 rounded-tl-xs'
                }`}
              >
                {/* Message text */}
                <p className="whitespace-pre-line font-normal">
                  {msg.text}
                </p>

                {/* ATTACHMENT 1: DERIVATION NOTE (Ananya's Handwritten Note Preview) */}
                {msg.attachmentType === 'derivation_note' && msg.attachmentData && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-700/40 bg-slate-900 text-white shadow-md">
                    {/* Header bar */}
                    <div className="bg-slate-800/80 px-3 py-1.5 flex items-center justify-between border-b border-slate-700">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>{msg.attachmentData.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewNoteModal(true)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>Preview</span>
                      </button>
                    </div>

                    {/* Derivation Equation Preview Sheet */}
                    <div
                      onClick={() => setPreviewNoteModal(true)}
                      className="p-3.5 bg-gradient-to-b from-slate-950 to-slate-900 font-mono text-xs space-y-1.5 cursor-pointer hover:bg-slate-900 transition-colors"
                    >
                      <p className="text-cyan-300 font-bold">
                        $\vec&#123;E&#125;(x,t) = E_0 \cos(kx - \omega t)\hat&#123;j&#125;$
                      </p>
                      <p className="text-cyan-300 font-bold">
                        $\vec&#123;B&#125;(x,t) = B_0 \cos(kx - \omega t)\hat&#123;k&#125;$
                      </p>
                      <p className="text-amber-300 font-semibold pt-1">
                        Speed of Light $c = E_0 / B_0 = 3 \times 10^8\text&#123; m/s&#125;$
                      </p>
                      <div className="pt-2 flex items-center justify-end">
                        <span className="text-[10px] text-slate-400 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                          <Maximize2 className="w-2.5 h-2.5" /> Full View
                        </span>
                      </div>
                    </div>

                    {/* Bottom Metadata & Verification Actions */}
                    <div className="bg-slate-950 px-3 py-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 min-w-0">
                        <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />
                        <span className="truncate">{msg.attachmentData.fileName}</span>
                        <span className="text-slate-600 hidden sm:inline">•</span>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">{msg.attachmentData.fileSize}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isTeacher ? (
                          <button
                            type="button"
                            onClick={() => handleVerifyNote(msg.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                              msg.verifiedByTeacher
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            <span>{msg.verifiedByTeacher ? 'Verified Note' : 'Verify Note'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPreviewNoteModal(true)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-900/60 text-blue-300 border border-blue-700/50 hover:bg-blue-800/60 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Drive</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ATTACHMENT 2: FACULTY DEMO VIDEO (Dr. Sharma's EM Wave Clip & Linked Homework) */}
                {msg.attachmentType === 'faculty_video' && msg.attachmentData && (
                  <div className="mt-3 space-y-2.5">
                    {/* Video Player Card */}
                    <div className="rounded-xl overflow-hidden border border-blue-400/30 bg-slate-950 text-white shadow-md">
                      {/* Video Thumbnail Area */}
                      <div
                        onClick={() => setVideoModal(true)}
                        className="relative h-44 sm:h-52 bg-slate-900 flex items-center justify-center cursor-pointer group overflow-hidden"
                      >
                        {/* Background Lab Visual Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-0"></div>
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <Video className="w-3 h-3" /> FACULTY DEMO
                          </span>
                        </div>

                        {/* Center Play Button */}
                        <div className="relative z-10 w-13 h-13 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ring-4 ring-white/20">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>

                        {/* Bottom Overlay Info */}
                        <div className="absolute bottom-2 right-2 z-10 bg-black/75 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                          {msg.attachmentData.duration} • {msg.attachmentData.quality}
                        </div>
                      </div>

                      {/* Video File Sub-bar */}
                      <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-200 truncate text-[11px]">
                            {msg.attachmentData.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {msg.attachmentData.fileSize} • {msg.attachmentData.lab}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-900/80 text-blue-300 text-[10px] font-bold border border-blue-700/50 shrink-0">
                          {msg.attachmentData.deliveredCount} Delivered
                        </span>
                      </div>
                    </div>

                    {/* Linked Homework Card (#08) */}
                    <div className="rounded-xl p-2.5 bg-blue-700/60 border border-blue-300/40 text-white flex items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-blue-800/80 text-blue-200 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-200 block">
                            {msg.attachmentData.homeworkTitle}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {msg.attachmentData.homeworkSubmitted}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setGradeModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-white text-blue-800 text-xs font-bold hover:bg-blue-50 transition-colors shadow-2xs shrink-0 cursor-pointer"
                      >
                        Grade ({msg.attachmentData.pendingGrading})
                      </button>
                    </div>
                  </div>
                )}

                {/* ATTACHMENT 3: AUDIO DOUBT VOICE NOTE (Tanmay Singh's Doubt Player) */}
                {msg.attachmentType === 'audio_note' && msg.attachmentData && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-2xs space-y-2">
                    <div className="flex items-center gap-3">
                      {/* Play/Pause Button */}
                      <button
                        type="button"
                        onClick={handleToggleAudio}
                        className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shrink-0 shadow-sm cursor-pointer"
                        title={isPlayingAudio ? 'Pause Audio Doubt' : 'Play Audio Doubt'}
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-4 h-4 fill-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        )}
                      </button>

                      {/* Animated Soundwave Bars */}
                      <div className="flex-1 flex items-center gap-1 h-8">
                        {[18, 28, 42, 60, 35, 75, 50, 65, 80, 45, 30, 65, 40, 55, 70, 35, 25, 45, 60, 30].map(
                          (h, idx) => {
                            const isPassed = (audioProgress / 24) * 20 >= idx;
                            return (
                              <div
                                key={idx}
                                className={`flex-1 rounded-full transition-all duration-150 ${
                                  isPassed
                                    ? 'bg-blue-600 dark:bg-blue-400'
                                    : 'bg-slate-300 dark:bg-neutral-700'
                                } ${isPlayingAudio ? 'animate-pulse' : ''}`}
                                style={{
                                  height: isPlayingAudio ? `${Math.max(12, (h * (audioProgress % 4 + 1)) / 4)}%` : `${h}%`
                                }}
                              ></div>
                            );
                          }
                        )}
                      </div>

                      {/* Timer & Mic Icon */}
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          {isPlayingAudio
                            ? `0:${(24 - audioProgress).toString().padStart(2, '0')}`
                            : msg.attachmentData.duration}
                        </span>
                        <Mic className="w-3.5 h-3.5 text-slate-400 ml-auto mt-0.5" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-neutral-800 text-slate-500">
                      <span>{msg.attachmentData.statusText}</span>
                      <button
                        type="button"
                        onClick={handleToggleVoiceRecord}
                        className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        ↩ Reply with Audio Note
                      </button>
                    </div>
                  </div>
                )}

                {/* ATTACHMENT: PHOTO FROM GALLERY */}
                {msg.attachmentType === 'image' && msg.attachmentData && (
                  <div className="mt-2.5 space-y-1.5">
                    <div
                      onClick={() =>
                        setSelectedImageModal({
                          url: msg.attachmentData.url,
                          title: msg.attachmentData.title || msg.attachmentData.fileName || 'Shared Photo'
                        })
                      }
                      className="rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 bg-slate-900 group cursor-pointer relative max-w-sm"
                    >
                      <img
                        src={msg.attachmentData.url}
                        alt={msg.attachmentData.fileName || 'Photo attachment'}
                        className="w-full max-h-72 object-cover hover:scale-[1.02] transition-transform duration-200"
                        loading="lazy"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 opacity-90 group-hover:opacity-100">
                        <Maximize2 className="w-3 h-3" /> Click to expand
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span className="truncate max-w-[220px] font-medium">{msg.attachmentData.fileName}</span>
                      {msg.attachmentData.fileSize && <span className="font-mono">{msg.attachmentData.fileSize}</span>}
                    </div>
                  </div>
                )}

                {/* ATTACHMENT: PDF DOCUMENT FROM FILE MANAGER */}
                {msg.attachmentType === 'pdf' && msg.attachmentData && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-rose-50/80 dark:bg-neutral-900 border border-rose-200 dark:border-neutral-800 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {msg.attachmentData.title || msg.attachmentData.fileName || 'Document.pdf'}
                        </p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1.5 font-mono">
                          <span className="font-bold text-rose-600 dark:text-rose-400 uppercase">PDF</span>
                          <span>•</span>
                          <span>{msg.attachmentData.fileSize || 'Document'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {msg.attachmentData.url && (
                        <a
                          href={msg.attachmentData.url}
                          download={msg.attachmentData.fileName || 'Document.pdf'}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                          title="Open or Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* ATTACHMENT: VIDEO RECORDING */}
                {msg.attachmentType === 'video' && msg.attachmentData && (
                  <div className="mt-2.5 rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 bg-black shadow-md max-w-md">
                    <video
                      src={msg.attachmentData.url}
                      controls
                      className="w-full max-h-72 bg-black object-contain"
                      preload="metadata"
                    />
                    <div className="p-2.5 bg-slate-950 text-white flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold truncate text-[11px]">{msg.attachmentData.title || msg.attachmentData.fileName || 'Video Clip'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{msg.attachmentData.fileSize || 'Video'}</p>
                      </div>
                      {msg.attachmentData.url && (
                        <a
                          href={msg.attachmentData.url}
                          download={msg.attachmentData.fileName || 'video.mp4'}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 font-bold shrink-0"
                          title="Download Video"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* BOTTOM REACTIONS BAR */}
                <div className="mt-2.5 pt-2 flex items-center justify-between gap-2 border-t border-slate-200/40 dark:border-neutral-800/40 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Thank you Sir Reaction */}
                    {msg.reactions?.thankYou !== undefined && (
                      <button
                        type="button"
                        onClick={() => handleReactionClick(msg.id, 'thankYou')}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          msg.reactions.userReacted?.thankYou
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                            : 'bg-slate-100/80 dark:bg-neutral-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <span>🙏</span>
                        <span>Thank you Sir</span>
                        <span className="font-mono">{msg.reactions.thankYou}</span>
                      </button>
                    )}

                    {/* Helpful Reaction */}
                    {msg.reactions?.helpful !== undefined && (
                      <button
                        type="button"
                        onClick={() => handleReactionClick(msg.id, 'helpful')}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          msg.reactions.userReacted?.helpful
                            ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700'
                            : 'bg-slate-100/80 dark:bg-neutral-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <Lightbulb className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>Helpful</span>
                        <span className="font-mono">{msg.reactions.helpful}</span>
                      </button>
                    )}

                    {/* Thumbs Up Reaction */}
                    {msg.reactions?.thumbsUp !== undefined && (
                      <button
                        type="button"
                        onClick={() => handleReactionClick(msg.id, 'thumbsUp')}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          msg.reactions.userReacted?.thumbsUp
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                            : 'bg-slate-100/80 dark:bg-neutral-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <span>👍</span>
                        <span>{msg.reactions.thumbsUp} found helpful</span>
                      </button>
                    )}

                    {/* Verified Note text */}
                    {msg.verifiedByTeacher && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCheck className="w-3 h-3" />
                        Verified by Mentor
                      </span>
                    )}
                  </div>

                  {/* Message delivery indicator */}
                  <div className="shrink-0 text-[10px] opacity-75 flex items-center gap-1">
                    {msg.status === 'read' ? (
                      <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 8. BOTTOM CHAT INPUT BAR (Screenshot 1 & 2 exact match) */}
      <footer className="sticky bottom-0 z-30 pt-2 px-3 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-t border-slate-200 dark:border-neutral-800">
        {/* Voice recording live pulse banner */}
        {isRecordingVoice && (
          <div className="mb-2 p-2 px-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              <span className="font-bold">Recording Doubt Voice Note...</span>
              <span className="font-mono font-bold">0:{voiceSeconds.toString().padStart(2, '0')}</span>
            </div>
            <button
              type="button"
              onClick={handleToggleVoiceRecord}
              className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700"
            >
              Done & Send
            </button>
          </div>
        )}

        {/* Quick Emoji / Math Formula Bar Popup */}
        {showEmojiPicker && (
          <div className="mb-2 p-2 bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-lg flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['👍', '🙏', '💡', '✅', '❓', '$\\lambda$', '$\\vec{E}$', '$\\vec{B}$', '$\\omega$', '$\\theta$', '$\\pi$'].map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => handleInsertEmoji(symbol + ' ')}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                {symbol}
              </button>
            ))}
          </div>
        )}

        {/* Hidden inputs for local storage device file selection */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'image')}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'pdf')}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, 'video')}
        />

        {/* Active Local File Attachment Banner */}
        {pendingAttachment && (
          <div className="mb-2 p-2.5 bg-blue-50/90 dark:bg-neutral-900/90 border border-blue-200 dark:border-neutral-700 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {pendingAttachment.type === 'image' && (
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-300 dark:border-neutral-700 shrink-0 bg-slate-900">
                  <img src={pendingAttachment.url} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
              {pendingAttachment.type === 'pdf' && (
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              {pendingAttachment.type === 'video' && (
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Video className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                  {pendingAttachment.fileName}
                </p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1.5 font-mono">
                  <span className="uppercase font-bold text-blue-600 dark:text-blue-400">
                    {pendingAttachment.type}
                  </span>
                  <span>•</span>
                  <span>{pendingAttachment.fileSize}</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-sans font-semibold">Ready to send</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPendingAttachment(null)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Remove attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pb-1">
          {/* Plus button with attachment menu */}
          <div className="relative">
            <button
              id="chat-plus-btn"
              type="button"
              onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              title="Add Attachments"
            >
              <Plus className={`w-5 h-5 transition-transform ${isPlusMenuOpen ? 'rotate-45' : ''}`} />
            </button>

            {isPlusMenuOpen && (
              <div className="absolute bottom-12 left-0 w-72 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 p-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-md">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-neutral-800 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Share Study Material</p>
                </div>

                {/* 1. Gallery (Photos & Board Notes) */}
                <button
                  type="button"
                  onClick={() => {
                    galleryInputRef.current?.click();
                    setIsPlusMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 transition-colors cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Gallery / Photos
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded font-normal">Storage</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">Choose photos & board notes from device</p>
                  </div>
                </button>

                {/* 2. File Manager (PDF Documents) */}
                <button
                  type="button"
                  onClick={() => {
                    pdfInputRef.current?.click();
                    setIsPlusMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 mt-0.5 transition-colors cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      File Manager (PDF)
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-rose-50 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 rounded font-normal">PDF Docs</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">Send PDF worksheets, solutions & chapters</p>
                  </div>
                </button>

                {/* 3. Video (Local Storage) */}
                <button
                  type="button"
                  onClick={() => {
                    videoInputRef.current?.click();
                    setIsPlusMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 mt-0.5 transition-colors cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      Video Recording
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-sky-50 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300 rounded font-normal">Video</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">Send lab experiment or lecture video</p>
                  </div>
                </button>

                {/* 4. Record Voice Doubt */}
                <button
                  type="button"
                  onClick={() => {
                    handleToggleVoiceRecord();
                    setIsPlusMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 mt-0.5 transition-colors cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white">Record Voice Doubt</p>
                    <p className="text-[10px] text-slate-400 truncate">Audio explanation with waveform</p>
                  </div>
                </button>

                {/* 5. Pinned Exemplar Modal */}
                <button
                  type="button"
                  onClick={() => {
                    setPinnedModal(true);
                    setIsPlusMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 mt-1 border-t border-slate-100 dark:border-neutral-800 pt-2 transition-colors cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Pin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200">NCERT Exemplar PDF</p>
                    <p className="text-[10px] text-slate-400 truncate">Ch-8 Solutions download</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Main Input Pill */}
          <div className="flex-1 relative flex items-center bg-slate-100 dark:bg-neutral-900 rounded-full border border-slate-200 dark:border-neutral-800 px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
            <input
              id="chat-message-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a study doubt or share notes in Class 11..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none pr-16"
            />

            <div className="absolute right-2.5 flex items-center gap-1.5 text-slate-400">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title="Formulas & Emojis"
              >
                <Smile className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleToggleVoiceRecord}
                className="p-1 hover:text-blue-600 transition-colors"
                title="Record Audio Note"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Send Button */}
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!inputText.trim() && !pendingAttachment}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-sm ${
              inputText.trim() || pendingAttachment
                ? 'bg-blue-600 text-white hover:bg-blue-700 scale-100 shadow-blue-500/20'
                : 'bg-blue-600/50 text-white/70 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </footer>

      {/* --- MODAL 1: HANDWRITTEN DERIVATION PREVIEW (High-Res Note Modal) --- */}
      {previewNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-neutral-800 shadow-2xl">
            <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  solution_derivation_ch8.jpg
                </h3>
                <p className="text-xs text-slate-500">Submitted by Ananya Gupta (Roll 02) • Ch 8 Electromagnetic Waves</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewNoteModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-950 text-slate-100 font-mono space-y-4">
              <div className="border border-slate-800 rounded-2xl p-5 bg-gradient-to-br from-slate-900 to-black space-y-3">
                <p className="text-emerald-400 font-bold border-b border-slate-800 pb-2">
                  [Derivation Step 1: Maxwell Wave Vector & Electric Field Equation]
                </p>
                <p className="text-cyan-300">
                  $\vec&#123;E&#125;(x,t) = E_0 \cos(kx - \omega t)\hat&#123;j&#125;$
                </p>
                <p className="text-cyan-300">
                  $\vec&#123;B&#125;(x,t) = B_0 \cos(kx - \omega t)\hat&#123;k&#125;$
                </p>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
                  <p>• Poynting Vector: $\vec&#123;S&#125; = \frac&#123;1&#125;&#123;\mu_0&#125; (\vec&#123;E&#125; \times \vec&#123;B&#125;) = \frac&#123;E_0 B_0&#125;&#123;\mu_0&#125; \cos^2(kx - \omega t) \hat&#123;i&#125;$</p>
                  <p>• Amplitude Ratio: $c = \frac&#123;E_0&#125;&#123;B_0&#125; = 3 \times 10^8\text&#123; m/s&#125;$</p>
                  <p>• Wave number $k = \frac&#123;2\pi&#125;&#123;\lambda&#125;$ with angular velocity $\omega = 2\pi\nu$</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Verified by {activeMentor.name} ({activeMentor.dept})</span>
              <button
                type="button"
                onClick={() => setPreviewNoteModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: FACULTY DEMO VIDEO PLAYER --- */}
      {videoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-3 px-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold">Dr_Sharma_EM_RightHandRule_Demo.mp4</span>
              </div>
              <button
                type="button"
                onClick={() => setVideoModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Simulation Canvas */}
            <div className="relative aspect-video bg-black flex flex-col items-center justify-center p-6 text-center text-white">
              <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center mb-3 shadow-lg">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
              <h4 className="text-sm font-bold">Right-Hand Thumb Rule Demo</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Demonstrated on Helmholtz coils in Physics Lab-102 by Dr. Rajesh Sharma.
              </p>
              <div className="mt-4 px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 font-mono">
                Duration: 0:48 mins • 1080p 60fps
              </div>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Class 11 PCM Physics Practical Syllabus</span>
              <button
                type="button"
                onClick={() => setVideoModal(false)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: GRADE HOMEWORK #08 DRAWER --- */}
      {gradeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-neutral-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">LINKED HOMEWORK #08</h3>
                <p className="text-xs text-slate-500">Numerical Worksheet: Chapter 8 (Electromagnetic Waves)</p>
              </div>
              <button
                type="button"
                onClick={() => setGradeModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200">Submission Progress</span>
                  <p className="text-xs text-blue-700 dark:text-blue-300">42 of 48 Students Submitted</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                  87.5%
                </span>
              </div>

              <div className="pt-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Pending Submissions for Review:</p>
                <div className="space-y-2">
                  {[
                    { name: 'Tanmay Singh', roll: 'Roll 03', status: 'Submitted 03:40 PM', score: 'Pending' },
                    { name: 'Diya Sharma', roll: 'Roll 05', status: 'Submitted 04:02 PM', score: 'Pending' },
                    { name: 'Rohan Mehra', roll: 'Roll 08', status: 'Submitted 04:18 PM', score: 'Pending' }
                  ].map((stu, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{stu.name}</p>
                        <p className="text-[10px] text-slate-500">{stu.roll} • {stu.status}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">
                        Review Note
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setGradeModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 4: PINNED RESOURCES MODAL --- */}
      {pinnedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-neutral-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Pin className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Pinned NCERT Resources</h3>
              </div>
              <button
                type="button"
                onClick={() => setPinnedModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'NCERT Exemplar Solutions Ch-8 Electromagnetic Waves', size: '3.2 MB', author: activeMentor.name },
                { title: 'Formula Sheet: Maxwell Displacement Current & Poynting Vector', size: '1.1 MB', author: 'Faculty Mentors' },
                { title: 'Unit Test Blueprint & 5-Year Question Bank 2026', size: '4.8 MB', author: 'CBSE Academic Cell' }
              ].map((res, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{res.title}</p>
                    <p className="text-[10px] text-slate-500">{res.size} • Uploaded by {res.author}</p>
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 shrink-0 font-bold flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setPinnedModal(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 5: FULL-SCREEN HIGH-RES IMAGE VIEWER MODAL --- */}
      {selectedImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
          <div className="max-w-4xl w-full max-h-[92vh] flex flex-col bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-3 px-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs font-bold truncate">{selectedImageModal.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedImageModal.url}
                  download={selectedImageModal.title || 'image.jpg'}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 text-xs font-bold"
                  title="Download image"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedImageModal(null)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-black/60">
              <img
                src={selectedImageModal.url}
                alt={selectedImageModal.title}
                className="max-h-[78vh] w-auto max-w-full object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
