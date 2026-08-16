'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { FullScreenLoader } from '@/components/Loader';

export default function Home() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'guest') router.replace('/login');
    if (status === 'authed') router.replace('/dashboard');
  }, [status, router]);

  return <FullScreenLoader />;
}
