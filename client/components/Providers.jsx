'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/lib/auth-context';
import { ToastProvider } from './Toast';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
