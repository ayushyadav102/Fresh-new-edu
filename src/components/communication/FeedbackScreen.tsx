import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { FeedbackSubmission } from '../../types';
import {
  MessageSquare,
  Star,
  Send,
  ShieldCheck
} from 'lucide-react';

export const FeedbackScreen: React.FC = () => {
  const { feedbacks, submitFeedback } = useERP();

  const [category, setCategory] = useState<FeedbackSubmission['category']>('Subject & Faculty');
  const [targetName, setTargetName] = useState('Design & Analysis of Algorithms');
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    submitFeedback({
      category,
      targetName,
      rating,
      feedbackText,
      isAnonymous
    });

    setFeedbackText('');
    alert('Thank you! Your feedback has been safely submitted to Quality Assurance Cell.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">Student Feedback & Ratings</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit anonymous feedback on faculty courses, hostel mess, and campus infrastructure
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Encrypted Feedback Submission</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Feedback Submission Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-xs space-y-5 transition-colors">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg font-serif">Submit Feedback</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Feedback Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackSubmission['category'])}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:outline-hidden"
              >
                <option value="Subject & Faculty">Subject & Faculty Teaching</option>
                <option value="Administrative Staff">Administrative & Registrar Staff</option>
                <option value="Campus Infrastructure">Campus Infrastructure & Labs</option>
                <option value="Hostel & Mess">Hostel Facilities & Mess Quality</option>
                <option value="Library & Labs">Library & Digital E-Journals</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Subject / Target Name
              </label>
              <input
                type="text"
                required
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. Design & Analysis of Algorithms or Central Library"
                className="w-full p-3 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            {/* Star Rating Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Satisfaction Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 dark:text-slate-600 hover:text-amber-400 dark:hover:text-amber-400 focus:outline-hidden transition-colors cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">{rating} / 5 Stars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Feedback Details & Suggestions
              </label>
              <textarea
                required
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your detailed experience or recommendations for improvement..."
                className="w-full p-3 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-700 text-xs">
              <label className="flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-all duration-150 ease-in-out">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">Submit Anonymously</span>
              </label>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Identity protected if checked</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.98] duration-150 ease-in-out"
            >
              <Send className="w-4 h-4" />
              <span>Submit Feedback</span>
            </button>
          </form>
        </div>

        {/* Right Submitted History Tracker (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl p-6 border border-slate-200/80 dark:border-neutral-800 shadow-xs transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-white text-base font-serif mb-4">
              Your Past Submitted Feedbacks
            </h3>

            <div className="space-y-3">
              {feedbacks.map((fb) => (
                <div key={fb.id} className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      {fb.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fb.status === 'Resolved'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                    }`}>
                      {fb.status}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 dark:text-white text-xs">{fb.targetName}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{fb.feedbackText}</p>

                  {fb.adminResponse && (
                    <div className="p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-[11px] text-blue-900 dark:text-blue-200">
                      <span className="font-bold block text-blue-950 dark:text-blue-100">University Response:</span>
                      {fb.adminResponse}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                    <span>Submitted on {fb.submittedAt}</span>
                    <span>{fb.isAnonymous ? 'Anonymous' : 'Verified Student'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
