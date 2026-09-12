import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { useAuth } from '../../context/AuthContext';
import { Send } from 'lucide-react';
import { NotificationItem } from '../../types';
import {
  Bell,
  CheckCircle2,
  FileCheck2,
  CreditCard,
  BookOpen,
  Sparkles,
  Search,
  Check
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { role } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, addNotification } = useERP();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [newNotifTitle, setNewNotifTitle] = useState('');
  const [newNotifMessage, setNewNotifMessage] = useState('');
  const [newNotifCategory, setNewNotifCategory] = useState<'General' | 'Exam' | 'Fee' | 'Academic'>('General');

  const filteredNotifications = notifications.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'Exam':
        return <FileCheck2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'Fee':
        return <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Academic':
        return <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    }
  };

  
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotifTitle.trim() || !newNotifMessage.trim()) return;
    addNotification({
      title: newNotifTitle,
      message: newNotifMessage,
      category: newNotifCategory,
      priority: 'High'
    });
    setNewNotifTitle('');
    setNewNotifMessage('');
    alert('Notification Broadcasted Successfully!');
  };

  const handleTriggerTestAlert = () => {
    addNotification({
      title: 'Library Extended Hours Announced',
      message: 'Central Library will remain open until 11:00 PM during upcoming mid-term exams.',
      category: 'General',
      priority: 'Medium'
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 font-bold">
              <Bell className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">Notification Center</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time university alerts, exam schedule updates, fee dues & event announcements
          </p>
        </div>

        <div className="flex items-center gap-3">
          

          <button
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ease-in-out active:scale-[0.98] duration-150"
          >
            <Check className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      
      {role !== 'student' && (
        <form onSubmit={handleSendNotification} className="bg-slate-50 dark:bg-neutral-900/60 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Broadcast Notice / Alert</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="Notification Title (e.g., Campus closed tomorrow)"
              value={newNotifTitle}
              onChange={(e) => setNewNotifTitle(e.target.value)}
              className="sm:col-span-2 w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-purple-600"
            />
            <select
              value={newNotifCategory}
              onChange={(e) => setNewNotifCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-purple-600"
            >
              <option value="General">General Notice</option>
              <option value="Academic">Academic / Classes</option>
              <option value="Exam">Examination</option>
              <option value="Fee">Fee / Finance</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="Type detailed message here..."
              value={newNotifMessage}
              onChange={(e) => setNewNotifMessage(e.target.value)}
              className="flex-1 w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#0a0a0a] border border-slate-300 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-purple-600"
            />
            <button
              type="submit"
              className="shrink-0 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-600/20 transition-all active:scale-95 ease-in-out duration-150"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Now</span>
            </button>
          </div>
        </form>
      )}

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-4 border border-slate-200/80 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:bg-white dark:focus:bg-slate-800 focus:border-purple-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto custom-scrollbar">
          {(['ALL', 'Exam', 'Fee', 'Academic', 'General'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'All Alerts' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((n, idx) => (
          <div
            key={`${n.id || 'notif'}_${idx}`}
            onClick={() => markNotificationAsRead(n.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
              !n.isRead
                ? 'bg-purple-50/40 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/80 shadow-xs ring-1 ring-purple-500/10'
                : 'bg-white dark:bg-[#0a0a0a] border-slate-200/80 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-700 shadow-xs shrink-0">
                {getCategoryIcon(n.category)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  )}
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{n.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400">
                    {n.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-1">{n.timestamp}</p>
              </div>
            </div>

            {n.isRead && <CheckCircle2 className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
};
