'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export { ROUTES } from './routes';
export type { AppRoute } from './routes';

export function useAppRouter() {
  const router = useRouter();

  return {
    push: (path: string) => router.push(path),
    replace: (path: string) => router.replace(path),
    back: () => router.back(),
    refresh: () => router.refresh(),
  };
}

export { usePathname, useSearchParams };
