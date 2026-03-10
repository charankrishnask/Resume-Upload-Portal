/**
 * services/api.js — Centralised Axios API layer
 *
 * All backend calls are defined here. Components import individual named
 * functions rather than calling Axios directly, making it easy to swap
 * the base URL or add auth headers in one place.
 */

import axios from 'axios';

// Base URL of the Express API
const BASE_URL = 'http://localhost:5000/api';

// Shared Axios instance — add interceptors here if needed (e.g. auth tokens)
const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // 30 s timeout for large file uploads
});

/**
 * uploadResume
 * ------------
 * Sends form data (name, email, rollNo, resume file) to the backend.
 *
 * @param {FormData} formData  — built by the UploadForm component
 * @param {Function} onProgress  — called with upload % (0-100) as integer
 * @returns {Promise<Object>}  — response.data from Express
 */
export const uploadResume = (formData, onProgress) =>
    apiClient.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },

        // Axios fires this callback as the browser sends data chunks
        onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
                const percent = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress(percent);
            }
        },
    });

/**
 * getResumeUrl
 * ------------
 * Returns the URL that streams a student's resume file.
 * Open this in a new tab or use as an <a href> for downloads.
 *
 * @param {string} studentId — MongoDB _id of the Student document
 * @returns {string}
 */
export const getResumeUrl = (studentId) =>
    `${BASE_URL}/resume/${studentId}`;

/**
 * listResumes
 * -----------
 * Fetches all student records (metadata only).
 *
 * @returns {Promise<Object>}  — response.data from Express
 */
export const listResumes = () => apiClient.get('/resume');
