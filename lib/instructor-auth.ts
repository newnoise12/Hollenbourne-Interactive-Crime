import bcrypt from "bcryptjs";
import { db } from "@/db/client";
import { instructorSessions } from "@/db/schema";
import { eq, gt, and } from "drizzle-orm";

// Same session lifetime as team logins (lib/auth.ts) — a term-length login
// shouldn't expire mid-week for instructors either.
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

export class InstructorAuthError extends Error {}

/**
 * Verifies the shared instructor passcode against INSTRUCTOR_PASSCODE_HASH.
 * There's no per-instructor account — this just proves the passcode was
 * entered correctly, same as any single shared-secret gate.
 */
export async function verifyInstructorPasscode(passcode: string) {
  const hash = process.env.INSTRUCTOR_PASSCODE_HASH;
  if (!hash) {
    throw new InstructorAuthError("Instructor access isn't configured on this server.");
  }

  const valid = await bcrypt.compare(passcode, hash);
  if (!valid) {
    throw new InstructorAuthError("Incorrect passcode.");
  }
}

/** Creates an instructor session row and returns it (id goes in a cookie). */
export async function createInstructorSession() {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const [session] = await db.insert(instructorSessions).values({ expiresAt }).returning();
  return session;
}

/** Returns true if the given session id is a valid, unexpired instructor session. */
export async function isValidInstructorSession(sessionId: string | undefined) {
  if (!sessionId) return false;

  const session = await db.query.instructorSessions.findFirst({
    where: and(eq(instructorSessions.id, sessionId), gt(instructorSessions.expiresAt, new Date())),
  });
  return !!session;
}

/** Deletes an instructor session row (logout). Safe to call with an id that doesn't exist. */
export async function destroyInstructorSession(sessionId: string) {
  await db.delete(instructorSessions).where(eq(instructorSessions.id, sessionId));
}
