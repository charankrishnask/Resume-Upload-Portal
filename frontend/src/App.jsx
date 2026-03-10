/**
 * App.jsx — Root component
 *
 * Orchestrates state shared across UploadForm, ProgressBar, and ConfirmationCard.
 * Keeps upload flow state (idle → uploading → done) in one place so the child
 * components remain pure/presentational.
 */

import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import ProgressBar from './components/ProgressBar';
import ConfirmationCard from './components/ConfirmationCard';

// Upload lifecycle states
const STATE = {
    IDLE: 'idle',
    UPLOADING: 'uploading',
    SUCCESS: 'success',
    ERROR: 'error',
};

export default function App() {
    const [uploadState, setUploadState] = useState(STATE.IDLE);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);   // Student data returned from API
    const [errorMsg, setErrorMsg] = useState('');

    // ── Callbacks passed down to UploadForm ─────────────────────────────────────

    const handleUploadStart = () => {
        setUploadState(STATE.UPLOADING);
        setProgress(0);
        setResult(null);
        setErrorMsg('');
    };

    const handleProgress = (pct) => setProgress(pct);

    const handleSuccess = (studentData) => {
        setProgress(100);
        setResult(studentData);
        setUploadState(STATE.SUCCESS);
    };

    const handleError = (message) => {
        setErrorMsg(message);
        setUploadState(STATE.ERROR);
        setProgress(0);
    };

    /** Reset back to the idle form so the user can submit again */
    const handleReset = () => {
        setUploadState(STATE.IDLE);
        setProgress(0);
        setResult(null);
        setErrorMsg('');
    };

    // While uploading or after completion the form is hidden to avoid duplicate submissions
    const showForm = uploadState === STATE.IDLE;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Page header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                        📋 Resume Upload Portal
                    </h1>
                    <p className="mt-2 text-slate-500 text-sm">
                        Submit your resume · PDF, DOC, or DOCX · Max 5 MB
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 p-8">
                    {showForm && (
                        <UploadForm
                            onUploadStart={handleUploadStart}
                            onProgress={handleProgress}
                            onSuccess={handleSuccess}
                            onError={handleError}
                        />
                    )}

                    {/* Progress bar is visible during upload */}
                    <ProgressBar progress={progress} />

                    {/* Uploading spinner */}
                    {uploadState === STATE.UPLOADING && (
                        <p className="mt-3 text-center text-sm text-slate-500 animate-pulse">
                            Please wait while we upload your resume…
                        </p>
                    )}

                    {/* Success / error card */}
                    <ConfirmationCard
                        result={uploadState === STATE.SUCCESS ? result : null}
                        error={uploadState === STATE.ERROR ? errorMsg : null}
                        onReset={handleReset}
                    />
                </div>

                <p className="mt-6 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} Resume Upload Portal · All rights reserved
                </p>
            </div>
        </div>
    );
}
