import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidInstructorSession } from "@/lib/instructor-auth";
import { INSTRUCTOR_SESSION_COOKIE_NAME } from "@/lib/session-cookie";
import InstructorLoginForm from "./InstructorLoginForm";

export default async function InstructorLoginPage() {
  const sessionId = (await cookies()).get(INSTRUCTOR_SESSION_COOKIE_NAME)?.value;
  if (await isValidInstructorSession(sessionId)) {
    redirect("/instructor");
  }

  return (
    <main className="flex-1 bg-[#23262B]/90 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#A6764A] m-0">
            Hollenbourne Police &middot; Case Review Panel
          </p>
          <h1 className="font-serif font-bold text-2xl text-[#E8E1D0] mt-1 mb-2">Instructor access</h1>
          <p className="font-mono text-xs text-[#8A8A80] m-0">
            Enter the instructor passcode to view all teams&apos; progress.
          </p>
        </div>
        <InstructorLoginForm />
      </div>
    </main>
  );
}
