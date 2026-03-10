/**
 * components/ConfirmationCard.jsx
 *
 * Displays a success or error card after an upload attempt.
 * Success case shows the student's details returned by the API.
 * Error case shows the error message.
 *
 * Props:
 *   result {Object|null}  — API response data (student record) on success
 *   error  {string|null}  — Human-readable error message on failure
 *   onReset {Function}    — Callback to clear state and allow a fresh upload
 */

import React from 'react';

export default function ConfirmationCard({ result, error, onReset }) {
    // Nothing to show yet
    if (!result && !error) return null;

    const isSuccess = Boolean(result);

    return (
        <div
            className={`mt-6 rounded-2xl border p-6 shadow-sm transition-all ${isSuccess
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-rose-200 bg-rose-50'
                }`}
        >
            {/* Icon + title */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{isSuccess ? '✅' : '❌'}</span>
                <h2 className={`text-lg font-semibold ${isSuccess ? 'text-emerald-800' : 'text-rose-800'}`}>
                    {isSuccess ? 'Upload Successful!' : 'Upload Failed'}
                </h2>
            </div>

            {/* Success details */}
            {isSuccess && (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    {[
                        ['Name', result.name],
                        ['Email', result.email],
                        ['Roll No', result.rollNo],
                        ['Status', result.status],
                        ['Uploaded At', new Date(result.uploadedAt).toLocaleString()],
                        ['Student ID', result.studentId],
                    ].map(([label, value]) => (
                        <React.Fragment key={label}>
                            <dt className="font-medium text-emerald-700">{label}</dt>
                            <dd className="text-emerald-900 break-all">{value}</dd>
                        </React.Fragment>
                    ))}
                </dl>
            )}

            {/* Error message */}
            {!isSuccess && (
                <p className="text-sm text-rose-700">{error}</p>
            )}

            {/* Reset button */}
            <button
                type="button"
                onClick={onReset}
                className={`mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${isSuccess
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
            >
                {isSuccess ? '+ Upload Another' : '↩ Try Again'}
            </button>
        </div>
    );
}
