'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/data/mock';
import styles from './Header.module.css';
import { UserButton } from '@clerk/nextjs';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const roleLabels: Record<UserRole | 'super_admin', { label: string; icon: string }> = {
  student: { label: 'Student', icon: '🎓' },
  instructor: { label: 'Instructor', icon: '👩‍🏫' },
  recruiter: { label: 'Recruiter', icon: '🏢' },
  admin: { label: 'Admin', icon: '⚙️' },
  super_admin: { label: 'Super Admin', icon: '👑' },
};

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'achievement' | 'community' | 'job';
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function Header() {
  const { user } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [allSearchableItems, setAllSearchableItems] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);

  // Click Outside Listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cmd/Ctrl + K Keyboard Shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
          searchInput.focus();
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load read notification IDs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('read_notifications');
    if (saved) {
      try {
        setReadNotifIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Populate searchable items and fetch dynamic community notifications on mount
  useEffect(() => {
    if (!user) return;
    
    async function fetchSearchItems() {
      const items: any[] = [
        { type: 'navigation', title: 'Dashboard', subtitle: 'Main overview & progress tracker', url: '/dashboard' },
        { type: 'navigation', title: 'Courses Directory', subtitle: 'Browse available courses', url: '/dashboard/courses' },
        { type: 'navigation', title: 'Coding Lab', subtitle: 'Practice coding problems & challenges', url: '/dashboard/coding-lab' },
        { type: 'navigation', title: 'Job Openings', subtitle: 'Browse software developer jobs', url: '/dashboard/jobs' },
        { type: 'navigation', title: 'Community Hub', subtitle: 'Discuss with peer students', url: '/dashboard/community' },
        { type: 'navigation', title: 'My Learning & Stats', subtitle: 'View course progress & certificates', url: '/dashboard/my-learning' },
      ];

      try {
        const coursesRes = await fetch('/api/courses?t=' + Date.now());
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          if (coursesData.courses) {
            coursesData.courses.forEach((c: any) => {
              items.push({
                type: 'course',
                title: c.title,
                subtitle: `Course • ${c.difficulty || 'All levels'}`,
                url: `/dashboard/courses/${c.id}`,
              });
            });
          }
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const jobsRes = await fetch('/api/jobs?t=' + Date.now());
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          const activeJobs = jobsData.data || jobsData || [];
          activeJobs.forEach((j: any) => {
            items.push({
              type: 'job',
              title: j.title,
              subtitle: `Job • ${j.company} • ${j.location}`,
              url: '/dashboard/jobs',
            });
          });
        }
      } catch (e) {
        console.error(e);
      }

      setAllSearchableItems(items);
    }

    async function loadNotifications() {
      const baseNotifs: NotificationItem[] = [
        {
          id: 'ach-1',
          title: '🏆 XP Earned',
          description: 'You earned +100 XP for solving Hello World!',
          time: '1h ago',
          type: 'achievement',
        },
        {
          id: 'job-1',
          title: '💼 Job Application',
          description: 'Stripe viewed your Developer application',
          time: '1d ago',
          type: 'job',
        },
      ];

      try {
        const commRes = await fetch(`/api/community/posts?t=${Date.now()}`, { cache: 'no-store' });
        if (commRes.ok) {
          const posts = await commRes.json();
          if (Array.isArray(posts)) {
            // Take the 2 latest posts
            const recentPosts = posts.slice(0, 2);
            const commNotifs = recentPosts.map((post: any) => {
              const authorName = post.author
                ? `${post.author.firstName ?? ''} ${post.author.lastName ?? ''}`.trim() || post.author.username || 'Student'
                : 'Student';
              
              const lines = post.content.split('\n');
              const title = lines[0] || '';
              const imageRegex = /!\[.*?\]\((data:image\/.*?)\)/;
              const hasImage = imageRegex.test(post.content);
              const cleanTitle = title.replace(imageRegex, '').trim();
              const displayedTitle = cleanTitle.length > 35 ? `${cleanTitle.slice(0, 35)}...` : cleanTitle;
              const suffix = hasImage ? ' 📷' : '';

              return {
                id: `comm-${post.id}`,
                title: '💬 New Discussion',
                description: `${authorName}: "${displayedTitle}"${suffix}`,
                time: formatRelativeTime(post.createdAt),
                type: 'community' as const,
              };
            });
            setNotifications([...commNotifs, ...baseNotifs]);
          } else {
            setNotifications(baseNotifs);
          }
        } else {
          setNotifications(baseNotifs);
        }
      } catch (err) {
        console.error(err);
        setNotifications(baseNotifs);
      }
    }

    fetchSearchItems();
    loadNotifications();
  }, [user]);

  // Search filter query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(allSearchableItems.slice(0, 10));
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = allSearchableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query)
    );
    setSearchResults(filtered.slice(0, 10));
  }, [searchQuery, allSearchableItems]);

  const markAsRead = (id: string) => {
    if (readNotifIds.includes(id)) return;
    const updated = [...readNotifIds, id];
    setReadNotifIds(updated);
    localStorage.setItem('read_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifIds(allIds);
    localStorage.setItem('read_notifications', JSON.stringify(allIds));
  };

  if (!user) return null;

  const userRole = user.role as UserRole | 'super_admin';
  const roleInfo = roleLabels[userRole] || { label: 'Student', icon: '🎓' };
  const hasUnread = notifications.some(n => !readNotifIds.includes(n.id));

  return (
    <motion.header 
      ref={headerRef}
      className={styles.header}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-primary)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.01)',
      }}
    >
      <div className={styles.left}>
        <motion.div 
          className={styles.searchWrapper}
          animate={{ width: isSearchFocused ? '100%' : '85%' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <span className={styles.searchIcon} style={{ top: '50%', transform: 'translateY(-50%)' }}>
            <Search size={13} className="text-muted" style={{ opacity: 0.6 }} />
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search courses, coding labs, jobs..."
            id="global-search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => {
              setIsSearchFocused(true);
              setShowSearchResults(true);
            }}
            onBlur={() => {
              setIsSearchFocused(false);
            }}
            style={{
              borderRadius: 'var(--radius-md)',
              background: isSearchFocused ? '#ffffff' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isSearchFocused ? '#000000' : 'rgba(0, 0, 0, 0.06)',
              boxShadow: isSearchFocused ? '0 4px 12px rgba(0, 0, 0, 0.04)' : 'none',
              paddingLeft: '2.5rem',
              fontSize: '12.5px',
            }}
          />

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className={styles.searchResultsDropdown}>
              <div className={styles.dropdownHeader}>Search Results</div>
              <div className={styles.resultsList}>
                {searchResults.map((result, idx) => (
                  <Link
                    key={idx}
                    href={result.url}
                    className={styles.searchResultItem}
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className={styles.resultItemInfo}>
                      <span className={styles.resultItemBadge}>{result.type}</span>
                      <div className={styles.resultItemText}>
                        <p className={styles.resultItemTitle}>{result.title}</p>
                        <span className={styles.resultItemSubtitle}>{result.subtitle}</span>
                      </div>
                    </div>
                    <ChevronRight size={12} className={styles.resultChevron} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
 
      <div className={styles.right}>
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <motion.button 
            className={styles.notificationBtn} 
            id="notifications-btn" 
            aria-label="Notifications"
            onClick={() => setShowNotifications(prev => !prev)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
            {hasUnread && (
              <span className={styles.notificationDot} />
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className={styles.notificationsDropdown}>
              <div className={styles.notificationsHeader}>
                <p className={styles.notificationsTitle}>Notifications</p>
                {hasUnread && (
                  <button 
                    className={styles.markAllReadBtn}
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className={styles.notificationsList}>
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`${styles.notificationItem} ${!readNotifIds.includes(notif.id) ? styles.unreadNotif : ''}`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className={styles.notifContent}>
                        <p className={styles.notifItemTitle}>{notif.title}</p>
                        <p className={styles.notifItemDesc}>{notif.description}</p>
                        <span className={styles.notifItemTime}>{notif.time}</span>
                      </div>
                      {!readNotifIds.includes(notif.id) && (
                        <span className={styles.unreadDot} />
                      )}
                    </div>
                  ))
                ) : (
                  <div className={styles.notificationsEmpty}>
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
 
        {/* Vertical Divider */}
        <div className={styles.divider} />
 
        {/* User Info Block */}
        <div className={styles.headerUserInfo}>
          <span className={styles.headerUserName}>{user.name || 'Atharva Nighot'}</span>
          <span className={styles.headerUserRole}>{roleInfo.label}</span>
        </div>
 
        {/* Clerk User Button */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: {
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                  boxShadow: 'none'
                },
              },
            }}
          />
        </div>
      </div>
    </motion.header>
  );
}
