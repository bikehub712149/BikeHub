import { NextResponse } from "next/server";

import { getBikesPage } from "@/lib/server/bike";
import { verifyAdmin } from "@/lib/server/admin-auth";
import { getPaginationParams } from "@/lib/server/pagination";
import CustomerTransaction from "@/models/CustomerTransaction";

export async function GET(req: Request) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const url = new URL(req.url);
    const { page, pageSize } = getPaginationParams(url.searchParams);
    const month = url.searchParams.get("month");
    const paperworkParam = url.searchParams.get("paperwork")?.toLowerCase();
    const paperwork = paperworkParam === "pending" ? "Pending" : paperworkParam === "completed" ? "Completed" : undefined;
    const result = await getBikesPage({
      status: "Sold",
      paperwork,
      page,
      pageSize,
    });
    // Page sold bikes first, then join their customer transaction data by registration number.
    const customers = await CustomerTransaction.find({
      bikeId: { $in: result.items.map((bike) => bike.number) },
    }).lean();

    const sales = result.items.map((bike) => {
        const customer = customers.find((c: any) => c.bikeId === bike.number);

        return {
          ...bike,
          buyer: customer?.buyer,
          sellingPrice: customer?.sellingPrice,
          purchasePrice: customer?.purchasePrice,
          receipt: customer?.receipt,
          saleDate: customer?.saleDate,
        };
    });

    // Summary totals cover all matching transactions, not only the current page.
    const [summaryResult, bikesSold] = await Promise.all([
      CustomerTransaction.aggregate([
        { $match: { sellingPrice: { $ne: null } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $ifNull: ["$sellingPrice", 0] } },
            totalProfit: {
              $sum: {
                $subtract: [
                  { $ifNull: ["$sellingPrice", 0] },
                  { $ifNull: ["$purchasePrice", 0] },
                ],
              },
            },
          },
        },
      ]),
      result.pagination.totalItems,
    ]);

    let monthlyReport = null;
    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return NextResponse.json({ message: "Month must use YYYY-MM format" }, { status: 400 });
      }

      const [year, monthNumber] = month.split("-").map(Number);
      const monthStart = new Date(Date.UTC(year, monthNumber - 1, 1));
      const nextMonthStart = new Date(Date.UTC(year, monthNumber, 1));

      if (
        monthStart.getUTCFullYear() !== year ||
        monthStart.getUTCMonth() !== monthNumber - 1
      ) {
        return NextResponse.json({ message: "Invalid month" }, { status: 400 });
      }

      const monthlyResult = await CustomerTransaction.aggregate([
        {
          $match: {
            saleDate: { $gte: monthStart, $lt: nextMonthStart },
            sellingPrice: { $ne: null },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $ifNull: ["$sellingPrice", 0] } },
            totalProfit: {
              $sum: {
                $subtract: [
                  { $ifNull: ["$sellingPrice", 0] },
                  { $ifNull: ["$purchasePrice", 0] },
                ],
              },
            },
            bikesSold: { $sum: 1 },
          },
        },
      ]);

      monthlyReport = {
        month,
        totalRevenue: monthlyResult[0]?.totalRevenue ?? 0,
        totalProfit: monthlyResult[0]?.totalProfit ?? 0,
        bikesSold: monthlyResult[0]?.bikesSold ?? 0,
      };
    }

    return NextResponse.json({
      items: sales,
      summary: {
        totalRevenue: summaryResult[0]?.totalRevenue ?? 0,
        totalProfit: summaryResult[0]?.totalProfit ?? 0,
        bikesSold,
      },
      monthlyReport,
      pagination: result.pagination,
    });
  } catch (error) {

    return NextResponse.json(
      { message: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}
