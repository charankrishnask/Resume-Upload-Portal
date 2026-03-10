/**
 * routes/resumeRoutes.js — Express router for resume-related endpoints
 *
 * Endpoints:
 *   POST /api/resume/upload       — Upload a new resume (multipart/form-data)
 *   GET  /api/resume/:studentId   — Stream the resume file for a given student
 *   GET  /api/resumes             — List all student records
 *
 * The `upload` middleware runs before the controller and:
 *   1. Validates file type (PDF / DOC / DOCX) and size (≤ 5 MB)
 *   2. Streams the accepted file into GridFS
 *   3. Attaches file metadata to req.file for the controller to read
 */

const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');
const { uploadResume, streamResume, listResumes } = require('../controllers/resumeController');

// POST /api/resume/upload
// "resume" must match the field name used in FormData on the client side
router.post(
    '/upload',
    (req, res, next) => {
        // Wrap Multer call to convert Multer-specific errors into standard Error objects
        upload.single('resume')(req, res, (err) => {
            if (err) {
                // MulterError covers limits violations (file size, unexpected field, etc.)
                return res.status(400).json({
                    success: false,
                    message: err.message,
                    data: {},
                });
            }
            next();
        });
    },
    uploadResume
);

// GET /api/resume/:studentId — stream resume file
router.get('/:studentId', streamResume);

// GET /api/resumes — list all students (note: mounted on the parent app at /api/resumes)
router.get('/', listResumes);

module.exports = router;
