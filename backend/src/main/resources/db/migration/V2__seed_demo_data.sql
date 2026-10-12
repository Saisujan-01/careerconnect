-- ========================================================
-- CareerConnect Database Seed Migration V2
-- Realistic Seed Data for Demo & Technical Presentation
-- ========================================================

-- 1. Insert Companies
INSERT INTO companies (id, name, description, website, industry, location, logo_url) VALUES
(1, 'TechCorp Solutions', 'Global enterprise cloud software and developer tooling platform building next-gen web applications.', 'https://techcorp.example.com', 'Software & Cloud', 'San Francisco, CA', 'TC'),
(2, 'FinEdge Systems', 'High-frequency algorithmic trading and financial intelligence solutions for global institutions.', 'https://finedge.example.com', 'Fintech', 'New York, NY', 'FE'),
(3, 'CloudScale Inc', 'Next-generation container infrastructure, Kubernetes orchestration, and cloud observability.', 'https://cloudscale.example.com', 'Cloud & DevOps', 'Austin, TX', 'CS'),
(4, 'HealthPulse AI', 'AI-assisted medical diagnostics, clinical workflows, and patient management software.', 'https://healthpulse.example.com', 'Healthtech', 'Boston, MA', 'HP'),
(5, 'CreativePulse Studio', 'Award-winning digital product studio specializing in intuitive UX and mobile designs.', 'https://creativepulse.example.com', 'Design & Product', 'Seattle, WA', 'CP'),
(6, 'DataSphere Analytics', 'Real-time big data pipelines, machine learning intelligence, and business telemetry platforms.', 'https://datasphere.example.com', 'Data & Analytics', 'Chicago, IL', 'DS');

-- 2. Insert Users (Placeholder password hashes - re-hashed on app init by DataInitializer)
-- Passwords:
-- Admin: Admin@123
-- Recruiter: Recruiter@123
-- Candidate: Candidate@123
INSERT INTO users (id, email, password, full_name, role, is_active) VALUES
(1, 'admin@careerconnect.com', '$2a$10$wN1q0y2wZ.Y3rX4q1L2g3.eY4b5n6m7k8j9h0g1f2d3s4a5p6o7i', 'Platform Administrator', 'ADMIN', TRUE),
(2, 'recruiter.sarah@techcorp.com', '$2a$10$wN1q0y2wZ.Y3rX4q1L2g3.eY4b5n6m7k8j9h0g1f2d3s4a5p6o7i', 'Sarah Jenkins', 'RECRUITER', TRUE),
(3, 'recruiter.david@finedge.com', '$2a$10$wN1q0y2wZ.Y3rX4q1L2g3.eY4b5n6m7k8j9h0g1f2d3s4a5p6o7i', 'David Miller', 'RECRUITER', TRUE),
(4, 'candidate.alex@example.com', '$2a$10$wN1q0y2wZ.Y3rX4q1L2g3.eY4b5n6m7k8j9h0g1f2d3s4a5p6o7i', 'Alex Morgan', 'CANDIDATE', TRUE),
(5, 'candidate.priya@example.com', '$2a$10$wN1q0y2wZ.Y3rX4q1L2g3.eY4b5n6m7k8j9h0g1f2d3s4a5p6o7i', 'Priya Sharma', 'CANDIDATE', TRUE),
(6, 'candidate.jordan@example.com', '$2a$10$wN1q0y2wZ.Y3rX4q1L2g3.eY4b5n6m7k8j9h0g1f2d3s4a5p6o7i', 'Jordan Lee', 'CANDIDATE', TRUE);

-- 3. Insert Recruiter Profiles
INSERT INTO recruiter_profiles (id, user_id, company_id, phone, title, department) VALUES
(1, 2, 1, '+1 (415) 555-0142', 'Lead Technical Recruiter', 'Talent Acquisition'),
(2, 3, 2, '+1 (212) 555-0199', 'Senior Talent Partner', 'Human Resources');

-- 4. Insert Candidate Profiles
INSERT INTO candidate_profiles (id, user_id, phone, location, headline, summary, skills, education, experience, linkedin_url, portfolio_url, resume_file_path, resume_file_name) VALUES
(1, 4, '+1 (555) 234-5678', 'San Francisco, CA', 'Full Stack Java & React Engineer', 'Experienced software engineer with 5+ years building scalable microservices in Java/Spring Boot and responsive frontends with React and TypeScript.', 'Java, Spring Boot, React, TypeScript, MySQL, Docker, REST APIs, Microservices, Tailwind CSS', 'B.S. in Computer Science - University of California, Berkeley (2019-2023)', 'Software Engineer at CloudNative Labs (2023 - Present): Engineered distributed Spring Boot services and optimized REST endpoints.\nJunior Developer at CodeCraft (2022 - 2023): Built customer-facing React components.', 'https://linkedin.com/in/alex-morgan-dev', 'https://alexmorgan.dev', 'uploads/resumes/sample-resume-alex.pdf', 'Alex_Morgan_Resume.pdf'),
(2, 5, '+1 (555) 345-6789', 'Boston, MA', 'Data Scientist & Machine Learning Specialist', 'Data scientist skilled in Python, SQL, predictive modeling, and scalable analytics pipelines with experience transforming complex datasets into actionable insights.', 'Python, SQL, Data Analysis, Machine Learning, Tableau, Pandas, NumPy, Scikit-Learn, BigQuery', 'M.S. in Data Analytics - Boston University (2022-2024)', 'Data Analyst at HealthMetrics (2024 - Present): Analyzed healthcare retention metrics and built real-time executive dashboards.', 'https://linkedin.com/in/priya-sharma-data', 'https://priyasharma.ai', 'uploads/resumes/sample-resume-priya.pdf', 'Priya_Sharma_Resume.pdf'),
(3, 6, '+1 (555) 456-7890', 'Seattle, WA', 'Lead UI/UX Product Designer', 'Passionate product designer focusing on accessible user interfaces, comprehensive design systems, user journey mapping, and high-fidelity prototyping.', 'UI/UX Design, Figma, Design Systems, Wireframing, User Research, Prototyping, Accessibility (WCAG), Tailwind CSS', 'B.Des. in Interactive Design - University of Washington (2020-2024)', 'UI Designer at CreativeStudio (2023 - Present): Designed multi-tenant SaaS dashboards and unified component libraries in Figma.', 'https://linkedin.com/in/jordan-lee-design', 'https://jordanlee.design', 'uploads/resumes/sample-resume-jordan.pdf', 'Jordan_Lee_Resume.pdf');

-- 5. Insert 10 Realistic Jobs
INSERT INTO jobs (id, title, company_id, recruiter_id, description, responsibilities, skills_required, qualifications, category, location, workplace_type, employment_type, experience_level, salary_min, salary_max, salary_currency, is_salary_negotiable, status, moderation_status, application_deadline, created_at) VALUES
(1, 'Senior Java Developer', 1, 2, 'Join TechCorp Solutions to architect high-throughput backend services and lead API design for our distributed cloud platform.', 'Architect and maintain resilient Spring Boot microservices.\nOptimize JPA/Hibernate SQL queries and manage database performance.\nCollaborate with frontend engineers to deliver intuitive RESTful APIs.\nWrite comprehensive JUnit and Mockito automated tests.', 'Java 21, Spring Boot 3, Spring Data JPA, MySQL, Docker, JUnit, Microservices', 'Bachelor degree in CS or equivalent with 4+ years of professional backend Java experience.', 'Software Development', 'San Francisco, CA', 'HYBRID', 'FULL_TIME', 'Senior Level', 125000.00, 160000.00, 'USD', FALSE, 'PUBLISHED', 'APPROVED', '2026-12-31', CURRENT_TIMESTAMP),

(2, 'Frontend Developer (React)', 1, 2, 'We are seeking a talented Frontend Engineer to craft modern, accessible web applications using React, TypeScript, and Tailwind CSS.', 'Build reusable, performant React components with TypeScript.\nCollaborate with UX designers to translate Figma mockups into pixel-perfect pages.\nIntegrate RESTful APIs and handle complex client-side state.\nImplement responsive layouts and ensure WCAG accessibility.', 'React, TypeScript, Tailwind CSS, Vite, REST APIs, HTML5/CSS3, Git', '3+ years experience with modern React (hooks, context, TypeScript) and modern styling frameworks.', 'Software Development', 'Remote', 'REMOTE', 'FULL_TIME', 'Mid Level', 105000.00, 135000.00, 'USD', TRUE, 'PUBLISHED', 'APPROVED', '2026-11-30', CURRENT_TIMESTAMP),

(3, 'React Developer', 5, 2, 'CreativePulse is hiring a React Developer to build interactive creative dashboards and modern client portals.', 'Develop high-performance UI components with smooth micro-interactions.\nWork closely with the design team to ensure aesthetic excellence.\nOptimize frontend bundle size, lighthouse scores, and rendering speeds.', 'React, JavaScript/TypeScript, CSS Animations, Responsive Design, State Management', '2+ years of hands-on React production experience with an eye for design details.', 'Design', 'Seattle, WA', 'HYBRID', 'FULL_TIME', 'Mid Level', 100000.00, 125000.00, 'USD', FALSE, 'PUBLISHED', 'APPROVED', '2026-12-15', CURRENT_TIMESTAMP),

(4, 'Full Stack Developer', 1, 2, 'Lead end-to-end feature delivery spanning Spring Boot backend APIs to React TypeScript user interfaces.', 'Own full-stack feature lifecycles from architecture to deployment.\nDevelop robust backend endpoints with Spring Security and JPA.\nBuild engaging frontend dashboards with React and Tailwind.\nDeploy containers and monitor performance metrics in staging and production.', 'Java, Spring Boot, React, TypeScript, MySQL, Docker, REST APIs, Tailwind CSS', '3+ years full-stack development experience across Java and modern JavaScript frameworks.', 'Software Development', 'San Francisco, CA', 'HYBRID', 'FULL_TIME', 'Senior Level', 130000.00, 165000.00, 'USD', TRUE, 'PUBLISHED', 'APPROVED', '2026-12-20', CURRENT_TIMESTAMP),

(5, 'Data Analyst', 6, 2, 'Turn complex raw telemetry and business transaction records into actionable business insights and dashboards.', 'Design and automate business metrics dashboards using SQL and BI tools.\nPerform exploratory data analysis to identify operational trends.\nPartner with stakeholders to define key performance indicators and report progress.', 'SQL, Python, Data Visualization, Excel, Tableau, Statistics, Analytical Thinking', '2+ years analytical experience working with relational databases and SQL queries.', 'Data Science', 'Chicago, IL', 'REMOTE', 'FULL_TIME', 'Entry Level', 80000.00, 105000.00, 'USD', FALSE, 'PUBLISHED', 'APPROVED', '2026-11-25', CURRENT_TIMESTAMP),

(6, 'Software Engineer (Fintech)', 2, 3, 'FinEdge Systems is looking for a core Software Engineer to build low-latency transactional trading pipelines.', 'Build mission-critical, fault-tolerant transaction services.\nParticipate in rigorous peer code reviews and architectural discussions.\nEnsure bank-grade security protocols, encryption, and auditability.', 'Java, Spring Boot, Distributed Systems, Concurrency, SQL, Security, Message Queues', 'Bachelor in Computer Science or Software Engineering with 3+ years backend experience.', 'Finance', 'New York, NY', 'ON_SITE', 'FULL_TIME', 'Mid Level', 135000.00, 175000.00, 'USD', FALSE, 'PUBLISHED', 'APPROVED', '2026-12-31', CURRENT_TIMESTAMP),

(7, 'UI/UX Designer', 5, 2, 'Shape the visual language, design system, and user experience for multiple client applications at CreativePulse.', 'Create wireframes, user journeys, interaction flows, and high-fidelity mockups in Figma.\nMaintain and evolve our comprehensive design tokens and component library.\nConduct user testing sessions to iterate on interface usability.', 'Figma, UI/UX Design, Prototyping, Wireframing, User Research, Design Systems, Accessibility', '3+ years UI/UX design experience with a strong portfolio showcasing web apps.', 'Design', 'Remote', 'REMOTE', 'FULL_TIME', 'Mid Level', 95000.00, 125000.00, 'USD', TRUE, 'PUBLISHED', 'APPROVED', '2026-12-10', CURRENT_TIMESTAMP),

(8, 'DevOps Engineer', 3, 2, 'Accelerate engineering productivity by automating CI/CD pipelines and managing cloud Kubernetes clusters.', 'Maintain CI/CD automation pipelines for continuous testing and deployment.\nManage AWS and containerized Kubernetes environments using Terraform.\nImplement monitoring, alerting, and log aggregation with Prometheus and Grafana.', 'Docker, Kubernetes, AWS, CI/CD, Terraform, Linux, Shell Scripting, Monitoring', '3+ years in DevOps / Site Reliability Engineering supporting production cloud workloads.', 'Software Development', 'Austin, TX', 'REMOTE', 'FULL_TIME', 'Senior Level', 125000.00, 155000.00, 'USD', FALSE, 'PUBLISHED', 'APPROVED', '2026-12-31', CURRENT_TIMESTAMP),

(9, 'QA Engineer (Automation)', 1, 2, 'Ensure rock-solid software quality through automated regression testing, integration testing, and API verification.', 'Develop automated test suites for REST APIs and web interfaces.\nCollaborate with development teams during sprint planning to identify test criteria.\nAnalyze bug patterns and track quality metrics across release milestones.', 'Test Automation, Selenium/Playwright, JUnit, REST API Testing, Postman, CI/CD, Java', '2+ years software QA experience with automated testing focus.', 'Software Development', 'Austin, TX', 'HYBRID', 'FULL_TIME', 'Mid Level', 85000.00, 115000.00, 'USD', TRUE, 'PUBLISHED', 'APPROVED', '2026-11-20', CURRENT_TIMESTAMP),

(10, 'Business Analyst', 2, 3, 'Bridge the gap between institutional finance requirements and engineering deliverables at FinEdge Systems.', 'Gather, document, and translate business requirements into technical user stories.\nAnalyze market trends and regulatory workflows in quantitative finance.\nCoordinate user acceptance testing (UAT) with international stakeholders.', 'Business Analysis, Agile/Scrum, Requirements Gathering, JIRA, SQL, Process Mapping', '3+ years experience as a Business Analyst in financial services or SaaS companies.', 'Human Resources', 'New York, NY', 'ON_SITE', 'FULL_TIME', 'Mid Level', 90000.00, 120000.00, 'USD', FALSE, 'PUBLISHED', 'APPROVED', '2026-12-15', CURRENT_TIMESTAMP);

-- 6. Insert Demo Applications
INSERT INTO job_applications (id, job_id, candidate_id, cover_letter, resume_file_path, resume_file_name, status, status_notes, applied_at) VALUES
(1, 4, 4, 'Dear TechCorp Team, I am thrilled to apply for the Full Stack Developer position. My experience building robust Java Spring Boot architectures and modern React user interfaces matches the team needs perfectly.', 'uploads/resumes/sample-resume-alex.pdf', 'Alex_Morgan_Resume.pdf', 'APPLIED', 'Application submitted and awaiting preliminary recruiter review.', CURRENT_TIMESTAMP),
(2, 1, 4, 'Dear Hiring Manager, With over 5 years of backend engineering in Java and Spring ecosystem, I have led high-volume API projects and would love to bring my technical expertise to TechCorp.', 'uploads/resumes/sample-resume-alex.pdf', 'Alex_Morgan_Resume.pdf', 'SHORTLISTED', 'Candidate passed initial phone screen. Advanced to technical interview round.', CURRENT_TIMESTAMP),
(3, 5, 5, 'Dear Hiring Manager, As a passionate data specialist proficient in SQL and Python analytics, I look forward to contributing to DataSphere Analytics data intelligence pipeline.', 'uploads/resumes/sample-resume-priya.pdf', 'Priya_Sharma_Resume.pdf', 'UNDER_REVIEW', 'Application and portfolio currently under review by analytics team lead.', CURRENT_TIMESTAMP),
(4, 7, 6, 'Hello CreativePulse team! I have extensive experience building scalable design systems in Figma and translating them to accessible digital products. I would love to join your creative team.', 'uploads/resumes/sample-resume-jordan.pdf', 'Jordan_Lee_Resume.pdf', 'SELECTED', 'Candidate selected for offer extension following final portfolio presentation.', CURRENT_TIMESTAMP);

-- 7. Insert Saved Jobs
INSERT INTO saved_jobs (id, job_id, candidate_id) VALUES
(1, 8, 4),
(2, 6, 4),
(3, 4, 5);

-- 8. Insert Status History for Applications
INSERT INTO application_status_history (id, application_id, previous_status, new_status, changed_by_user_id, notes, created_at) VALUES
(1, 1, NULL, 'APPLIED', 4, 'Candidate submitted initial application.', CURRENT_TIMESTAMP),
(2, 2, NULL, 'APPLIED', 4, 'Candidate submitted initial application.', CURRENT_TIMESTAMP),
(3, 2, 'APPLIED', 'UNDER_REVIEW', 2, 'Recruiter started reviewing candidate qualifications.', CURRENT_TIMESTAMP),
(4, 2, 'UNDER_REVIEW', 'SHORTLISTED', 2, 'Resume shortlisted for technical interview round.', CURRENT_TIMESTAMP),
(5, 3, NULL, 'APPLIED', 5, 'Candidate submitted initial application.', CURRENT_TIMESTAMP),
(6, 3, 'APPLIED', 'UNDER_REVIEW', 2, 'Recruiter moved candidate to review queue.', CURRENT_TIMESTAMP),
(7, 4, NULL, 'APPLIED', 6, 'Candidate submitted initial application.', CURRENT_TIMESTAMP),
(8, 4, 'APPLIED', 'SHORTLISTED', 2, 'Shortlisted based on exceptional Figma portfolio.', CURRENT_TIMESTAMP),
(9, 4, 'SHORTLISTED', 'SELECTED', 2, 'Final candidate selection confirmed.', CURRENT_TIMESTAMP);

-- 9. Insert Initial Audit Log Records
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, created_at) VALUES
(1, 1, 'SYSTEM_BOOTSTRAP', 'SYSTEM', 1, 'Platform initialized with seed configuration and demo accounts.', '127.0.0.1', CURRENT_TIMESTAMP),
(2, 2, 'JOB_CREATED', 'JOB', 1, 'Recruiter Sarah Jenkins published job: Senior Java Developer', '127.0.0.1', CURRENT_TIMESTAMP),
(3, 2, 'STATUS_UPDATE', 'APPLICATION', 2, 'Updated application #2 status to SHORTLISTED', '127.0.0.1', CURRENT_TIMESTAMP);
