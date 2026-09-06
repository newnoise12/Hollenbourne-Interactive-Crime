import { NextResponse } from "next/server";
import { STUDENT_COOKIE_NAME } from "@/lib/session-cookie";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(STUDENT_COOKIE_NAME);
  return res;
}
