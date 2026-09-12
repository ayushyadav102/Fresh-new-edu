import React, { useState, useEffect, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  X,
  BookOpen,
  Clock,
  FileCheck2,
  Award,
  CreditCard,
  Bus,
  Bell,
  Calendar,
  User,
  ExternalLink,
  Tag,
  ArrowRight,
  FolderCheck,
  CheckCircle2,
  FileText,
  Video,
  Sparkles,
  Command,
  Building
} from 'lucide-react';
import { sortTimetableSlots } from '../../utils/timetableUtils';

export interface SearchResultItem {
  id: string;
  category: 'Module' | 'Academic' | 'Assignment' | 'Timetable' | 'Faculty' | 'Notice' | 'Exam';
  title: string;
  subtitle: string;
  extraInfo?: string;
  badge?: string;
  badgeColor?: string;
  targetTab: string;
  actionPayload?: any;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tabId: string, payload?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const {   timetable, exams, notifications, attendance } = useERP();
  const { role } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggested popular searches
  const popularSearches = [
    'Physics Notes',
    'Mathematics Timetable',
    'Chemistry Assignment',
    'Exam Schedule',
    'Report Card',
    'Computer Science Lab'
  ];

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSelectedCategory('ALL');
    }
  }, [isOpen]);

  // Close on Escape & support global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Aggregate and index all entities
  const allSearchableItems: SearchResultItem[] = [];

  // 1. Core Modules / Screens
  const moduleItems: SearchResultItem[] = [
    {
      id: 'mod_dash',
      category: 'Module',
      title: 'Student Dashboard',
      subtitle: 'Overview of attendance, timetable, fee summary & recent updates',
      targetTab: 'dashboard',
      badge: 'Main View',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    },
    {
      id: 'mod_tt',
      category: 'Module',
      title: 'Class Timetable & Periods',
      subtitle: 'Daily & weekly periods schedule, rooms, and bell timings',
      targetTab: 'timetable',
      badge: 'Schedule',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
    },
    {
      id: 'mod_att',
      category: 'Module',
      title: 'Attendance Tracker',
      subtitle: 'Biometric daily lecture attendance and subject-wise logs',
      targetTab: 'attendance',
      badge: 'Biometrics',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
    },
    {
      id: 'mod_lms',
      category: 'Module',
      title: 'Learning Portal',
      subtitle: 'Download chapter notes, revision PDFs, slides, and submit homework',
      targetTab: 'attendance',
      badge: 'Academics',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
    },
    {
      id: 'mod_exams',
      category: 'Module',
      title: 'Exam Schedule & Hall Tickets',
      subtitle: 'Mid-term datesheet, seating arrangements, syllabus & room numbers',
      targetTab: 'exams',
      badge: 'Exams',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    },
    {
      id: 'mod_results',
      category: 'Module',
      title: 'Results & Report Card',
      subtitle: 'CBSE Term marksheets, subject grades, percentile and GPAs',
      targetTab: 'results',
      badge: 'Grades',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
    },
    {
      id: 'mod_notif',
      category: 'Module',
      title: 'Notice Board & Alerts',
      subtitle: 'Official school broadcasts, holidays, circulars, and updates',
      targetTab: 'notifications',
      badge: 'Announcements',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
    },
    {
      id: 'mod_calendar',
      category: 'Module',
      title: 'Academic Calendar',
      subtitle: 'Annual school calendar, vacations, exam windows, sports day',
      targetTab: 'calendar',
      badge: 'Events',
      badgeColor: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300'
    }
  ];

  if (role === 'superadmin') {
    moduleItems.unshift({
      id: 'mod_superadmin_desk',
      category: 'Module',
      title: 'Super Admin SaaS Master Console',
      subtitle: 'Manage school tenants, onboarding, multi-school IAM profiles, billing & overrides',
      targetTab: 'superadmin_portal',
      badge: 'Platform Owner',
      badgeColor: 'bg-gradient-to-r from-purple-100 to-rose-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200'
    });
  }

  if (role === 'principal') {
    moduleItems.unshift({
      id: 'mod_principal_desk',
      category: 'Module',
      title: 'Principal Management Desk',
      subtitle: 'Class capacities, appoint faculty, assign class teachers, CBSE circulars',
      targetTab: 'principal_portal',
      badge: 'Principal Desk',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    });
  }

  if (role === 'teacher') {
    moduleItems.unshift({
      id: 'mod_teacher_desk',
      category: 'Module',
      title: 'Teacher Management Desk',
      subtitle: 'Mark attendance, upload marks, publish notes, edit timetable & roster',
      targetTab: 'teacher_portal',
      badge: 'Faculty Portal',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
    });
  }

  allSearchableItems.push(...moduleItems);

  // 4. Timetable Slots
  sortTimetableSlots(timetable || []).forEach((slot) => {
    allSearchableItems.push({
      id: `tt_${slot.id}`,
      category: 'Timetable',
      title: `${slot.subjectName} (${slot.day})`,
      subtitle: `${slot.startTime} - ${slot.endTime} • Room: ${slot.roomNo} (${slot.building})`,
      extraInfo: `Faculty: ${slot.facultyName} • Type: ${slot.type} • Period ${slot.periodNo || ''}`,
      targetTab: 'timetable',
      badge: slot.day,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    });
  });

  // 5. Faculty / Teachers
  const facultyMap = new Map<string, { subjects: string[]; room: string; building: string }>();
  timetable.forEach((slot) => {
    if (!facultyMap.has(slot.facultyName)) {
      facultyMap.set(slot.facultyName, {
        subjects: [slot.subjectName],
        room: slot.roomNo,
        building: slot.building
      });
    } else {
      const existing = facultyMap.get(slot.facultyName)!;
      if (!existing.subjects.includes(slot.subjectName)) {
        existing.subjects.push(slot.subjectName);
      }
    }
  });

  facultyMap.forEach((info, facultyName) => {
    allSearchableItems.push({
      id: `fac_${facultyName}`,
      category: 'Faculty',
      title: facultyName,
      subtitle: `Teaches: ${info.subjects.join(', ')}`,
      extraInfo: `Dept / Room: ${info.room}, ${info.building}`,
      targetTab: 'timetable',
      badge: 'Faculty',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
    });
  });

  // 6. Exams
  exams.forEach((ex) => {
    allSearchableItems.push({
      id: `exam_${ex.id}`,
      category: 'Exam',
      title: `${ex.subjectName} Exam (${ex.examType})`,
      subtitle: `Date: ${ex.date} (${ex.timeSlot}) • Room: ${ex.roomNo} • Max Marks: ${ex.totalMarks}`,
      extraInfo: `Syllabus: ${(ex.syllabusTopics || []).join(', ')}`,
      targetTab: 'exams',
      badge: 'Datesheet',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    });
  });

  // 7. Notifications / Notices
  notifications.forEach((notif) => {
    allSearchableItems.push({
      id: `notif_${notif.id}`,
      category: 'Notice',
      title: notif.title,
      subtitle: `${notif.category} • ${notif.timestamp} • Priority: ${notif.priority}`,
      extraInfo: notif.message,
      targetTab: 'notifications',
      badge: notif.priority,
      badgeColor:
        notif.priority === 'High'
          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
          : 'bg-slate-100 text-slate-700 dark:bg-neutral-900 dark:text-slate-300'
    });
  });

  // Filter items by search query & category
  const trimmed = query.trim().toLowerCase();
  const filteredItems = allSearchableItems.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!trimmed) return true;

    const inTitle = item.title.toLowerCase().includes(trimmed);
    const inSubtitle = item.subtitle.toLowerCase().includes(trimmed);
    const inExtra = item.extraInfo ? item.extraInfo.toLowerCase().includes(trimmed) : false;
    const inCategory = item.category.toLowerCase().includes(trimmed);

    return inTitle || inSubtitle || inExtra || inCategory;
  });

  // Top results limit
  const displayedItems = filteredItems.slice(0, 20);

  const handleSelectItem = (item: SearchResultItem) => {
    onNavigate(item.targetTab, item.actionPayload);
    onClose();
  };

  // Keyboard navigation up / down / enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < displayedItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayedItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (displayedItems[selectedIndex]) {
        handleSelectItem(displayedItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  const categories = [
    'ALL',
    'Module',
    'Academic',
    'Assignment',
    'Timetable',
    'Faculty',
    'Exam',
    'Notice'
  ];

  const getCategoryIcon = (cat: SearchResultItem['category']) => {
    switch (cat) {
      case 'Module':
        return <FolderCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Academic':
        return <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'Assignment':
        return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Timetable':
        return <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      case 'Faculty':
        return <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'Exam':
        return <FileCheck2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'Notice':
        return <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 sm:pt-16 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[85vh] transition-colors active:scale-[0.98] duration-150 ease-in-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-neutral-800 flex items-center gap-3 bg-slate-50/70 dark:bg-neutral-900/40">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder="Search anything: Physics notes, timetable, assignments, exam dates, faculty..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden font-medium"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-200/80 dark:bg-neutral-900 text-slate-500 dark:text-slate-400 text-[11px] font-mono font-semibold">
            <span>ESC</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills Filter */}
        <div className="px-4 py-2.5 bg-white dark:bg-[#0a0a0a] border-b border-slate-100 dark:border-neutral-800/80 overflow-x-auto custom-scrollbar flex items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'ALL' ? 'All Results' : cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 custom-scrollbar">
          {displayedItems.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-neutral-900 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No matching results found for "{query}"
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Try searching for subject name, faculty name, chapter title, or module.
                </p>
              </div>

              {/* Quick suggestions */}
              <div className="pt-4 max-w-md mx-auto">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Popular Queries
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {popularSearches.map((pop) => (
                    <button
                      key={pop}
                      onClick={() => setQuery(pop)}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/80 hover:text-blue-600 transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                    >
                      {pop}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            displayedItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 shadow-xs'
                      : 'bg-white dark:bg-[#0a0a0a] border-slate-100 dark:border-neutral-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-neutral-900 shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              item.badgeColor ||
                              'bg-slate-100 text-slate-700 dark:bg-neutral-900 dark:text-slate-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-slate-400 font-mono">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                      {item.extraInfo && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {item.extraInfo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shrink-0 text-xs font-semibold active:scale-[0.98] transition-all duration-150 ease-in-out">
                    <span className="hidden sm:inline">Open</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-neutral-900/60 border-t border-slate-200 dark:border-neutral-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded text-[10px] font-mono">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded text-[10px] font-mono">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded text-[10px] font-mono">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>

          <span className="text-slate-400">
            {filteredItems.length} indexed items found
          </span>
        </div>
      </div>
    </div>
  );
};
