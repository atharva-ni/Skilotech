'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Editor from '@monaco-editor/react';
import { toast } from 'sonner';
import { 
  BookOpen, Folder, FileText, Video, Code, Plus, Trash2, ArrowUp, ArrowDown, 
  ChevronRight, ChevronDown, Save, Eye, ArrowLeft, Loader2, CheckCircle2, AlertCircle, X, Menu, ClipboardList
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';

// Inline form mini-component for sidebar (defined outside CourseEditor to prevent focus loss)
interface InlineCreateFormProps {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

const InlineCreateForm = ({ placeholder, value, onChange, onConfirm, onCancel, inputRef }: InlineCreateFormProps) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px',
    background: 'var(--bg-primary)',
    borderRadius: '6px',
    border: '1px solid var(--accent-primary)',
  }}>
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') onConfirm(); if (e.key === 'Escape') onCancel(); }}
      style={{
        flex: 1,
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: '11px',
        padding: '4px 6px',
        color: 'var(--text-primary)',
      }}
    />
    <button
      onClick={onConfirm}
      style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
    >
      <CheckCircle2 size={12} style={{ color: 'white' }} />
    </button>
    <button
      onClick={onCancel}
      style={{ background: 'transparent', border: 'none', padding: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
    >
      <X size={12} style={{ color: 'var(--text-tertiary)' }} />
    </button>
  </div>
);

export default function CourseEditor() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { user } = useAuth();

  // State Management
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Selected item in split pane
  // type can be 'course' | 'module' | 'lesson' | 'step'
  const [selectedNode, setSelectedNode] = useState<{ type: string; id: string }>({
    type: 'course',
    id: courseId
  });

  // Current active data for edit forms
  const [editCourse, setEditCourse] = useState<any>({});
  const [editModule, setEditModule] = useState<any>({});
  const [editLesson, setEditLesson] = useState<any>({});
  const [editStep, setEditStep] = useState<any>({});

  // Active sub-tab inside Coding Lab editor
  const [activeLabTab, setActiveLabTab] = useState<'instructions' | 'starter' | 'solution'>('instructions');

  // Collapsible tree state
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  // Inline creation forms
  const [inlineAddModule, setInlineAddModule] = useState(false);
  const [inlineAddModuleTitle, setInlineAddModuleTitle] = useState('');
  const [inlineAddLesson, setInlineAddLesson] = useState<string | null>(null); // moduleId or null
  const [inlineAddLessonTitle, setInlineAddLessonTitle] = useState('');
  const [inlineAddStep, setInlineAddStep] = useState<{ lessonId: string; type: 'text' | 'video' | 'lab' | 'assignment' } | null>(null);
  const [inlineAddStepTitle, setInlineAddStepTitle] = useState('');

  // Drag and drop states for modules
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  const [dragOverModuleId, setDragOverModuleId] = useState<string | null>(null);

  // Drag and drop states for lessons
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [dragOverLessonId, setDragOverLessonId] = useState<string | null>(null);

  // Refs for inline form auto-focus
  const moduleInputRef = useRef<HTMLInputElement>(null);
  const lessonInputRef = useRef<HTMLInputElement>(null);
  const stepInputRef = useRef<HTMLInputElement>(null);

  // Unsaved changes tracking
  const [savedSnapshot, setSavedSnapshot] = useState<string>('');
  const hasUnsavedChanges = useCallback(() => {
    let currentData = '';
    if (selectedNode.type === 'course') currentData = JSON.stringify(editCourse);
    else if (selectedNode.type === 'module') currentData = JSON.stringify(editModule);
    else if (selectedNode.type === 'lesson') currentData = JSON.stringify(editLesson);
    else if (selectedNode.type === 'step') currentData = JSON.stringify(editStep);
    return savedSnapshot !== '' && currentData !== savedSnapshot;
  }, [selectedNode, editCourse, editModule, editLesson, editStep, savedSnapshot]);

  const [isFormattingDescription, setIsFormattingDescription] = useState(false);
  const [isFormattingStep, setIsFormattingStep] = useState(false);

  const handleAiFormatDescription = async () => {
    if (!editCourse.description) {
      toast.error('Please enter some text in the description field first');
      return;
    }
    setIsFormattingDescription(true);
    try {
      const res = await fetch('/api/ai/format-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editCourse.description, type: 'description' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to format content');
      setEditCourse((prev: any) => ({ ...prev, description: data.formattedText }));
      toast.success('✨ Course description beautified with AI formatting!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to auto-format with AI');
    } finally {
      setIsFormattingDescription(false);
    }
  };

  const handleAiFormatStep = async () => {
    if (!editStep.textContent) {
      toast.error('Please enter some text in the content field first');
      return;
    }
    setIsFormattingStep(true);
    try {
      const res = await fetch('/api/ai/format-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editStep.textContent, type: 'lesson' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to format content');
      setEditStep((prev: any) => ({ ...prev, textContent: data.formattedText }));
      toast.success('✨ Lesson step text beautified with AI formatting!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to auto-format with AI');
    } finally {
      setIsFormattingStep(false);
    }
  };

  // Load course full curriculum tree and categories
  const fetchData = async () => {
    try {
      const [courseRes, catRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch('/api/categories')
      ]);

      if (!courseRes.ok) {
        throw new Error('Failed to load course details');
      }

      const courseData = await courseRes.json();
      setCourse(courseData);
      setModules(courseData.modules || []);
      
      // Seed course editor form
      setEditCourse({
        title: courseData.title || '',
        description: courseData.description || '',
        shortDescription: courseData.shortDescription || '',
        price: courseData.price ? Number(courseData.price) : 0,
        level: courseData.level || 'beginner',
        categoryId: courseData.categoryId || '',
        status: courseData.status || 'draft',
        isFree: courseData.isFree || false
      });

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }

      // Auto-expand all modules on first load
      if (courseData.modules) {
        setExpandedModules(new Set(courseData.modules.map((m: any) => m.id)));
        const lessonIds = new Set<string>();
        courseData.modules.forEach((m: any) => {
          (m.lessons || []).forEach((l: any) => lessonIds.add(l.id));
        });
        setExpandedLessons(lessonIds);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error loading course builder details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // Load editor data when selectedNode changes
  useEffect(() => {
    if (!course) return;

    if (selectedNode.type === 'course') {
      const data = {
        title: course.title || '',
        description: course.description || '',
        shortDescription: course.shortDescription || '',
        price: course.price ? Number(course.price) : 0,
        level: course.level || 'beginner',
        categoryId: course.categoryId || '',
        status: course.status || 'draft',
        isFree: course.isFree || false
      };
      setEditCourse(data);
      setSavedSnapshot(JSON.stringify(data));
    } else if (selectedNode.type === 'module') {
      const activeModule = modules.find(m => m.id === selectedNode.id);
      if (activeModule) {
        const data = {
          title: activeModule.title || '',
          description: activeModule.description || '',
          sortOrder: activeModule.sortOrder || 0,
          isFree: activeModule.isFree || false
        };
        setEditModule(data);
        setSavedSnapshot(JSON.stringify(data));
      }
    } else if (selectedNode.type === 'lesson') {
      // Find lesson inside modules
      let activeLesson: any = null;
      for (const m of modules) {
        const found = m.lessons?.find((l: any) => l.id === selectedNode.id);
        if (found) {
          activeLesson = found;
          break;
        }
      }
      if (activeLesson) {
        const data = {
          title: activeLesson.title || '',
          description: activeLesson.description || '',
          durationMins: activeLesson.durationMins || 0,
          isFree: activeLesson.isFree || false,
          moduleId: activeLesson.moduleId || ''
        };
        setEditLesson(data);
        setSavedSnapshot(JSON.stringify(data));
      }
    } else if (selectedNode.type === 'step') {
      // Find step inside lessons
      let activeStep: any = null;
      for (const m of modules) {
        for (const l of m.lessons || []) {
          const found = l.steps?.find((s: any) => s.id === selectedNode.id);
          if (found) {
            activeStep = found;
            break;
          }
        }
      }
      if (activeStep) {
        const data = {
          title: activeStep.title || '',
          stepType: activeStep.stepType || 'text',
          textContent: activeStep.textContent || '',
          videoUrl: activeStep.videoUrl || '',
          videoDurationSecs: activeStep.videoDurationSecs || 0,
          labLanguage: activeStep.labLanguage || 'javascript',
          labStarterCode: activeStep.labStarterCode || '',
          labSolutionCode: activeStep.labSolutionCode || '',
          labInstructions: activeStep.labInstructions || '',
          lessonId: activeStep.lessonId || '',
          attachmentUrl: activeStep.metadata?.attachmentUrl || '',
          attachmentName: activeStep.metadata?.attachmentName || ''
        };
        setEditStep(data);
        setSavedSnapshot(JSON.stringify(data));
      }
    }
  }, [selectedNode, modules, course]);

  // Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, editCourse, editModule, editLesson, editStep]);

  // Beforeunload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Auto-focus inline form inputs
  useEffect(() => {
    if (inlineAddModule && moduleInputRef.current) moduleInputRef.current.focus();
  }, [inlineAddModule]);
  useEffect(() => {
    if (inlineAddLesson && lessonInputRef.current) lessonInputRef.current.focus();
  }, [inlineAddLesson]);
  useEffect(() => {
    if (inlineAddStep && stepInputRef.current) stepInputRef.current.focus();
  }, [inlineAddStep]);

  // Toggle tree collapse
  const toggleModule = (modId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId);
      else next.add(modId);
      return next;
    });
  };

  const toggleLesson = (lesId: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lesId)) next.delete(lesId);
      else next.add(lesId);
      return next;
    });
  };

  // ----------------------------------------------------
  // Save Action Handlers
  // ----------------------------------------------------
  const handleSave = async () => {
    setSaving(true);
    let url = '';
    const method = 'PUT';
    let bodyData = {};

    if (selectedNode.type === 'course') {
      url = `/api/courses/${courseId}`;
      bodyData = editCourse;
    } else if (selectedNode.type === 'module') {
      url = `/api/modules/${selectedNode.id}`;
      bodyData = editModule;
    } else if (selectedNode.type === 'lesson') {
      url = `/api/lessons/${selectedNode.id}`;
      bodyData = editLesson;
    } else if (selectedNode.type === 'step') {
      url = `/api/steps/${selectedNode.id}`;
      bodyData = editStep;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save changes');

      toast.success('Changes saved successfully');
      // Update saved snapshot
      setSavedSnapshot(JSON.stringify(bodyData));
      await fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------
  // Add Curriculum Nodes (Module, Lesson, Step) - inline
  // ----------------------------------------------------
  const handleAddModule = async () => {
    const title = inlineAddModuleTitle.trim();
    if (!title) { toast.error('Module title is required'); return; }

    try {
      const res = await fetch(`/api/courses/${courseId}/curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'module',
          data: {
            title,
            sortOrder: modules.length + 1
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create module');

      toast.success('Module added');
      setInlineAddModule(false);
      setInlineAddModuleTitle('');
      setSelectedNode({ type: 'module', id: data.module.id });
      // Auto-expand new module
      setExpandedModules(prev => new Set(prev).add(data.module.id));
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error adding module');
    }
  };

  const handleAddLesson = async (moduleId: string, currentLessonsCount: number) => {
    const title = inlineAddLessonTitle.trim();
    if (!title) { toast.error('Lesson title is required'); return; }

    try {
      const res = await fetch(`/api/courses/${courseId}/curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lesson',
          data: {
            title,
            moduleId,
            sortOrder: currentLessonsCount + 1
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create lesson');

      toast.success('Lesson added');
      setInlineAddLesson(null);
      setInlineAddLessonTitle('');
      setSelectedNode({ type: 'lesson', id: data.lesson.id });
      // Auto-expand parent module + new lesson
      setExpandedModules(prev => new Set(prev).add(moduleId));
      setExpandedLessons(prev => new Set(prev).add(data.lesson.id));
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error adding lesson');
    }
  };

  const handleAddStep = async (lessonId: string, currentStepsCount: number, type: 'text' | 'video' | 'lab' | 'assignment') => {
    const title = inlineAddStepTitle.trim();
    if (!title) { toast.error('Step title is required'); return; }

    try {
      const res = await fetch(`/api/courses/${courseId}/curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'step',
          data: {
            title,
            lessonId,
            stepType: type,
            sortOrder: currentStepsCount + 1,
            textContent: (type === 'text' || type === 'assignment') ? 'Write your content here...' : '',
            labLanguage: type === 'lab' ? 'javascript' : undefined,
            labStarterCode: type === 'lab' ? '// Starter code here' : undefined,
            labInstructions: type === 'lab' ? 'Enter instructions here' : undefined
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create step');

      toast.success('Lesson step added');
      setInlineAddStep(null);
      setInlineAddStepTitle('');
      setSelectedNode({ type: 'step', id: data.step.id });
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Error adding lesson step');
    }
  };

  // ----------------------------------------------------
  // Delete Curriculum Nodes (Module, Lesson, Step)
  // ----------------------------------------------------
  const handleDeleteNode = async (type: string, id: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${type}? This action will remove all nested content.`)) {
      return;
    }

    let url = '';
    if (type === 'module') url = `/api/modules/${id}`;
    else if (type === 'lesson') url = `/api/lessons/${id}`;
    else if (type === 'step') url = `/api/steps/${id}`;

    try {
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to delete ${type}`);

      toast.success(`${type} deleted successfully`);
      setSelectedNode({ type: 'course', id: courseId });
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || `Error deleting ${type}`);
    }
  };

  // Drag and Drop modules order swap
  const handleDropModule = async (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    const draggedMod = modules.find(m => m.id === draggedId);
    const targetMod = modules.find(m => m.id === targetId);
    if (!draggedMod || !targetMod) return;

    try {
      setSaving(true);
      
      const update1 = fetch(`/api/modules/${draggedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: targetMod.sortOrder })
      });

      const update2 = fetch(`/api/modules/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: draggedMod.sortOrder })
      });

      await Promise.all([update1, update2]);
      toast.success('Modules reordered successfully');
      await fetchData();
    } catch (err) {
      toast.error('Failed to reorder modules');
    } finally {
      setSaving(false);
    }
  };

  // Drag and Drop lessons order swap (within the same module)
  const handleDropLesson = async (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    let draggedLes: any = null;
    let targetLes: any = null;

    for (const mod of modules) {
      const d = mod.lessons?.find((l: any) => l.id === draggedId);
      const t = mod.lessons?.find((l: any) => l.id === targetId);
      if (d) draggedLes = d;
      if (t) targetLes = t;
    }

    if (!draggedLes || !targetLes) return;

    if (draggedLes.moduleId !== targetLes.moduleId) {
      toast.error('Lessons can only be reordered within the same module');
      return;
    }

    try {
      setSaving(true);

      const update1 = fetch(`/api/lessons/${draggedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: targetLes.sortOrder })
      });

      const update2 = fetch(`/api/lessons/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: draggedLes.sortOrder })
      });

      await Promise.all([update1, update2]);
      toast.success('Lessons reordered successfully');
      await fetchData();
    } catch (err) {
      toast.error('Failed to reorder lessons');
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------
  // Shift Ranks (Up / Down)
  // ----------------------------------------------------
  const handleShiftRank = async (type: 'module' | 'lesson' | 'step', item: any, direction: 'up' | 'down') => {
    let list: any[] = [];
    if (type === 'module') {
      list = [...modules].sort((a, b) => a.sortOrder - b.sortOrder);
    } else if (type === 'lesson') {
      const parentModule = modules.find(m => m.id === item.moduleId);
      if (!parentModule) return;
      list = [...parentModule.lessons].sort((a, b) => a.sortOrder - b.sortOrder);
    } else if (type === 'step') {
      let parentLesson: any = null;
      for (const m of modules) {
        const found = m.lessons?.find((l: any) => l.id === item.lessonId);
        if (found) { parentLesson = found; break; }
      }
      if (!parentLesson) return;
      list = [...parentLesson.steps].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    const currentIndex = list.findIndex(i => i.id === item.id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === list.length - 1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetItem = list[swapIndex];

    try {
      setSaving(true);
      
      const update1 = fetch(
        type === 'module' ? `/api/modules/${item.id}` : type === 'lesson' ? `/api/lessons/${item.id}` : `/api/steps/${item.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: targetItem.sortOrder })
        }
      );

      const update2 = fetch(
        type === 'module' ? `/api/modules/${targetItem.id}` : type === 'lesson' ? `/api/lessons/${targetItem.id}` : `/api/steps/${targetItem.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: item.sortOrder })
        }
      );

      await Promise.all([update1, update2]);
      toast.success('Ranks updated successfully');
      await fetchData();
    } catch (err) {
      toast.error('Failed to swap positions');
    } finally {
      setSaving(false);
    }
  };

  // Helper to get step type icon
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={13} className="text-info" />;
      case 'lab': return <Code size={13} className="text-warning" />;
      case 'assignment': return <ClipboardList size={13} style={{ color: '#ec4899' }} />;
      default: return <FileText size={13} className="text-primary" />;
    }
  };


  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '16px' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Loading Curriculum workspace...</span>
      </div>
    );
  }

  const unsaved = hasUnsavedChanges();

  return (
    <div className="page-container" style={{ padding: '20px 24px', maxWidth: '100%' }}>
      {/* Dynamic Breadcrumbs and Top Actions Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-primary)',
        paddingBottom: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link 
            href={((user?.role as string) === 'admin' || (user?.role as string) === 'super_admin') ? '/dashboard/admin/courses' : '/dashboard/instructor/courses'} 
            className="btn btn-ghost" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <div style={{ height: '24px', width: '1px', background: 'var(--border-primary)' }}></div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} /> {course?.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <Badge variant={course?.status === 'published' ? 'success' : course?.status === 'pending' ? 'info' : course?.status === 'archived' ? 'error' : 'warning'}>
                {course?.status === 'archived' ? 'inactive' : course?.status}
              </Badge>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {course?.isFree ? 'Free Course' : `₹${(course?.price || 0).toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Status Changer Toggle */}
          <select 
            value={editCourse.status || course?.status || 'draft'}
            className="input select"
            style={{ width: '160px', padding: '6px 12px', height: '36px', fontSize: 'var(--font-size-xs)' }}
            onChange={async (e) => {
              const newStatus = e.target.value;
              try {
                const res = await fetch(`/api/courses/${courseId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: newStatus })
                });
                if (res.ok) {
                  toast.success(`Course status updated to ${newStatus === 'archived' ? 'inactive' : newStatus}`);
                  fetchData();
                } else {
                  toast.error('Failed to update status');
                }
              } catch (err) {
                toast.error('Error connecting to updates');
              }
            }}
          >
            <option value="draft">Draft Mode</option>
            <option value="pending">Submit Review</option>
            <option value="published">Publish Public</option>
            <option value="archived">Inactive (Soft Delete)</option>
          </select>

          <Button 
            variant="ghost" 
            style={{ height: '36px', gap: '6px', fontSize: 'var(--font-size-xs)' }}
            onClick={() => router.push(`/dashboard/courses/${courseId}`)}
          >
            <Eye size={14} /> Preview Student
          </Button>

          <Button 
            onClick={handleSave} 
            disabled={saving} 
            style={{ 
              height: '36px', 
              gap: '8px', 
              fontSize: 'var(--font-size-xs)',
              position: 'relative',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
              fontWeight: 700,
              padding: '0 16px',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.35)';
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.25)';
            }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
            Save Changes
            {unsaved && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#f59e0b',
                border: '2px solid #ffffff',
                boxShadow: '0 0 8px #f59e0b',
              }} />
            )}
          </Button>

          <button 
            className="btn btn-outline-danger" 
            style={{ height: '36px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', fontWeight: 600, padding: '0 16px', borderRadius: '8px' }}
            onClick={async () => {
              if (window.confirm("Are you sure you want to permanently delete this course? This will remove all modules, lessons, steps, and progress records.")) {
                try {
                  setSaving(true);
                  const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
                  const data = await res.json();
                  if (res.ok) {
                    toast.success('Course deleted successfully');
                    router.push('/dashboard/instructor/courses');
                  } else {
                    toast.error(data.error || 'Failed to delete course');
                  }
                } catch (err) {
                  toast.error('Error connecting to deletion endpoint');
                } finally {
                  setSaving(false);
                }
              }
            }}
          >
            <Trash2 size={14} /> Delete Course
          </button>
        </div>
      </div>

      {/* Unsaved changes banner */}
      {unsaved && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          marginBottom: '16px',
          background: 'rgba(234, 179, 8, 0.1)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--warning)',
          fontWeight: 500,
        }}>
          <AlertCircle size={14} />
          You have unsaved changes. Press <kbd style={{ padding: '1px 6px', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-primary)', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>Ctrl+S</kbd> or click Save.
        </div>
      )}

      {/* Main Split-Pane Workspace */}
      <div style={{ display: 'flex', gap: '24px', minHeight: 'calc(80vh - 100px)', alignItems: 'flex-start' }}>
        
        {/* LEFT PANE: Curriculum Outline (Tree builder) */}
        <div style={{
          width: '320px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxHeight: '75vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Folder size={14} /> Curriculum Outline
            </h2>
            <button 
              onClick={() => { setInlineAddModule(true); setInlineAddModuleTitle(''); }}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary-hover)', fontWeight: 600 }}
            >
              <Plus size={12} /> Module
            </button>
          </div>

          {/* Expand/Collapse All Actions */}
          <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px' }}>
            <button 
              onClick={() => {
                setExpandedModules(new Set());
                setExpandedLessons(new Set());
              }}
              className="btn btn-ghost btn-xs"
              style={{ padding: '2px 6px', height: 'auto', fontSize: '10px', color: 'var(--text-secondary)' }}
            >
              Collapse All
            </button>
            <span style={{ color: 'var(--border-secondary)' }}>|</span>
            <button 
              onClick={() => {
                setExpandedModules(new Set(modules.map(m => m.id)));
                const lessonIds = new Set<string>();
                modules.forEach(m => {
                  (m.lessons || []).forEach((l: any) => lessonIds.add(l.id));
                });
                setExpandedLessons(lessonIds);
              }}
              className="btn btn-ghost btn-xs"
              style={{ padding: '2px 6px', height: 'auto', fontSize: '10px', color: 'var(--text-secondary)' }}
            >
              Expand All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Course Node (Root) */}
            <div 
              onClick={() => setSelectedNode({ type: 'course', id: courseId })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: selectedNode.type === 'course' ? 'var(--border-secondary)' : 'transparent',
                background: selectedNode.type === 'course' ? 'var(--bg-primary)' : 'transparent',
                fontWeight: selectedNode.type === 'course' ? 600 : 500,
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>
                📖 General Details & Settings
              </span>
            </div>

            <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }}></div>

            {/* Empty state when no modules */}
            {modules.length === 0 && !inlineAddModule && (
              <div style={{
                padding: '20px 16px',
                textAlign: 'center',
                borderRadius: '8px',
                border: '1px dashed var(--border-secondary)',
                background: 'var(--bg-primary)',
              }}>
                <Folder size={24} style={{ color: 'var(--text-tertiary)', marginBottom: '8px' }} />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
                  Start building your course by adding the first module.
                </p>
                <button
                  onClick={() => { setInlineAddModule(true); setInlineAddModuleTitle(''); }}
                  className="btn btn-ghost"
                  style={{ fontSize: '11px', color: 'var(--accent-primary-hover)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={12} /> Add First Module
                </button>
              </div>
            )}

            {/* Inline Add Module Form */}
            {inlineAddModule && (
              <InlineCreateForm
                placeholder="New module title..."
                value={inlineAddModuleTitle}
                onChange={setInlineAddModuleTitle}
                onConfirm={handleAddModule}
                onCancel={() => { setInlineAddModule(false); setInlineAddModuleTitle(''); }}
                inputRef={moduleInputRef}
              />
            )}

            {/* Modules Loop */}
            {modules.sort((a, b) => a.sortOrder - b.sortOrder).map((mod: any, mIdx: number) => {
              const isModSelected = selectedNode.type === 'module' && selectedNode.id === mod.id;
              const isModExpanded = expandedModules.has(mod.id);
              return (
                <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {/* Module Header Card */}
                  <div 
                    onClick={() => {
                      setSelectedNode({ type: 'module', id: mod.id });
                      toggleModule(mod.id);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (draggedModuleId && draggedModuleId !== mod.id) {
                        setDragOverModuleId(mod.id);
                      }
                    }}
                    onDragLeave={() => {
                      setDragOverModuleId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverModuleId(null);
                      if (draggedModuleId) {
                        handleDropModule(draggedModuleId, mod.id);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: dragOverModuleId === mod.id 
                        ? 'var(--accent-primary)' 
                        : isModSelected 
                          ? 'var(--border-secondary)' 
                          : 'var(--border-primary)',
                      background: dragOverModuleId === mod.id
                        ? 'var(--bg-secondary)'
                        : isModSelected 
                          ? 'var(--bg-primary)' 
                          : 'var(--card-bg)',
                      transform: dragOverModuleId === mod.id ? 'scale(1.02)' : 'none',
                      opacity: draggedModuleId === mod.id ? 0.4 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isModExpanded 
                          ? <ChevronDown size={12} style={{ color: 'var(--text-tertiary)' }} />
                          : <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
                        }
                      </div>
                      <span 
                        style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)' }}
                      >
                        {mod.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDraggedModuleId(mod.id);
                        }}
                        onDragEnd={() => {
                          setDraggedModuleId(null);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        style={{
                          cursor: 'grab',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px',
                          color: 'var(--text-tertiary)',
                          borderRadius: '4px',
                          transition: 'background 0.15s ease',
                        }}
                        title="Drag to reorder module"
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-primary)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                        }}
                      >
                        <Menu size={12} />
                      </div>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '2px', color: 'var(--error)' }} 
                        onClick={(e) => { e.stopPropagation(); handleDeleteNode('module', mod.id); }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Lessons inside Module (collapsible) */}
                  {isModExpanded && (
                    <div style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {(mod.lessons || []).length === 0 && inlineAddLesson !== mod.id && (
                        <div style={{ padding: '8px 10px', fontSize: '11px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                          No lessons yet - 
                          <button
                            onClick={() => { setInlineAddLesson(mod.id); setInlineAddLessonTitle(''); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary-hover)', fontWeight: 600, fontSize: '11px', fontStyle: 'normal', padding: '0 2px' }}
                          >
                            add one
                          </button>
                        </div>
                      )}

                      {(mod.lessons || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((les: any, lIdx: number) => {
                        const isLesSelected = selectedNode.type === 'lesson' && selectedNode.id === les.id;
                        const isLesExpanded = expandedLessons.has(les.id);
                        return (
                          <div key={les.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div 
                              onClick={() => {
                                setSelectedNode({ type: 'lesson', id: les.id });
                                toggleLesson(les.id);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (draggedLessonId && draggedLessonId !== les.id) {
                                  const draggedLes = modules.flatMap(m => m.lessons || []).find(l => l.id === draggedLessonId);
                                  if (draggedLes && draggedLes.moduleId === les.moduleId) {
                                    setDragOverLessonId(les.id);
                                  }
                                }
                              }}
                              onDragLeave={() => {
                                setDragOverLessonId(null);
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                setDragOverLessonId(null);
                                if (draggedLessonId) {
                                  handleDropLesson(draggedLessonId, les.id);
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: dragOverLessonId === les.id
                                  ? 'var(--accent-primary)'
                                  : isLesSelected
                                  ? 'var(--border-secondary)'
                                  : 'transparent',
                                background: dragOverLessonId === les.id
                                  ? 'rgba(99,102,241,0.08)'
                                  : isLesSelected
                                  ? 'var(--bg-primary)'
                                  : 'transparent',
                                transform: dragOverLessonId === les.id ? 'scale(1.01)' : 'none',
                                opacity: draggedLessonId === les.id ? 0.4 : 1,
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  {isLesExpanded
                                    ? <ChevronDown size={10} style={{ color: 'var(--text-tertiary)' }} />
                                    : <ChevronRight size={10} style={{ color: 'var(--text-tertiary)' }} />
                                  }
                                </div>
                                <span 
                                  style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: isLesSelected ? 600 : 500, flex: 1 }}
                                >
                                  📖 {les.title}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div
                                  draggable
                                  onDragStart={(e) => {
                                    e.stopPropagation();
                                    setDraggedLessonId(les.id);
                                  }}
                                  onDragEnd={() => {
                                    setDraggedLessonId(null);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '4px',
                                    cursor: 'grab',
                                    color: 'var(--text-tertiary)',
                                    borderRadius: '4px',
                                    transition: 'background 0.15s ease',
                                  }}
                                  title="Drag to reorder lesson"
                                  onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-primary)';
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                                  }}
                                >
                                  <Menu size={10} />
                                </div>
                                <button 
                                  className="btn btn-ghost" 
                                  style={{ padding: '2px', color: 'var(--error)' }} 
                                  onClick={(e) => { e.stopPropagation(); handleDeleteNode('lesson', les.id); }}
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>

                            {/* Steps inside Lesson (collapsible) */}
                            {isLesExpanded && (
                              <div style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {(les.steps || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((stp: any, sIdx: number) => {
                                  const isStpSelected = selectedNode.type === 'step' && selectedNode.id === stp.id;
                                  return (
                                    <div 
                                      key={stp.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '4px 6px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        background: isStpSelected ? 'var(--border-primary)' : 'transparent',
                                        transition: 'all 0.15s ease',
                                      }}
                                    >
                                      <span 
                                        onClick={() => setSelectedNode({ type: 'step', id: stp.id })}
                                        style={{ 
                                          fontSize: '11px', 
                                          color: 'var(--text-tertiary)', 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: '4px',
                                          flex: 1
                                        }}
                                      >
                                        {getStepIcon(stp.stepType)} {stp.title}
                                      </span>

                                      <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <button 
                                          className="btn btn-ghost" 
                                          style={{ padding: '1px', color: 'var(--error)' }} 
                                          onClick={() => handleDeleteNode('step', stp.id)}
                                        >
                                          <Trash2 size={8} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                                
                                {/* Inline Add Step Form */}
                                {inlineAddStep && inlineAddStep.lessonId === les.id ? (
                                  <InlineCreateForm
                                    placeholder={`New ${inlineAddStep.type} step title...`}
                                    value={inlineAddStepTitle}
                                    onChange={setInlineAddStepTitle}
                                    onConfirm={() => handleAddStep(les.id, (les.steps || []).length, inlineAddStep.type)}
                                    onCancel={() => { setInlineAddStep(null); setInlineAddStepTitle(''); }}
                                    inputRef={stepInputRef}
                                  />
                                ) : (
                                  /* Add Step trigger inside lesson */
                                  <div style={{ display: 'flex', gap: '6px', paddingLeft: '4px', marginTop: '4px' }}>
                                    <button 
                                      onClick={() => { setInlineAddStep({ lessonId: les.id, type: 'text' }); setInlineAddStepTitle(''); }}
                                      className="btn btn-ghost" 
                                      style={{ fontSize: '9px', padding: '2px 4px', color: 'var(--text-secondary)' }}
                                    >
                                      + Text
                                    </button>
                                    <button 
                                      onClick={() => { setInlineAddStep({ lessonId: les.id, type: 'video' }); setInlineAddStepTitle(''); }}
                                      className="btn btn-ghost" 
                                      style={{ fontSize: '9px', padding: '2px 4px', color: 'var(--text-secondary)' }}
                                    >
                                      + Video
                                    </button>
                                    <button 
                                      onClick={() => { setInlineAddStep({ lessonId: les.id, type: 'lab' }); setInlineAddStepTitle(''); }}
                                      className="btn btn-ghost" 
                                      style={{ fontSize: '9px', padding: '2px 4px', color: 'var(--accent-primary-hover)' }}
                                    >
                                      + Lab
                                    </button>
                                    <button 
                                      onClick={() => { setInlineAddStep({ lessonId: les.id, type: 'assignment' }); setInlineAddStepTitle(''); }}
                                      className="btn btn-ghost" 
                                      style={{ fontSize: '9px', padding: '2px 4px', color: 'var(--text-secondary)' }}
                                    >
                                      + Assignment
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Inline Add Lesson Form */}
                      {inlineAddLesson === mod.id ? (
                        <InlineCreateForm
                          placeholder="New lesson title..."
                          value={inlineAddLessonTitle}
                          onChange={setInlineAddLessonTitle}
                          onConfirm={() => handleAddLesson(mod.id, (mod.lessons || []).length)}
                          onCancel={() => { setInlineAddLesson(null); setInlineAddLessonTitle(''); }}
                          inputRef={lessonInputRef}
                        />
                      ) : (
                        <button 
                          onClick={() => { setInlineAddLesson(mod.id); setInlineAddLessonTitle(''); }}
                          className="btn btn-ghost" 
                          style={{ fontSize: '10px', alignSelf: 'flex-start', color: 'var(--text-secondary)', padding: '2px 8px', marginTop: '4px' }}
                        >
                          + Add Lesson
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: Selected Node Editor */}
        <div style={{
          flex: 1,
          background: 'var(--card-bg)',
          border: '1px solid var(--border-primary)',
          borderRadius: '12px',
          padding: '24px',
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          
          {/* 📋 COURSE DETAILS FORM EDITOR */}
          {selectedNode.type === 'course' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>General Course Setup</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Provide primary search catalog metadata details.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Course Title</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={editCourse.title || ''} 
                    onChange={(e) => setEditCourse({ ...editCourse, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Category</label>
                  <select 
                    className="input select"
                    value={editCourse.categoryId || ''} 
                    onChange={(e) => setEditCourse({ ...editCourse, categoryId: e.target.value })}
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="label">Short Description</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Introduce what students will accomplish in 1-2 sentences."
                  value={editCourse.shortDescription || ''} 
                  onChange={(e) => setEditCourse({ ...editCourse, shortDescription: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="label">Full Description (Markdown supported)</label>
                  <button
                    type="button"
                    onClick={handleAiFormatDescription}
                    disabled={isFormattingDescription}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'transform 0.1s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                  >
                    {isFormattingDescription ? '⏳ Formatting...' : '✨ AI Auto-Format'}
                  </button>
                </div>
                <textarea 
                  className="input" 
                  rows={6}
                  style={{ height: 'auto', resize: 'vertical' }}
                  value={editCourse.description || ''} 
                  onChange={(e) => setEditCourse({ ...editCourse, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Course Price (₹)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={editCourse.price ?? 0} 
                    onChange={(e) => setEditCourse({ ...editCourse, price: Number(e.target.value) })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Target Skill Level</label>
                  <select 
                    className="input select"
                    value={editCourse.level || 'beginner'} 
                    onChange={(e) => setEditCourse({ ...editCourse, level: e.target.value })}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      id="isFree"
                      checked={editCourse.isFree || false}
                      onChange={(e) => setEditCourse({ ...editCourse, isFree: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="isFree" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Mark as Free Course
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📂 MODULE DETAILS FORM EDITOR */}
          {selectedNode.type === 'module' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Module Details</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>A module groups multiple cohesive lessons and assignments together.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="label">Module Title</label>
                <input 
                  type="text" 
                  className="input" 
                  value={editModule.title || ''} 
                  onChange={(e) => setEditModule({ ...editModule, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="label">Module Description</label>
                <textarea 
                  className="input" 
                  rows={4}
                  style={{ height: 'auto', resize: 'vertical' }}
                  value={editModule.description || ''} 
                  onChange={(e) => setEditModule({ ...editModule, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    id="modFree"
                    checked={editModule.isFree || false}
                    onChange={(e) => setEditModule({ ...editModule, isFree: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="modFree" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Mark entire module as Free Preview
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 📖 LESSON DETAILS FORM EDITOR */}
          {selectedNode.type === 'lesson' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Lesson Details</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>Lessons hold the specific content steps that students unlock as they progress.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="label">Lesson Title</label>
                <input 
                  type="text" 
                  className="input" 
                  value={editLesson.title || ''} 
                  onChange={(e) => setEditLesson({ ...editLesson, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="label">Lesson Description</label>
                <textarea 
                  className="input" 
                  rows={4}
                  style={{ height: 'auto', resize: 'vertical' }}
                  value={editLesson.description || ''} 
                  onChange={(e) => setEditLesson({ ...editLesson, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Estimated Duration (in minutes)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={editLesson.durationMins ?? 0} 
                    onChange={(e) => setEditLesson({ ...editLesson, durationMins: Number(e.target.value) })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      id="lesFree"
                      checked={editLesson.isFree || false}
                      onChange={(e) => setEditLesson({ ...editLesson, isFree: e.target.checked })}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="lesFree" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Mark lesson as Free Preview
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 📝 STEP DETAILS FORM EDITOR (Standard & Coding Lab) */}
          {selectedNode.type === 'step' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Lesson Step Content</h3>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>A step represents a block of learning content: Text, Video, or an interactive Coding Lab.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Step Title</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={editStep.title || ''} 
                    onChange={(e) => setEditStep({ ...editStep, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="label">Step Type</label>
                  <select 
                    className="input select"
                    value={editStep.stepType || 'text'}
                    onChange={(e) => setEditStep({ ...editStep, stepType: e.target.value })}
                  >
                    <option value="text">📖 Text/Markdown Documentation</option>
                    <option value="video">🎥 Video Lecture</option>
                    <option value="lab">💻 Interactive Coding Lab</option>
                    <option value="assignment">📝 Assignment</option>
                  </select>
                </div>
              </div>

              {/* A. TEXT CONTENT OR ASSIGNMENT TYPE */}
              {(editStep.stepType === 'text' || editStep.stepType === 'assignment') && (() => {
                const pages = splitTextIntoPages(editStep.textContent || '');
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label className="label" style={{ margin: 0 }}>Step Text Content (Markdown supported)</label>
                        <button
                          type="button"
                          onClick={handleAiFormatStep}
                          disabled={isFormattingStep}
                          style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 10px',
                            fontSize: '10px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'transform 0.1s ease',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                        >
                          {isFormattingStep ? '⏳ Formatting...' : '✨ AI Auto-Format'}
                        </button>
                      </div>
                      {pages.length > 1 && (
                        <span style={{ fontSize: '11px', color: 'var(--accent-primary-hover)', fontWeight: 600, background: 'rgba(99,102,241,0.08)', padding: '2px 8px', borderRadius: '12px' }}>
                          📄 Split into {pages.length} pages
                        </span>
                      )}
                    </div>
                    <textarea 
                      className="input" 
                      rows={12}
                      style={{ height: 'auto', flex: 1, resize: 'vertical', fontFamily: 'monospace' }}
                      value={editStep.textContent || ''} 
                      onChange={(e) => setEditStep({ ...editStep, textContent: e.target.value })}
                    />
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', lineHeight: '1.4', background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-primary)' }}>
                      <strong>Paging Tip:</strong> Type <code>&lt;!-- pagebreak --&gt;</code> on a new line to explicitly split content into pages. 
                      {editStep.textContent && editStep.textContent.length > 1800 && !editStep.textContent.includes('<!-- pagebreak -->') && (
                        <span> This step will be automatically split into <strong>{pages.length} pages</strong> (max ~1200 chars per page) because of its length.</span>
                      )}
                    </div>
                    {editStep.stepType === 'assignment' && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                        background: '#f8fafc',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px dashed var(--border-secondary)',
                        marginTop: '12px'
                      }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label className="label" style={{ fontWeight: 700 }}>Attachment File URL</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="https://example.com/dataset.zip"
                            value={editStep.attachmentUrl || ''}
                            onChange={(e) => setEditStep({ 
                              ...editStep, 
                              attachmentUrl: e.target.value
                            })}
                            style={{ background: '#ffffff' }}
                          />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label className="label" style={{ fontWeight: 700 }}>Attachment File Label / Name</label>
                          <input
                            type="text"
                            className="input"
                            placeholder="e.g., Project_Starter_Dataset.zip"
                            value={editStep.attachmentName || ''}
                            onChange={(e) => setEditStep({ 
                              ...editStep, 
                              attachmentName: e.target.value
                            })}
                            style={{ background: '#ffffff' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* B. VIDEO CONTENT TYPE */}
              {editStep.stepType === 'video' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="label">Video URL (Vimeo, YouTube, AWS CloudFront, etc.)</label>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="https://example.com/lecture.mp4"
                      value={editStep.videoUrl || ''} 
                      onChange={(e) => setEditStep({ ...editStep, videoUrl: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="label">Video Duration (seconds)</label>
                    <input 
                      type="number" 
                      className="input" 
                      value={editStep.videoDurationSecs ?? 0} 
                      onChange={(e) => setEditStep({ ...editStep, videoDurationSecs: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              {/* C. INTERACTIVE CODING LAB TYPE */}
              {editStep.stepType === 'lab' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    
                    {/* Language Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>Coding Language:</span>
                      <select 
                        className="input select"
                        style={{ width: '130px', padding: '4px 8px', fontSize: 'var(--font-size-xs)', borderRadius: '6px' }}
                        value={editStep.labLanguage || 'javascript'}
                        onChange={(e) => setEditStep({ ...editStep, labLanguage: e.target.value })}
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="c">C Language</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                        <option value="sql">SQL Query</option>
                        <option value="html">HTML Structure</option>
                        <option value="css">CSS Styling</option>
                      </select>
                    </div>

                    {/* Sub-Tabs inside Coding Lab editor */}
                    <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
                      <button 
                        type="button"
                        onClick={() => setActiveLabTab('instructions')}
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          background: activeLabTab === 'instructions' ? 'var(--bg-primary)' : 'transparent',
                          color: activeLabTab === 'instructions' ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        1. Instructions
                      </button>
                      <button 
                        type="button"
                        onClick={() => setActiveLabTab('starter')}
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          background: activeLabTab === 'starter' ? 'var(--bg-primary)' : 'transparent',
                          color: activeLabTab === 'starter' ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        2. Starter Code
                      </button>
                      <button 
                        type="button"
                        onClick={() => setActiveLabTab('solution')}
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          background: activeLabTab === 'solution' ? 'var(--bg-primary)' : 'transparent',
                          color: activeLabTab === 'solution' ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        3. Validation Solution
                      </button>
                    </div>
                  </div>

                  {/* Sub-Tab Workspaces */}
                  <div style={{ flex: 1, minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
                    {/* Tab 1: Instructions Markdown */}
                    {activeLabTab === 'instructions' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        <textarea 
                          className="input" 
                          rows={14}
                          placeholder="Describe the challenge instructions. Tell the student what function to write, what arguments to accept, and expected return output."
                          style={{ height: 'auto', flex: 1, resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }}
                          value={editStep.labInstructions || ''} 
                          onChange={(e) => setEditStep({ ...editStep, labInstructions: e.target.value })}
                        />
                      </div>
                    )}

                    {/* Tab 2: Monaco Starter Code */}
                    {activeLabTab === 'starter' && (
                      <div style={{ border: '1px solid var(--border-primary)', borderRadius: '8px', overflow: 'hidden', flex: 1 }}>
                        <Editor
                          height="340px"
                          language={editStep.labLanguage || 'javascript'}
                          value={editStep.labStarterCode || ''}
                          theme="light"
                          onChange={(val) => setEditStep({ ...editStep, labStarterCode: val || '' })}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            wordWrap: 'on'
                          }}
                        />
                      </div>
                    )}

                    {/* Tab 3: Monaco Solution Check */}
                    {activeLabTab === 'solution' && (
                      <div style={{ border: '1px solid var(--border-primary)', borderRadius: '8px', overflow: 'hidden', flex: 1 }}>
                        <Editor
                          height="340px"
                          language={editStep.labLanguage || 'javascript'}
                          value={editStep.labSolutionCode || ''}
                          theme="light"
                          onChange={(val) => setEditStep({ ...editStep, labSolutionCode: val || '' })}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            wordWrap: 'on'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delete Action Button for Non-Course Nodes */}
          {selectedNode.type !== 'course' && (
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-outline-danger"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600
                }}
                onClick={() => handleDeleteNode(selectedNode.type, selectedNode.id)}
              >
                <Trash2 size={14} /> Delete this {selectedNode.type}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

// Robust helper function to split text into pages based on manual pagebreaks or automatic paragraph grouping
export function splitTextIntoPages(text: string): string[] {
  if (!text) return [''];
  
  // 1. Split by explicit custom pagebreak tag if present
  if (text.includes('<!-- pagebreak -->')) {
    return text.split('<!-- pagebreak -->').map(p => p.trim()).filter(Boolean);
  }
  
  // 2. Auto-paginate very long text step content (over 1800 characters)
  if (text.length > 1800) {
    const paragraphs = text.split(/\n\s*\n/);
    const pages: string[] = [];
    let currentPage = '';
    
    for (const para of paragraphs) {
      if ((currentPage + para).length > 1200 && currentPage.length > 0) {
        pages.push(currentPage.trim());
        currentPage = para;
      } else {
        if (currentPage.length > 0) {
          currentPage += '\n\n' + para;
        } else {
          currentPage = para;
        }
      }
    }
    if (currentPage.trim()) {
      pages.push(currentPage.trim());
    }
    return pages;
  }
  
  return [text];
}
