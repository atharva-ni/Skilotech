'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Heart, Trash2, Send, CornerDownRight, MessageCircle,
  Bookmark, MoreHorizontal, Camera, Code, Plus, X,
  CheckCircle2, MessageSquare
} from 'lucide-react';
import styles from './page.module.css';

// ---- Utilities ----

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const s = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const dd = Math.floor(h / 24);
  if (dd === 1) return 'yesterday';
  if (dd < 7) return `${dd}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function avatarColor(name: string): string {
  const c = ['#000', '#ef4444', '#f97316', '#8b5cf6', '#06b6d4', '#10b981', '#6366f1', '#ec4899'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return c[Math.abs(h) % c.length];
}

const POST_TYPES = [
  { value: 'discussion', label: 'Discussion' },
  { value: 'question', label: 'Question' },
  { value: 'project', label: 'Project' },
  { value: 'announcement', label: 'Announce' },
] as const;

type PostType = typeof POST_TYPES[number]['value'];

function deriveType(tags: string[]): PostType {
  if (tags.includes('question')) return 'question';
  if (tags.includes('project') || tags.includes('project-showcase')) return 'project';
  if (tags.includes('announcement')) return 'announcement';
  return 'discussion';
}

function badgeClass(t: PostType) {
  const m: Record<PostType, string> = {
    question: styles.badgeQuestion,
    discussion: styles.badgeDiscussion,
    project: styles.badgeProject,
    announcement: styles.badgeAnnouncement,
  };
  return m[t];
}

// Function to render post body with support for code blocks and inline uploaded images
function renderPostBody(text: string) {
  if (!text) return null;

  // Extract base64 image markdown tags
  const imageRegex = /!\[.*?\]\((data:image\/.*?)\)/g;
  const images: string[] = [];
  let match;
  while ((match = imageRegex.exec(text)) !== null) {
    images.push(match[1]);
  }

  // Clean out the image markdown syntax so it is not rendered as text
  const textWithoutImages = text.replace(imageRegex, '').trim();

  // Split content by code blocks: ```[lang]\n[code]```
  const parts = textWithoutImages.split(/(```[\s\S]*?```)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const rawCode = part.slice(3, -3).trim();
          const lines = rawCode.split('\n');
          let lang = 'code';
          let code = rawCode;
          if (lines[0] && !lines[0].includes(' ') && lines[0].length < 15) {
            lang = lines[0];
            code = lines.slice(1).join('\n');
          }
          return (
            <div key={i} className={styles.codeBlockWrapper}>
              <div className={styles.codeBlockHeader}>{lang}</div>
              <pre className={styles.codeBlock}>
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        return part.split('\n').map((line, idx) => (
          <p key={`${i}-${idx}`} className={styles.rowBody} style={{ margin: line ? '0 0 6px 0' : '8px 0' }}>
            {line}
          </p>
        ));
      })}

      {/* Render attachments */}
      {images.map((imgSrc, idx) => (
        <img key={idx} src={imgSrc} alt="Post attachment" className={styles.postImage} />
      ))}
    </>
  );
}

// ---- Component ----

export default function Community() {
  const { user } = useAuth();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer States
  const [newContent, setNewContent] = useState('');
  const [newTopic, setNewTopic] = useState('general');
  const [newType, setNewType] = useState<PostType>('discussion');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeCategory, setActiveCategory] = useState('All');

  // Comments / Replies states
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replyPosting, setReplyPosting] = useState<Record<string, boolean>>({});

  const [solved, setSolved] = useState<Set<string>>(new Set());

  // ---- API ----

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const r = await fetch('/api/community/posts');
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setPosts(Array.isArray(d) ? d : []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const insertCodeTemplate = () => {
    setNewContent(prev => prev + '\n```javascript\n// Write your code here\n```\n');
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    // Extract hashtags from the content automatically (#topic format)
    const hashTags = newContent.match(/#\w+/g)?.map(t => t.slice(1).toLowerCase()) || [];
    const baseTags = newTopic.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    const combinedTags = [...new Set([...baseTags, ...hashTags])];

    const tags = newType !== 'discussion' 
      ? [...new Set([...combinedTags, newType])] 
      : combinedTags.length ? combinedTags : ['general'];

    // Append image as markdown attachment if present
    let finalContent = newContent.trim();
    if (imagePreview) {
      finalContent += `\n\n![Uploaded Image](${imagePreview})`;
    }

    try {
      setPosting(true);
      const r = await fetch('/api/community/posts', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: finalContent, tags })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      
      toast.success('Posted to Community Hub!');
      setNewContent(''); 
      setNewTopic('general'); 
      setNewType('discussion'); 
      setImagePreview(null);
      setComposerOpen(false);
      await fetchPosts();
    } catch (e: any) { 
      toast.error(e.message); 
    } finally { 
      setPosting(false); 
    }
  };

  const like = async (id: string) => {
    setPosts(ps => ps.map(p => {
      if (p.id !== id) return p;
      const liked = p.likes.some((l: any) => l.userId === user?.id);
      return {
        ...p,
        likesCount: liked ? p.likesCount - 1 : p.likesCount + 1,
        likes: liked ? p.likes.filter((l: any) => l.userId !== user?.id) : [...p.likes, { userId: user?.id }]
      };
    }));
    try {
      const r = await fetch(`/api/community/posts/${id}`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like' })
      });
      if (!r.ok) fetchPosts();
    } catch { 
      fetchPosts(); 
    }
  };

  const fetchComments = async (id: string) => {
    try {
      setLoadingComments(p => ({ ...p, [id]: true }));
      const r = await fetch(`/api/community/posts/${id}/comments`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setComments(p => ({ ...p, [id]: Array.isArray(d) ? d : [] }));
    } catch (e: any) { 
      toast.error(e.message); 
    } finally { 
      setLoadingComments(p => ({ ...p, [id]: false })); 
    }
  };

  const toggleComments = async (id: string) => {
    if (openComments === id) { setOpenComments(null); return; }
    setOpenComments(id);
    await fetchComments(id);
  };

  const addComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = replyText[postId] || '';
    if (!text.trim()) return;
    try {
      setReplyPosting(p => ({ ...p, [postId]: true }));
      const r = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim() })
      });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      setReplyText(p => ({ ...p, [postId]: '' }));
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      await fetchComments(postId);
    } catch (e: any) { 
      toast.error(e.message); 
    } finally { 
      setReplyPosting(p => ({ ...p, [postId]: false })); 
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      const r = await fetch(`/api/community/posts/${id}`, { method: 'DELETE' });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      toast.success('Deleted'); 
      fetchPosts();
    } catch (e: any) { 
      toast.error(e.message); 
    }
  };

  const deleteComment = async (cId: string, pId: string) => {
    if (!confirm('Delete this reply?')) return;
    try {
      const r = await fetch(`/api/community/comments/${cId}`, { method: 'DELETE' });
      if (!r.ok) { const d = await r.json(); throw new Error(d.error); }
      setPosts(ps => ps.map(p => p.id === pId ? { ...p, commentsCount: Math.max(0, p.commentsCount - 1) } : p));
      fetchComments(pId);
    } catch (e: any) { 
      toast.error(e.message); 
    }
  };

  // ---- Derived ----

  const tagCounts: Record<string, number> = {};
  const typeFilter = ['question', 'project', 'project-showcase', 'announcement'];
  posts.forEach(p => {
    (Array.isArray(p.tags) ? p.tags : []).forEach((t: string) => {
      if (!typeFilter.includes(t)) tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  const categories = [
    { label: 'All', count: posts.length },
    ...sortedTags.map(([tag, count]) => ({ label: tag, count }))
  ];

  const filtered = posts.filter(p =>
    activeCategory === 'All' || (Array.isArray(p.tags) && p.tags.includes(activeCategory))
  );

  if (!user) return null;

  const userName = user.name || 'Student';
  const userInitial = userName.charAt(0).toUpperCase();
  const topics = ['general', 'placements', 'coding-help', 'projects', 'resources', 'off-topic'];

  const hasAvatarImg = user.avatar && (user.avatar.startsWith('http') || user.avatar.startsWith('/'));

  return (
    <div className={styles.container}>
      {/* ======== Feed ======== */}
      <div>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Community</h1>
            <button className={styles.newPostBtn} onClick={() => setComposerOpen(true)}>
              <Plus size={14} /> New Post
            </button>
          </div>
          <p className={styles.pageSubtitle}>
            Ask questions, share projects and help others learn.
          </p>
        </div>

        {/* Category tabs */}
        <div className={styles.categoryTabs}>
          {categories.map(c => (
            <button
              key={c.label}
              className={`${styles.categoryTab} ${activeCategory === c.label ? styles.categoryTabActive : ''}`}
              onClick={() => setActiveCategory(c.label)}
            >
              {c.label === 'All' ? '💬' : '#'} {c.label}
              <span className={styles.tabCount}>{c.count}</span>
            </button>
          ))}
        </div>

        {/* Composer */}
        {!composerOpen ? (
          <div className={styles.composer} onClick={() => setComposerOpen(true)}>
            <div className={styles.composerAvatar} style={{ background: avatarColor(userName) }}>
              {hasAvatarImg ? (
                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                userInitial
              )}
            </div>
            <span className={styles.composerPlaceholder}>Start a new discussion...</span>
          </div>
        ) : (
          <form onSubmit={createPost} className={styles.composerExpanded}>
            <div className={styles.composerExpandedTop}>
              <div className={styles.composerAvatar} style={{ background: avatarColor(userName) }}>
                {hasAvatarImg ? (
                  <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  userInitial
                )}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  className={styles.composerTextarea}
                  autoFocus
                  placeholder="What's on your mind? Type #react or #python to automatically tag topics!"
                  value={newContent}

                  onChange={e => setNewContent(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') setComposerOpen(false); }}
                />
                
                {/* Image upload preview */}
                {imagePreview && (
                  <div className={styles.composerImagePreviewContainer}>
                    <img src={imagePreview} className={styles.composerImagePreview} alt="upload preview" />
                    <button type="button" className={styles.composerImageRemoveBtn} onClick={() => setImagePreview(null)}>
                      <X size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.composerToolbar}>
              <div className={styles.toolbarLeft}>
                {POST_TYPES.map(pt => (
                  <button
                    key={pt.value} type="button"
                    className={`${styles.typePill} ${newType === pt.value ? styles.typePillActive : ''}`}
                    onClick={() => setNewType(pt.value)}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
              <div className={styles.toolbarRight}>
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <button type="button" className={styles.iconBtn} onClick={() => fileInputRef.current?.click()} title="Upload Image">
                  <Camera size={13} />
                </button>
                <button type="button" className={styles.iconBtn} onClick={insertCodeTemplate} title="Insert Code Snippet">
                  <Code size={13} />
                </button>
                <select className={styles.topicSelect} value={newTopic} onChange={e => setNewTopic(e.target.value)}>
                  {topics.map(t => <option key={t} value={t}>#{t}</option>)}
                </select>
                <button type="submit" className={styles.postBtn} disabled={posting || !newContent.trim()}>
                  {posting ? '...' : 'Post'}
                </button>
              </div>
            </div>
            <span className={styles.composerTip}>
              💡 Tip: Type `#react` or `#python` in your text to automatically tag your post!
            </span>
          </form>
        )}

        {/* Discussion rows */}
        {loading ? (
          <div className={styles.loadingState}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <h3 className={styles.emptyTitle}>No discussions yet</h3>
            <p className={styles.emptyText}>Start the conversation!</p>
          </div>
        ) : (
          <div className={styles.discussionList}>
            {filtered.map(post => {
              const liked = post.likes?.some((l: any) => l.userId === user?.id);
              const commOpen = openComments === post.id;
              const canDelete = post.authorId === user?.id || user?.role === 'admin' || (user?.role as string) === 'super_admin';
              const name = `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || 'Student';
              const type = deriveType(Array.isArray(post.tags) ? post.tags : []);
              const isSolved = solved.has(post.id);
              
              // Handle first line as title
              const lines = post.content.split('\n');
              const title = lines[0];
              const body = lines.length > 1 ? lines.slice(1).join('\n').trim() : '';
              
              const displayTags = (Array.isArray(post.tags) ? post.tags : []).filter((t: string) => !typeFilter.includes(t));

              return (
                <div key={post.id} id={`post-${post.id}`} className={styles.discussionRow}>
                  {/* Avatar */}
                  <div className={styles.rowAvatar} style={{ background: avatarColor(name) }}>
                    {post.author.avatarUrl ? (
                      <img src={post.author.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (post.author.firstName?.charAt(0) || '?')}
                  </div>

                  {/* Main content */}
                  <div className={styles.rowMain}>
                    <div className={styles.rowTitleLine}>
                      <span className={`${styles.badge} ${badgeClass(type)}`}>{type}</span>
                      {isSolved && <span className={styles.solvedBadge}><CheckCircle2 size={9} /> Solved</span>}
                      <h3 className={styles.rowTitle}>{title}</h3>
                    </div>

                    {body && (
                      <div style={{ marginTop: '4px' }}>
                        {renderPostBody(body)}
                      </div>
                    )}

                    {displayTags.length > 0 && (
                      <div className={styles.rowTags}>
                        {displayTags.map((tag: string) => (
                          <span key={tag} className={styles.rowTag} onClick={() => setActiveCategory(tag)}>#{tag}</span>
                        ))}
                      </div>
                    )}

                    <div className={styles.rowMeta}>
                      <span className={styles.rowMetaItem} style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {name}
                      </span>
                      <button className={`${styles.rowMetaBtn} ${liked ? styles.rowMetaBtnActive : ''}`} onClick={() => like(post.id)}>
                        <Heart size={12} fill={liked ? 'currentColor' : 'none'} /> {post.likesCount}
                      </button>
                      <button
                        className={`${styles.rowMetaBtn} ${commOpen ? styles.rowMetaBtnActive : ''}`}
                        onClick={() => toggleComments(post.id)}
                        style={commOpen ? { color: 'var(--text-primary)' } : {}}
                      >
                        <MessageCircle size={12} /> {post.commentsCount}
                      </button>
                    </div>

                    {/* Comments */}
                    {commOpen && (
                      <div className={styles.commentsPanel}>
                        <h5 className={styles.commentsTitle}>Replies</h5>
                        {loadingComments[post.id] ? (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</div>
                        ) : !comments[post.id]?.length ? (
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', padding: '8px 0' }}>
                            No replies yet
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {comments[post.id].map((c: any) => (
                              <div key={c.id} className={styles.commentItem}>
                                <CornerDownRight size={11} style={{ color: 'var(--text-muted)', marginTop: '10px', flexShrink: 0 }} />
                                <div className={styles.commentBody}>
                                  <div className={styles.commentMeta}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span className={styles.commentAuthor}>{c.author.firstName} {c.author.lastName}</span>
                                      <span className={styles.commentDate}>{timeAgo(c.createdAt)}</span>
                                    </div>
                                    {(c.authorId === user?.id || user?.role === 'admin' || (user?.role as string) === 'super_admin') && (
                                      <button className={styles.commentDeleteBtn} onClick={() => deleteComment(c.id, post.id)}>
                                        <Trash2 size={10} />
                                      </button>
                                    )}
                                  </div>
                                  <p className={styles.commentText}>{c.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <form onSubmit={e => addComment(post.id, e)} className={styles.replyForm}>
                          <input
                            type="text" required placeholder="Write a reply..."
                            className={styles.replyInput}
                            value={replyText[post.id] || ''}
                            onChange={e => setReplyText(p => ({ ...p, [post.id]: e.target.value }))}
                          />
                          <button type="submit" disabled={replyPosting[post.id]} className={styles.replySubmitBtn}>
                            <Send size={11} />
                          </button>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Right side: time + actions */}
                  <div className={styles.rowRight}>
                    <span className={styles.rowTime}>{timeAgo(post.createdAt)}</span>
                    <div className={styles.rowActions}>
                      {type === 'question' && post.authorId === user?.id && (
                        <button
                          className={styles.rowActionBtn}
                          onClick={() => setSolved(p => { const n = new Set(p); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n; })}
                          title={isSolved ? 'Unmark solved' : 'Mark solved'}
                          style={isSolved ? { color: '#10b981' } : {}}
                        >
                          <CheckCircle2 size={13} />
                        </button>
                      )}
                      <button className={styles.rowActionBtn} title="Bookmark"><Bookmark size={13} /></button>
                      {canDelete ? (
                        <button className={styles.rowActionBtn} onClick={() => deletePost(post.id)} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        <button className={styles.rowActionBtn} title="More"><MoreHorizontal size={13} /></button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ======== Sidebar ======== */}
      <div className={styles.sidebar}>
        {/* About */}
        <div className={styles.sidebarCard}>
          <h3 className={styles.sidebarTitle}>About</h3>
          <p className={styles.aboutText}>
            Connect with students, mentors and recruiters. Ask questions, share projects, and help others learn.
          </p>
          <div className={styles.aboutStats}>
            <div className={styles.aboutStatRow}>
              <span className={styles.aboutStatLabel}>Posts</span>
              <span className={styles.aboutStatValue}>{posts.length}</span>
            </div>
            <div className={styles.aboutStatRow}>
              <span className={styles.aboutStatLabel}>Topics</span>
              <span className={styles.aboutStatValue}>{sortedTags.length}</span>
            </div>
            <div className={styles.aboutStatRow}>
              <span className={styles.aboutStatLabel}>Members</span>
              <span className={styles.aboutStatValue}>{new Set(posts.map(p => p.authorId)).size}</span>
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className={styles.sidebarCard}>
          <h3 className={styles.sidebarTitle}>Topics</h3>
          <div className={styles.topicsList}>
            {sortedTags.slice(0, 8).map(([tag, count]) => (
              <button
                key={tag}
                className={`${styles.topicItem} ${activeCategory === tag ? styles.topicItemActive : ''}`}
                onClick={() => setActiveCategory(tag)}
              >
                <span className={styles.topicName}>
                  <span className={styles.topicHash}>#</span> {tag}
                </span>
                <span className={styles.topicCount}>{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
