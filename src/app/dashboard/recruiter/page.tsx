'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import StatsCard from '@/components/ui/StatsCard';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

const enumToJobType: Record<string, string> = {
  'full_time': 'Full-time',
  'part_time': 'Part-time',
  'internship': 'Internship',
  'contract': 'Contract'
};

export default function RecruiterDashboard() {
  const { user } = useAuth();
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [jobsRes, appsRes] = await Promise.all([
          fetch('/api/jobs?manage=true'),
          fetch('/api/jobs/applications')
        ]);
        const jobsData = await jobsRes.json();
        const appsData = await appsRes.json();
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setApplications(Array.isArray(appsData) ? appsData : []);
      } catch {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    Promise.resolve().then(() => {
      fetchData();
    });
  }, []);

  const activeJobsCount = jobs.filter(j => j.status === 'active').length;
  const totalApplicantsCount = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted' || a.status === 'interviewing').length;
  const hiredCount = applications.filter(a => a.status === 'hired').length;

  const stats = [
    { label: 'Active Jobs', value: activeJobsCount.toString(), icon: '📋', trend: 'Live postings' },
    { label: 'Total Applicants', value: totalApplicantsCount.toString(), icon: '👥', trend: 'Awaiting review' },
    { label: 'Shortlisted', value: shortlistedCount.toString(), icon: '🎯', trend: 'Candidates in pipeline' },
    { label: 'Total Hired', value: hiredCount.toString(), icon: '🏆', trend: 'Completed hires' },
  ];

  const recentApplicants = applications.slice(0, 4);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🏢 Recruiter Hub</h1>
        <p className="page-subtitle">Welcome back, {user?.name}. Source top technical developers from Skilotech.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: 'var(--text-secondary)' }}>
          Computing metrics...
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid-4" style={{ marginBottom: 'var(--spacing-xl)' }}>
            {stats.map((stat) => (
              <StatsCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
              />
            ))}
          </div>

          {/* Recent Applicants */}
          <section style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--spacing-base)' }}>
              <h2 className="section-title" style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>Recent Technical Applicants</h2>
              <Link href="/dashboard/recruiter/applicants" className="btn btn-ghost btn-sm" style={{ fontSize: '11px' }}>
                All Candidates →
              </Link>
            </div>
            {recentApplicants.length === 0 ? (
              <div className="card" style={{ padding: '24px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                No applications received yet. Post a job to start receiving candidates.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recentApplicants.map((app) => (
                  <div 
                    key={app.id} 
                    className="card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: '#ffffff',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                        {app.user.firstName} {app.user.lastName}
                      </h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        Target Job: <strong style={{ color: 'var(--text-secondary)' }}>{app.job.title}</strong>
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-primary-hover)' }}>
                        Match: {app.matchScore || 85}%
                      </span>
                      <Badge variant={
                        app.status === 'hired' ? 'success' :
                        app.status === 'interviewing' ? 'info' :
                        app.status === 'shortlisted' ? 'primary' :
                        app.status === 'rejected' ? 'error' : 'warning'
                      }>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Job Postings */}
          <section>
            <h2 className="section-title" style={{ fontSize: 'var(--font-size-md)' }}>Your Job Postings</h2>
            {jobs.length === 0 ? (
              <div className="card" style={{ padding: '24px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                No job postings yet.{' '}
                <Link href="/dashboard/recruiter/jobs" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Create your first job →</Link>
              </div>
            ) : (
              <div className="grid-3 animate-fade-in-up">
                {jobs.slice(0, 3).map((job) => (
                  <div 
                    key={job.id} 
                    className="card"
                    style={{ 
                      padding: '20px', 
                      background: '#ffffff', 
                      border: '1px solid var(--border-primary)', 
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <h4 style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{job.title}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{job.location} • {enumToJobType[job.jobType]}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-primary)', paddingTop: '10px', marginTop: '4px', fontSize: '10px', color: 'var(--text-tertiary)' }}>
                      <span>{job.salaryDisplay}</span>
                      <span><strong>{job.applicantCount}</strong> applicants</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
