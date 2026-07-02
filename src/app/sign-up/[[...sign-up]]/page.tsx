'use client';

import { SignUp } from '@clerk/nextjs';
import styles from '@/app/page.module.css';

export default function SignUpPage() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.bgOrbs}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>Skillzy</span>
        </div>
        <SignUp
          forceRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: '#8b5cf6',
              colorBackground: '#111827',
            },
            elements: {
              card: {
                background: 'rgba(17, 24, 39, 0.7)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              },
              headerTitle: {
                color: '#f3f4f6',
                fontWeight: '800',
              },
              socialButtonsBlockButton: {
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f3f4f6',
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                },
              },
              socialButtonsBlockButtonText: {
                color: '#f3f4f6',
              },
              formButtonPrimary: {
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 100%)',
                },
              },
              footerActionLink: {
                color: '#a78bfa',
                '&:hover': {
                  color: '#818cf8',
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
