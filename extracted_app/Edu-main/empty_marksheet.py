import re

with open('src/components/academics/ResultsScreen.tsx', 'r') as f:
    content = f.read()

# I want to replace the `return (` block inside ResultsScreen to show a polished empty state.

empty_state = """  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-slate-200/80 dark:border-neutral-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 font-bold">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">Academic Marksheet & Report Card</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official school term marksheets, CBSE subject marks breakdown & progress cards
          </p>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-dashed border-slate-300 dark:border-neutral-700 shadow-sm text-center">
        <div className="w-20 h-20 bg-slate-50 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-6">
          <Award className="w-10 h-10 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-2">No Marksheet Data Available</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
          Your marksheet and grading data will appear here once the new real-data module is integrated.
        </p>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-neutral-700">
          <TrendingUp className="w-4 h-4" />
          Pending Real Data Integration
        </span>
      </div>
    </div>
  );
};
"""

idx = content.find("  return (")
if idx != -1:
    new_content = content[:idx] + empty_state
    with open('src/components/academics/ResultsScreen.tsx', 'w') as f:
        f.write(new_content)
    print("Updated ResultsScreen")
else:
    print("Could not find return in ResultsScreen")
