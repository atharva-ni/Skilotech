import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "Skilotech — Career-Focused Learning & Placement Platform",
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
          <title>Clerk Configuration Required | Skilotech</title>
        </head>
        <body style={{
          background: '#fafafa',
          color: '#171717',
          fontFamily: 'Inter, system-ui, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          margin: 0
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            borderRadius: '16px',
            padding: '40px 32px',
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🔑</div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: '12px', color: '#171717' }}>
              Clerk Configuration Required
            </h1>
            <p style={{ color: '#525252', fontSize: '0.9375rem', lineHeight: '1.6', marginBottom: '24px' }}>
              SkillBridge relies on <strong>Clerk</strong> to handle secure multi-role logins. Provide your publishable key in the <code>.env</code> file to run the app.
            </p>
            <div style={{
              background: '#f4f4f5',
              border: '1px solid #e5e5e5',
              borderRadius: '10px',
              padding: '16px 20px',
              textAlign: 'left',
              fontSize: '0.8125rem',
              fontFamily: 'Consolas, monospace',
              color: '#525252',
              marginBottom: '24px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}>
              # Add to your <strong style={{ color: '#171717' }}>.env</strong> or <strong style={{ color: '#171717' }}>.env.local</strong> file:<br/>
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...<br/>
              CLERK_SECRET_KEY=sk_test_...
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <a
                href="https://clerk.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#171717',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
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
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
