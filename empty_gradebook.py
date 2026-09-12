import re

with open('src/components/teacher/TeacherPortalScreen.tsx', 'r') as f:
    content = f.read()

start_marker = "{/* --- SUB-TAB 2: MARKS & REPORT CARD GRADEBOOK --- */}"
end_marker = "{/* --- SUB-TAB 3: SYLLABUS & HOMEWORK --- */}"

idx_start = content.find(start_marker)
idx_end = content.find(end_marker)

if idx_start != -1 and idx_end != -1:
    
    empty_gradebook_state = """{/* --- SUB-TAB 2: MARKS & REPORT CARD GRADEBOOK --- */}
      {activeSubTab === 'marks' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-neutral-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                  Gradebook & Marks Entry (Class {selectedClass})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage student marks and publish report cards.
                </p>
              </div>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center p-12 mt-4 bg-slate-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-neutral-700 text-center">
              <div className="w-16 h-16 bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-neutral-800 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <FileSpreadsheet className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Gradebook Module Emptied</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                This module has been cleared to prepare for the new UI/UX integration with real database functionality.
              </p>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-neutral-700">
                Awaiting Real Data Setup
              </span>
            </div>
          </div>
        </div>
      )}

      """
      
    new_content = content[:idx_start] + empty_gradebook_state + content[idx_end:]
    with open('src/components/teacher/TeacherPortalScreen.tsx', 'w') as f:
        f.write(new_content)
    print("Updated TeacherPortalScreen Gradebook")
else:
    print("Markers not found.")
