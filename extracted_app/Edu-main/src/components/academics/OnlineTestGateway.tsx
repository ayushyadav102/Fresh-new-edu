import React, { useState } from 'react';
import { ArrowLeft, MonitorPlay, Link2, CheckCircle } from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface OnlineTestGatewayProps {
  test: any;
  onBack: () => void;
  role: 'student' | 'teacher';
}

export const OnlineTestGateway: React.FC<OnlineTestGatewayProps> = ({ test, onBack, role }) => {
  const { updateExamItem } = useERP();
  
  const [formLink, setFormLink] = useState(test.formLink || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveLink = () => {
    setIsSaving(true);
    try {
      let processedLink = formLink.trim();
      
      // Attempt to format link for embedding if it's a raw google forms link
      if (processedLink.includes('docs.google.com/forms') && !processedLink.includes('embedded=true')) {
        if (processedLink.includes('?')) {
          processedLink += '&embedded=true';
        } else {
          processedLink += '?embedded=true';
        }
      }
      
      updateExamItem(test.id, { formLink: processedLink });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 h-full flex flex-col">
      

      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-sm flex flex-col flex-1 min-h-[70vh] overflow-hidden">
        <div className="p-6 md:p-8 flex items-center gap-4 border-b border-slate-100 dark:border-neutral-800 shrink-0 bg-slate-50 dark:bg-neutral-900/50">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center shrink-0">
            <MonitorPlay className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {test.title}
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {test.code} • {test.marks} Marks
            </p>
          </div>
        </div>

        {role === 'teacher' && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Configure Google Form</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Paste the URL of your Google Form here. Students will take the test directly on the website through the embedded form.
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Link2 className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="url"
                    placeholder="https://docs.google.com/forms/d/e/..."
                    className="w-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formLink}
                    onChange={e => setFormLink(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleSaveLink}
                    disabled={isSaving || !formLink.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-6 py-2.5 text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {isSaving ? 'Saving...' : 'Save Form Link'}
                  </button>
                  
                  {showSuccess && (
                    <span className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-500 animate-in slide-in-from-left-4">
                      <CheckCircle className="w-4 h-4" /> Link saved successfully!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 bg-slate-100/50 dark:bg-neutral-950 flex flex-col p-4 md:p-8 relative">
          {(role === 'student' && !test.formLink) ? (
            <div className="flex flex-col items-center justify-center text-center m-auto max-w-sm">
              <div className="w-16 h-16 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-200 dark:border-neutral-800">
                <MonitorPlay className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Test Not Started</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Your teacher has not linked the Google Form for this test yet. Please check back later.
              </p>
            </div>
          ) : test.formLink ? (
            <div className="flex-1 w-full max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-neutral-800 min-h-[600px] flex flex-col">
              {role === 'teacher' && (
                <div className="px-4 py-2 bg-slate-50 dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700 text-xs font-bold text-slate-500 dark:text-slate-400 text-center uppercase tracking-wider">
                  Student Preview
                </div>
              )}
              <iframe 
                src={test.formLink} 
                className="w-full flex-1 border-0"
                title="Google Form Assessment"
                allow="camera; microphone"
              >
                Loading...
              </iframe>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
