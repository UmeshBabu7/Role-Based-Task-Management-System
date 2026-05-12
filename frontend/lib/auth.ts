'use client';
import { User } from '@/types';


const USER_COOKIE = 'tm_user';

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${USER_COOKIE}=`));
    if (!match) return null;
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
  } catch {
    return null;
  }
};

export const setAuth = (_access: string, _refresh: string, user: User) => {
 
  document.cookie = `${USER_COOKIE}=${encodeURIComponent(JSON.stringify(user))}; path=/; SameSite=Lax; max-age=${8 * 60 * 60}`;
};

export const clearAuth = () => {
  document.cookie = `${USER_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  
};

export const isAuthenticated = (): boolean => !!getUser();
