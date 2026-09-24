import { db } from "@/db/client";
import { moduleSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MAX_WEEK } from "./actions-catalog";

const SETTINGS_ID = "singleton";

/** The module-wide current week, instructor-controlled. Defaults to 1 if never set. */
export async function getCurrentWeek(): Promise<number> {
  const row = await db.query.moduleSettings.findFirst({ where: eq(moduleSettings.id, SETTINGS_ID) });
  return row?.currentWeek ?? 1;
}

export async function setCurrentWeek(week: number): Promise<number> {
  const clamped = Math.min(MAX_WEEK, Math.max(1, Math.round(week)));
  await db
    .insert(moduleSettings)
    .values({ id: SETTINGS_ID, currentWeek: clamped })
    .onConflictDoUpdate({ target: moduleSettings.id, set: { currentWeek: clamped, updatedAt: new Date() } });
  return clamped;
}
