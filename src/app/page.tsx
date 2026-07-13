'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { motion } from 'framer-motion';

const features = [
  {
    icon: '📚',
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with structured, project-based courses across tech domains.',
  },
  {
    icon: '💻',
    title: 'Interactive Coding Lab',
    description: 'Practice coding in-browser with our Monaco-powered editor. Compile, run, and test instantly.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Feedback',
    description: 'Get instant optimization guidance, style tips, and performance insights on every submission.',
  },
  {
    icon: '💼',
    title: 'Job Placement',
    description: 'Apply to top companies, track applications, and get matched with roles that fit your skills.',
  },
  {
    icon: '🏆',
    title: 'Certifications',
    description: 'Earn verified certificates on course completion to showcase your skills to recruiters.',
  },
  {
    icon: '💬',
    title: 'Community',
    description: 'Join discussions, share knowledge, and collaborate with learners and mentors worldwide.',
  },
];

const stats = [
  { value: '12,500+', label: 'Active Learners' },
  { value: '150+', label: 'Courses' },
  { value: '89+', label: 'Hiring Partners' },
  { value: '4.7★', label: 'Avg Rating' },
];

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Redirect signed-in users to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  // Premium loading screen
  if (!isLoaded || isSignedIn) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#fafafa', flexDirection: 'column', gap: '20px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div className="grid-bg" />
        <div style={{
          width: '50px', height: '50px', borderRadius: '50%',
          border: '3px solid #e5e5e5',
          borderTop: '3px solid #171717',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '1px' }}>
          authenticating_user...
        </p>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 260, damping: 20 }
    }
  };

  return (
    <div className={styles.landing} style={{ position: 'relative', overflow: 'hidden', background: '#fafafa' }}>
      {/* Background patterns */}
      <div className="grid-bg" />
      <div style={{
        position: 'absolute', top: '10%', left: '15%', width: '40vw', height: '40vh',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.025) 0%, transparent 60%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0
      }} />
      <div style={{
        position: 'absolute', top: '50%', right: '10%', width: '35vw', height: '35vh',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.02) 0%, transparent 65%)',
        filter: 'blur(90px)', pointerEvents: 'none', zIndex: 0
      }} />

      {/* Navigation */}
      <nav className={styles.nav} style={{ borderBottom: '1px solid #e5e5e5', zIndex: 10, background: '#ffffff' }}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.brand}>
            <span className={styles.brandIcon} style={{ fontWeight: 800 }}>⚡</span>
            <span className={styles.brandText} style={{ fontWeight: 800, color: '#171717' }}>Skilotech</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#stats" className={styles.navLink}>Stats</a>
            <Link href="/sign-in" className={styles.navLink}>Sign In</Link>
            <Link href="/sign-up" className={`btn btn-primary ${styles.ctaBtn}`} style={{ borderRadius: 'var(--radius-md)' }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero} style={{ zIndex: 1, position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} style={{ opacity: 0.04, background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }} />
          <div className={styles.heroOrb2} style={{ opacity: 0.03, background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        </div>
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div 
            className={styles.heroBadge}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: '#f4f4f5',
              border: '1px solid #e5e5e5',
              borderRadius: 'var(--radius-full)',
              color: '#171717',
              padding: '6px 14px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            🚀 Your Career Starts Here
          </motion.div>
          <h1 className={styles.heroTitle} style={{ fontSize: 'var(--font-size-hero)', fontWeight: 900, letterSpacing: '-1.5px', marginTop: '16px', lineHeight: 1.15 }}>
            Learn. Code.{' '}
            <span className={styles.heroGradient} style={{ color: '#171717' }}>Get Hired.</span>
          </h1>
          <p className={styles.heroSubtitle} style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', margin: '20px auto 32px auto', maxWidth: '640px', lineHeight: 1.6 }}>
            Master in-demand tech skills with expert-led courses, practice coding with AI-powered feedback,
            and connect directly with top employers. All in one platform.
          </p>
          <div className={styles.heroActions} style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link href="/sign-up" className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--radius-md)' }}>
              Start Learning Free →
            </Link>
            <Link href="#features" className="btn btn-secondary btn-lg" style={{ borderRadius: 'var(--radius-md)' }}>
              Explore Features
            </Link>
          </div>
          <div className={styles.heroTrust} style={{ marginTop: '48px' }}>
            <span className={styles.trustAvatars} style={{ letterSpacing: '2px' }}>🎓👨‍💻👩‍🔬🛠️👩‍🏫</span>
            <span className={styles.trustText} style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginLeft: '12px', fontWeight: 500 }}>Trusted by 12,500+ learners across India</span>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className={styles.features} id="features" style={{ zIndex: 1, position: 'relative', padding: '100px 0' }}>
        <div className={styles.sectionInner}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <h2 className={styles.sectionTitle} style={{ fontSize: '2rem', fontWeight: 800 }}>
              Everything You Need to{' '}
              <span className={styles.heroGradient} style={{ color: '#171717' }}>Succeed</span>
            </h2>
            <p className={styles.sectionSubtitle} style={{ color: 'var(--text-secondary)', marginTop: '12px', fontSize: '0.95rem' }}>
              From learning to placement — Skilotech has got you covered with a complete career toolkit.
            </p>
          </motion.div>

          <motion.div 
            className={styles.featuresGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className={styles.featureCard}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-premium)',
                  transition: 'border-color 0.25s ease'
                }}
              >
                <div className={styles.featureIcon} style={{ fontSize: '2rem', marginBottom: '16px' }}>{feature.icon}</div>
                <h3 className={styles.featureTitle} style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p className={styles.featureDesc} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '8px', lineHeight: 1.5 }}>{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection} id="stats" style={{ zIndex: 1, position: 'relative', padding: '60px 0', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5', background: '#f4f4f5' }}>
        <div className={styles.sectionInner}>
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <motion.div 
                key={stat.label} 
                className={styles.statItem}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: 'spring' }}
              >
                <span className={styles.statValue} style={{ color: '#171717', fontWeight: 900, fontSize: '2.5rem' }}>{stat.value}</span>
                <span className={styles.statLabel} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection} style={{ zIndex: 1, position: 'relative', padding: '100px 0' }}>
        <div className={styles.sectionInner}>
          <motion.div 
            className={styles.ctaCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              background: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: 'var(--radius-xl)',
              padding: '60px 40px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h2 className={styles.ctaTitle} style={{ fontSize: '2.25rem', fontWeight: 800 }}>Ready to Transform Your Career?</h2>
            <p className={styles.ctaText} style={{ color: 'var(--text-secondary)', margin: '16px auto 32px auto', maxWidth: '520px', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Join thousands of learners who are building the skills employers want. Start with free courses today.
            </p>
            <Link href="/sign-up" className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--radius-md)' }}>
              Join Skilotech Now →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer} style={{ borderTop: '1px solid #e5e5e5', padding: '40px 0', background: '#ffffff' }}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.brandIcon} style={{ fontWeight: 800 }}>⚡</span>
            <span className={styles.brandText} style={{ fontWeight: 800, color: '#171717' }}>Skilotech</span>
          </div>
          <p className={styles.footerText} style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
            © 2026 Skilotech. All rights reserved. Built for learners, by learners.
          </p>
        </div>
      </footer>
    </div>
  );
}
