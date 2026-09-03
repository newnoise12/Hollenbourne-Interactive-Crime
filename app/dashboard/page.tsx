import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import LogoutButton from "./LogoutButton";

export default async function DashboardPage() {
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);

  if (!team) {
    redirect("/login");
  }

  return (
    <main className="flex-1 px-4 py-10 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-neutral-500">Logged in as</p>
          <h1 className="text-2xl font-semibold">{team.name}</h1>
        </div>
        <LogoutButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/case-log"
          className="block rounded-lg border border-neutral-300 p-6 hover:border-neutral-900 transition-colors"
        >
          <h2 className="font-semibold mb-1">Case log</h2>
          <p className="text-sm text-neutral-500">
            Open and cite the evidence exhibits your team has access to.
          </p>
        </Link>

        <Link
          href="/dashboard/actions"
          className="block rounded-lg border border-neutral-300 p-6 hover:border-neutral-900 transition-colors"
        >
          <h2 className="font-semibold mb-1">Investigation actions</h2>
          <p className="text-sm text-neutral-500">
            Spend this week&apos;s actions and review your team&apos;s permanent case log.
          </p>
        </Link>

        <Link
          href="/dashboard/quiz"
          className="block rounded-lg border border-neutral-300 p-6 hover:border-neutral-900 transition-colors"
        >
          <h2 className="font-semibold mb-1">Week 2 trust activity</h2>
          <p className="text-sm text-neutral-500">
            Rank sources by trustworthiness &mdash; your score sets this week&apos;s trust bonus.
          </p>
        </Link>
      </div>
    </main>
  );
}
