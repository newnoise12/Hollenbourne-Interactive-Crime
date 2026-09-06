import { db } from "@/db/client";
import { students, teams } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Student = { id: string; name: string; teamId: string };

/** A team's current student roster, for the "who are you" picker. */
export async function getStudentsForTeam(teamId: string): Promise<Student[]> {
  const rows = await db.query.students.findMany({ where: eq(students.teamId, teamId) });
  return rows.map((r) => ({ id: r.id, name: r.name, teamId: r.teamId }));
}

export async function getStudentById(id: string): Promise<Student | null> {
  const row = await db.query.students.findFirst({ where: eq(students.id, id) });
  return row ? { id: row.id, name: row.name, teamId: row.teamId } : null;
}

/**
 * Resolves a student by name within a team, reusing an existing row when
 * one matches (case-insensitively, trimmed) rather than creating a
 * near-duplicate every time someone retypes their name slightly
 * differently. Rosters are small (a handful of students per team), so
 * comparing in JS after one query is simpler than a SQL lower()-index.
 */
export async function getOrCreateStudent(teamId: string, name: string): Promise<Student> {
  const trimmed = name.trim();
  const existing = await getStudentsForTeam(teamId);
  const match = existing.find((s) => s.name.toLowerCase() === trimmed.toLowerCase());
  if (match) return match;

  const [row] = await db.insert(students).values({ teamId, name: trimmed }).returning();
  return { id: row.id, name: row.name, teamId: row.teamId };
}

export type StudentWithTeam = { id: string; name: string; teamId: string; teamName: string; createdAt: Date };

/** Every student across every team, for the instructor reassignment tool. */
export async function getAllStudentsWithTeams(): Promise<StudentWithTeam[]> {
  const rows = await db
    .select({
      id: students.id,
      name: students.name,
      teamId: students.teamId,
      teamName: teams.name,
      createdAt: students.createdAt,
    })
    .from(students)
    .innerJoin(teams, eq(students.teamId, teams.id));

  return rows;
}

/**
 * Instructor-only: moves a student to a different team going forward.
 * Deliberately touches only students.teamId — quizAttempts.teamIdAtAttempt
 * rows are untouched, so every past week's team average stays exactly what
 * it was before the move.
 */
export async function reassignStudentTeam(studentId: string, newTeamId: string): Promise<void> {
  await db.update(students).set({ teamId: newTeamId }).where(eq(students.id, studentId));
}
