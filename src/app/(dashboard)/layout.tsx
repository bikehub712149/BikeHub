import { ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";

import { Inter, Poppins } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
});

// 1. Define your allowed shop admin emails here
const ALLOWED_ADMINS = [
  "bikehub.712149@gmail.com", // Replace with your actual email!
];

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Grab the full auth object instead of just userId
  const authObject = await auth();

  // 2. If they aren't logged in at all, redirect to sign-in
  if (!authObject.userId) {
    redirect("/sign-in");
  }

  // 3. Extract the email from the Clerk session token
  const userEmail = authObject.sessionClaims?.email as string;

  // 4. Block them if their email is NOT in the allowed list
  if (!userEmail || !ALLOWED_ADMINS.includes(userEmail)) {
    return (
      <div className={`${inter.variable} ${poppins.variable} flex min-h-screen items-center justify-center bg-slate-50 font-sans dark:bg-slate-950`}>
        <div className="text-center rounded-2xl bg-white p-10 shadow-sm border dark:bg-slate-900 dark:border-slate-800">
          <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-3 text-slate-500">
            This inventory portal is restricted to authorized shop admins only.
          </p>
        </div>
      </div>
    );
  }

  // 5. If they pass the checks, render your actual dashboard!
  return (
    <div className={`${inter.variable} ${poppins.variable} flex min-h-screen font-sans`}>
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 p-8 dark:bg-slate-950">
          {children}
        </div>
      </main>
    </div>
  );
}