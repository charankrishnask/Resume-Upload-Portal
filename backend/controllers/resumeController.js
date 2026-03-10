/**
 * controllers/resumeController.js — Business logic for resume operations
 *
 * uploadResume  — POST /api/resume/upload
 *   Multer buffers the file in memory (req.file.buffer).
 *   We open a GridFS upload stream and pipe the buffer in.
 *
 * streamResume  — GET  /api/resume/:studentId
 *   Opens a GridFS download stream by the stored resumeFileId.
 *
 * listResumes   — GET  /api/resume
 *   Returns all student metadata records.
 */

const mongoose = require('mongoose');
const { Readable } = require('stream');
const Student = require('../models/Student');
const { getGfsBucket } = require('../config/db');

// ── Helper: pipe a Buffer into GridFS ────────────────────────────────────────
/**
 * Wraps a Buffer in a Readable stream and uploads it to GridFS.
 * Returns a Promise that resolves to the GridFS file id (ObjectId).
 */
const uploadBufferToGridFS = (buffer, filename) => {
    return new Promise((resolve, reject) => {
        const bucket = getGfsBucket();
        if (!bucket) return reject(new Error('GridFS bucket not ready.'));

        // Open a writable stream into the "resumes" GridFS bucket
        const uploadStream = bucket.openUploadStream(filename, {
            metadata: { uploadedAt: new Date() },
        });

        // Convert the buffer to a Readable and pipe into GridFS
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null); // EOF signal
        readable.pipe(uploadStream);

        uploadStream.on('finish', () => resolve(uploadStream.id));  // GridFS ObjectId
        uploadStream.on('error', reject);
    });
};

// ── uploadResume ──────────────────────────────────────────────────────────────
const uploadResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please attach a PDF, DOC, or DOCX resume.',
                data: {},
            });
        }

        const { name, email, rollNo } = req.body;

        if (!name || !email || !rollNo) {
            return res.status(400).json({
                success: false,
                message: 'name, email, and rollNo are all required fields.',
                data: {},
            });
        }

        // Build a unique filename and upload the buffer to GridFS
        const uniqueFilename = `${Date.now()}-${req.file.originalname}`;
        const fileId = await uploadBufferToGridFS(req.file.buffer, uniqueFilename);

        // Save student metadata to MongoDB
        const student = await Student.create({
            name,
            email,
            rollNo,
            resumeFileId: fileId,
            resumeFileName: uniqueFilename,
        });

        return res.status(201).json({
            success: true,
            message: 'Resume uploaded successfully.',
            data: {
                studentId: student._id,
                name: student.name,
                email: student.email,
                rollNo: student.rollNo,
                uploadedAt: student.uploadedAt,
                status: student.status,
            },
        });
    } catch (err) {
        next(err);
    }
};

// ── streamResume ──────────────────────────────────────────────────────────────
const streamResume = async (req, res, next) => {
    try {
        const { studentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ success: false, message: 'Invalid student ID.', data: {} });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.', data: {} });
        }

        const bucket = getGfsBucket();
        if (!bucket) {
            return res.status(503).json({ success: false, message: 'Storage service not ready.', data: {} });
        }

        const downloadStream = bucket.openDownloadStream(student.resumeFileId);

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${student.resumeFileName}"`,
        });

        downloadStream.pipe(res);

        downloadStream.on('error', (err) => {
            console.error('[GridFS Stream Error]', err.message);
            if (!res.headersSent) {
                res.status(404).json({ success: false, message: 'Resume file not found.', data: {} });
            }
        });
    } catch (err) {
        next(err);
    }
};

// ── listResumes ───────────────────────────────────────────────────────────────
const listResumes = async (req, res, next) => {
    try {
        const students = await Student.find().select('-__v').sort({ uploadedAt: -1 });

        return res.status(200).json({
            success: true,
            message: `${students.length} resume(s) found.`,
            data: students,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { uploadResume, streamResume, listResumes };
