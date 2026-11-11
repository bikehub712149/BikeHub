import { NextResponse } from "next/server";

import { getBikesPage } from "@/lib/server/bike";
import { getCustomers } from "@/lib/server/customer";
import { verifyAdmin } from "@/lib/server/admin-auth";
import { getPaginationParams } from "@/lib/server/pagination";
import { connectDB } from "@/lib/db";
import CustomerTransaction from "@/models/CustomerTransaction";

export async function GET(req: Request) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const url = new URL(req.url);
    const { page, pageSize } = getPaginationParams(url.searchParams);
    const paperworkParam = url.searchParams.get("paperwork")?.toLowerCase();
    const paperwork =
      paperworkParam === "pending"
        ? "Pending"
        : paperworkParam === "completed"
        ? "Completed"
        : undefined;

    const result = await getBikesPage({
      status: "Sold",
      paperwork,
      page,
      pageSize,
    });

    const isConnected = await connectDB();

    if (isConnected) {
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

      return NextResponse.json({
        items: sales,
        summary: {
          totalRevenue: summaryResult[0]?.totalRevenue ?? 0,
          totalProfit: summaryResult[0]?.totalProfit ?? 0,
          bikesSold,
        },
        pagination: result.pagination,
      });
    }

    // Fallback when running without MongoDB connection
    const allCustomers = await getCustomers();
    const sales = result.items.map((bike) => {
      const customer = allCustomers.find((c: any) => c.bikeId === bike.number);
      return {
        ...bike,
        buyer: customer?.buyer,
        sellingPrice: customer?.sellingPrice,
        purchasePrice: customer?.purchasePrice,
        receipt: customer?.receipt,
        saleDate: customer?.saleDate,
      };
    });

    let totalRevenue = 0;
    let totalProfit = 0;
    for (const c of allCustomers) {
      if (c.sellingPrice !== null && c.sellingPrice !== undefined) {
        const sell = Number(c.sellingPrice) || 0;
        const buy = Number(c.purchasePrice) || 0;
        totalRevenue += sell;
        totalProfit += sell - buy;
      }
    }

    return NextResponse.json({
      items: sales,
      summary: {
        totalRevenue,
        totalProfit,
        bikesSold: result.pagination.totalItems,
      },
      pagination: result.pagination,
    });
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}
