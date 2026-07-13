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

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className={`${inter.variable} ${poppins.variable} flex min-h-screen`}>
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