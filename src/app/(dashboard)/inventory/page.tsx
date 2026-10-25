import Link from "next/link";
import InventoryList from "@/components/inventory/inventory-list";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const normalizedStatus =
    status === "available" || status === "sold" ? status : undefined;

  const filters = [
    ["All Bikes", "/inventory", !normalizedStatus],
    ["Available", "/inventory?status=available", normalizedStatus === "available"],
    ["Sold", "/inventory?status=sold", normalizedStatus === "sold"],
  ] as const;

  return (
    <div className="flex-1 overflow-y-auto p-0 pb-28 sm:p-4 sm:pb-32">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Inventory Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse and manage all vehicles in your inventory.
        </p>
      </div>

      <div className="mb-6 grid w-full grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 sm:flex sm:w-max sm:gap-2">
        {filters.map(([label, href, active]) => (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-2 py-2 text-center text-xs font-semibold transition sm:px-5 sm:text-sm ${
              active ? "border bg-white shadow-sm" : "text-slate-600 hover:bg-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <InventoryList status={normalizedStatus} />
    </div>
  );
}
