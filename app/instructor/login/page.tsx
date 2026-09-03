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
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full">
        <h1 className="text-2xl font-semibold text-center mb-1">Instructor access</h1>
        <p className="text-sm text-neutral-500 text-center mb-8">
          Enter the instructor passcode to view all teams&apos; progress.
        </p>
        <InstructorLoginForm />
      </div>
    </main>
  );
}
