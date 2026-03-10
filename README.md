# 📋 Resume Upload Portal

A full-stack web application that lets students submit their resumes online. Built with **React + Vite** on the frontend and **Node.js + Express + MongoDB** on the backend, with files stored securely using **GridFS**.

---

## ✨ Features

- 📤 Drag-and-drop or click-to-browse file upload
- ✅ Client-side & server-side validation (type + size)
- 📊 Real-time upload progress bar
- 💾 Resume files stored in MongoDB GridFS (no disk storage needed)
- 📥 Resume download/streaming by student ID
- 🗂️ View all submitted resumes

---

## 🛠️ Tech Stack

| Side | Technology |
|------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| File Storage | MongoDB GridFS |
| Dev Tools | Nodemon, dotenv |

---

## 📁 Project Structure

```
student_resume_project/
├── backend/
│   ├── server.js                 # Express app entry point
│   ├── .env                      # Your environment variables (create this)
│   ├── .env.example              # Template for .env
│   ├── package.json
│   ├── config/
│   │   └── db.js                 # MongoDB + GridFS connection
│   ├── models/
│   │   └── Student.js            # Mongoose schema (student_resumes collection)
│   ├── middleware/
│   │   └── upload.js             # Multer file validation & memory storage
│   ├── controllers/
│   │   └── resumeController.js   # Upload, stream, list logic
│   └── routes/
│       └── resumeRoutes.js       # API route definitions
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx              # React 18 entry point
        ├── index.css             # Tailwind directives
        ├── App.jsx               # Root component & upload state machine
        ├── services/
        │   └── api.js            # All Axios API calls
        └── components/
            ├── UploadForm.jsx    # Form + drag-and-drop zone
            ├── ProgressBar.jsx   # Upload % bar
            └── ConfirmationCard.jsx  # Success / error feedback
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) running locally **or** a [MongoDB Atlas](https://cloud.mongodb.com) connection string

---

### 1️⃣ Clone / Open the Project

```bash
cd student_resume_project
```

---

### 2️⃣ Set Up the Backend

```bash
cd backend

# Install dependencies
npm install --legacy-peer-deps

# Create your .env file
copy .env.example .env
```

Open `.env` and set your values:

```env
MONGO_URI=mongodb://localhost:27017/Resume_upload
PORT=5000
```

> **Using MongoDB Atlas?** Replace the URI with your Atlas connection string, e.g.:
> `mongodb+srv://<user>:<password>@cluster.mongodb.net/Resume_upload`

Start the backend:

```bash
npm run dev
```

You should see:
```
🚀  Server listening on http://localhost:5000
✅  MongoDB connected: localhost
📁  GridFS bucket "resumes" ready
```

---

### 3️⃣ Set Up the Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/resume/upload` | Upload a resume (multipart/form-data) |
| `GET` | `/api/resume/:studentId` | Stream/download a student's resume |
| `GET` | `/api/resume` | List all submitted student records |

### POST `/api/resume/upload`

**Form fields:**

| Field | Type | Required |
|-------|------|----------|
| `name` | text | ✅ |
| `email` | text | ✅ |
| `rollNo` | text | ✅ |
| `resume` | file | ✅ PDF, DOC, DOCX · max 5 MB |

**Success response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully.",
  "data": {
    "studentId": "65f3a...",
    "name": "Jane Doe",
    "email": "jane@uni.edu",
    "rollNo": "CS2024001",
    "uploadedAt": "2026-03-10T17:00:00.000Z",
    "status": "pending"
  }
}
```

**Error response:**
```json
{
  "success": false,
  "message": "Invalid file type \".txt\". Only PDF, DOC, and DOCX files are allowed.",
  "data": {}
}
```

---

## 🗄️ MongoDB Collections

| Collection | Contents |
|------------|----------|
| `student_resumes` | Student metadata (name, email, rollNo, reference to file) |
| `resumes.files` | GridFS file metadata (filename, size, upload date) |
| `resumes.chunks` | GridFS binary chunks (actual file bytes, 255 KB each) |

---

## ⚠️ Validation Rules

| Rule | Client | Server |
|------|--------|--------|
| All fields required | ✅ | ✅ |
| Valid email format | ✅ | ✅ |
| File type: PDF / DOC / DOCX only | ✅ | ✅ |
| Max file size: 5 MB | ✅ | ✅ |

---

## 🔒 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/Resume_upload` |
| `PORT` | Port for Express server | `5000` |

> Never commit your `.env` file to version control. It is listed in `.gitignore` by convention.

---

## 📦 Available Scripts

### Backend
| Command | Action |
|---------|--------|
| `npm run dev` | Start with Nodemon (auto-restart on changes) |
| `npm start` | Start with plain Node |

### Frontend
| Command | Action |
|---------|--------|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview the production build locally |

---

## 🙋 Common Issues

**`nodemon` not found**
```bash
npm install --legacy-peer-deps   # installs devDependencies including nodemon
```

**MongoDB connection failed**
- Make sure MongoDB is running: `mongod` in a separate terminal
- Check that `MONGO_URI` in `.env` includes the database name (e.g. `.../Resume_upload`)
- Make sure `PORT` is `5000`, not `27017`

**CORS error in the browser**
- Ensure the frontend is running on port `3000`
- Ensure the backend `CORS` origin in `server.js` matches `http://localhost:3000`

---

## 📄 License

MIT — free to use and modify.
