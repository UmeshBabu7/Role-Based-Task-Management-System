# Role-Based Task Management System

A full-stack task management application with strict role-based access control, built with **Django REST Framework** on the backend and **Next.js** on the frontend.

---

## Overview

This system allows teams to manage projects, tasks, and daily work logs across three distinct roles — Admin, Manager, and Employee. Each role sees a different dashboard and has different permissions over what they can create, view, or update.

---

## Project Structure

```
Role-Based-Task-Management-System/
├── backend/
│   ├── users/        # Custom user model, auth, permissions
│   ├── projects/     # Project management
│   ├── tasks/        # Tasks & daily logs
│   ├── dashboard/    # Role-specific dashboard data
│   └── config/       # Django settings, JWT auth, pagination, URLs
│
└── frontend/
    ├── app/          # Next.js pages (App Router)
    │   ├── login/
    │   ├── dashboard/
    │   ├── projects/
    │   ├── tasks/
    │   └── daily-logs/
    ├── components/   # UI components & layout
    ├── lib/          # API client, auth, route guards
    └── types/        # TypeScript type definitions
```

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Django | 6.0.5 | Web framework |
| Django REST Framework | 3.17.1 | REST API |
| SimpleJWT | 5.5.1 | JWT Authentication (via HttpOnly cookies) |
| django-cors-headers | 4.9.0 | CORS handling |
| python-decouple | 3.8 | Environment variables |
| dj-database-url | 3.1.2 | Database URL config |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2.4 | React framework |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type safety |
| TanStack Query | ^5 | Server state management |
| React Hook Form + Zod | latest | Form validation |
| Tailwind CSS | ^4 | Styling |
| Axios | ^1 | HTTP client with auto token refresh |
| React Router | ^7 | Client-side routing |

---

## Roles & Permissions

This system has three roles with clearly separated access:

| Feature | Admin | Manager | Employee |
|---|:---:|:---:|:---:|
| View dashboard | ✅ | ✅ | ✅ |
| Manage users | ✅ | ❌ | ❌ |
| Create projects | ❌ | ✅ | ❌ |
| View projects | ✅ | ✅ (own) | ❌ |
| Create tasks | ❌ | ✅ | ❌ |
| View tasks | ✅ (all) | ✅ (own projects) | ✅ (assigned only) |
| Update task (assign/status) | ❌ | ✅ | ✅ (status only) |
| Daily logs | ❌ | ✅ | ✅ |

### Dashboard by Role
- **Admin** — Total users, projects, tasks; breakdown by role and task status
- **Manager** — Their projects, total/completed/todo tasks
- **Employee** — Their assigned tasks and how many are completed

---

## Features

### Authentication
- Email + password login
- JWT tokens stored in **HttpOnly cookies** (`tm_access`, `tm_refresh`) — never exposed to JavaScript
- Access token valid for **8 hours**, refresh token for **1 day**
- Automatic silent token refresh via Axios interceptor on 401 responses
- Logout clears both cookies server-side

### Users
- 3 roles: `admin`, `manager`, `employee`
- Admin can create and list all users
- Custom `UserManager` for email-based authentication (no username required)

### Projects
- Managers create projects; projects are owned by their creator
- Admins can view all projects; Managers see only theirs
- Each project stores task count

### Tasks
- Belong to a project, optionally assigned to an employee
- Statuses: `TODO` → `DONE`
- Managers can assign tasks and change any field; Employees can only update status
- Admins have read-only access (cannot update tasks)
- Paginated list (5 per page by default)

### 📝 Daily Logs
- Employees and Managers can log notes against any of their tasks
- Each log records the task, user, note text, and timestamp
- Paginated and filterable by task

---

## Getting Started

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# SECRET_KEY=your-secret-key
# DEBUG=True
# ALLOWED_HOSTS=127.0.0.1,localhost
# DATABASE_URL=sqlite:///db.sqlite3

# Run migrations
python manage.py migrate

# Create an admin user
python manage.py createsuperuser

# Start the server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Create .env.local (see .env.local.example)
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Start development server
pnpm dev
```

Frontend: `http://localhost:3000`  
Backend API: `http://localhost:8000/api/v1`

---

## API Endpoints

### Authentication
```
POST   /api/v1/login/           → Login (sets HttpOnly JWT cookies)
POST   /api/v1/logout/          → Logout (clears cookies)
POST   /api/v1/token/refresh/   → Refresh access token from cookie
GET    /api/v1/me/              → Get current user info
```

### Users (Admin only)
```
GET    /api/v1/users/           → List all users (paginated)
POST   /api/v1/users/           → Create a new user
GET    /api/v1/employees/       → List employees (for task assignment)
```

### Projects (Admin + Manager)
```
GET    /api/v1/projects/        → List projects
POST   /api/v1/projects/        → Create project (Manager only)
GET    /api/v1/projects/<id>/   → Get project detail
```

### Tasks
```
GET    /api/v1/tasks/           → List tasks (filtered by role)
POST   /api/v1/tasks/           → Create task (Manager only)
GET    /api/v1/tasks/<id>/      → Get task detail
PATCH  /api/v1/tasks/<id>/      → Update task (role-scoped fields)
```

### Daily Logs
```
GET    /api/v1/daily-logs/      → List daily logs
POST   /api/v1/daily-logs/      → Create a daily log
```

### Dashboard
```
GET    /api/v1/dashboard/       → Role-specific dashboard data
```

---

## Data Model Overview

```
User (admin | manager | employee)
  │
  ├── Project (created_by → Manager)
  │     └── Task (assigned_to → Employee)
  │           └── DailyLog (user → Manager | Employee)
  │
  └── DailyLog
```

---

## Frontend Pages & Access

| Page | Path | Roles Allowed |
|---|---|---|
| Login | `/login` | Public |
| Dashboard | `/dashboard` | Admin, Manager, Employee |
| Projects | `/projects` | Admin, Manager |
| Tasks | `/tasks` | Admin, Manager, Employee |
| Daily Logs | `/daily-logs` | Manager, Employee |
| Users | `/users` | Admin |

Route access is enforced client-side via `ProtectedRoute` component and `canAccessRoute()` guard, and server-side via DRF permission classes.

---

## Notes

- JWT tokens live in **HttpOnly cookies**, making them inaccessible to XSS attacks
- The Axios client automatically retries failed requests after a silent token refresh, queuing concurrent requests during the refresh to avoid race conditions
- Task update serializers are role-aware: employees get `TaskStatusUpdateSerializer`, managers get `TaskManagerUpdateSerializer`
- Dashboard responses are dynamically shaped based on the authenticated user's role
- Pagination defaults to **5 items per page**, configurable via `page_size` query param
