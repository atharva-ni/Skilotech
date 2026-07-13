'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Briefcase, MapPin, IndianRupee, X, Edit3, Trash2, Calendar, FileText } from 'lucide-react';

const enumToJobType: Record<string, string> = {
  'full_time': 'Full-time',
  'part_time': 'Part-time',
  'internship': 'Internship',
  'contract': 'Contract'
};

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Remote');
  const [jobType, setJobType] = useState('full_time');
  const [salaryDisplay, setSalaryDisplay] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs?manage=true');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch jobs');
      setJobs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const openCreateModal = () => {
    setEditingJob(null);
    setTitle('');
    setCompany('');
    setLocation('Remote');
    setJobType('full_time');
    setSalaryDisplay('');
    setDescription('');
    setRequirements('');
    setSkillsStr('');
    setShowFormModal(true);
  };

  const openEditModal = (job: any) => {
    setEditingJob(job);
    setTitle(job.title);
    setCompany(job.company);
    setLocation(job.location || 'Remote');
    setJobType(job.jobType);
    setSalaryDisplay(job.salaryDisplay || '');
    setDescription(job.description);
    setRequirements(job.requirements || '');
    setSkillsStr(Array.isArray(job.skills) ? job.skills.join(', ') : '');
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !description.trim()) {
      toast.error('Please fill in all required fields (title, company, description)');
      return;
    }

    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      jobType,
      salaryDisplay: salaryDisplay.trim(),
      description: description.trim(),
      requirements: requirements.trim(),
      skills
    };

    try {
      setSubmitting(true);
      const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
      const method = editingJob ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save job posting');

      toast.success(editingJob ? 'Job updated successfully!' : 'Job posted successfully!');
      setShowFormModal(false);
      await fetchJobs();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job posting? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete job posting');

      toast.success('Job posting deleted successfully');
      await fetchJobs();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">💼 Manage Job Postings</h1>
          <p className="page-subtitle">Publish new technical career roles and view match statistics.</p>
        </div>
        <Button onClick={openCreateModal}>+ Create Job</Button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'var(--text-secondary)' }}>
          Loading your job postings...
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Briefcase size={40} style={{ margin: '0 auto 16px', color: 'var(--text-tertiary)' }} />
          <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>No job postings yet</h3>
          <p>Create your first job posting to start receiving applications from Skilotech learners.</p>
        </div>
      ) : (
        <div className="grid-3 animate-fade-in-up">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="card" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                background: '#ffffff',
                border: '1px solid var(--border-primary)',
                padding: '24px',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Badge variant="primary">{enumToJobType[job.jobType] || job.jobType}</Badge>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => openEditModal(job)}
                    style={{ padding: '4px', color: 'var(--text-secondary)', background: 'transparent' }}
                    title="Edit Job"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(job.id)}
                    style={{ padding: '4px', color: 'var(--error)', background: 'transparent' }}
                    title="Delete Job"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{job.title}</h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                {job.company} • {job.location || 'Remote'}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {Array.isArray(job.skills) && job.skills.map((s: string) => (
                  <span key={s} style={{ fontSize: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                    {s}
                  </span>
                ))}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'auto',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-primary)',
                fontSize: '11px',
                color: 'var(--text-tertiary)'
              }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <IndianRupee size={12} style={{ color: 'var(--success)' }} /> {job.salaryDisplay || 'Competitive'}
                </span>
                <span>
                  <strong>{job.applicantCount}</strong> candidates
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {showFormModal && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {editingJob ? '✏️ Edit Job Posting' : '💼 Post New Job'}
              </h2>
              <button onClick={() => setShowFormModal(false)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="label">Job Title *</label>
                  <input 
                    type="text" required placeholder="e.g. Senior React Developer" className="input"
                    value={title} onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="label">Company Name *</label>
                  <input 
                    type="text" required placeholder="e.g. Skillzy Inc" className="input"
                    value={company} onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="label">Location</label>
                  <input 
                    type="text" placeholder="e.g. Remote or Bangalore" className="input"
                    value={location} onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="label">Job Type</label>
                  <select 
                    className="input select" value={jobType} onChange={(e) => setJobType(e.target.value)}
                  >
                    <option value="full_time">Full-Time</option>
                    <option value="part_time">Part-Time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label className="label">Salary Range Display</label>
                  <input 
                    type="text" placeholder="e.g. ₹8-12 LPA" className="input"
                    value={salaryDisplay} onChange={(e) => setSalaryDisplay(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="label">Required Skills (Comma separated) *</label>
                <input 
                  type="text" required placeholder="React, Node.js, Python, PostgreSQL" className="input"
                  value={skillsStr} onChange={(e) => setSkillsStr(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="label">Job Description *</label>
                <textarea 
                  rows={4} required placeholder="Detailed role responsibilities..." className="input"
                  value={description} onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="label">Requirements / Qualifications</label>
                <textarea 
                  rows={3} placeholder="e.g. B.Tech CS, 1+ years experience..." className="input"
                  value={requirements} onChange={(e) => setRequirements(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingJob ? 'Update Posting' : 'Publish Job'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
