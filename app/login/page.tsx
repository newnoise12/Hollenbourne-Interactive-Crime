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
    <main className="flex-1 bg-[#23262B] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#A6764A] m-0">
            Hollenbourne Police &middot; Case Review Panel
          </p>
          <h1 className="font-serif font-bold text-2xl text-[#E8E1D0] mt-1 mb-2">Hollenbourne Case Review</h1>
          <p className="font-mono text-xs text-[#8A8A80] m-0">
            Log in with your team&apos;s name and passcode, or create a new team.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
