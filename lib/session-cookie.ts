export const SESSION_COOKIE_NAME = "hollenbourne_session";
export const INSTRUCTOR_SESSION_COOKIE_NAME = "hollenbourne_instructor_session";
// Not an auth token — just remembers which student is answering quizzes on
// this browser. Re-validated against the logged-in team on every read (see
// lib/students.ts usage in app/dashboard/quiz/page.tsx) so a stale cookie
// from a previous team on a shared computer is never trusted.
export const STUDENT_COOKIE_NAME = "hollenbourne_student";
