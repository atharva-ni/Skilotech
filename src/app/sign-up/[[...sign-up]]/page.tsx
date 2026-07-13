'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="auth-page">
      {/* Animated gradient orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      {/* Dot grid pattern */}
      <div className="auth-grid" />

      <div className="auth-container">
        {/* Branding */}
        <div className="auth-brand">
          <div className="auth-brand-icon">⚡</div>
          <span className="auth-brand-text">Skilotech</span>
        </div>

        <p className="auth-tagline">Create your account and start learning today.</p>

        {/* Clerk Sign-Up Card */}
        <SignUp
          forceRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: '#171717',
              colorBackground: '#ffffff',
              borderRadius: '12px',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            },
            elements: {
              rootBox: {
                width: '100%',
                maxWidth: '400px',
              },
              cardBox: {
                boxShadow: 'none',
                width: '100%',
              },
              card: {
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                borderRadius: '16px',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
                padding: '28px 24px',
              },
              headerTitle: {
                color: '#171717',
                fontWeight: '800',
                fontSize: '1.375rem',
                letterSpacing: '-0.02em',
              },
              headerSubtitle: {
                color: '#737373',
                fontSize: '0.875rem',
              },
              socialButtonsBlockButton: {
                background: '#fafafa',
                border: '1px solid #e5e5e5',
                color: '#171717',
                borderRadius: '10px',
                fontWeight: '500',
                fontSize: '0.875rem',
                transition: 'all 150ms ease',
                '&:hover': {
                  background: '#f0f0f0',
                  borderColor: '#d4d4d4',
                },
              },
              socialButtonsBlockButtonText: {
                color: '#171717',
                fontWeight: '500',
              },
              dividerLine: {
                background: '#e5e5e5',
              },
              dividerText: {
                color: '#a3a3a3',
                fontSize: '0.75rem',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              },
              formFieldLabel: {
                color: '#171717',
                fontWeight: '600',
                fontSize: '0.8125rem',
              },
              formFieldInput: {
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                borderRadius: '10px',
                color: '#171717',
                fontSize: '0.875rem',
                transition: 'all 150ms ease',
                '&:focus': {
                  borderColor: '#171717',
                  boxShadow: '0 0 0 3px rgba(23, 23, 23, 0.08)',
                },
                '&::placeholder': {
                  color: '#a3a3a3',
                },
              },
              formButtonPrimary: {
                background: '#171717',
                color: '#ffffff',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '0.875rem',
                height: '42px',
                transition: 'all 150ms ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
                '&:hover': {
                  background: '#0a0a0a',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
              },
              footerAction: {
                '& a': {
                  color: '#171717',
                  fontWeight: '600',
                  '&:hover': {
                    color: '#525252',
                  },
                },
              },
              footerActionLink: {
                color: '#171717',
                fontWeight: '600',
                '&:hover': {
                  color: '#525252',
                },
              },
              footer: {
                '& + div': {
                  background: 'transparent',
                },
              },
              identityPreview: {
                background: '#fafafa',
                border: '1px solid #e5e5e5',
                borderRadius: '10px',
              },
              identityPreviewText: {
                color: '#171717',
              },
              identityPreviewEditButton: {
                color: '#525252',
              },
              formFieldAction: {
                color: '#525252',
                fontWeight: '500',
                '&:hover': {
                  color: '#171717',
                },
              },
              otpCodeFieldInput: {
                border: '1px solid #e5e5e5',
                borderRadius: '10px',
                '&:focus': {
                  borderColor: '#171717',
                  boxShadow: '0 0 0 3px rgba(23, 23, 23, 0.08)',
                },
              },
              alert: {
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                color: '#991b1b',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
