import { z } from 'zod';

const optionalUrlSchema = z.preprocess((val) => (val === '' || val === null) ? undefined : val, z.string().url().optional());

// ── Course Schemas ──────────────────────────────────────────────

export const createCourseSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  shortDescription: z.string().max(500).optional(),
  categoryId: z.string().nullable().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  price: z.number().int().min(0).default(0),
  currency: z.string().default('INR'),
  thumbnailUrl: optionalUrlSchema,
  previewVideoUrl: optionalUrlSchema,
  isFree: z.boolean().default(false),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  status: z.enum(['draft', 'pending', 'published', 'archived']).optional(),
});

// ── Module Schemas ──────────────────────────────────────────────

export const createModuleSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isFree: z.boolean().default(false),
});

// ── Lesson Schemas ──────────────────────────────────────────────

export const createLessonSchema = z.object({
  moduleId: z.string(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  durationMins: z.number().int().min(0).default(0),
  isFree: z.boolean().default(false),
});

// ── Lesson Step Schemas ─────────────────────────────────────────

export const createLessonStepSchema = z.object({
  lessonId: z.string(),
  stepType: z.enum(['intro', 'text', 'video', 'lab', 'assignment']),
  sortOrder: z.number().int().min(0).default(0),
  title: z.string().min(1).max(255),
  textContent: z.string().optional(),
  videoUrl: optionalUrlSchema,
  videoDurationSecs: z.number().int().optional(),
  labLanguage: z.string().optional(),
  labStarterCode: z.string().optional(),
  labSolutionCode: z.string().optional(),
  labInstructions: z.string().optional(),
  attachmentUrl: z.string().optional().nullable(),
  attachmentName: z.string().optional().nullable(),
});

// ── Progress Schemas ────────────────────────────────────────────

export const markStepCompleteSchema = z.object({
  stepId: z.string(),
  timeSpentSecs: z.number().int().min(0).default(0),
});

// ── Payment Schemas ─────────────────────────────────────────────

export const createOrderSchema = z.object({
  courseId: z.string(),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
  courseId: z.string(),
});

// ── User Schemas ────────────────────────────────────────────────

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  bio: z.string().max(1000).optional(),
  phone: z.string().max(20).optional(),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['student', 'instructor', 'recruiter', 'admin', 'super_admin']),
});

// ── Query Schemas ───────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const courseQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  sort: z.enum(['rating', 'price_asc', 'price_desc', 'newest', 'popular']).default('popular'),
  status: z.enum(['draft', 'pending', 'published', 'archived', 'all']).optional(),
});
