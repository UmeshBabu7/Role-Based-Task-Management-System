'use client';
import { useEffect } from 'react';
import { useAppRouter, ROUTES } from '@/lib/router';
import { isAuthenticated } from '@/lib/auth';

export default function Home() {
  const router = useAppRouter();
  useEffect(() => {
    router.replace(isAuthenticated() ? ROUTES.DASHBOARD : ROUTES.LOGIN);
  }, [router]);
  return null;
}
