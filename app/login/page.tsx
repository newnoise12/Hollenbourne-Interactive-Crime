import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTeamForSession } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  // Already logged in? Skip straight to the dashboard rather than showing
  // the form again.
  const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const team = await getTeamForSession(sessionId);
  if (team) {
    redirect("/dashboard");
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full">
        <h1 className="text-2xl font-semibold text-center mb-1">Hollenbourne Case Review</h1>
        <p className="text-sm text-neutral-500 text-center mb-8">
          Log in with your team&apos;s name and passcode, or create a new team.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
