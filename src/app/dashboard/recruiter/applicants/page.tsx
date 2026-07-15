'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { Link as LinkIcon, Edit } from 'lucide-react';

export default function RecruiterApplicants() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Notes Modal state
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [noteText, setNoteText] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs/applications');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch applicants');
      setApplicants(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchApplicants();
    });
  }, []);

  const openStatusModal = (app: any, status: string) => {
    setSelectedApp(app);
    setNewStatus(status);
    setNoteText(app.recruiterNotes || '');
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/jobs/applications/${selectedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          recruiterNotes: noteText.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update application');

      toast.success(`Candidate status updated to ${newStatus}`);
      setSelectedApp(null);
      await fetchApplicants();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { 
      header: 'Applicant', 
      accessor: (item: any) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {item.user.firstName} {item.user.lastName}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{item.user.email}</div>
        </div>
      )
    },
    { header: 'Target Job', accessor: (item: any) => item.job.title },
    {
      header: 'Match Score',
      accessor: (item: any) => (
        <span style={{
          fontWeight: 700,
          color: (item.matchScore || 85) >= 90 ? 'var(--success)' : (item.matchScore || 85) >= 80 ? 'var(--accent-primary-hover)' : 'var(--warning)'
        }}>
          {item.matchScore || 85}%
        </span>
      )
    },
    { 
      header: 'Pitch/Cover Letter', 
      accessor: (item: any) => (
        <div style={{ maxWidth: '240px', fontSize: '11px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.coverLetter}>
          {item.coverLetter || 'No cover letter'}
        </div>
      )
    },
    { 
      header: 'Documents', 
      accessor: (item: any) => (
        item.resumeUrl ? (
          <a 
            href={item.resumeUrl} 
            target="_blank" 
            rel="noreferrer" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-primary-hover)', fontWeight: 600 }}
          >
            <LinkIcon size={12} /> Resume
          </a>
        ) : <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>N/A</span>
      )
    },
    {
      header: 'Status',
      accessor: (item: any) => (
        <Badge variant={
          item.status === 'hired' ? 'success' :
          item.status === 'interviewing' ? 'info' :
          item.status === 'shortlisted' ? 'primary' :
          item.status === 'rejected' ? 'error' : 'warning'
        }>
          {item.status}
        </Badge>
      )
    },
    {
      header: 'Pipeline Actions',
      accessor: (item: any) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {item.status === 'applied' && (
            <button
              onClick={() => openStatusModal(item, 'shortlisted')}
              className="btn btn-primary btn-sm"
              style={{ padding: '2px 8px', fontSize: '10px' }}
            >
              Shortlist
            </button>
          )}
          {item.status === 'shortlisted' && (
            <button
              onClick={() => openStatusModal(item, 'interviewing')}
              className="btn btn-outline btn-sm"
              style={{ padding: '2px 8px', fontSize: '10px' }}
            >
              Interview
            </button>
          )}
          {item.status === 'interviewing' && (
            <button
              onClick={() => openStatusModal(item, 'hired')}
              className="btn btn-success btn-sm"
              style={{ padding: '2px 8px', fontSize: '10px', background: 'var(--success)', border: 'none', color: '#fff' }}
            >
              Hire
            </button>
          )}
          {item.status !== 'hired' && item.status !== 'rejected' && (
            <button
              onClick={() => openStatusModal(item, 'rejected')}
              className="btn btn-danger btn-sm"
              style={{ padding: '2px 8px', fontSize: '10px' }}
            >
              Reject
            </button>
          )}
          {(item.status === 'hired' || item.status === 'rejected') && (
            <button
              onClick={() => openStatusModal(item, item.status)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '2px', color: 'var(--text-tertiary)' }}
              title="Edit Note"
            >
              <Edit size={12} /> Note
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">👥 Candidate Pipeline</h1>
        <p className="page-subtitle">Track, filter, and schedule interview actions for job applicants.</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'var(--text-secondary)' }}>
          Loading candidate applications...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={applicants}
          emptyMessage="No applicants found. Candidates will appear here once they apply to your jobs."
        />
      )}

      {/* Recruiter Notes / Status Confirmation Modal */}
      {selectedApp && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)', padding: '16px'
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column',
            gap: '20px', background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '32px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Pipeline Action: {newStatus.toUpperCase()}
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Updating {selectedApp.user.firstName} {selectedApp.user.lastName} for {selectedApp.job.title}.
              </p>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="label">Recruiter Feedback / Evaluation Notes</label>
                <textarea 
                  rows={4}
                  placeholder="Add private evaluation feedback or next-step scheduling instructions for the candidate..."
                  className="input"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <Button type="button" variant="outline" onClick={() => setSelectedApp(null)}>Cancel</Button>
                <Button type="submit" disabled={updating}>
                  {updating ? 'Updating Candidate...' : 'Confirm Action'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
