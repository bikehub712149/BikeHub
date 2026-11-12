import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import NavigationToast from "@/components/layout/navigation-toast";

// 1. Define your allowed shop admin emails here
const ALLOWED_ADMINS = [
  "bikehub.712149@gmail.com", // Replace with your actual email!
];

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Keep authentication and authorization separate: signed-in users can still be denied.
  const authObject = await auth();

  // 2. Unauthenticated users belong on the sign-in route, not the access-denied screen.
  if (!authObject.userId) {
    if (process.env.AISTUDIO_PREVIEW !== "true") {
      redirect("/sign-in");
    }
  } else {
    // 3. Extract the email from the Clerk session token
    const userEmail = authObject.sessionClaims?.email as string | undefined;

    // This allowlist must stay aligned with verifyAdmin, which protects the API routes.
    if (!userEmail || !ALLOWED_ADMINS.includes(userEmail)) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans dark:bg-slate-950">
          <div className="text-center rounded-2xl bg-white p-10 shadow-sm border dark:bg-slate-900 dark:border-slate-800">
            <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
            <p className="mt-3 text-slate-500">
              This inventory portal is restricted to authorized shop admins only.
            </p>
          </div>
        </div>
      );
    }
  }

  // Only authorized administrators reach the dashboard shell.
  return (
    <div className="flex min-h-screen font-sans">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <NavigationToast />
        <Navbar />

        <div className="flex-1 bg-slate-50 p-6 max-sm:p-3 dark:bg-slate-950">
          {children}
        </div>
      </main>
    </div>
  );
}