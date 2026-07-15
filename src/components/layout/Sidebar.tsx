'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/data/mock';
import styles from './Sidebar.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Milestone,
  Terminal,
  Briefcase,
  MessageSquare,
  FileSpreadsheet,
  Users,
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// Map roles to Lucide icons for premium aesthetics
const navConfig: Record<UserRole, (collapsed: boolean) => NavItem[]> = {
  student: () => [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Courses', href: '/dashboard/courses', icon: <BookOpen size={18} /> },
    { label: 'My Learning', href: '/dashboard/my-learning', icon: <Milestone size={18} /> },
    { label: 'Coding Lab', href: '/dashboard/coding-lab', icon: <Terminal size={18} /> },
    { label: 'Jobs', href: '/dashboard/jobs', icon: <Briefcase size={18} /> },
    { label: 'Community', href: '/dashboard/community', icon: <MessageSquare size={18} /> },
  ],
  instructor: () => [
    { label: 'Dashboard', href: '/dashboard/instructor', icon: <LayoutDashboard size={18} /> },
    { label: 'My Courses', href: '/dashboard/instructor/courses', icon: <BookOpen size={18} /> },
    { label: 'Assignments', href: '/dashboard/instructor/assignments', icon: <FileSpreadsheet size={18} /> },
    { label: 'Community', href: '/dashboard/community', icon: <MessageSquare size={18} /> },
  ],
  recruiter: () => [
    { label: 'Dashboard', href: '/dashboard/recruiter', icon: <LayoutDashboard size={18} /> },
    { label: 'Job Postings', href: '/dashboard/recruiter/jobs', icon: <FileSpreadsheet size={18} /> },
    { label: 'Applicants', href: '/dashboard/recruiter/applicants', icon: <Users size={18} /> },
  ],
  admin: () => [
    { label: 'Dashboard', href: '/dashboard/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Users', href: '/dashboard/admin/users', icon: <Users size={18} /> },
    { label: 'Courses', href: '/dashboard/admin/courses', icon: <BookOpen size={18} /> },
    { label: 'Payments', href: '/dashboard/admin/payments', icon: <CreditCard size={18} /> },
  ],
};

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED = 72;

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  if (!user) return null;

  const items = navConfig[user.role] ? navConfig[user.role](collapsed) : [];

  // Determine the correct dashboard home path based on the user's role
  const dashboardHome = user.role === 'admin' || user.role === ('super_admin' as UserRole)
    ? '/dashboard/admin'
    : user.role === 'instructor'
      ? '/dashboard/instructor'
      : user.role === 'recruiter'
        ? '/dashboard/recruiter'
        : '/dashboard';

  return (
    <motion.aside
      className={styles.sidebar}
      animate={{ width: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: '#ffffff',
        borderRight: '1px solid #e5e5e5',
        overflow: 'hidden',
      }}
    >
      {/* Brand header - logo only */}
      <div className={styles.brand} style={{
        borderBottom: '1px solid #e5e5e5',
        justifyContent: 'center',
        padding: collapsed ? '12px 0' : '16px 24px',
      }}>
        <Link href={dashboardHome} className={styles.logo} style={{
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}>
          <AnimatePresence mode="wait" initial={false}>
            {collapsed ? (
              <motion.img
                key="icon"
                src="/apple-touch-icon.png"
                alt="Skilotech"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                style={{
                  width: '36px',
                  height: '36px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : (
              <motion.img
                key="full-logo"
                src="/logo.png"
                alt="Skilotech"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  width: '180px',
                  height: '180px',
                  marginTop: '-70px',
                  marginBottom: '-70px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {items.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '0.625rem 0' : '0.625rem 0.875rem',
                margin: '4px 8px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'color 0.2s ease',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className={styles.activeBg}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'var(--radius-md)',
                    background: '#f4f4f5',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className={styles.navIcon} style={{
                marginRight: collapsed ? '0' : '12px',
                color: isActive ? 'var(--accent-primary-hover)' : 'inherit',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}>
                {item.icon}
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className={styles.navLabel}
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: isActive ? 600 : 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !collapsed && (
                <motion.span
                  className={styles.activeIndicator}
                  layoutId="sidebar-indicator"
                  style={{
                    width: '3px',
                    height: '16px',
                    background: '#171717',
                    borderRadius: 'var(--radius-full)',
                    position: 'absolute',
                    right: '12px',
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div style={{
        padding: '8px',
        display: 'flex',
        justifyContent: 'center',
        borderTop: '1px solid #e5e5e5',
      }}>
        <motion.button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          whileHover={{ scale: 1.05, background: '#f4f4f5' }}
          whileTap={{ scale: 0.95 }}
          style={{
            borderRadius: '8px',
            width: collapsed ? '36px' : '100%',
            height: '32px',
            background: '#fafafa',
            border: '1px solid #e5e5e5',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /> <span>Collapse</span></>}
        </motion.button>
      </div>

      {/* User section */}
      <div className={styles.userSection} style={{
        borderTop: '1px solid #e5e5e5',
        padding: collapsed ? '16px 0' : '16px 24px',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <motion.div
          className={styles.userAvatar}
          whileHover={{ scale: 1.05 }}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            background: '#171717',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: 600,
            flexShrink: 0,
            overflow: 'hidden'
          }}
        >
          {user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('/')) ? (
            <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user.avatar || user.name[0]
          )}
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              className={styles.userInfo}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', flexDirection: 'column', marginLeft: '12px', overflow: 'hidden', whiteSpace: 'nowrap' }}
            >
              <span className={styles.userName} style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
              <span className={styles.userRole} style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{user.role}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
