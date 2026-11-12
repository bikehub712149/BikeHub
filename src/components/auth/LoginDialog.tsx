"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-3 sm:p-6">
      <div className="w-full max-w-md overflow-hidden rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-8 shadow-xl">
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold">BikeHub</h1>

          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-slate-500">Admin Login</p>
        </div>

        {hasClerkKey ? (
          <div className="flex justify-center w-full overflow-x-hidden">
            <SignIn
              routing="path"
              path="/sign-in"
              forceRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full max-w-full",
                  cardBox: "w-full max-w-full shadow-none border-0",
                  card: "w-full max-w-full shadow-none border-0 p-0",
                  footer: "hidden",
                  footerAction: {
                    display: "none",
                  },
                },
              }}
            />
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-600">
              Local administrator session is active.
            </p>
            <Link href="/" className="block">
              <Button className="w-full rounded-xl">Continue to Dashboard</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
