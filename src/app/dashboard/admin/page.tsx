'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Payment } from '@/data/mock';
import StatsCard from '@/components/ui/StatsCard';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, payments } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    pendingCourses: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch real course count
        const coursesRes = await fetch('/api/courses');
        let totalCourses = 0;
        let pendingCourses = 0;
        if (coursesRes.ok) {
          const data = await coursesRes.json();
          totalCourses = data.courses?.length || 0;
          pendingCourses = (data.courses || []).filter((c: any) => c.status === 'pending').length;
        }

        setStats({ totalUsers: 0, totalCourses, pendingCourses });
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      }
    }
    Promise.resolve().then(() => {
      fetchStats();
    });
  }, []);

  const recentPayments = payments.slice(0, 4);

  const totalRevenueCalculated = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const statCards = [
    { label: 'Total Courses', value: stats.totalCourses.toString(), icon: '📚', trend: `${stats.pendingCourses} pending approval` },
    { label: 'Total Revenue', value: `₹${(totalRevenueCalculated / 100000).toFixed(2)}L`, icon: '💳', trend: 'From payments' },
    { label: 'Transactions', value: payments.length.toString(), icon: '🧾', trend: 'All time' },
  ];

  const columns = [
    { header: 'Student Name', accessor: 'studentName' as keyof Payment },
    { header: 'Course', accessor: 'courseName' as keyof Payment },
    {
      header: 'Amount',
      accessor: (item: Payment) => (
        <span>₹{item.amount.toLocaleString('en-IN')}</span>
      )
    },
    { header: 'Date', accessor: 'date' as keyof Payment },
    {
      header: 'Status',
      accessor: (item: Payment) => (
        <Badge variant={
          item.status === 'completed' ? 'success' :
          item.status === 'pending' ? 'warning' :
          item.status === 'failed' ? 'error' : 'info'
        }>
          {item.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Control Center</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Monitor platform analytics and manage resources.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-3" style={{ marginBottom: 'var(--spacing-xl)' }}>
        {statCards.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Dynamic Payments Table */}
      <section style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="flex-between" style={{ marginBottom: 'var(--spacing-base)' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Recent Transaction Records</h2>
          <Link href="/dashboard/admin/payments" className="btn btn-ghost btn-sm">
            All Payments →
          </Link>
        </div>
        <DataTable
          columns={columns}
          data={recentPayments}
          emptyMessage="No payment transactions recorded yet."
        />
      </section>

      {/* Course Approvals Quick list */}
      <section>
        <div className="flex-between" style={{ marginBottom: 'var(--spacing-base)' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Courses Pending Review</h2>
          <Link href="/dashboard/admin/courses" className="btn btn-ghost btn-sm">
            Review Board →
          </Link>
        </div>
        {stats.pendingCourses === 0 ? (
          <div className="card" style={{ padding: '24px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            All courses are reviewed! No pending submissions.
          </div>
        ) : (
          <div className="card" style={{ padding: '24px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            {stats.pendingCourses} course(s) awaiting review.{' '}
            <Link href="/dashboard/admin/courses" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>View →</Link>
          </div>
        )}
      </section>
    </div>
  );
}
