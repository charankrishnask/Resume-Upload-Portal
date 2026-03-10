/**
 * models/Student.js — Mongoose schema for student resume metadata
 *
 * The actual PDF/DOC bytes are stored in GridFS; the `resumeFileId` field
 * holds the ObjectId of the corresponding GridFS document so we can
 * stream it back on demand.
 */

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    // Student personal details (collected from the upload form)
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    rollNo: {
        type: String,
        required: [true, 'Roll number is required'],
        trim: true,
    },

    // Reference to the file stored in GridFS ("resumes" bucket)
    resumeFileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },

    // Original filename, useful for setting Content-Disposition on download
    resumeFileName: {
        type: String,
        required: true,
    },

    // Timestamp — defaults to the moment of insertion
    uploadedAt: {
        type: Date,
        default: Date.now,
    },

    // Optional status field (can be updated by an admin review workflow)
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
        default: 'pending',
    },
});

module.exports = mongoose.model('Student', studentSchema, 'student_resumes');
