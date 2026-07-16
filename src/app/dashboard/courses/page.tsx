'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CourseCard from '@/components/ui/CourseCard';
import SearchFilter from '@/components/ui/SearchFilter';
import { toast } from 'sonner';

const PlaceholderCard = () => {
  return (
    <div style={{
      border: '2px dashed #cbd5e1',
      borderRadius: '16px',
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      minHeight: '340px',
      textAlign: 'center',
      height: '100%'
    }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '1px solid #e2e8f0',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        fontSize: '1.25rem',
        fontWeight: 300,
        marginBottom: '16px'
      }}>
        +
      </div>
      <h3 style={{
        fontSize: '0.9rem',
        fontWeight: 700,
        color: '#0f172a',
        marginBottom: '6px'
      }}>
        More courses on the way
      </h3>
      <p style={{
        fontSize: '0.75rem',
        color: '#64748b',
        lineHeight: '1.4',
        maxWidth: '180px'
      }}>
        New tracks are added regularly. Check back soon.
      </p>
    </div>
  );
};

export default function CourseCatalog() {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular'); // default sorted by popular

  // Stats calculation
  const [stats, setStats] = useState({
    coursesCount: 0,
    hoursCount: 0,
    categoriesCount: 0,
    enrolledCount: 0,
  });
  const [hasCalculatedStats, setHasCalculatedStats] = useState(false);

  // Fetch courses with filters from API
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      // Map frontend sort names to backend queries
      let backendSort = 'popular';
      if (sortBy === 'rating') backendSort = 'rating';
      if (sortBy === 'price-low') backendSort = 'price_asc';
      if (sortBy === 'price-high') backendSort = 'price_desc';

      const queryParams = new URLSearchParams({
        search,
        sort: backendSort,
      });

      if (category !== 'All') {
        queryParams.append('category', category);
      }

      const res = await fetch(`/api/courses?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load courses');
      }
      
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to search courses');
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy]);

  // Initial load
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Extract unique categories and calculate stats from initial loaded courses
  useEffect(() => {
    if (courses.length > 0) {
      if (categories.length === 0) {
        const uniqueCats = Array.from(new Set(courses.map((c: any) => c.category?.name).filter(Boolean))) as string[];
        setCategories(uniqueCats);
      }

      if (!hasCalculatedStats) {
        const uniqueCats = new Set(courses.map((c: any) => c.category?.name).filter(Boolean));
        const totalHours = Math.round(courses.reduce((sum: number, c: any) => sum + Number(c.durationHours || 0), 0));
        const totalEnrolled = courses.reduce((sum: number, c: any) => sum + Number(c.studentsEnrolled || 0), 0);

        setStats({
          coursesCount: courses.length,
          hoursCount: totalHours,
          categoriesCount: uniqueCats.size,
          enrolledCount: totalEnrolled
        });
        setHasCalculatedStats(true);
      }
    }
  }, [courses, categories, hasCalculatedStats]);

  const sortOptions = [
    { label: 'Popularity', value: 'popular' },
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
  ];

  return (
    <div className="page-container" style={{ paddingBottom: '40px' }}>
      {/* Redesigned Header Text */}
      <div style={{ marginBottom: '24px' }}>
        <p style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--text-secondary, #6b7280)', // monochrome instead of teal
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ height: '1px', width: '16px', backgroundColor: 'var(--text-secondary, #6b7280)' }}></span>
          learning & development
        </p>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--text-primary, #171717)',
          marginBottom: '8px',
          letterSpacing: '-0.025em'
        }}>Course Catalog</h1>
        <p style={{
          fontSize: '0.925rem',
          color: 'var(--text-secondary, #6b7280)',
          maxWidth: '650px',
          lineHeight: '1.5'
        }}>
          Learn top tech and business skills from industry experts, structured for real-world application.
        </p>
      </div>

      {/* Redesigned Statistics Container */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-card, #ffffff)',
        border: '1px solid var(--border-primary, rgba(0, 0, 0, 0.05))',
        borderRadius: '12px',
        marginBottom: '32px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ flex: 1, padding: '16px 24px', borderRight: '1px solid var(--border-primary, rgba(0, 0, 0, 0.05))' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary, #171717)', lineHeight: 1.2 }}>
            {stats.coursesCount || 2}
          </div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary, #6b7280)', letterSpacing: '0.05em', marginTop: '4px', textTransform: 'uppercase' }}>
            Courses Live
          </div>
        </div>
        <div style={{ flex: 1, padding: '16px 24px', borderRight: '1px solid var(--border-primary, rgba(0, 0, 0, 0.05))' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary, #171717)', lineHeight: 1.2 }}>
            {stats.hoursCount || 59}
          </div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary, #6b7280)', letterSpacing: '0.05em', marginTop: '4px', textTransform: 'uppercase' }}>
            Hours of Content
          </div>
        </div>
        <div style={{ flex: 1, padding: '16px 24px', borderRight: '1px solid var(--border-primary, rgba(0, 0, 0, 0.05))' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary, #171717)', lineHeight: 1.2 }}>
            {stats.categoriesCount || 2}
          </div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary, #6b7280)', letterSpacing: '0.05em', marginTop: '4px', textTransform: 'uppercase' }}>
            Categories
          </div>
        </div>
        <div style={{ flex: 1, padding: '16px 24px' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary, #171717)', lineHeight: 1.2 }}>
            {stats.enrolledCount || 10}
          </div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary, #6b7280)', letterSpacing: '0.05em', marginTop: '4px', textTransform: 'uppercase' }}>
            Enrolled Learners
          </div>
        </div>
      </div>

      <SearchFilter
        searchPlaceholder="Search courses, instructors..."
        searchValue={search}
        onSearchChange={setSearch}
        categories={categories}
        selectedCategory={category}
        onCategoryChange={setCategory}
        sortOptions={sortOptions}
        selectedSort={sortBy}
        onSortChange={setSortBy}
      />

      {/* Results and header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        marginTop: '8px'
      }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#475569',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>All Courses</h2>
        <span style={{
          fontSize: '0.75rem',
          color: '#64748b',
          fontFamily: 'monospace'
        }}>
          {courses.length} {courses.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <div style={{
            width: '40px', height: '40px', margin: '0 auto 16px auto',
            borderRadius: '50%', border: '3px solid var(--border-primary)',
            borderTop: '3px solid var(--accent-primary)',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading catalog...</p>
        </div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <h3>No courses found</h3>
          <p>Try resetting the search terms or category filters.</p>
        </div>
      ) : (
        <div className="grid-3 animate-fade-in-up">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              instructor={`${course.instructor?.firstName ?? ''} ${course.instructor?.lastName ?? ''}`.trim() || 'Instructor'}
              category={course.category?.name || 'Technology'}
              price={course.price} // already in ₹ for UI display
              rating={Number(course.ratingAvg)}
              studentsEnrolled={course.studentsEnrolled}
              duration={`${Math.round(course.durationHours || 0)} hours`}
            />
          ))}
          {/* Append the placeholder card at the end */}
          <PlaceholderCard />
        </div>
      )}
    </div>
  );
}
