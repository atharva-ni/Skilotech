import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Skillzy — Career-Focused Learning & Placement Platform",
  description:
    "Master in-demand tech skills, practice coding with AI feedback, and land your dream job. Courses, coding labs, mock interviews, and job placement all in one platform.",
  keywords: "online learning, coding courses, job placement, career skills, tech education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isClerkConfigured = 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "pk_test_REPLACE_ME" &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("REPLACE_ME");

  if (!isClerkConfigured) {
    return (
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <title>Clerk Configuration Required | Skillzy</title>
        </head>
        <body style={{
          background: '#0a0e1a',
          color: '#f1f5f9',
          fontFamily: 'Inter, system-ui, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          margin: 0
        }}>
          <div style={{
            background: 'rgba(17, 24, 39, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '40px 32px',
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(16px)'
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔑</div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Clerk Configuration Required
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: '1.6', marginBottom: '24px' }}>
              SkillBridge relies on <strong>Clerk</strong> to handle secure multi-role logins. Provide your publishable key in the <code>.env</code> file to run the app.
            </p>
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '10px',
              padding: '16px 20px',
              textAlign: 'left',
              fontSize: '0.8125rem',
              fontFamily: 'Consolas, monospace',
              color: '#a78bfa',
              marginBottom: '24px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}>
              # Add to your <strong style={{ color: '#f1f5f9' }}>.env</strong> or <strong style={{ color: '#f1f5f9' }}>.env.local</strong> file:<br/>
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...<br/>
              CLERK_SECRET_KEY=sk_test_...
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <a
                href="https://clerk.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
                }}
              >
                Get Keys from Clerk.com →
              </a>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body>
          <AuthProvider>{children}</AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
