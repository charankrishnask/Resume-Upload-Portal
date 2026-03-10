/**
 * config/db.js — MongoDB connection and GridFS bucket setup
 *
 * We use GridFS (via mongodb's native GridFSBucket) to store large resume
 * files directly inside MongoDB instead of the local filesystem.
 * The bucket is exported so controllers can open download streams.
 */

const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

// Module-level bucket reference — populated once the connection is ready
let gfsBucket;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅  MongoDB connected: ${conn.connection.host}`);

        // Initialise the GridFS bucket on the raw native driver connection
        gfsBucket = new GridFSBucket(conn.connection.db, {
            bucketName: 'resumes', // files stored in "resumes.files" & "resumes.chunks"
        });

        console.log('📁  GridFS bucket "resumes" ready');
    } catch (err) {
        console.error('❌  MongoDB connection error:', err.message);
        process.exit(1); // Exit with failure so the process restarts in production
    }
};

// Getter for the bucket — used by middleware & controllers
const getGfsBucket = () => gfsBucket;

module.exports = connectDB;
module.exports.getGfsBucket = getGfsBucket;
