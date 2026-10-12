# CareerConnect — Technical Training Presentation & Live Demonstration Guide

A presenter's handbook and step-by-step demonstration walkthrough for the **Java Full Stack Development Technical Training Presentation**.

---

## 🎯 Executive Overview & Project Goals

- **Application Name**: **CareerConnect**
- **Domain**: Modern Recruitment SaaS & Candidate Management Platform
- **Audience**: Technical training evaluators, software engineering students, and architecture leads.
- **Core Purpose**: Demonstrate clean, production-grade enterprise software patterns using **Java 21**, **Spring Boot 3.3.4**, **Spring Security (JWT)**, **Spring Data JPA**, **MySQL 8 / Flyway**, and a responsive **React 18 + TypeScript + Tailwind CSS** frontend.

---

## ⏱️ Recommended 15-Minute Presentation Agenda

| Segment | Time | Focus Area | Key Visuals |
|---|---|---|---|
| **1. Intro & Architecture** | 2 min | Layered architecture, tech stack, and database schema | Architecture diagram & schema overview |
| **2. Public Experience** | 3 min | Search engine, filters, URL params sync, job details | Home hero, faceted search `/jobs`, company page |
| **3. Candidate Journey** | 3 min | 1-Click Login, Profile completion meter, apply & resume upload | Dashboard `/candidate`, timeline modal, resume upload |
| **4. Recruiter Workflow** | 3 min | Post job opening, applicant pipeline progression | Recharts pipeline, status update dialog with notes |
| **5. Admin Governance** | 2 min | User suspension, job content moderation, audit logs | Platform analytics, user toggling, audit trail |
| **6. Code Deep Dive & Q&A** | 2 min | Security filter chain, JPA queries, exception handling | IDE inspection of Spring Boot 3 & React code |

---

## 🔑 Pre-Configured Demo Credentials

The login page (`/login`) includes **1-Click Quick Demo Login buttons** at the top of the form for immediate switching without typing:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Administrator** | `admin@careerconnect.com` | `Admin@123` | Platform analytics, user suspension, job moderation, audit logs |
| **Recruiter** | `recruiter.sarah@techcorp.com` | `Recruiter@123` | Create/edit jobs, manage applicants, update statuses |
| **Candidate** | `candidate.alex@example.com` | `Candidate@123` | Search jobs, bookmark, apply, upload resume, track status |

---

## 🎬 Step-by-Step Live Demonstration Script

### Act 1: Public Discovery & Enterprise Job Search (3 Minutes)
1. **Navigate to the Landing Page (`/`)**:
   - Highlight the clean, modern recruitment SaaS design (clean white/slate backgrounds, navy typography, indigo accents).
   - Point out the **Hero Search Bar** (`Role / keyword` and `Location`).
   - Scroll through **Trusted Companies**, **Job Categories**, **Featured Job Cards**, and **How It Works**.
2. **Perform a Faceted Job Search (`/jobs`)**:
   - Click **"Browse All Jobs"** or type a query in the search bar (e.g. `Engineer`).
   - Demonstrate the sidebar filters:
     - Workplace Type (`Remote`, `Hybrid`, `On-site`).
     - Employment Type (`Full-time`, `Contract`, `Internship`).
     - Category (`Engineering`, `Product`, `Design`).
   - Notice that the URL query parameters update dynamically (e.g. `?keyword=Engineer&workplaceType=REMOTE`), making the search state bookmarkable and shareable.
3. **Inspect a Job Details Page (`/jobs/1`)**:
   - Show the structured view: Overview, Responsibilities, Required Skills, Qualifications, and Company Card.
   - Point out the quick action buttons: **"Apply Now"** and **"Bookmark"**.

---

### Act 2: The Candidate Experience (3 Minutes)
1. **Log in as Candidate Alex**:
   - Click **"Sign In"** (`/login`). Click the blue **"Alex Morgan (Candidate)"** 1-Click button and hit **"Sign In"**.
   - Notice the instant redirect to `/candidate/dashboard`.
2. **Explore the Candidate Dashboard (`/candidate/dashboard`)**:
   - **Profile Completion Meter**: Show dynamic percentage based on filled profile fields.
   - **Metrics Cards**: Total Applications, In Review, Shortlisted, Selected.
   - **Recent Activity Table**: View real-time status badges (`APPLIED`, `UNDER_REVIEW`, `SHORTLISTED`).
3. **Submit a New Job Application**:
   - Navigate to `/jobs`, open an unapplied job (e.g., *Full Stack Developer*).
   - Click **"Apply for this Position"**.
   - Show the modal:
     - Allows selecting the uploaded profile resume or uploading a targeted document.
     - Add a custom Cover Letter.
     - Submit -> Observe immediate toast notification and button state change to `"Applied"`.
4. **Manage Applications & Status Audit History (`/candidate/applications`)**:
   - View the active applications table.
   - Click **"View History"** on any application:
     - Highlight the **Status Audit Trail** modal showing every state transition (`APPLIED` → `UNDER_REVIEW` → `SHORTLISTED`), with timestamp, recruiter name, and reviewer notes!
   - Demonstrate the **"Withdraw"** button which safely transitions state to `WITHDRAWN`.
5. **Resume & Document Management (`/candidate/resume`)**:
   - Upload a new PDF/DOCX file.
   - Show instant server-side path traversal validation, UUID sanitization, and the secure download link.

---

### Act 3: Recruiter Job Posting & Applicant Pipeline (3 Minutes)
1. **Switch to Recruiter Sarah**:
   - Click the user avatar -> **"Sign Out"** -> Click **"Sarah Jenkins (Recruiter)"** 1-Click button -> **"Sign In"**.
   - You land on `/recruiter/dashboard`.
2. **Review the Recruiter Dashboard (`/recruiter/dashboard`)**:
   - **Interactive Charts (Recharts)**:
     - Monthly Applications trend bar chart.
     - Pipeline status breakdown.
   - **Active Job Metrics**: Total Postings, Active Openings, Applicants Received.
3. **Post a New Job (`/recruiter/jobs/new`)**:
   - Complete the form: Title, Category, Location, Workplace Type, Employment Type, Salary Range (Min/Max), Skills, Description.
   - Hit **"Publish Job"** -> Automatically validated using **Spring Validation** & **React Hook Form**.
4. **Manage the Hiring Pipeline (`/recruiter/applicants`)**:
   - Filter applicants by specific job posting.
   - Open an applicant detail view (`/recruiter/applicants/1`).
   - Download the candidate's uploaded resume directly from the backend.
   - **Update Status**:
     - Change status from `UNDER_REVIEW` to `SHORTLISTED` (or `SELECTED`).
     - Enter notes: *"Strong system architecture interview performance"*.
     - Click **"Update Status"** -> Automatically logs an immutable entry to `application_status_history` and `audit_logs`!

---

### Act 4: Administrator Governance & Security Auditing (2 Minutes)
1. **Switch to System Admin**:
   - Sign in using the red **"System Admin"** 1-Click button (`admin@careerconnect.com`).
   - Land on `/admin/dashboard`.
2. **Platform Metrics & Distribution**:
   - Live database counts: Total Users, Total Candidates, Total Recruiters, Total Jobs, Total Applications, Registered Employers.
3. **User Governance (`/admin/users`)**:
   - Search across all users.
   - Filter by `CANDIDATE`, `RECRUITER`, or `ADMIN`.
   - Click **"Suspend"** on a user account -> Enter suspension note -> Confirm.
   - Try logging in with the suspended account -> Spring Security rejects authentication with a 403 Forbidden message!
4. **Job Moderation (`/admin/jobs`)**:
   - Filter listings by moderation status (`PENDING`, `APPROVED`, `REJECTED`).
   - Admin can approve or reject recruiter job postings before they appear in public search.
5. **System Audit Trail**:
   - Show the immutable audit trail (`/api/admin/audit-logs`) tracking critical actions across the entire enterprise.

---

## 💻 Technical Code Highlights for IDE Inspection

When questions arise during the presentation, open these exact files to showcase architectural excellence:

### 1. Spring Security Configuration & Stateless JWT
- **File**: `backend/src/main/java/com/careerconnect/security/SecurityConfig.java`
- **Key points to show**:
  - Stateless session policy: `SessionCreationPolicy.STATELESS`.
  - BCrypt password encoder (`BCryptPasswordEncoder`).
  - Strict endpoint authorization:
    - `/api/candidate/**` has role `ROLE_CANDIDATE`.
    - `/api/recruiter/**` has role `ROLE_RECRUITER`.
    - `/api/admin/**` has role `ROLE_ADMIN`.
    - Public read endpoints for `/api/jobs/**` and `/api/companies/**`.
  - Custom JWT filter positioned prior to `UsernamePasswordAuthenticationFilter`.

### 2. JJWT 0.12.6 Token Provider
- **File**: `backend/src/main/java/com/careerconnect/security/JwtTokenProvider.java`
- **Key points to show**:
  - Cryptographically secure `Keys.hmacShaKeyFor(secret.getBytes())`.
  - Claim extraction, subject verification, and signature tampering prevention.

### 3. Cross-Recruiter Isolation & Business Logic
- **File**: `backend/src/main/java/com/careerconnect/service/impl/RecruiterServiceImpl.java`
- **Key points to show**:
  - Strict ownership verification: Recruiters can only access and modify job applications associated with jobs belonging to their own company/profile.
  - Audit logging triggered automatically on status transitions.

### 4. Enterprise Global Exception Handling
- **File**: `backend/src/main/java/com/careerconnect/exception/GlobalExceptionHandler.java`
- **Key points to show**:
  - Catches `MethodArgumentNotValidException`, `BadCredentialsException`, `AccessDeniedException`, and custom runtime exceptions.
  - Emits clean, standardized JSON envelope (`ApiResponse<T>`) without leaking database internals or stack traces.

### 5. Flyway Database Migrations
- **File**: `backend/src/main/resources/db/migration/V1__init_schema.sql` and `V2__seed_demo_data.sql`
- **Key points to show**:
  - Clean relational DDL with foreign keys, compound indexes (`idx_jobs_search`, `idx_apps_unique`), and audit tables.
  - Reproducible seed data enabling automated testing and zero-setup demonstrations.

---

## ❓ Common Technical Questions & Answers

### Q1: Why use Java 21 and Spring Boot 3.3.4?
> **Answer**: Java 21 is a Long-Term Support (LTS) release introducing virtual threads, pattern matching, and record patterns. Spring Boot 3 requires Java 17+ baseline, embraces Jakarta EE 10 specifications, and provides out-of-the-box support for Spring Boot Actuator health monitoring and modern dependency injection.

### Q2: How does CareerConnect handle database portability between local development and production?
> **Answer**: CareerConnect implements Spring Boot profiles:
> - `application-dev.yml` (default): Uses persistent file-based H2 configured in **MySQL 8 compatibility mode** (`MODE=MySQL;DATABASE_TO_LOWER=TRUE`). Flyway runs the exact same MySQL DDL scripts, enabling instant zero-dependency execution.
> - `application-mysql.yml`: Connects directly to real MySQL 8 on port 3306 or inside Docker Compose.

### Q3: How is authorization enforced beyond hiding UI elements?
> **Answer**: UI navigation is guarded with React Router and `ProtectedRoute`, but the primary enforcement happens on the backend in `SecurityConfig.java` and `@PreAuthorize` method annotations. Any direct HTTP request from an unauthorized role returns an HTTP 403 Forbidden status code.

### Q4: How is file storage secured against path traversal attacks?
> **Answer**: In `FileStorageService.java`, every uploaded file is checked for path traversal patterns (`..`), validated for permissible MIME types (PDF, DOCX) and file size, and saved with a randomized UUID file name. Files are retrieved using `Path.normalize()` and bounded to the designated upload root.
