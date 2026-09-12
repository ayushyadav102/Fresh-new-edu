import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ACADEMIC_CALENDAR_EVENTS, MENTOR_LOGS } from '../../data/mockData';
import { Modal } from '../common/Modal';
import {
  CalendarDays,
  Clock,
  ChevronRight,
  Filter
} from 'lucide-react';

export const AcademicCalendarScreen: React.FC = () => {
  const { student } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'mentor'>('calendar');
  const [eventCategoryFilter, setEventCategoryFilter] = useState<string>('ALL');

  // Mentor Appointment Modal
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [preferredDate, setPreferredDate] = useState('2026-08-20');
  const [preferredSlot, setPreferredSlot] = useState('03:00 PM - 03:30 PM');
  const [topicReason, setTopicReason] = useState('Internship Resume Review & Minor Project Guidance');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const mentor = student?.mentor;

  const filteredEvents = ACADEMIC_CALENDAR_EVENTS.filter(
    (item) => eventCategoryFilter === 'ALL' || item.category === eventCategoryFilter
  );

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setAppointmentModalOpen(false);
      alert(`Appointment request sent to ${mentor?.name} for ${preferredDate} at ${preferredSlot}!`);
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">Academic Calendar & Mentor Desk</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official key dates, university holidays, exam milestones & dedicated faculty mentor interaction
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-neutral-700">
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'calendar'
                ? 'bg-white dark:bg-[#0a0a0a] text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Academic Calendar
          </button>
          <button
            onClick={() => setActiveSubTab('mentor')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'mentor'
                ? 'bg-white dark:bg-[#0a0a0a] text-blue-700 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Faculty Mentor Desk
          </button>
        </div>
      </div>

      {activeSubTab === 'calendar' ? (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-4 border border-slate-200/80 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Event Category:</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto custom-scrollbar">
              {(['ALL', 'Holiday', 'Exam', 'Fee Due', 'Academic Milestone', 'Sports & Fest'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setEventCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    eventCategoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'ALL' ? 'All Events' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  evt.isImportant
                    ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white border-indigo-700 shadow-lg'
                    : 'bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white border-slate-200/80 dark:border-neutral-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        evt.isImportant
                          ? 'bg-amber-400 text-slate-900'
                          : evt.category === 'Holiday'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : evt.category === 'Exam'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                      }`}
                    >
                      {evt.category}
                    </span>

                    <span className={`text-xs font-mono font-bold ${evt.isImportant ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                      {evt.date}
                    </span>
                  </div>

                  <h3 className={`font-bold font-serif text-base ${evt.isImportant ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {evt.title}
                  </h3>

                  <p className={`text-xs ${evt.isImportant ? 'text-indigo-100' : 'text-slate-600 dark:text-slate-300'}`}>
                    {evt.description}
                  </p>
                </div>

                <div className={`mt-4 pt-3 border-t text-[11px] font-semibold flex items-center justify-between ${
                  evt.isImportant ? 'border-white/10 text-amber-300' : 'border-slate-100 dark:border-neutral-800 text-indigo-600 dark:text-indigo-400'
                }`}>
                  <span>{evt.isImportant ? '⭐ Mandatory Campus Event' : 'Scheduled Milestone'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Faculty Mentor Section */
        <div className="space-y-6">
          {/* Mentor Profile Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-indigo-200 text-2xl font-bold font-serif shrink-0">
                  {mentor?.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase">
                    Assigned Faculty Mentor
                  </span>
                  <h2 className="text-2xl font-bold font-serif text-white">{mentor?.name}</h2>
                  <p className="text-xs text-indigo-200">{mentor?.designation} • {mentor?.department}</p>
                  <p className="text-xs text-slate-300 font-mono">Office: {mentor?.office}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => setAppointmentModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                >
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Book Mentor Appointment</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mentor Logs & Past Meetings */}
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-4 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg font-serif">
              Mentorship Meeting Logs & Advisory Notes
            </h3>

            <div className="space-y-4">
              {MENTOR_LOGS.map((log) => (
                <div key={log.id} className="p-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                      📅 Meeting Date: {log.date}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      ✓ {log.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{log.topic}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{log.summary}</p>

                  <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs">
                    <p className="font-bold text-indigo-900 dark:text-indigo-300 uppercase text-[10px] tracking-wider mb-1">
                      Action Items & Next Steps:
                    </p>
                    <p className="text-slate-700 dark:text-slate-200 whitespace-pre-line font-medium">{log.actionItems}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      <Modal
        isOpen={appointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        title="Schedule Meeting with Faculty Mentor"
      >
        <form onSubmit={handleBookAppointment} className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 text-indigo-950 dark:text-indigo-200 text-xs space-y-1">
            <p className="font-bold">Faculty: {mentor?.name} ({mentor?.designation})</p>
            <p className="text-indigo-800 dark:text-indigo-300">Office Hours: Mon, Wed, Fri (03:00 PM - 05:00 PM)</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Preferred Date
            </label>
            <input
              type="date"
              required
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Time Slot
            </label>
            <select
              value={preferredSlot}
              onChange={(e) => setPreferredSlot(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:outline-hidden"
            >
              <option value="03:00 PM - 03:30 PM">03:00 PM - 03:30 PM</option>
              <option value="03:30 PM - 04:00 PM">03:30 PM - 04:00 PM</option>
              <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Agenda / Discussion Topic
            </label>
            <textarea
              required
              rows={3}
              value={topicReason}
              onChange={(e) => setTopicReason(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setAppointmentModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-[0.98] transition-all duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={bookingSuccess}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer disabled:opacity-70 active:scale-[0.98] duration-150 ease-in-out"
            >
              {bookingSuccess ? 'Booking Slot...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
