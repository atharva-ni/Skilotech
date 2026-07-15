'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import SearchFilter from '@/components/ui/SearchFilter';
import { 
  MapPin, IndianRupee, CheckCircle2, Clock, X, Link as LinkIcon 
} from 'lucide-react';

const enumToJobType: Record<string, string> = {
  'full_time': 'Full-time',
  'part_time': 'Part-time',
  'internship': 'Internship',
  'contract': 'Contract'
};

const jobTypeToEnum: Record<string, string> = {
  'Full-time': 'full_time',
  'Part-time': 'part_time',
  'Internship': 'internship',
  'Contract': 'contract'
};

export default function StudentJobBoard() {
  // Tabs
  const [activeTab, setActiveTab] = useState<'explore' | 'applications'>('explore');

  // Job Listing Data & State
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modal Details & Apply State
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const fetchJobsAndApplications = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([
        fetch('/api/jobs'),
        fetch('/api/jobs/applications')
      ]);

      const jobsData = await jobsRes.json();
      const appsData = await appsRes.json();

      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setApplications(Array.isArray(appsData) ? appsData : []);
    } catch {
      toast.error('Failed to load job listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchJobsAndApplications();
    });
  }, []);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!resumeUrl.trim()) {
      toast.error('Please enter your resume link');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/jobs/${selectedJob.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coverLetter: coverLetter.trim(),
          resumeUrl: resumeUrl.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');

      toast.success(`Applied successfully to ${selectedJob.company}!`);
      setShowApplyModal(false);
      setSelectedJob(null);
      setCoverLetter('');
      setResumeUrl('');
      
      // Refresh listings
      await fetchJobsAndApplications();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const typesList = ['Full-time', 'Part-time', 'Internship', 'Contract'];
  const sortOptions = [
    { label: 'Newest Postings', value: 'newest' },
    { label: 'Most Popular', value: 'popular' }
  ];

  const filteredJobs = jobs
    .filter((job) => job.status === 'active')
    .filter((job) => {
      const query = search.toLowerCase();
      const matchesSearch = 
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        (job.location && job.location.toLowerCase().includes(query)) ||
        (Array.isArray(job.skills) && job.skills.some((s: string) => s.toLowerCase().includes(query)));

      const targetEnum = jobTypeToEnum[selectedType];
      const matchesType = selectedType === 'All' || job.jobType === targetEnum;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'popular') return b.applicantCount - a.applicantCount;
      return 0;
    });

  const getAppliedStatus = (jobId: string) => {
    return applications.find(app => app.jobId === jobId);
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          💼 Skilotech Placement Board
        </h1>
        <p className="page-subtitle">Elevate your career. Apply to active developer roles and track your interviews.</p>
        
        {/* Tab switchers */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
          <button
            onClick={() => setActiveTab('explore')}
            className={`btn ${activeTab === 'explore' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 20px', borderRadius: '8px', fontSize: 'var(--font-size-xs)' }}
          >
            Explore Job Listings ({filteredJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 20px', borderRadius: '8px', fontSize: 'var(--font-size-xs)' }}
          >
            Track Your Applications ({applications.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'var(--text-secondary)' }}>
          Loading job postings pipeline...
        </div>
      ) : activeTab === 'explore' ? (
        <>
          {/* Filters */}
          <SearchFilter
            searchPlaceholder="Search title, company, skills, or location..."
            searchValue={search}
            onSearchChange={setSearch}
            categories={typesList}
            selectedCategory={selectedType}
            onCategoryChange={setSelectedType}
            sortOptions={sortOptions}
            selectedSort={sortBy}
            onSortChange={setSortBy}
          />

          {/* Jobs Listing Grid */}
          {filteredJobs.length === 0 ? (
            <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '3rem' }}>🔍</span>
              <h3 style={{ color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>No active postings match your search</h3>
              <p>Check back shortly or change your filters to discover technical roles.</p>
            </div>
          ) : (
            <div className="grid-3 animate-fade-in-up">
              {filteredJobs.map((job) => {
                const application = getAppliedStatus(job.id);
                return (
                  <div 
                    key={job.id} 
                    className="card card-interactive" 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '16px',
                      background: '#ffffff',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '24px',
                      boxShadow: 'var(--shadow-premium)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '8px',
                          background: 'rgba(99,102,241,0.06)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                          fontWeight: 700, color: 'var(--accent-primary)'
                        }}>
                          {job.companyLogo || job.company.charAt(0)}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{job.company}</h4>
                          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{job.title}</h3>
                        </div>
                      </div>
                      
                      <Badge variant={job.jobType === 'full_time' ? 'primary' : 'info'}>
                        {enumToJobType[job.jobType] || job.jobType}
                      </Badge>
                    </div>

                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
                      {job.description.length > 120 ? job.description.slice(0, 120) + '...' : job.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {Array.isArray(job.skills) && job.skills.map((skill: string) => (
                        <span 
                          key={skill} 
                          style={{ 
                            fontSize: '10px', 
                            background: 'var(--bg-primary)', 
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-primary)',
                            padding: '2px 6px', 
                            borderRadius: '4px' 
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderTop: '1px solid var(--border-primary)', paddingTop: '16px', fontSize: '11px',
                      color: 'var(--text-tertiary)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        <IndianRupee size={13} style={{ color: 'var(--success)' }} /> {job.salaryDisplay || 'Competitive'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {job.location || 'Remote'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
                      <button 
                        onMouseEnter={() => setHoveredId(`details-${job.id}`)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setSelectedJob(job)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px 16px',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: hoveredId === `details-${job.id}` ? '#a3a3a3' : '#e5e5e5',
                          background: hoveredId === `details-${job.id}` ? '#f5f5f7' : '#ffffff',
                          color: '#171717',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          transform: hoveredId === `details-${job.id}` ? 'translateY(-1px)' : 'none',
                          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      >
                        Details
                      </button>
                      
                      {application ? (
                        <span style={{
                          flex: 1.5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          gap: '6px', background: 'rgba(16,185,129,0.06)', color: '#059669',
                          border: '1px solid rgba(16,185,129,0.15)', borderRadius: '8px', fontSize: '12px',
                          fontWeight: 700
                        }}>
                          <CheckCircle2 size={13} /> Applied ({application.status})
                        </span>
                      ) : (
                        <button 
                          onMouseEnter={() => setHoveredId(`apply-${job.id}`)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => {
                            setSelectedJob(job);
                            setShowApplyModal(true);
                          }}
                          style={{
                            flex: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '10px 16px',
                            fontSize: '12px',
                            fontWeight: 700,
                            borderRadius: '8px',
                            border: 'none',
                            background: hoveredId === `apply-${job.id}` 
                              ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' 
                              : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: '#ffffff',
                            cursor: 'pointer',
                            boxShadow: hoveredId === `apply-${job.id}` 
                              ? '0 4px 12px rgba(99, 102, 241, 0.25)' 
                              : '0 2px 4px rgba(99, 102, 241, 0.15)',
                            transform: hoveredId === `apply-${job.id}` ? 'translateY(-1px)' : 'none',
                            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                          }}
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* Applications tracking list */
        <div className="card" style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-premium)' }}>
          <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>
            Application Pipeline
          </h2>

          {applications.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '2.5rem' }}>📋</span>
              <h3 style={{ color: 'var(--text-primary)', marginTop: '12px', marginBottom: '6px' }}>No applications submitted yet</h3>
              <p>Apply to career opportunities in the explore tab to start tracking your interviews.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {applications.map((app) => (
                <div 
                  key={app.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '20px',
                    borderRadius: '10px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <h4 style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                        {app.job.company} • {app.job.location}
                      </h4>
                      <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        {app.job.title}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> Applied: {new Date(app.appliedAt).toLocaleDateString()}
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

                  {app.resumeUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--accent-primary-hover)', fontWeight: 600 }}>
                      <LinkIcon size={12} /> 
                      <a href={app.resumeUrl} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
                        Submitted Resume Link
                      </a>
                    </div>
                  )}

                  {app.recruiterNotes && (
                    <div style={{ 
                      marginTop: '4px',
                      background: 'rgba(245,158,11,0.04)',
                      borderLeft: '3px solid #d97706',
                      padding: '10px 14px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#9a3412',
                      lineHeight: '1.5'
                    }}>
                      <strong>Recruiter Note:</strong> {app.recruiterNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail / Apply Modal */}
      {selectedJob && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)', padding: '16px'
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column',
            gap: '20px', background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '32px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: 600 }}>{selectedJob.company}</h4>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                  {selectedJob.title}
                </h2>
              </div>
              <button 
                onClick={() => {
                  setSelectedJob(null);
                  setShowApplyModal(false);
                }} 
                style={{ background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {!showApplyModal ? (
              /* Description & Details View */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-primary)', fontSize: '12px' }}>
                  <div><strong>Location:</strong> {selectedJob.location || 'Remote'}</div>
                  <div><strong>Job Type:</strong> {enumToJobType[selectedJob.jobType] || selectedJob.jobType}</div>
                  <div><strong>Salary:</strong> {selectedJob.salaryDisplay || 'Competitive'}</div>
                  <div><strong>Candidates:</strong> {selectedJob.applicantCount} applied</div>
                </div>

                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '6px' }}>Job Description</h4>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.requirements && (
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '6px' }}>Requirements</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {selectedJob.requirements}
                    </p>
                  </div>
                )}

                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '6px' }}>Required Technical Skills</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {Array.isArray(selectedJob.skills) && selectedJob.skills.map((s: string) => (
                      <span key={s} style={{ fontSize: '11px', background: 'var(--bg-primary)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-primary)' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button 
                    onMouseEnter={() => setHoveredId('modal-close')}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelectedJob(null)}
                    style={{
                      padding: '10px 24px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: hoveredId === 'modal-close' ? '#a3a3a3' : '#e5e5e5',
                      background: hoveredId === 'modal-close' ? '#f5f5f7' : '#ffffff',
                      color: '#171717',
                      cursor: 'pointer',
                      transform: hoveredId === 'modal-close' ? 'translateY(-1px)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    Close
                  </button>
                  
                  {getAppliedStatus(selectedJob.id) ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(16,185,129,0.06)', color: '#059669',
                      border: '1px solid rgba(16,185,129,0.15)', padding: '10px 24px',
                      borderRadius: '8px', fontSize: 'var(--font-size-xs)', fontWeight: 700
                    }}>
                      <CheckCircle2 size={16} /> Already Applied
                    </span>
                  ) : (
                    <button 
                      onMouseEnter={() => setHoveredId('modal-apply')}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setShowApplyModal(true)}
                      style={{
                        padding: '10px 24px',
                        fontSize: '12px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: 'none',
                        background: hoveredId === 'modal-apply' 
                          ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' 
                          : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        boxShadow: hoveredId === 'modal-apply' 
                          ? '0 4px 12px rgba(99, 102, 241, 0.25)' 
                          : '0 2px 4px rgba(99, 102, 241, 0.15)',
                        transform: hoveredId === 'modal-apply' ? 'translateY(-1px)' : 'none',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      Apply for this Job
                    </button>
                  )}
                </div>     </div>
              </div>
            ) : (
              /* Submission Form View */
              <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Resume URL (Link to your Hosted PDF / Google Drive) *</label>
                  <input 
                    type="url"
                    required
                    placeholder="https://drive.google.com/file/... or https://resume.io/..."
                    className="input"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Cover Letter / Pitch *</label>
                  <textarea 
                    rows={6}
                    required
                    placeholder="Briefly state why you're a great fit for this role and highlight your project accomplishments..."
                    className="input"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button 
                    type="button" 
                    onMouseEnter={() => setHoveredId('form-back')}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setShowApplyModal(false)}
                    style={{
                      padding: '10px 24px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: hoveredId === 'form-back' ? '#a3a3a3' : '#e5e5e5',
                      background: hoveredId === 'form-back' ? '#f5f5f7' : '#ffffff',
                      color: '#171717',
                      cursor: 'pointer',
                      transform: hoveredId === 'form-back' ? 'translateY(-1px)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    Back to Details
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    onMouseEnter={() => setHoveredId('form-submit')}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      padding: '10px 24px',
                      fontSize: '12px',
                      fontWeight: 700,
                      borderRadius: '8px',
                      border: 'none',
                      background: submitting
                        ? 'var(--text-tertiary)'
                        : hoveredId === 'form-submit' 
                          ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' 
                          : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: '#ffffff',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      boxShadow: !submitting && hoveredId === 'form-submit' 
                        ? '0 4px 12px rgba(99, 102, 241, 0.25)' 
                        : '0 2px 4px rgba(99, 102, 241, 0.15)',
                      transform: !submitting && hoveredId === 'form-submit' ? 'translateY(-1px)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
