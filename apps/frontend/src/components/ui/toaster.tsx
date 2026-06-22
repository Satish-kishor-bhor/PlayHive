'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="top-right"
      toastOptions={{
        style: {
          background: '#1A1A28',
          border: '1px solid #2A2A3A',
          color: '#ffffff',
        },
      }}
    />
  );
}
