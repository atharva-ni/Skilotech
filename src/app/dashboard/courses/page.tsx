'use client';

import React, { useState, useEffect, useCallback } from 'react';
import CourseCard from '@/components/ui/CourseCard';
import SearchFilter from '@/components/ui/SearchFilter';
import { toast } from 'sonner';

export default function CourseCatalog() {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular'); // default sorted by popular

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

  // Extract unique categories from loaded courses
  useEffect(() => {
    if (courses.length > 0 && categories.length === 0) {
      const uniqueCats = Array.from(new Set(courses.map((c: any) => c.category?.name).filter(Boolean))) as string[];
      setCategories(uniqueCats);
    }
  }, [courses, categories]);

  const sortOptions = [
    { label: 'Popularity', value: 'popular' },
    { label: 'Highest Rated', value: 'rating' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Course Catalog</h1>
        <p className="page-subtitle">Learn top tech and business skills from industry experts.</p>
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
              price={course.price / 100} // convert paise to INR for UI display
              rating={Number(course.ratingAvg)}
              studentsEnrolled={course.studentsEnrolled}
              duration={`${Math.round(course.durationHours || 0)} hours`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
