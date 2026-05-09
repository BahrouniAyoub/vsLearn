# vsLearn Roadmap

This roadmap tracks the path from the current frontend prototype to a production full-stack learning platform.

## 1. Foundation

- Stabilize the TanStack Start routing structure.
- Keep the VS Code-inspired visual system consistent across pages.
- Extract repeated UI patterns where useful without over-abstracting.
- Document setup, deployment assumptions, and project conventions.
- Add baseline lint/build checks to the development workflow.
- Identify the initial data model for courses, modules, lessons, users, progress, and badges.

## 2. Auth/Database

- Add Cloudflare D1 schema and migrations.
- Seed initial course, module, and lesson data.
- Implement server-side authentication with secure HTTP-only sessions.
- Add register, login, logout, and current-user flows.
- Protect dashboard and learning routes for authenticated users.
- Add role-based access control for admin routes.
- Replace mock user data with database-backed queries.

## 3. Learning Engine

- Store enrollments and course progress persistently.
- Track lesson completion, quiz attempts, scores, and timestamps.
- Add resume-learning logic based on the latest incomplete lesson.
- Add bookmarks and saved lessons.
- Add badge-awarding rules.
- Replace static dashboard stats with real learner data.
- Add server validation for learning mutations.

## 4. Editor/Test Runner

- Replace browser `new Function` execution with a safer challenge runner.
- Define challenge test cases, expected output, hints, and solution metadata.
- Add execution limits for time, memory, and output size.
- Return structured test results to the lesson UI.
- Support JavaScript and TypeScript challenges first.
- Add richer editor behavior such as file tabs, reset, hints, and submissions.

## 5. Certificates

- Define certificate eligibility rules.
- Generate certificates when a course is completed.
- Store certificate records and verification IDs.
- Add public certificate verification pages.
- Add downloadable certificate assets or PDFs.
- Add certificate history to the learner dashboard.

## 6. Admin Dashboard

- Replace mock admin tables with database-backed views.
- Add course creation, editing, publishing, and archiving.
- Add module and lesson management.
- Add user management and role assignment.
- Add progress, enrollment, completion, and engagement analytics.
- Add audit logging for administrative actions.
- Add safe destructive-action confirmations.

## 7. Production Launch

- Configure Cloudflare production bindings and environments.
- Add deployment documentation and release checklist.
- Add automated database migration workflow.
- Add error monitoring and structured logging.
- Add rate limiting for auth and code execution endpoints.
- Add accessibility and responsive design audits.
- Add smoke tests for critical user flows.
- Finalize SEO metadata, Open Graph tags, and public marketing content.
- Launch with a small initial course catalog and monitored rollout.
