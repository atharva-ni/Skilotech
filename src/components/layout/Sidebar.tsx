'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/data/mock';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navConfig: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Courses', href: '/dashboard/courses', icon: '📚' },
    { label: 'My Learning', href: '/dashboard/my-learning', icon: '🎯' },
    { label: 'Coding Lab', href: '/dashboard/coding-lab', icon: '💻' },
    { label: 'Jobs', href: '/dashboard/jobs', icon: '💼' },
    { label: 'Community', href: '/dashboard/community', icon: '💬' },
  ],
  instructor: [
    { label: 'Dashboard', href: '/dashboard/instructor', icon: '📊' },
    { label: 'My Courses', href: '/dashboard/instructor/courses', icon: '📚' },
    { label: 'Assignments', href: '/dashboard/instructor/assignments', icon: '📝' },
    { label: 'Community', href: '/dashboard/community', icon: '💬' },
  ],
  recruiter: [
    { label: 'Dashboard', href: '/dashboard/recruiter', icon: '📊' },
    { label: 'Job Postings', href: '/dashboard/recruiter/jobs', icon: '📋' },
    { label: 'Applicants', href: '/dashboard/recruiter/applicants', icon: '👥' },
  ],
  admin: [
    { label: 'Dashboard', href: '/dashboard/admin', icon: '📊' },
    { label: 'Users', href: '/dashboard/admin/users', icon: '👥' },
    { label: 'Courses', href: '/dashboard/admin/courses', icon: '📚' },
    { label: 'Payments', href: '/dashboard/admin/payments', icon: '💳' },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  if (!user) return null;

  const items = navConfig[user.role] || [];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.brand}>
        <Link href="/dashboard" className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          {!collapsed && <span className={styles.logoText}>Skillzy</span>}
        </Link>
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
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
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              {isActive && <span className={styles.activeIndicator} />}
            </Link>
          );
        })}
      </nav>

      <div className={styles.userSection}>
        <div className={styles.userAvatar}>{user.avatar}</div>
        {!collapsed && (
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name}</span>
            <span className={styles.userRole}>{user.role}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
