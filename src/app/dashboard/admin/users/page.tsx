'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '@/data/mock';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users, Loader2, Award, Briefcase, GraduationCap, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'partners' | 'students'>('partners');

  // Form State
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'instructor' | 'recruiter'>('instructor');

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      } else {
        toast.error('Failed to load users');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error loading users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchUsers();
    });
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, firstName, lastName }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Profile pre-created successfully for ${email}!`);
        setEmail('');
        setFirstName('');
        setLastName('');
        setShowInviteForm(false);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to pre-create user');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error pre-creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('User role updated successfully');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to update user role');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error updating user role');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the user profile for ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`User ${userEmail} deleted successfully`);
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error deleting user');
    }
  };

  // Filter users based on active tab
  const partnerUsers = users.filter((u) => u.role === 'instructor' || u.role === 'recruiter');
  const normalUsers = users.filter((u) => u.role === 'student' || u.role === 'admin');

  // Columns for Tab 1: Instructors & Recruiters
  const partnerColumns = [
    {
      header: 'Name',
      accessor: (item: any) => {
        const isPending = item.clerkId?.startsWith('pending:');
        const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isPending ? '#fafafa' : '#171717',
              color: isPending ? '#a3a3a3' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.8rem',
              border: '1px solid #e5e5e5'
            }}>
              {isPending ? '⏳' : fullName ? fullName.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {fullName || item.username || 'Invited User'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: (item: any) => {
        const isPending = item.clerkId?.startsWith('pending:');
        return isPending ? (
          <Badge variant="warning">Pending Sign-Up</Badge>
        ) : (
          <Badge variant="success">Registered</Badge>
        );
      }
    },
    {
      header: 'System Role',
      accessor: (item: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {item.role === 'instructor' ? (
            <Award size={14} style={{ color: 'var(--info)' }} />
          ) : (
            <Briefcase size={14} style={{ color: 'var(--warning)' }} />
          )}
          <span style={{ fontWeight: 500, fontSize: '0.8125rem', textTransform: 'capitalize' }}>
            {item.role}
          </span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (item: User) => {
        const isSelf = currentUser?.id === item.id;
        return (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteUser(item.id, item.email)}
            disabled={isSelf}
            style={{
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              height: '30px'
            }}
          >
            <Trash2 size={12} /> Delete
          </Button>
        );
      }
    }
  ];

  // Columns for Tab 2: Normal Users (Students)
  const studentColumns = [
    {
      header: 'Student User',
      accessor: (item: any) => {
        const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f4f4f5',
              color: '#171717',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.8rem',
              border: '1px solid #e5e5e5'
            }}>
              {fullName ? fullName.charAt(0).toUpperCase() : <GraduationCap size={16} />}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {fullName || item.username || 'Student'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Role',
      accessor: (item: User) => (
        <Badge variant={item.role === 'admin' ? 'error' : 'primary'}>
          {item.role}
        </Badge>
      )
    },
    {
      header: 'Assign Role',
      accessor: (item: User) => (
        <select
          className="input select"
          style={{ width: '130px', padding: '4px 8px', fontSize: 'var(--font-size-xs)', borderRadius: '6px' }}
          value={item.role}
          onChange={(e) => handleRoleChange(item.id, e.target.value as UserRole)}
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="recruiter">Recruiter</option>
          <option value="admin">Admin</option>
        </select>
      )
    },
    {
      header: 'Actions',
      accessor: (item: User) => {
        const isSelf = currentUser?.id === item.id;
        return (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteUser(item.id, item.email)}
            disabled={isSelf}
            style={{
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              height: '30px'
            }}
          >
            <Trash2 size={12} /> Delete
          </Button>
        );
      }
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} /> User Directory
          </h1>
          <p className="page-subtitle">Pre-create professional roles or modify access permissions for standard students.</p>
        </div>
        {activeTab === 'partners' && (
          <Button onClick={() => setShowInviteForm(!showInviteForm)} variant={showInviteForm ? 'outline' : 'primary'}>
            {showInviteForm ? 'Cancel' : 'Invite Recruiter / Instructor'}
          </Button>
        )}
      </div>

      {/* Tabs Layout */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e5e5e5', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => {
            setActiveTab('partners');
            setShowInviteForm(false);
          }}
          style={{
            padding: '8px 16px',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            background: activeTab === 'partners' ? '#171717' : 'transparent',
            color: activeTab === 'partners' ? '#ffffff' : '#737373',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          Instructors & Recruiters
        </button>
        <button
          onClick={() => {
            setActiveTab('students');
            setShowInviteForm(false);
          }}
          style={{
            padding: '8px 16px',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            background: activeTab === 'students' ? '#171717' : 'transparent',
            color: activeTab === 'students' ? '#ffffff' : '#737373',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          Normal Users (Students)
        </button>
      </div>

      {/* Invite/Pre-create Form Panel (Tab 1 Only) */}
      <AnimatePresence>
        {activeTab === 'partners' && showInviteForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="card"
            style={{ marginBottom: '24px', padding: '24px', border: '1px solid #e5e5e5', boxShadow: 'var(--shadow-premium)' }}
          >
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} style={{ color: 'var(--accent-primary)' }} /> Pre-Authorize Recruiter or Instructor
            </h3>
            <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>First Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anish"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="input"
                  style={{ fontSize: 'var(--font-size-sm)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bonde"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="input"
                  style={{ fontSize: 'var(--font-size-sm)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address (Required)</label>
                <input
                  type="email"
                  placeholder="e.g. partner@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  style={{ fontSize: 'var(--font-size-sm)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Role Designation</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'instructor' | 'recruiter')}
                  className="input select"
                  style={{ fontSize: 'var(--font-size-sm)' }}
                >
                  <option value="instructor">Instructor</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>

              <div>
                <Button type="submit" style={{ width: '100%', height: '38px' }} disabled={submitting}>
                  {submitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Loader2 size={16} className="animate-spin" /> Authorization...
                    </span>
                  ) : (
                    'Authorize Account'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users Database list */}
      {loading && users.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : activeTab === 'partners' ? (
        <DataTable
          columns={partnerColumns}
          data={partnerUsers}
          emptyMessage="No pending partner invites or registered partners found."
        />
      ) : (
        <DataTable
          columns={studentColumns}
          data={normalUsers}
          emptyMessage="No registered students or normal users found."
        />
      )}
    </div>
  );
}
