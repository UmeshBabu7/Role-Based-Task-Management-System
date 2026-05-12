'use client';


import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useNavigate, useLocation } from 'react-router';

export { ROUTES } from './routes';
export type { AppRoute } from './routes';


export function useAppRouter() {
  const nextRouter = useRouter();
  const navigate = useNavigate();

  return {
    push: (path: string) => {
      navigate(path);       
      nextRouter.push(path); 
    },
    replace: (path: string) => {
      navigate(path, { replace: true }); 
      nextRouter.replace(path);         
    },
    back: () => nextRouter.back(),
    refresh: () => nextRouter.refresh(),
  };
}

export { usePathname, useSearchParams };


export function useReactRouter() {
  try {
    const navigate = useNavigate();
    const location = useLocation();
    return { navigate, location };
  } catch {
    
    return {
      navigate: (_: string) => {},
      location: { pathname: '/', search: '', hash: '', state: null, key: 'default' },
    };
  }
}
