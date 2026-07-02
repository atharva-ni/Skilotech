'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isLoaded: clerkLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Wait for both Clerk and our AuthContext to finish loading
  React.useEffect(() => {
    if (clerkLoaded && !isSignedIn) {
      // Not signed in with Clerk at all → send to Clerk sign-in
      router.replace('/sign-in');
    }
  }, [clerkLoaded, isSignedIn, router]);

  // Show loading spinner while checking auth
  if (!clerkLoaded || isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-primary, #0a0e1a)',
        flexDirection: 'column', gap: '16px'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTop: '3px solid #6366f1',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.875rem' }}>
          Loading dashboard...
        </p>
      </div>
    );
  }

  // If Clerk says not signed in, render nothing (redirect is happening)
  if (!isSignedIn) {
    return null;
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <Header />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
