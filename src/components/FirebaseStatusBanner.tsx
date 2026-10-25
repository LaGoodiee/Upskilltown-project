import React from 'react';
import { useApp } from '../context/AppContext';

export const FirebaseStatusBanner: React.FC = () => {
  const { isFirebaseConfigured, previewMode, setPreviewMode } = useApp();

  // Never show once keys are pasted into FIREBASE_CONFIG
  if (isFirebaseConfigured) return null;

  return (
    <div className="w-full mb-8 rounded-2xl border border-amber-400/50 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-200 shadow-sm animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xl shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-bold leading-tight">
              Backend not connected yet. Paste your Firebase keys in FIREBASE_CONFIG to turn this on.
            </p>
            <p className="text-xs opacity-90 mt-0.5">
              Running locally in offline simulation. All forms and features are active below.
            </p>
          </div>
        </div>

        {/* Preview mode toggle - ONLY shown when keys are empty */}
        <div className="flex items-center gap-2.5 bg-amber-500/20 px-3.5 py-1.5 rounded-full border border-amber-400/40 text-xs font-semibold self-stretch sm:self-auto justify-between sm:justify-start">
          <span className="select-none">Preview mode</span>
          <button
            type="button"
            role="switch"
            aria-checked={previewMode}
            onClick={() => setPreviewMode(!previewMode)}
            className={`w-10 h-6 flex items-center rounded-full p-1 duration-300 cursor-pointer transition-colors ${
              previewMode ? 'bg-[#ff4800]' : 'bg-zinc-400 dark:bg-zinc-600'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${
                previewMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
