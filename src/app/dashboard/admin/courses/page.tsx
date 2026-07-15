'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CheckCircle2, Edit3, Trash2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';

interface CourseRow {
  id: string;
  title: string;
  instructor: string;
  category: string;
  price: number;
  status: 'published' | 'draft' | 'pending' | 'archived';
}

export default function CourseApprovals() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCourses() {
    try {
      setLoading(true);
      const res = await fetch('/api/courses?status=all');
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.courses || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          instructor: `${c.instructor?.firstName || ''} ${c.instructor?.lastName || ''}`.trim() || 'Unknown',
          category: c.category?.name || 'Uncategorized',
          price: c.price || 0,
          status: c.status,
        }));
        setCourses(mapped);
      } else {
        toast.error('Failed to load courses catalogue');
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
      toast.error('Connection error loading courses');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchCourses();
    });
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'published' }),
      });
      const data = await res.json();
      if (res.ok) {
        setCourses(
          courses.map((c) => (c.id === id ? { ...c, status: 'published' as const } : c))
        );
        toast.success('Course approved and published successfully!');
      } else {
        toast.error(data.error || 'Failed to approve course');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error approving course');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? This will delete all modules, lessons, steps, and progress records.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setCourses(courses.filter((c) => c.id !== id));
        toast.success(`Course "${title}" has been deleted.`);
      } else {
        toast.error(data.error || 'Failed to delete course');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error deleting course');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Published</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending Review</Badge>;
      case 'draft':
        return <Badge variant="info">Draft</Badge>;
      default:
        return <Badge variant="error">{status}</Badge>;
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title' as keyof CourseRow },
    { header: 'Instructor', accessor: 'instructor' as keyof CourseRow },
    { header: 'Category', accessor: 'category' as keyof CourseRow },
    {
      header: 'Price',
      accessor: (item: CourseRow) => (
        <span>₹{(item.price || 0).toLocaleString('en-IN')}</span>
      )
    },
    {
      header: 'Status',
      accessor: (item: CourseRow) => getStatusBadge(item.status)
    },
    {
      header: 'Actions',
      accessor: (item: CourseRow) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {item.status === 'pending' && (
            <button
              onClick={() => handleApprove(item.id)}
              style={{
                padding: '4px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                height: '30px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '6px',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.25)';
              }}
            >
              <CheckCircle2 size={12} /> Approve
            </button>
          )}
          <Link
            href={`/dashboard/instructor/courses/${item.id}`}
            style={{ textDecoration: 'none' }}
          >
            <Button
              variant="outline"
              size="sm"
              style={{
                padding: '4px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                height: '30px'
              }}
            >
              <Edit3 size={12} /> Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(item.id, item.title)}
            style={{
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              height: '30px'
            }}
          >
            <Trash2 size={12} /> Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Course Management & Approvals</h1>
        <p className="page-subtitle">Verify pending submissions, edit course configurations, or delete catalog offerings.</p>
      </div>

      {loading && courses.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2Spinner />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={courses}
          emptyMessage="No courses found. Courses will appear here once instructors create them."
        />
      )}
    </div>
  );
}

function Loader2Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        border: '3px solid var(--border-primary)',
        borderTop: '3px solid var(--accent-primary)',
        animation: 'spin 0.8s linear infinite'
      }} />
      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Loading catalog...</span>
    </div>
  );
}

