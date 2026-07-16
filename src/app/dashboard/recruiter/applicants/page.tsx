'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { Link as LinkIcon, Edit } from 'lucide-react';

function renderMarkdownReport(report: string) {
  if (!report) return <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No report content available.</p>;
  const lines = report.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', lineHeight: '1.6' }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('###')) {
          return (
            <h3 key={idx} style={{ 
              fontSize: '14px', 
              fontWeight: 800, 
              marginTop: '12px', 
              borderBottom: '1px solid #f1f5f9', 
              paddingBottom: '4px', 
              color: 'var(--text-primary)' 
            }}>
              {trimmed.replace('###', '').trim()}
            </h3>
          );
        }
        if (trimmed.startsWith('####')) {
          return (
            <h4 key={idx} style={{ 
              fontSize: '12px', 
              fontWeight: 700, 
              marginTop: '8px', 
              color: '#4f46e5' 
            }}>
              {trimmed.replace('####', '').trim()}
            </h4>
          );
        }
        if (trimmed.startsWith('**Match Score**') || trimmed.startsWith('**Fit Recommendation**')) {
          return (
            <div key={idx} style={{ 
              background: 'rgba(99, 102, 241, 0.04)', 
              borderLeft: '3px solid #6366f1', 
              padding: '6px 12px', 
              borderRadius: '0 8px 8px 0', 
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '4px 0'
            }}>
              {trimmed.replace(/\*\*/g, '').trim()}
            </div>
          );
        }
        if (trimmed.startsWith('💬') || trimmed.startsWith('👤')) {
          const isAi = trimmed.startsWith('💬');
          return (
            <div key={idx} style={{
              padding: '8px 12px', 
              borderRadius: '8px', 
              fontSize: '11px',
              background: isAi ? 'rgba(99, 102, 241, 0.04)' : '#f8fafc',
              border: isAi ? '1px solid rgba(99, 102, 241, 0.08)' : '1px solid #e2e8f0',
              marginLeft: isAi ? '0' : '16px',
              maxWidth: '90%',
              lineHeight: '1.4'
            }}>
              {trimmed}
            </div>
          );
        }
        if (trimmed.startsWith('*')) {
          return (
            <li key={idx} style={{ 
              fontSize: '11px', 
              color: 'var(--text-secondary)', 
              marginLeft: '12px',
              listStyleType: 'disc'
            }}>
              {trimmed.substring(1).trim()}
            </li>
          );
        }
        if (!trimmed) return <div key={idx} style={{ height: '4px' }} />;
        return <p key={idx} style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>{trimmed}</p>;
      })}
    </div>
  );
}

export default function RecruiterApplicants() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Screening action states
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [viewingReportApp, setViewingReportApp] = useState<any | null>(null);
  const [screenedApps, setScreenedApps] = useState<Record<string, boolean>>({});

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

  const handleRunAiScreen = async (appId: string) => {
    try {
      setScreeningId(appId);
      const res = await fetch(`/api/jobs/applications/${appId}/ai-screen`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to screen candidate');
      toast.success('AI Screening evaluation complete!');
      await fetchApplicants();
      setScreenedApps(prev => ({ ...prev, [appId]: true }));
      // Auto-open report modal for the newly screened application
      setViewingReportApp(data.application);
    } catch (err: any) {
      toast.error(err.message || 'Error running AI screening');
    } finally {
      setScreeningId(null);
    }
  };

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
        screenedApps[item.id] && item.matchScore !== null && item.matchScore !== undefined ? (
          <span style={{
            fontWeight: 700,
            color: item.matchScore >= 90 ? 'var(--success)' : item.matchScore >= 80 ? 'var(--accent-primary-hover)' : 'var(--warning)'
          }}>
            {item.matchScore}%
          </span>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
            Not Screened
          </span>
        )
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
      header: 'AI Evaluation',
      accessor: (item: any) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {screeningId === item.id ? (
            <span style={{ fontSize: '10.5px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%', border: '1.5px solid var(--accent-primary)',
                borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite'
              }} /> Screening...
            </span>
          ) : (screenedApps[item.id] && item.matchScore !== null && item.matchScore !== undefined) ? (
            <button
              onClick={() => setViewingReportApp(item)}
              className="btn btn-sm"
              style={{
                padding: '3px 8px', fontSize: '10.5px', background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)', color: '#4f46e5', fontWeight: 600,
                borderRadius: '6px'
              }}
            >
              👁 View Report
            </button>
          ) : (
            <button
              onClick={() => handleRunAiScreen(item.id)}
              className="btn btn-sm"
              style={{
                padding: '3px 8px', fontSize: '10.5px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none', color: '#ffffff', fontWeight: 700, borderRadius: '6px', cursor: 'pointer'
              }}
            >
              🤖 Screen Resume
            </button>
          )}
        </div>
      )
    },
    {
      header: 'Pipeline Actions',
      accessor: (item: any) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {(item.status === 'applied' || item.status === 'rejected') && (
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
          {item.status !== 'hired' && (
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

      {/* AI Screening Report Modal */}
      {viewingReportApp && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)', padding: '16px'
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column',
            gap: '20px', background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '32px',
            boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  🤖 AI Candidate Evaluation Report
                </h2>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Candidate: {viewingReportApp.user.firstName} {viewingReportApp.user.lastName} • Job: {viewingReportApp.job.title}
                </p>
              </div>
              <button 
                onClick={() => setViewingReportApp(null)}
                style={{
                  border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer',
                  color: 'var(--text-tertiary)'
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {renderMarkdownReport(viewingReportApp.recruiterNotes || '')}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <Button type="button" onClick={() => setViewingReportApp(null)}>Close Report</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

