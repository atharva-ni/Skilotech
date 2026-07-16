'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './DashboardLayout.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const { isLoaded: clerkLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isCodingLab = pathname === '/dashboard/coding-lab';

  // Wait for both Clerk and our AuthContext to finish loading
  React.useEffect(() => {
    if (clerkLoaded && !isSignedIn) {
      // Not signed in with Clerk at all → send to Clerk sign-in
      router.replace('/sign-in');
    }
  }, [clerkLoaded, isSignedIn, router]);

  // Show premium loading state while checking auth
  if (!clerkLoaded || isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-primary, #05070f)',
        flexDirection: 'column', gap: '24px',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Ambient background grid inside loader */}
        <div className="grid-bg" />
        <div style={{
          position: 'fixed', top: '30%', left: '40%', width: '30vw', height: '30vh',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          filter: 'blur(50px)', pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', width: '80px', height: '80px' }}>
          {/* Concentric glowing rings */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2px solid rgba(99, 102, 241, 0.05)',
            borderTop: '2px solid var(--accent-primary)',
            animation: 'spin 1s cubic-bezier(0.5, 0.2, 0.3, 1) infinite'
          }} />
          <div style={{
            position: 'absolute', inset: '10px', borderRadius: '50%',
            border: '2px solid rgba(139, 92, 246, 0.05)',
            borderBottom: '2px solid var(--accent-secondary)',
            animation: 'spin 0.75s cubic-bezier(0.5, 0.2, 0.3, 1) infinite reverse'
          }} />
          <div style={{
            position: 'absolute', inset: '20px', borderRadius: '50%',
            border: '2px solid rgba(217, 70, 239, 0.05)',
            borderLeft: '2px solid var(--accent-tertiary)',
            animation: 'spin 1.5s linear infinite'
          }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <p style={{
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
            letterSpacing: '2px',
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
          }}>
            initializing_dashboard...
          </p>
          <p style={{
            color: 'var(--text-tertiary)',
            fontSize: '0.75rem',
            fontFamily: 'monospace'
          }}>
            compiling assets & security handshake
          </p>
        </div>
      </div>
    );
  }

  // If Clerk says not signed in, render nothing (redirect is happening)
  if (!isSignedIn) {
    return null;
  }

  return (
    <div className={styles.layout}>
      {/* Background patterns */}
      <div className="grid-bg" />
      {!isCodingLab && <Sidebar />}
      {!isCodingLab && <Header />}
      <main className={`${styles.main} ${isCodingLab ? styles.codingLabMain : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
