import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <article className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900">
          Back to Bike Hub
        </Link>
        <h1 className="mt-8 text-3xl font-bold tracking-tight">Terms &amp; Conditions</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Bike Hub is an internal inventory and transaction management tool. Use it only for authorized business activities and keep customer information confidential.
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Data entered into Bike Hub should be accurate and handled according to your organization&apos;s privacy and record-keeping policies.
        </p>
        <p className="mt-8 text-xs text-slate-400">Created and maintained by dev.nasim.</p>
      </article>
    </main>
  );
}