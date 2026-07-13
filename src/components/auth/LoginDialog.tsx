"use client";

import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">BikeHub</h1>

          <p className="mt-2 text-slate-500">Admin Login</p>
        </div>

        <SignIn
          routing="path"
          path="/sign-in"
          forceRedirectUrl="/"
          appearance={{
            elements: {
              card: "shadow-none border-0 p-0",
              rootBox: "w-full",
              footer: "hidden",

              footerAction: {
                display: "none",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
