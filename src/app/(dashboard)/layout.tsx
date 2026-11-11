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

const isProduction = process.env.NODE_ENV === "production";
const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (hasClerkKeys) {
    // Keep authentication and authorization separate: signed-in users can still be denied.
    const authObject = await auth();

    // Unauthenticated users belong on the sign-in route in production.
    if (!authObject.userId) {
      if (isProduction) {
        redirect("/sign-in");
      }
    } else {
      // 3. Extract the email from the Clerk session token
      const userEmail = authObject.sessionClaims?.email as string;

      // This allowlist must stay aligned with verifyAdmin, which protects the API routes.
      if (!userEmail || !ALLOWED_ADMINS.includes(userEmail)) {
        return (
          <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans dark:bg-slate-950">
            <div className="text-center rounded-2xl bg-white p-6 sm:p-10 shadow-sm border dark:bg-slate-900 dark:border-slate-800">
              <h1 className="text-2xl sm:text-3xl font-bold text-red-600">Access Denied</h1>
              <p className="mt-3 text-sm sm:text-base text-slate-500">
                This inventory portal is restricted to authorized shop admins only.
              </p>
            </div>
          </div>
        );
      }
    }
  }

  // Only authorized administrators reach the dashboard shell.
  return (
    <div className="flex min-h-screen w-full max-w-full overflow-x-hidden font-sans">
      <Sidebar />

      <main className="flex min-h-screen min-w-0 flex-1 flex-col">
        <NavigationToast />
        <Navbar />

        <div className="flex-1 bg-slate-50 p-3 sm:p-6 lg:p-8 dark:bg-slate-950">
          {children}
        </div>
      </main>
    </div>
  );
}