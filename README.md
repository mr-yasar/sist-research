<![CDATA[# 🎓 Faculty Activity & Research Tracker

### Sathyabama Institute of Science and Technology

> A production-grade academic SaaS platform for managing faculty research, student submissions, and multi-level approval workflows aligned with **NAAC/NBA accreditation standards**.

---

## ✨ Overview

**SIST Research Platform** is a full-stack web application that digitizes the research submission and approval lifecycle within Sathyabama Institute. It provides dedicated dashboards for four distinct roles — **Student, Faculty, HOD, and Admin** — enabling a structured, transparent, and auditable document review pipeline.

### 🔑 Key Highlights

- 🔄 **Multi-Level Approval Workflow**: Student → Faculty Review → HOD Approval → Final Decision
- 📊 **Real-Time Analytics**: Interactive charts (Pie, Bar) for submission tracking and institutional insights
- 🔐 **Role-Based Access Control (RBAC)**: Four distinct user roles with scoped dashboards and permissions
- 📂 **Drag-and-Drop File Upload**: Supports PDF, DOCX, images with progress simulation and preview
- 🛡️ **Enterprise Audit Trail**: Every action logged with user, role, timestamp, and details
- 🔔 **In-App Notifications**: Real-time status change alerts per user
- 📚 **Resource Sharing**: Faculty/HOD can publish learning materials for students
- 🌙 **Dark Mode**: Premium dark glassmorphism UI with smooth transitions

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js (Vite), Functional Components + Hooks |
| **Styling** | Tailwind CSS, Custom Glassmorphism Design System |
| **Animations** | Framer Motion |
| **Charts** | Recharts (Pie, Bar, Responsive) |
| **Icons** | React Icons (Feather) |
| **Routing** | React Router DOM v7 |
| **Backend** | Supabase (Auth, PostgreSQL, Storage) |
| **State** | React Context API (Auth, Theme, Notifications) |
| **Deployment** | Netlify (Frontend) |

---

## 👥 User Roles & Features

### 👨‍🎓 Student
- Upload research papers, project reports, and internship documents
- Track submission status through the approval pipeline
- View comments and feedback from faculty/HOD
- Access learning resources published by faculty
- View full submission history with timeline

### 👩‍🏫 Faculty
- Review student submissions in the approval queue
- Approve, reject, or request revision with comments
- Upload and share learning resources with students
- Submit own research papers
- Delete uploaded resources

### 🏛️ HOD (Head of Department)
- Final approval authority after faculty review
- View analytics dashboard with submission statistics (Pie + Bar charts)
- Monthly submission trend analysis
- Manage shared learning resources
- Review and comment on submissions

### ⚙️ Admin
- System-wide statistics and KPI cards
- User management overview
- Full audit log viewer (action, user, role, timestamp, details)
- CSV report export functionality
- System health monitoring

---

## 📋 Approval Pipeline

```
┌──────────┐    ┌────────────────┐    ┌──────────────┐    ┌──────────┐
│ Student  │───▶│ Faculty Review │───▶│ HOD Approval │───▶│ Approved │
│ Submits  │    │                │    │              │    │          │
└──────────┘    └───────┬────────┘    └──────┬───────┘    └──────────┘
                        │                     │
                        ▼                     ▼
                   ┌──────────┐          ┌──────────┐
                   │ Rejected │          │ Rejected │
                   └──────────┘          └──────────┘
```

Each status change is:
- ✅ Saved to the database with full history
- 📝 Logged in the audit trail
- 🔔 Notified to the student
- 💬 Optionally accompanied by reviewer comments

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── FileUpload.jsx          # Drag-drop file upload with preview
│   ├── Navbar.jsx              # Top navigation with theme toggle
│   ├── NotificationBell.jsx    # Notification dropdown
│   ├── ProgressBar.jsx         # Animated progress bar
│   ├── ProtectedRoute.jsx      # Role-based route guard
│   ├── Sidebar.jsx             # Collapsible navigation sidebar
│   ├── StatusBadge.jsx         # Color-coded status indicators
│   └── Timeline.jsx            # Submission approval timeline
├── context/
│   ├── AuthContext.jsx          # Authentication state management
│   ├── NotificationContext.jsx  # Notification state management
│   └── ThemeContext.jsx         # Dark/light mode state
├── data/
│   └── mockData.js             # Seed data (users, submissions, types)
├── layouts/
│   └── DashboardLayout.jsx     # Main app shell (sidebar + navbar + outlet)
├── lib/
│   └── supabaseClient.js       # Supabase connection config
├── pages/
│   ├── Login.jsx               # Authentication page with role selector
│   ├── SubmissionDetail.jsx    # Detailed submission view + actions
│   ├── admin/
│   │   └── AdminDashboard.jsx  # System admin panel
│   ├── faculty/
│   │   └── FacultyDashboard.jsx # Faculty review & resource management
│   ├── hod/
│   │   └── HodDashboard.jsx    # HOD approval & analytics dashboard
│   └── student/
│       └── StudentDashboard.jsx # Student upload & tracking dashboard
├── services/
│   ├── auditService.js         # Audit trail logging
│   ├── authService.js          # Supabase auth operations
│   ├── notificationService.js  # In-app notification management
│   ├── resourceService.js      # Learning resource CRUD
│   └── submissionService.js    # Submission CRUD + workflow logic
├── utils/
│   └── helpers.js              # Formatting utilities (date, file size, export)
├── App.jsx                     # Root component with routing
├── index.css                   # Global styles + Tailwind + glassmorphism
└── main.jsx                    # React DOM entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mr-yasar/sist-research.git
cd sist-research

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Student | student@sist.ac.in | password |
| Faculty | faculty@sist.ac.in | password |
| HOD | hod@sist.ac.in | password |
| Admin | admin@sist.ac.in | password |

---

## 🎨 UI Design

The application features a **premium dark glassmorphism** design system with:

- 🌑 Deep dark backgrounds with subtle transparency layers
- ✨ Glass-effect cards with `backdrop-filter: blur()`
- 🎨 Indigo/Violet primary color palette
- ⚡ Smooth Framer Motion page transitions and micro-animations
- 📱 Fully responsive across desktop, tablet, and mobile
- 🏷️ Color-coded status badges for instant visual recognition

---

## 📊 Analytics & Reporting

- **Pie Chart**: Submission status distribution (Submitted, In Review, Approved, Rejected)
- **Bar Chart**: Monthly submission trends
- **KPI Cards**: Total submissions, approval rates, active users
- **CSV Export**: Download submission data as CSV reports (Admin)

---

## 🛡️ Enterprise Features

| Feature | Description |
|---------|-------------|
| **Audit Trail** | Every create, update, and status change logged with user, role, and timestamp |
| **RBAC** | Strict role-based routing and UI rendering |
| **File Validation** | Type and size checks before upload |
| **Comment System** | Threaded comments with role badges on each submission |
| **Notification System** | Per-user notification queue with read/unread state |
| **Resource Library** | Faculty/HOD can publish and manage learning materials |

---

## 🗺️ Roadmap

- [ ] Real-time collaborative comments
- [ ] Email notifications via Supabase Edge Functions
- [ ] PDF report generation for NAAC/NBA compliance
- [ ] Student profile with publication portfolio
- [ ] Department-level analytics breakdown
- [ ] Mobile PWA support

---

## 📄 License

This project is developed for **Sathyabama Institute of Science and Technology** as an academic research management tool.

---

> **Note**: Backend APIs and file storage are powered by Supabase. The service layer is designed to be swappable — backend can be migrated to a custom Express/Node.js API without frontend changes.

---

Built with ❤️ for Sathyabama Institute of Science and Technology
]]>
