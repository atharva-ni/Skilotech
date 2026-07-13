'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import { Plus, X, Loader2 } from 'lucide-react';

export default function InstructorCourses() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Inline course creation form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses?status=all');
        if (res.ok) {
          const data = await res.json();
          const myCourses = (data.courses || []).filter((c: any) => {
            const instructorName = `${c.instructor?.firstName || ''} ${c.instructor?.lastName || ''}`.trim();
            return instructorName === user?.name;
          });
          setCourses(myCourses);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchCourses();
  }, [user]);

  // Auto-focus title input when create form opens
  useEffect(() => {
    if (showCreateForm && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [showCreateForm]);

  const handleCreateCourse = async () => {
    if (!newTitle.trim()) {
      toast.error('Course title is required');
      return;
    }
    if (newTitle.trim().length < 3) {
      toast.error('Course title must be at least 3 characters long');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || 'Course description — edit this in the course builder.'
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Course created successfully');
        router.push(`/dashboard/instructor/courses/${data.course.id}`);
      } else {
        toast.error(data.error || 'Failed to create course');
      }
    } catch (err) {
      console.error(err);
      toast.error('Connection error creating course');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">Create, design, and manage your student curricula.</p>
        </div>
        {!showCreateForm && (
          <Button onClick={() => setShowCreateForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> New Course
          </Button>
        )}
      </div>

      {/* Inline Course Creation Form */}
      {showCreateForm && (
        <div
          className="card"
          style={{
            marginBottom: '24px',
            padding: '24px',
            border: '2px solid var(--accent-primary)',
            borderRadius: 'var(--radius-lg)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, margin: 0 }}>Create a New Course</h3>
            <button
              onClick={handleCancelCreate}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="label">Course Title *</label>
              <input
                ref={titleInputRef}
                type="text"
                className="input"
                placeholder="e.g., Full-Stack Web Development with React & Node.js"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateCourse(); if (e.key === 'Escape') handleCancelCreate(); }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label className="label">Short Description <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional — can be edited later)</span></label>
              <input
                type="text"
                className="input"
                placeholder="Briefly describe what students will learn"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateCourse(); if (e.key === 'Escape') handleCancelCreate(); }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button className="btn btn-ghost" onClick={handleCancelCreate} disabled={creating}>Cancel</button>
              <Button onClick={handleCreateCourse} disabled={creating || !newTitle.trim()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {creating ? 'Creating...' : 'Create Course'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '80px', height: '14px', background: 'var(--border-primary)', borderRadius: '4px', animation: 'pulse 1.5s ease infinite' }} />
                <div style={{ width: '50px', height: '20px', background: 'var(--border-primary)', borderRadius: '10px', animation: 'pulse 1.5s ease infinite' }} />
              </div>
              <div style={{ width: '100%', height: '18px', background: 'var(--border-primary)', borderRadius: '4px', animation: 'pulse 1.5s ease infinite' }} />
              <div style={{ width: '60%', height: '12px', background: 'var(--border-primary)', borderRadius: '4px', animation: 'pulse 1.5s ease infinite' }} />
              <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ width: '60px', height: '14px', background: 'var(--border-primary)', borderRadius: '4px', animation: 'pulse 1.5s ease infinite' }} />
                <div style={{ width: '70px', height: '14px', background: 'var(--border-primary)', borderRadius: '4px', animation: 'pulse 1.5s ease infinite' }} />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📚</div>
          <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>No courses yet</h3>
          <p style={{ marginBottom: '16px' }}>Create your first course to start teaching on Skilotech.</p>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Create Your First Course
            </Button>
          )}
        </div>
      ) : (
        <div className="grid-3 animate-fade-in-up">
          {courses.map((course: any) => (
            <div key={course.id} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--accent-primary-hover)' }}>
                  {course.category?.name || 'Uncategorized'}
                </span>
                <Badge variant={course.status === 'published' ? 'success' : course.status === 'pending' ? 'info' : 'warning'}>
                  {course.status}
                </Badge>
              </div>

              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>{course.title}</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                Lessons: {course._count?.lessons || 0} • Level: {course.level || 'N/A'}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-primary)',
                fontSize: 'var(--font-size-sm)'
              }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {course.isFree ? 'Free' : `₹${(course.price || 0).toLocaleString('en-IN')}`}
                </span>
                <button
                  onClick={() => router.push(`/dashboard/instructor/courses/${course.id}`)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--accent-primary-hover)', fontWeight: 600 }}
                >
                  Manage ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
