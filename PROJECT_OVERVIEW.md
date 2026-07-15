# Skilotech / Skillzy - Project Overview, User Flows, & UI Design

Skillzy (Skilotech) is a premium, state-of-the-art, full-stack Interactive Learning Management System (LMS) and Coding Education Platform built with Next.js 16 and React 19. It combines rich video and text-based courses, an interactive Monaco-powered browser coding environment, local Razorpay payment processing, and job recruitment features in a unified dashboard.

---

## 1. System Architecture

The platform is designed with a high-performance modern web stack featuring real-time caching, asynchronous database operations, and secure, webhook-synchronized authentication.

```mermaid
graph TD
    Client[Client Browser / Next.js 16 React 19] -->|Auth Token / Session| Clerk[Clerk Authentication]
    Client -->|API Requests| NextServer[Next.js API Routes]
    NextServer -->|Cache Check| Redis[(Redis Caching Layer)]
    NextServer -->|ORM Queries| Prisma[Prisma Client]
    Prisma -->|Read/Write| Postgres[(PostgreSQL Database)]
    NextServer -->|Verify Signature| Razorpay[Razorpay API Gateway]
```

### Core Technologies
*   **Frontend**: Next.js 16 (App Router), React 19, Monaco Editor, GSAP (GreenSock) for high-performance animations, Framer Motion for dashboard state transitions.
*   **Database**: PostgreSQL & Prisma ORM for type-safe schema modeling.
*   **Caching**: Redis for lightning-fast course catalog queries, with cache invalidation on curriculum changes.
*   **Payments**: Razorpay SDK for secure local payment checkout (INR currency).
*   **Authentication**: Clerk for enterprise-grade authentication with custom webhooks syncing Clerk metadata to the PostgreSQL database.

---

## 2. User Roles & Permission Levels

The application features four distinct user roles, each accessing a tailored layout and set of features:

```mermaid
graph LR
    User([User]) -->|Role Assignment| Role{Role}
    Role -->|Student| Stud[Dashboard, Coding Lab, Course Player, Job Board]
    Role -->|Instructor| Inst[Course Outline Builder, Assignments, Metrics]
    Role -->|Recruiter| Recr[Job Postings, Candidate Tracker, Resume Viewer]
    Role -->|Admin| Admin[User Management, Course Approval, Payment Auditing]
```

1.  **Student (Learner)**
    *   *Permissions*: View public courses, purchase courses, read course curriculum, execute coding challenges in the Coding Lab, request AI hints, apply to jobs.
2.  **Instructor (Educator)**
    *   *Permissions*: View author dashboard, create courses/modules/lessons, edit curriculum (using visual builders), review student assignments.
3.  **Recruiter (Hiring Partner)**
    *   *Permissions*: View hiring dashboard, post job listings, filter applicants, update status (Shortlisted, Rejected, Hired), add recruiter notes.
4.  **Admin (Platform Operations)**
    *   *Permissions*: View system metrics, manage user roles, approve/reject pending courses, audit financial transactions (payments).

---

## 3. Core Application Flows

### A. Authentication & User Sync Flow
When a user signs up or logs in through Clerk, a webhook triggers a backend function to sync user profiles to the database.

```mermaid
sequenceDiagram
    participant User
    participant Clerk
    participant API as Webhook API
    participant DB as PostgreSQL
    User->>Clerk: Sign Up / Sign In
    Clerk-->>User: Auth Tokens (Cookie)
    Clerk->>API: POST /api/webhooks/clerk (Event: user.created)
    API->>DB: Upsert User record with metadata (Name, Email, Role)
    API-->>Clerk: 200 OK
```

### B. Course Purchase Flow (Razorpay Integration)
To unlock premium courses, students complete checkout through Razorpay. A verification API guarantees signature validity.

```mermaid
sequenceDiagram
    participant Student
    participant Checkout as Razorpay Checkout Component
    participant Backend as Order API
    participant Gate as Razorpay Gateway
    participant Verify as Verification API
    participant DB as PostgreSQL

    Student->>Checkout: Click "Buy Course"
    Checkout->>Backend: POST /api/payments/create-order {courseId}
    Backend->>DB: Check if already enrolled or if free
    Backend-->>Checkout: Order ID & Demo Flag
    Checkout->>Gate: Initialize Razorpay Checkout Modal
    Gate-->>Student: Modal Displayed (Prefilled details)
    Student->>Gate: Enter Details & Authorize Payment
    Gate-->>Checkout: Returns payment_id, signature, order_id
    Checkout->>Verify: POST /api/payments/verify {payload}
    Verify->>DB: Create Payment entry, Enroll student, Mark order paid
    Verify-->>Checkout: Payment Verified & invoiceId
    Checkout-->>Student: Toast Success! Unlock Course 🎉
```

### C. Coding Lab Execution Flow
Students write code in JavaScript, Python, C++, or Java inside the Monaco Editor. The code compiles and validates against pre-seeded test cases.

```mermaid
sequenceDiagram
    participant Student
    participant Monaco as Monaco Editor
    participant Compiler as Compile API
    participant Executor as Execution Environment
    participant AI as AI Help API

    Student->>Monaco: Writes code
    Student->>Compiler: Click "Run Code"
    Compiler->>Executor: Spin sandboxed execution of code + testCases
    Executor-->>Compiler: Returns stdout, stderr, executionTime, testResults
    Compiler-->>Student: Renders execution logs & console output
    Student->>AI: Click "Ask AI Hint"
    AI-->>Student: Stream response (style tips, optimization ideas)
```

---

## 4. UI Design & Aesthetics

The UI design system prioritizes a premium, high-contrast, modern aesthetic tailored for developers and technical learners.

### A. Color Palette (Dark Theme Focus)
*   **Primary Background**: `#05070f` (Sleek deep navy-black).
*   **Secondary Background**: `#0b0e1a` (Slightly lighter dark blue for cards, navigation panels).
*   **Primary Accent**: `#6366f1` / `rgb(99, 102, 241)` (Indigo purple for buttons, focus rings, interactive states).
*   **Secondary Accent**: `#a78bfa` (Muted lavender for active tabs, status indicators).
*   **Success state**: `#10b981` (Emerald green).
*   **Warning state**: `#f59e0b` (Amber yellow).
*   **Text Primary**: `#f8fafc` (Slate-50 for high readability).
*   **Text Secondary**: `#94a3b8` (Slate-400 for subtext).

### B. Typography
*   **Headers & Logo**: *Outfit* / *Syne* (Clean geometric sans-serif for modern tech vibes).
*   **Body & Dashboard**: *Inter* (Highly legible, neutral sans-serif).
*   **Code Elements**: *Fira Code* / *JetBrains Mono* (Monospace for terminal and Monaco Editor panels).

### C. Visual Elements & Layout
*   **Glassmorphism**: Border borders are colored using semi-transparent gradients (`rgba(255, 255, 255, 0.05)`). Cards feature a slight backdrop filter blur to give depth over radial background glows.
*   **Ambient Glows**: Subtle radial gradients blur behind layout containers to create a premium, alive look.
*   **Micro-animations**:
    *   Hovering over buttons scales them slightly (`scale: 1.02`) and brightens the background gradient.
    *   Active items in the sidebar have a glowing background badge and slide in dynamically.
    *   The Coding Lab features resizable panels with responsive resize handles that update widths in real time.
