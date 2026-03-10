/**
 * middleware/upload.js — Multer configuration using memory storage
 *
 * Instead of relying on multer-gridfs-storage (which has compatibility issues
 * with modern MongoDB drivers), we use Multer's built-in memoryStorage to
 * buffer the file in RAM, then stream it to GridFS inside the controller.
 *
 * Allowed types: PDF, DOC, DOCX
 * Max size: 5 MB
 */

const multer = require('multer');
const path = require('path');

// ── Allowed file types ────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',                                                       // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  // .docx
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];

// ── File filter — reject non-document uploads early ──────────────────────────
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (
        ALLOWED_MIME_TYPES.includes(file.mimetype) &&
        ALLOWED_EXTENSIONS.includes(ext)
    ) {
        cb(null, true);  // Accept
    } else {
        cb(
            new Error(
                `Invalid file type "${ext}". Only PDF, DOC, and DOCX files are allowed.`
            ),
            false  // Reject
        );
    }
};

// ── Multer with memory storage ────────────────────────────────────────────────
// The file will be available as req.file.buffer in the controller,
// where we manually open a GridFS upload stream.
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
});

module.exports = upload;
