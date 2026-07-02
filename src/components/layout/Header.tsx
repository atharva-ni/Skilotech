'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/data/mock';
import styles from './Header.module.css';
import { UserButton } from '@clerk/nextjs';

const roleLabels: Record<UserRole | 'super_admin', { label: string; icon: string }> = {
  student: { label: 'Student', icon: '🎓' },
  instructor: { label: 'Instructor', icon: '👩‍🏫' },
  recruiter: { label: 'Recruiter', icon: '🏢' },
  admin: { label: 'Admin', icon: '⚙️' },
  super_admin: { label: 'Super Admin', icon: '👑' },
};

export default function Header() {
  const { user } = useAuth();

  if (!user) return null;

  const userRole = user.role as UserRole | 'super_admin';
  const roleInfo = roleLabels[userRole] || { label: 'Student', icon: '🎓' };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search courses, jobs, community..."
            id="global-search"
          />
        </div>
      </div>

      <div className={styles.right}>
        {/* Role Display */}
        <div className={styles.roleSwitcher} style={{ cursor: 'default' }}>
          <span>{roleInfo.icon}</span>
          <span className={styles.roleLabel}>{roleInfo.label}</span>
        </div>

        {/* Notifications */}
        <button className={styles.iconBtn} id="notifications-btn" aria-label="Notifications">
          🔔
          <span className={styles.notifBadge}>1</span>
        </button>

        {/* Clerk User Button */}
        <div style={{ marginLeft: '8px', display: 'flex', alignItems: 'center' }}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: {
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-secondary)',
                },
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
