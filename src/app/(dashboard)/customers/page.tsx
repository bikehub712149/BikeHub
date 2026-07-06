import Link from "next/link";
import { FileText, User, Calendar, IndianRupee } from "lucide-react";

const customers = [
  {
    id: "1",
    name: "Rahul Das",
    bikeNumber: "WB-15-XX-1234",
    bikeModel: "Royal Enfield Classic 350",
    amount: "145000",
    saleDate: "02 Jul 2026",
    receiptId: "WB15XX1234",
  },
  {
    id: "2",
    name: "Anwar Hossain",
    bikeNumber: "WB-18-AA-4587",
    bikeModel: "TVS Raider 125",
    amount: "95000",
    saleDate: "28 Jun 2026",
    receiptId: "WB18AA4587",
  },
];

export default function Customers() {
  return (
    <div className="flex-1 p-8">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Customers
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Customers who purchased bikes from your showroom.
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-5">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              {/* Left */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    {customer.name}
                  </h2>
                </div>

                <div>
                  <p className="font-semibold text-slate-800">
                    {customer.bikeNumber}
                  </p>

                  <p className="text-sm text-slate-500">
                    {customer.bikeModel}
                  </p>
                </div>

                <div className="flex flex-wrap gap-6 pt-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    {customer.saleDate}
                  </div>

                  <div className="flex items-center gap-2 font-semibold text-green-700">
                    <IndianRupee size={16} />
                    {customer.amount}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div>
                <Link
                  href={`/customers/receipt/${customer.receiptId}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <FileText size={18} />
                  View Receipt
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}