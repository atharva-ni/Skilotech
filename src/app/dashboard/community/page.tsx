'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { 
  Heart, Trash2, Send, CornerDownRight, Hash, MessageCircle
} from 'lucide-react';

export default function Community() {
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create post states
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState('general');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [selectedTag, setSelectedTag] = useState('All');

  // Comments / Replies states
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/community/posts');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch posts');
      setPosts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchPosts();
    });
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const tags = newPostTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    try {
      setSubmittingPost(true);
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent.trim(),
          tags: tags.length > 0 ? tags : ['general']
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit post');

      toast.success('Post published to Community Hub!');
      setNewPostContent('');
      setNewPostTags('general');
      await fetchPosts();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLike = async (postId: string) => {
    // Optimistic UI updates
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const userLiked = post.likes.some((l: any) => l.userId === user?.id);
        const newLikes = userLiked
          ? post.likes.filter((l: any) => l.userId !== user?.id)
          : [...post.likes, { userId: user?.id }];
        
        return {
          ...post,
          likesCount: userLiked ? post.likesCount - 1 : post.likesCount + 1,
          likes: newLikes
        };
      }
      return post;
    });
    setPosts(updatedPosts);

    try {
      const res = await fetch(`/api/community/posts/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch {
      // Revert fetch on error
      fetchPosts();
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      setCommentsLoading(prev => ({ ...prev, [postId]: true }));
      const res = await fetch(`/api/community/posts/${postId}/comments`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load comments');
      setPostComments(prev => ({ ...prev, [postId]: Array.isArray(data) ? data : [] }));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCommentsLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = async (postId: string) => {
    if (expandedCommentsPostId === postId) {
      setExpandedCommentsPostId(null);
    } else {
      setExpandedCommentsPostId(postId);
      await fetchComments(postId);
    }
  };

  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = newCommentText[postId] || '';
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(prev => ({ ...prev, [postId]: true }));
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit comment');

      setNewCommentText(prev => ({ ...prev, [postId]: '' }));
      toast.success('Reply submitted');
      
      // Update local comment count
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      await fetchComments(postId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await fetch(`/api/community/posts/${postId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete post');

      toast.success('Post deleted successfully');
      await fetchPosts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteComment = async (commentId: string, postId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await fetch(`/api/community/comments/${commentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete comment');

      toast.success('Comment deleted successfully');
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p));
      await fetchComments(postId);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Generate unique list of tags from active posts for sidebar filters
  const allTags = Array.from(
    new Set(posts.flatMap((p) => (Array.isArray(p.tags) ? p.tags : [])))
  );

  const filteredPosts = posts.filter(
    (post) => selectedTag === 'All' || (Array.isArray(post.tags) && post.tags.includes(selectedTag))
  );

  return (
    <div className="page-container" style={{ display: 'grid', gridTemplateColumns: '3.2fr 1.2fr', gap: '24px' }}>
      {/* Feed Area */}
      <div>
        <div className="page-header">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            💬 Community Hub
          </h1>
          <p className="page-subtitle">Connect, discuss, and share insights with fellow students, recruiters, and mentors.</p>
        </div>

        {/* Create Post Card */}
        <div className="card" style={{ marginBottom: '24px', background: '#ffffff', border: '1px solid var(--border-primary)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <form onSubmit={handleCreatePost}>
            <textarea
              className="input"
              required
              placeholder="Share what is on your mind... (supports announcements, questions, or ideas)"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              style={{ minHeight: '90px', resize: 'vertical', marginBottom: '12px' }}
            />
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hash size={14} style={{ color: 'var(--text-tertiary)' }} />
                <input 
                  type="text"
                  placeholder="Tags (comma-separated, e.g. python, career)"
                  className="input"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  style={{ width: '240px', padding: '4px 8px', fontSize: '11px', height: '30px' }}
                />
              </div>

              <Button type="submit" size="sm" disabled={submittingPost}>
                {submittingPost ? 'Publishing...' : 'Post to Community'}
              </Button>
            </div>
          </form>
        </div>

        {/* Posts List */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', color: 'var(--text-secondary)' }}>
            Loading community feed...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)', background: '#ffffff', border: '1px solid var(--border-primary)' }}>
            <span style={{ fontSize: '3rem' }}>📣</span>
            <h3 style={{ color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>No posts found</h3>
            <p>Be the first to start a conversation in the community!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredPosts.map((post) => {
              const userHasLiked = post.likes?.some((l: any) => l.userId === user?.id);
              const isCommentsOpen = expandedCommentsPostId === post.id;
              
              const canDeletePost = 
                post.authorId === user?.id || 
                user?.role === 'admin' || 
                (user?.role as string) === 'super_admin';

              return (
                <div 
                  key={post.id} 
                  className="card animate-fade-in-up" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    background: '#ffffff',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-premium)'
                  }}
                >
                  {/* Post Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'rgba(99,102,241,0.06)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                        fontWeight: 700, color: 'var(--accent-primary)'
                      }}>
                        {post.author.avatarUrl ? (
                          <img src={post.author.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          post.author.firstName?.charAt(0) || '🎓'
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {post.author.firstName} {post.author.lastName}
                          {post.author.role === 'admin' && <Badge variant="error">Admin</Badge>}
                          {post.author.role === 'instructor' && <Badge variant="primary">Instructor</Badge>}
                          {post.author.role === 'recruiter' && <Badge variant="info">Recruiter</Badge>}
                        </h4>
                        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          {new Date(post.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {canDeletePost && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        style={{ padding: '6px', color: 'var(--error)', background: 'transparent', cursor: 'pointer' }}
                        title="Delete Post"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {post.content}
                  </p>

                  {/* Post Tags */}
                  {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {post.tags.map((tag: string) => (
                        <span
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          style={{
                            fontSize: '10px',
                            color: 'var(--accent-primary-hover)',
                            background: 'rgba(99, 102, 241, 0.05)',
                            border: '1px solid rgba(99, 102, 241, 0.1)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Post Actions Bar */}
                  <div style={{
                    display: 'flex', gap: '24px', paddingTop: '12px',
                    borderTop: '1px solid var(--border-primary)', fontSize: '11px',
                    color: 'var(--text-secondary)', marginTop: '4px'
                  }}>
                    <button
                      onClick={() => handleLike(post.id)}
                      style={{ 
                        background: 'transparent', display: 'flex', alignItems: 'center', gap: '6px', 
                        color: userHasLiked ? '#ef4444' : 'inherit', cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      <Heart size={14} fill={userHasLiked ? 'currentColor' : 'none'} /> {post.likesCount} Likes
                    </button>
                    
                    <button
                      onClick={() => toggleComments(post.id)}
                      style={{ 
                        background: 'transparent', display: 'flex', alignItems: 'center', gap: '6px', 
                        color: isCommentsOpen ? 'var(--accent-primary)' : 'inherit', cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      <MessageCircle size={14} /> {post.commentsCount} Comments
                    </button>
                  </div>

                  {/* Expanded Comments Panel */}
                  {isCommentsOpen && (
                    <div style={{ 
                      marginTop: '8px', padding: '16px', background: 'var(--bg-primary)', 
                      borderRadius: '8px', border: '1px solid var(--border-primary)',
                      display: 'flex', flexDirection: 'column', gap: '14px'
                    }}>
                      <h5 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-secondary)', paddingBottom: '6px' }}>
                        Replies
                      </h5>

                      {commentsLoading[post.id] ? (
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                          Loading replies...
                        </div>
                      ) : !postComments[post.id] || postComments[post.id].length === 0 ? (
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', fontStyle: 'italic' }}>
                          No replies yet. Be the first to share your thoughts.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {postComments[post.id].map((comment) => {
                            const canDeleteComment = 
                              comment.authorId === user?.id || 
                              (user?.role as string) === 'admin' || 
                              (user?.role as string) === 'super_admin';

                            return (
                              <div key={comment.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <CornerDownRight size={14} style={{ color: 'var(--text-tertiary)', marginTop: '4px', flexShrink: 0 }} />
                                
                                <div style={{ 
                                  flex: 1, padding: '10px 12px', background: '#ffffff', 
                                  border: '1px solid var(--border-primary)', borderRadius: '6px' 
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <strong style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
                                        {comment.author.firstName} {comment.author.lastName}
                                      </strong>
                                      <span style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>

                                    {canDeleteComment && (
                                      <button
                                        onClick={() => handleDeleteComment(comment.id, post.id)}
                                        style={{ padding: '2px', color: 'var(--error)', background: 'transparent', cursor: 'pointer' }}
                                        title="Delete Comment"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    )}
                                  </div>
                                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Reply submit form */}
                      <form 
                        onSubmit={(e) => handleAddComment(post.id, e)} 
                        style={{ display: 'flex', gap: '8px', marginTop: '4px' }}
                      >
                        <input
                          type="text"
                          required
                          placeholder="Write a reply..."
                          className="input"
                          value={newCommentText[post.id] || ''}
                          onChange={(e) => setNewCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                          style={{ flex: 1, padding: '6px 10px', fontSize: '11px', height: '32px' }}
                        />
                        <button
                          type="submit"
                          disabled={submittingComment[post.id]}
                          className="btn btn-primary"
                          style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                        >
                          <Send size={12} />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sidebar Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)', background: '#ffffff', border: '1px solid var(--border-primary)', padding: '20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-premium)' }}>
          <h3 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', color: 'var(--text-primary)' }}>
            Filter by Topic
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={() => setSelectedTag('All')}
              className={`btn ${selectedTag === 'All' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '11px', borderRadius: '6px' }}
            >
              # All Discussions
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`btn ${selectedTag === tag ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', padding: '8px 12px', fontSize: '11px', borderRadius: '6px' }}
              >
                # {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
