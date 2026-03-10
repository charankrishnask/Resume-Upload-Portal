/**
 * components/ProgressBar.jsx
 *
 * Displays a labelled progress bar that fills from 0 → 100% as a file uploads.
 * Disappears when progress is 0 and shows a "complete" style at 100%.
 *
 * Props:
 *   progress {number}  — integer 0–100 representing upload completion %
 */

import React from 'react';

export default function ProgressBar({ progress }) {
    // Only render while an upload is in progress
    if (progress === 0) return null;

    const isComplete = progress === 100;

    return (
        <div className="w-full mt-4" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            {/* Label row */}
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700">
                    {isComplete ? 'Processing…' : 'Uploading…'}
                </span>
                <span className="text-sm font-semibold text-indigo-600">{progress}%</span>
            </div>

            {/* Track */}
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                {/* Fill */}
                <div
                    className={`h-2.5 rounded-full transition-all duration-300 ease-out ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}
