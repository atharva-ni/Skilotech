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
  student: (c) => [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Courses', href: '/dashboard/courses', icon: <BookOpen size={18} /> },
    { label: 'My Learning', href: '/dashboard/my-learning', icon: <Milestone size={18} /> },
    { label: 'Coding Lab', href: '/dashboard/coding-lab', icon: <Terminal size={18} /> },
    { label: 'Jobs', href: '/dashboard/jobs', icon: <Briefcase size={18} /> },
    { label: 'Community', href: '/dashboard/community', icon: <MessageSquare size={18} /> },
  ],
  instructor: (c) => [
    { label: 'Dashboard', href: '/dashboard/instructor', icon: <LayoutDashboard size={18} /> },
    { label: 'My Courses', href: '/dashboard/instructor/courses', icon: <BookOpen size={18} /> },
    { label: 'Assignments', href: '/dashboard/instructor/assignments', icon: <FileSpreadsheet size={18} /> },
    { label: 'Community', href: '/dashboard/community', icon: <MessageSquare size={18} /> },
  ],
  recruiter: (c) => [
    { label: 'Dashboard', href: '/dashboard/recruiter', icon: <LayoutDashboard size={18} /> },
    { label: 'Job Postings', href: '/dashboard/recruiter/jobs', icon: <FileSpreadsheet size={18} /> },
    { label: 'Applicants', href: '/dashboard/recruiter/applicants', icon: <Users size={18} /> },
  ],
  admin: (c) => [
    { label: 'Dashboard', href: '/dashboard/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Users', href: '/dashboard/admin/users', icon: <Users size={18} /> },
    { label: 'Courses', href: '/dashboard/admin/courses', icon: <BookOpen size={18} /> },
    { label: 'Payments', href: '/dashboard/admin/payments', icon: <CreditCard size={18} /> },
  ],
};

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
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
      animate={{ width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: '#ffffff',
        borderRight: '1px solid #e5e5e5',
      }}
    >
      <div className={styles.brand} style={{ borderBottom: '1px solid #e5e5e5' }}>
        <Link href={dashboardHome} className={styles.logo}>
          <motion.span 
            className={styles.logoIcon}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            style={{
              fontWeight: 800,
              fontSize: '1.25rem'
            }}
          >
            ⚡
          </motion.span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span 
                className={styles.logoText}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.3px',
                  color: '#171717',
                }}
              >
                Skilotech
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <motion.button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          whileHover={{ scale: 1.1, background: '#f4f4f5' }}
          whileTap={{ scale: 0.95 }}
          style={{
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            background: '#fafafa',
            border: '1px solid #e5e5e5',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </motion.button>
      </div>

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
                padding: '0.625rem 0.875rem',
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
                alignItems: 'center'
              }}>
                {item.icon}
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span 
                    className={styles.navLabel}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.15 }}
                    style={{ fontSize: 'var(--font-size-sm)', fontWeight: isActive ? 600 : 500 }}
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

      <div className={styles.userSection} style={{ borderTop: '1px solid #e5e5e5' }}>
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
            fontWeight: 600
          }}
        >
          {user.avatar || user.name[0]}
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div 
              className={styles.userInfo}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', marginLeft: '12px' }}
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
