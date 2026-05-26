# TaskFlow — A Smart Task Manager with Priority Scoring

TaskFlow is a premium full-stack MERN stack task management application. The system automatically calculates a dynamic, server-side **Priority Score** for each task based on its deadline proximity and importance, sorting tasks on a responsive dashboard.

---

## 🚀 Core Features

1.  **Dynamic Server-side Priority Scoring**:
    *   Formula: `priorityScore = (importance * 10) + (100 / max(daysUntilDue, 1))`
    *   Completed tasks have their priority score frozen at `0.00`.
    *   Calculated dynamically at read-time so that priority scores update seamlessly without DB sync drifts.
2.  **Highly Polished Dark UI**:
    *   Harmonious radial background gradient dark-theme.
    *   Star-ratings representing task importance (1-5 scale).
    *   Glow highlights and red warning tags on tasks having `priorityScore >= 50`.
3.  **Metrics & Aggregation Dashboard**:
    *   Total tasks, pending tasks, completed tasks, and overdue metrics tracked.
    *   **Optional Bonus Aggregation Pipeline**: Uses MongoDB aggregation framework `$facet`, `$group`, `$cond`, and `$match` to calculate distribution and overdue counts inside the database natively.
4.  **\"Demo In-Memory Mode\" Dynamic Fallback**:
    *   Enforces a 2-second connection timeout on MongoDB connection requests.
    *   If MongoDB is unreachable, the backend catches the error and boots in **Demo In-Memory Mode** utilizing transparent Javascript `Proxy` wrappers, making the app immediately runnable database-free out-of-the-box!
    *   Includes a prepopulated board with overdue, active, and completed demo tasks.

---

## 🏗️ Folder Structure

```
taskflow/
├── backend/
│   ├── controllers/
│   │   └── taskController.js    # Score formulas & MongoDB stats aggregation pipeline
│   ├── models/
│   │   └── task.js              # Task schema & Proxy-based in-memory model fallback
│   ├── routes/
│   │   └── taskRoutes.js        # Express endpoints under /bfhl prefix
│   ├── server.js                # Express app, health checks, and database bootloader
│   └── verify_logic.js          # Logic verification test suite
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx    # Metrics distribution panel
    │   │   ├── TaskCard.jsx     # Card rendering, stars badge, humanized time formatting
    │   │   └── TaskForm.jsx     # Form panel drawer with inline validations
    │   ├── App.jsx              # App controller, network fetches, and toast banners
    │   ├── index.css            # Custom CSS variables, styling framework, animations
    │   └── main.jsx             # React entry point
    ├── index.html               # Mounting container
    ├── vite.config.js           # Vite config
    └── .env                     # Local environment settings
```

---

## ⚙️ Running Locally

### 1. Backend Setup
```bash
cd backend
npm install
npm start # runs server on port 5000 (auto-detects MongoDB or falls back to demo mode)
```

To run logic tests:
```bash
node verify_logic.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev # runs Vite hot-reload server on http://localhost:5173/
```
