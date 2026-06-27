# Crownridge LLP - AI Infrastructure Project Delay Root Cause Analyzer

The **AI Infrastructure Project Delay Root Cause Analyzer** is a full-stack, AI-powered web application designed to help infrastructure construction companies identify the root causes of project delays. Project managers enter structured delay metrics (e.g. weather severity, labour availability, permit delays, equipment failures), and the system utilizes AI completions to generate structured analysis reports containing business impact logs, immediate mitigation plans, recovery timeline forecasts, and long-term preventive procedures.

---

## Core Features

- **JWT Authentication:** Sign up/in and token verification with Role-Based Access Control (RBAC) (User vs Administrator).
- **Interactive Form Reporting:** Guided multi-field analysis form validation, supporting character limits, date inputs, and dropdown selectors.
- **AI-Powered Diagnostics:** Links directly to OpenRouter API (defaults to Gemini 2.5 Flash / Llama 3.3). If offline or no key is supplied, a fallback mock generator executes locally.
- **Exporting Options:** Copy reports to clipboard, export as clean TXT files, print reports, or download formatted PDFs via client-side `jsPDF` render layouts.
- **Feedback Quality Loops:** PMs rate reports on a 1-5 star visual score, like/dislike recommendation sentiment, and record comments reviewed by executives.
- **Admin Analytics Dashboard:** Visual trends including daily report volumes, cause distributions (doughnut chart), severity ratios, and feedback remarks databases.
- **Quick-Fill Templates:** Admins create incident templates (e.g. monsoon storms) that users select to auto-fill form inputs instantly.

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide icons, Axios, Chart.js, jsPDF.
- **Backend:** Node.js, Express, Prisma ORM, JSON Web Tokens, bcrypt, Helmet, Morgan.
- **Database:** SQLite (default for local development), easily switchable to PostgreSQL (Supabase/Render) in `schema.prisma`.

---

## Folder Structure

```text
AI-Project-Delay-Analyzer/
│
├── frontend/             # Vite + React Client
│   ├── src/
│   │   ├── components/   # Router guards
│   │   ├── pages/        # Dashboard, DelayForm, Details, History, Admin
│   │   ├── index.css     # Global Tailwind styles
│   │   └── App.jsx       # Global router layout
│   └── package.json
│
├── backend/              # Express API Server
│   ├── src/
│   │   ├── middleware/   # Authentication verification guards
│   │   ├── routes/       # Auth, Reports, Feedback, Templates, Analytics
│   │   ├── utils/        # Prisma client, OpenRouter/Mock completion
│   │   └── server.js     # Express main server mount
│   ├── prisma/           # SQLite database definition schema
│   ├── .env              # Server variables
│   └── package.json
│
└── README.md
```

---

## Installation & Running Locally

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Database & Backend Setup

1. Open your terminal in the `backend` folder:
   ```bash
   cd backend
   ```
2. Build dependencies:
   ```bash
   npm install
   ```
3. Set up variables in `.env` (a local database file `dev.db` is configured automatically):
   ```bash
   # Add your OpenRouter Key to query real AI, or leave blank to run fallbacks
   OPENROUTER_API_KEY="your-openrouter-key"
   ```
4. Perform database synchronization:
   ```bash
   npx prisma db push
   ```
5. Start the development server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

### 2. Frontend Client Setup

1. Open a new terminal in the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Build dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React client (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```

---

## User Roles for Demonstration

When registering, you can choose between two roles to test different sections of the app:

- **Project Manager / Engineer (User):** Can file new delay reports, review their own reporting history, copy/print/download reports, and submit feedback ratings.
- **Planning Executive (Administrator):** Can view all reports submitted by the organization, access the comprehensive Analytics charts, manage incident quick-fill templates, and read quality feedback comment tables.
