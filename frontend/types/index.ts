export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  created_by: { id: number; email: string; name: string; role: string };
  task_count: number;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'TODO' | 'DONE';

export interface Task {
  id: number;
  title: string;
  description: string;
  project: number;
  project_name: string;
  assigned_to: { id: number; email: string; name: string; role: string } | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface DailyLog {
  id: number;
  task: number;
  task_title: string;
  user: { id: number; email: string; name: string; role: string };
  note: string;
  logged_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AdminDashboard {
  role: 'admin';
  total_users: number;
  total_projects: number;
  total_tasks: number;
  users_by_role: { role: string; count: number }[];
  tasks_by_status: { status: string; count: number }[];
}

export interface ManagerDashboard {
  role: 'manager';
  total_projects: number;
  total_tasks: number;
  completed_tasks: number;
  todo_tasks: number;
}

export interface EmployeeDashboard {
  role: 'employee';
  total_assigned_tasks: number;
  completed_tasks: number;
}

export type Dashboard = AdminDashboard | ManagerDashboard | EmployeeDashboard;
