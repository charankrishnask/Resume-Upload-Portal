/**
 * components/UploadForm.jsx
 *
 * The main upload form.  Handles:
 *   - Text field collection (name, email, rollNo)
 *   - Drag-and-drop + click-to-browse file selection
 *   - Client-side validation (required fields + file type + file size)
 *   - Axios POST with upload progress via onUploadProgress
 *
 * Props:
 *   onUploadStart    {Function}  — called with no args when upload begins
 *   onProgress       {Function}  — called with integer 0-100
 *   onSuccess        {Function}  — called with API response data on success
 *   onError          {Function}  — called with error message string on failure
 */

import React, { useState, useRef } from 'react';
import { uploadResume } from '../services/api';

// Allowed file extension set — mirrors backend validation
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function UploadForm({ onUploadStart, onProgress, onSuccess, onError }) {
    // ── Form state ──────────────────────────────────────────────────────────────
    const [fields, setFields] = useState({ name: '', email: '', rollNo: '' });
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef(null);

    // ── Helpers ─────────────────────────────────────────────────────────────────

    /** Extract extension from a filename and check against allowlist */
    const isValidFileType = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        return ALLOWED_EXTENSIONS.includes(ext);
    };

    /** Returns an error string or null */
    const validateFile = (f) => {
        if (!f) return 'Please select a resume file.';
        if (!isValidFileType(f.name)) return `Only ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()} files are accepted.`;
        if (f.size > MAX_FILE_SIZE_BYTES) return `File size must be under ${MAX_FILE_SIZE_MB} MB.`;
        return null;
    };

    /** Validates all form fields and returns an errors object */
    const validateAll = () => {
        const errors = {};
        if (!fields.name.trim()) errors.name = 'Full name is required.';
        if (!fields.email.trim()) errors.email = 'Email is required.';
        else if (!/^\S+@\S+\.\S+$/.test(fields.email)) errors.email = 'Enter a valid email address.';
        if (!fields.rollNo.trim()) errors.rollNo = 'Roll number is required.';

        const fileError = validateFile(file);
        if (fileError) errors.file = fileError;

        return errors;
    };

    // ── Event handlers ───────────────────────────────────────────────────────────

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFields((prev) => ({ ...prev, [name]: value }));
        // Clear per-field error on change
        if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const applyFile = (selectedFile) => {
        const err = validateFile(selectedFile);
        if (err) {
            setFieldErrors((prev) => ({ ...prev, file: err }));
            setFile(null);
        } else {
            setFile(selectedFile);
            setFieldErrors((prev) => ({ ...prev, file: '' }));
        }
    };

    const handleFileChange = (e) => applyFile(e.target.files[0]);

    // Drag-and-drop handlers
    const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = () => setDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files[0]) applyFile(e.dataTransfer.files[0]);
    };

    // ── Submit ───────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateAll();
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        setSubmitting(true);
        onUploadStart();

        // Build FormData matching backend field names
        const formData = new FormData();
        formData.append('name', fields.name.trim());
        formData.append('email', fields.email.trim());
        formData.append('rollNo', fields.rollNo.trim());
        formData.append('resume', file); // must match multer field name "resume"

        try {
            const response = await uploadResume(formData, onProgress);
            onSuccess(response.data.data); // pass the student record to parent
        } catch (err) {
            // Extract a user-friendly message from Axios error
            const message =
                err.response?.data?.message ||
                err.message ||
                'Something went wrong. Please try again.';
            onError(message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────────
    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Full Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={fields.name}
                    onChange={handleFieldChange}
                    placeholder="Jane Doe"
                    disabled={submitting}
                    className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition
            focus:ring-2 focus:ring-indigo-400
            ${fieldErrors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'}`}
                />
                {fieldErrors.name && <p className="mt-1 text-xs text-rose-600">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={fields.email}
                    onChange={handleFieldChange}
                    placeholder="jane@university.edu"
                    disabled={submitting}
                    className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition
            focus:ring-2 focus:ring-indigo-400
            ${fieldErrors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'}`}
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>}
            </div>

            {/* Roll Number */}
            <div>
                <label htmlFor="rollNo" className="block text-sm font-medium text-slate-700 mb-1">
                    Roll Number <span className="text-rose-500">*</span>
                </label>
                <input
                    id="rollNo"
                    name="rollNo"
                    type="text"
                    value={fields.rollNo}
                    onChange={handleFieldChange}
                    placeholder="CS2024001"
                    disabled={submitting}
                    className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition
            focus:ring-2 focus:ring-indigo-400
            ${fieldErrors.rollNo ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white'}`}
                />
                {fieldErrors.rollNo && <p className="mt-1 text-xs text-rose-600">{fieldErrors.rollNo}</p>}
            </div>

            {/* Drag-and-drop file zone */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Resume <span className="text-rose-500">*</span>
                    <span className="ml-2 text-xs text-slate-400 font-normal">(PDF, DOC, DOCX · max {MAX_FILE_SIZE_MB} MB)</span>
                </label>

                <div
                    onClick={() => !submitting && fileInputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer
            px-6 py-8 text-center transition-colors
            ${dragging ? 'border-indigo-400 bg-indigo-50' : fieldErrors.file ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}
            ${submitting ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                    <span className="text-4xl select-none">{file ? '📄' : '☁️'}</span>
                    {file ? (
                        <span className="text-sm font-medium text-indigo-700">{file.name}</span>
                    ) : (
                        <>
                            <span className="text-sm font-medium text-slate-600">
                                Drag & drop your resume here, or <span className="text-indigo-600 underline">browse</span>
                            </span>
                        </>
                    )}
                    {/* Hidden native file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        disabled={submitting}
                        className="sr-only"
                        aria-label="Resume file upload"
                    />
                </div>
                {fieldErrors.file && <p className="mt-1 text-xs text-rose-600">{fieldErrors.file}</p>}
            </div>

            {/* Submit button */}
            <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white
          shadow-md transition hover:bg-indigo-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {submitting ? 'Uploading…' : 'Submit Resume →'}
            </button>
        </form>
    );
}
