import { UserRole } from '@/types';
import { ROUTES } from '@/lib/routes';


export const routePermissions: Record<string, UserRole[]> = {
  [ROUTES.DASHBOARD]: ['admin', 'manager', 'employee'],
  [ROUTES.PROJECTS]: ['admin', 'manager'],
  [ROUTES.TASKS]: ['admin', 'manager', 'employee'],
  [ROUTES.USERS]: ['admin'],
  [ROUTES.DAILY_LOGS]: ['manager', 'employee'],
};

export function canAccessRoute(pathname: string, role: UserRole): boolean {
  const matchedRoute = Object.keys(routePermissions).find(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  if (!matchedRoute) return true;
  return routePermissions[matchedRoute].includes(role);
}
