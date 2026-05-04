================================================================================
  FACULTY ACTIVITY & RESEARCH TRACKER
  Sathyabama Institute of Science and Technology
  Production-Level Web Application
================================================================================

OVERVIEW
--------
This system manages faculty research, student submissions, and multi-level
approval workflows (Faculty → HOD → Admin) aligned with NAAC/NBA standards.

NOTE: Backend APIs and file storage will be integrated in the next phase.

--------------------------------------------------------------------------------
OBJECTIVE
--------------------------------------------------------------------------------
Build a complete application with React frontend and backend-ready architecture
using localStorage as a mock database. Designed so backend APIs can be
integrated later without major changes.

--------------------------------------------------------------------------------
TECH STACK
--------------------------------------------------------------------------------
Frontend:
  - React.js (functional components + hooks)
  - React Router DOM
  - Tailwind CSS
  - Framer Motion (animations)
  - React Icons / Lucide React
  - Recharts (charts & analytics)

Mock Backend:
  - localStorage as database
  - Service layer with API-like structure (mockApi.js)
  - Express.js backend skeleton (routes/controllers placeholders)

--------------------------------------------------------------------------------
UI / UX DESIGN
--------------------------------------------------------------------------------
  - Premium glassmorphism + gradient design
  - Responsive layout (mobile + desktop)
  - Dashboard layout with sidebar navigation
  - Card-based UI components
  - Smooth animations using Framer Motion
  - Dark mode support (toggle + stored in localStorage)

--------------------------------------------------------------------------------
AUTHENTICATION (MOCK)
--------------------------------------------------------------------------------
  - Mock login system
  - Session stored in localStorage
  - Mock JWT token (accessToken)
  - Auto logout simulation
  - Role-based login with 4 roles:
      1. student
      2. faculty
      3. hod
      4. admin / super_admin
  - Protected routes per role

--------------------------------------------------------------------------------
USER ROLES & PERMISSIONS
--------------------------------------------------------------------------------
  student:
    - Submit internship reports
    - Submit research papers
    - View own submissions & status
    - View faculty published papers
    - Track approval timeline

  faculty:
    - View assigned submissions
    - Approve / Reject / Request Revision
    - Add comments
    - Submit own research papers

  hod:
    - Final approval after faculty review
    - View analytics & charts
    - View audit logs
    - Access all submissions

  admin / super_admin:
    - Overall institutional stats
    - Manage users (add/edit/deactivate)
    - View audit logs
    - Mock PDF/CSV export
    - Access all dashboards

--------------------------------------------------------------------------------
FILE UPLOAD COMPONENT
--------------------------------------------------------------------------------
  - Drag-and-drop zone
  - File picker button (browse)
  - Accepted types: PDF, DOCX, Images (JPG, PNG), ZIP
  - Max file size: 50 MB
  - Displays: file name, file size, file type icon
  - Image preview for image files
  - Upload simulation with progress bar (0% → 100%)
  - Status states: Uploading → Uploaded
  - Remove / clear file option
  - File stored in React state
  - Submission metadata saved to localStorage

--------------------------------------------------------------------------------
DATA FLOW (CRITICAL)
--------------------------------------------------------------------------------
When a student uploads a submission, save to localStorage:
  {
    id,
    title,
    fileName,
    fileType,
    date,
    status: "Submitted",
    comments: [],
    history: [
      { action: "Submitted", role: "student", timestamp }
    ]
  }

Dashboard reads from localStorage and displays counts by status:
  - Submitted
  - Pending (under review)
  - Approved
  - Rejected

When faculty or HOD updates a submission:
  - Update status field in localStorage
  - Push new entry to history array
  - UI reflects changes instantly (no page reload)

Approval pipeline stages:
  submitted → faculty_review → hod_review → approved / rejected

--------------------------------------------------------------------------------
STUDENT DASHBOARD
--------------------------------------------------------------------------------
  - Header: student name + department
  - Upload section (FileUpload component)
  - Approval timeline visual:
      Draft → Submitted → Faculty Review → HOD Approval → Completed
  - Submissions list:
      - Title
      - Date submitted
      - Status badge (color-coded)
  - Submission detail view:
      - File info (name, size, type)
      - Faculty/HOD comments
      - Full approval timeline

--------------------------------------------------------------------------------
FACULTY DASHBOARD
--------------------------------------------------------------------------------
  - View all submissions assigned to faculty stage
  - Actions per submission: Approve / Reject / Request Revision
  - Add comments with each action
  - View submission details

--------------------------------------------------------------------------------
HOD DASHBOARD
--------------------------------------------------------------------------------
  - View submissions at HOD stage
  - Final approval or rejection
  - Analytics overview (charts)
  - Audit log access

--------------------------------------------------------------------------------
ADMIN DASHBOARD
--------------------------------------------------------------------------------
  - Overall institutional statistics (KPI cards)
  - User management (add, edit, deactivate users)
  - Audit trail viewer
  - Mock export: PDF / CSV

--------------------------------------------------------------------------------
ANALYTICS (RECHARTS)
--------------------------------------------------------------------------------
  - Pie chart: submission status distribution
  - Bar chart: monthly submission counts
  - Line chart: approval rate over time
  - KPI cards: total submissions, approval %, rejection %, active users

--------------------------------------------------------------------------------
NOTIFICATIONS
--------------------------------------------------------------------------------
  - Notification bell icon in topbar
  - Mock notifications for status updates
  - Unread count badge
  - Dropdown notification list

--------------------------------------------------------------------------------
COMMENTS SYSTEM
--------------------------------------------------------------------------------
  - Faculty and HOD can leave comments on submissions
  - Comments displayed in a timeline view within submission detail
  - Each comment shows: author, role, timestamp, message

--------------------------------------------------------------------------------
DARK MODE
--------------------------------------------------------------------------------
  - Toggle button in topbar
  - Mode stored in localStorage
  - Smooth CSS transition on toggle
  - All components respect dark/light CSS variables

--------------------------------------------------------------------------------
EXPORT (MOCK)
--------------------------------------------------------------------------------
  - Export button on Admin/HOD dashboard
  - Simulates PDF export (mock download trigger)
  - Simulates CSV export (mock download trigger)

--------------------------------------------------------------------------------
STATE MANAGEMENT
--------------------------------------------------------------------------------
  - Context API (AuthContext, ThemeContext)
  - useAuth() custom hook
  - All global state centralized in context providers

--------------------------------------------------------------------------------
UI STATES
--------------------------------------------------------------------------------
  - Loading: skeleton shimmer animation
  - Empty: illustrated empty state with message
  - Error: error alert with retry option

--------------------------------------------------------------------------------
ROUTING STRUCTURE
--------------------------------------------------------------------------------
  /                    → Redirects to /dashboard
  /login               → Login page (public)
  /register            → Register page (public)
  /dashboard           → Role-based dashboard
  /submissions         → My Submissions list
  /submissions/new/:type → New submission form (type = internship | research)
  /submissions/:id     → Submission detail page
  /published           → Faculty published papers (students only)
  /review              → Review queue (faculty, hod, admin)
  /analytics           → Analytics page (hod, admin)
  /admin/users         → User management (admin only)
  /admin/logs          → Audit logs (hod, admin)
  /profile             → User profile

All protected routes use <ProtectedRoute> with role-based access control.

--------------------------------------------------------------------------------
COMPONENT STRUCTURE
--------------------------------------------------------------------------------
  src/
  ├── components/
  │   ├── layout/
  │   │   ├── AppLayout.jsx       (main shell with sidebar + topbar)
  │   │   ├── Sidebar.jsx         (collapsible role-aware nav)
  │   │   └── Topbar.jsx          (topbar with notifications, dark mode, profile)
  │   ├── ui/
  │   │   ├── AnimatedButton.jsx
  │   │   ├── DataTable.jsx
  │   │   ├── FileUpload.jsx      (drag-drop, progress, preview)
  │   │   ├── GlassCard.jsx
  │   │   ├── KPICard.jsx
  │   │   ├── LoadingSkeleton.jsx
  │   │   ├── Modal.jsx
  │   │   └── StatusBadge.jsx
  │   └── charts/
  │       ├── RolePieChart.jsx
  │       └── StatusBarChart.jsx
  ├── pages/
  │   ├── Login.jsx
  │   ├── Register.jsx
  │   ├── Dashboard.jsx
  │   ├── Submissions.jsx
  │   ├── NewSubmission.jsx
  │   ├── SubmissionDetail.jsx
  │   ├── ReviewQueue.jsx
  │   ├── Analytics.jsx
  │   ├── AdminUsers.jsx
  │   ├── AdminLogs.jsx
  │   ├── Profile.jsx
  │   ├── PublishedPapers.jsx
  │   └── NotFound.jsx
  ├── layouts/
  │   └── DashboardLayout.jsx
  ├── services/
  │   └── authService.js
  ├── context/
  │   ├── AuthContext.jsx
  │   └── ThemeContext.jsx
  ├── api/
  │   ├── axios.js                (points to mockApi in offline mode)
  │   └── mockApi.js              (full localStorage CRUD layer)
  ├── data/
  │   └── mockData.js             (seed data for demo)
  ├── utils/
  │   └── roleConfig.js           (ROLES, nav items, STATUS_CONFIG)
  ├── hooks/
  │   └── useAuth.js
  ├── App.jsx
  └── main.jsx

--------------------------------------------------------------------------------
ENTERPRISE FEATURES
--------------------------------------------------------------------------------
  - Audit Trail: every action logged with user, role, timestamp
  - Strict role-based UI rendering (components check user.role)
  - Form validation: file type, file size, required fields
  - History array on each submission tracks full lifecycle
  - Modular service layer ready for real API swap

--------------------------------------------------------------------------------
CONSTRAINTS
--------------------------------------------------------------------------------
  - No real backend (localStorage only for now)
  - Keep all modules backend-ready (API-like service calls)
  - Do not hardcode data directly into components

--------------------------------------------------------------------------------
EXPRESS BACKEND SKELETON (PLACEHOLDER)
--------------------------------------------------------------------------------
  server/
  ├── server.js
  ├── config/
  │   └── db.js
  ├── routes/
  │   ├── auth.routes.js
  │   ├── submission.routes.js
  │   ├── review.routes.js
  │   └── analytics.routes.js
  ├── controllers/
  │   ├── auth.controller.js
  │   ├── submission.controller.js
  │   ├── review.controller.js
  │   └── analytics.controller.js
  ├── middleware/
  │   └── auth.middleware.js
  ├── models/
  │   └── (MySQL/TiDB models)
  └── uploads/
      └── (file storage - to be integrated)

  Planned API Endpoints:
    POST   /api/auth/register
    POST   /api/auth/login
    GET    /api/auth/me
    POST   /api/auth/logout

    POST   /api/submissions/upload
    GET    /api/submissions
    GET    /api/submissions/:id

    GET    /api/review/queue
    POST   /api/review/action

    GET    /api/analytics/overview
    GET    /api/analytics/stats

    GET    /api/admin/users
    PATCH  /api/admin/users/:id
    GET    /api/admin/logs

--------------------------------------------------------------------------------
DEMO CREDENTIALS
--------------------------------------------------------------------------------
  HOD / Admin:
    Email:    admin@sathyabama.edu
    Password: admin123
    Role:     hod

  Faculty:
    Email:    faculty@sathyabama.edu
    Password: faculty123
    Role:     faculty

  (Register new student/faculty accounts via /register page)

--------------------------------------------------------------------------------
RUNNING THE PROJECT
--------------------------------------------------------------------------------
  Client (React):
    cd client
    npm install
    npm run dev

  Server (Express - optional):
    cd server
    npm install
    node server.js

================================================================================
  NOTE: Backend APIs and file storage will be integrated in the next phase.
================================================================================
