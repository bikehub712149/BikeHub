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
    const paperworkParam = url.searchParams.get("paperwork")?.toLowerCase();
    const paperwork = paperworkParam === "pending" ? "Pending" : paperworkParam === "completed" ? "Completed" : undefined;
    const result = await getBikesPage({
      status: "Sold",
      paperwork,
      page,
      pageSize,
    });
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
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}
