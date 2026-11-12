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
    <div className="flex-1 overflow-y-auto p-4 max-sm:p-2 pb-32">
      <div className="mb-6 max-sm:mb-4">
        <h1 className="text-2xl max-sm:text-lg font-bold tracking-tight text-slate-900">
          Inventory Management
        </h1>
        <p className="mt-1 max-sm:mt-0.5 text-sm max-sm:text-xs text-slate-500">
          Browse and manage all vehicles in your inventory.
        </p>
      </div>

      <div className="mb-6 max-sm:mb-4 flex w-max max-w-full overflow-x-auto gap-2 max-sm:gap-1 rounded-xl max-sm:rounded-lg border border-slate-200 bg-slate-100 p-1">
        {filters.map(([label, href, active]) => (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-lg max-sm:rounded-md px-5 py-2 max-sm:px-3 max-sm:py-1.5 text-sm max-sm:text-xs font-semibold transition ${
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
