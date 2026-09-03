import bcrypt from "bcryptjs";
import { db } from "@/db/client";
import { teams, sessions } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days — a term-length login shouldn't expire mid-week
const PASSCODE_MIN_LENGTH = 6;

export class AuthError extends Error {}

/** Creates a new team with a hashed passcode. Throws AuthError on bad input or duplicate name. */
export async function createTeam(name: string, passcode: string) {
  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    throw new AuthError("Team name must be at least 2 characters.");
  }
  if (passcode.length < PASSCODE_MIN_LENGTH) {
    throw new AuthError(`Passcode must be at least ${PASSCODE_MIN_LENGTH} characters.`);
  }

  const existing = await db.query.teams.findFirst({
    where: eq(teams.name, trimmedName),
  });
  if (existing) {
    throw new AuthError("A team with that name already exists.");
  }

  const passcodeHash = await bcrypt.hash(passcode, 10);
  const [team] = await db
    .insert(teams)
    .values({ name: trimmedName, passcodeHash })
    .returning();

  return team;
}

/** Verifies team name + passcode. Returns the team row on success, throws AuthError on failure. */
export async function verifyTeamLogin(name: string, passcode: string) {
  const team = await db.query.teams.findFirst({
    where: eq(teams.name, name.trim()),
  });
  if (!team) {
    // Deliberately the same error as a wrong passcode — don't reveal which part was wrong.
    throw new AuthError("Team name or passcode is incorrect.");
  }

  const valid = await bcrypt.compare(passcode, team.passcodeHash);
  if (!valid) {
    throw new AuthError("Team name or passcode is incorrect.");
  }

  return team;
}

/** Creates a session row for a team and returns the session id (to be stored in a cookie). */
export async function createSession(teamId: string) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const [session] = await db
    .insert(sessions)
    .values({ teamId, expiresAt })
    .returning();
  return session;
}

/** Looks up a session by id, returning the associated team if the session is valid and unexpired. */
export async function getTeamForSession(sessionId: string | undefined) {
  if (!sessionId) return null;

  const session = await db.query.sessions.findFirst({
    where: and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())),
  });
  if (!session) return null;

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, session.teamId),
  });
  return team ?? null;
}

/** Deletes a session row (logout). Safe to call with an id that doesn't exist. */
export async function destroySession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
