

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  TASKS: '/tasks',
  USERS: '/users',
  DAILY_LOGS: '/daily-logs',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
