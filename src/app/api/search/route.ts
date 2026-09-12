import { NextResponse } from "next/server";
import { getCustomers } from "@/lib/server/customer";
import { getAllBikes } from "@/lib/server/bike";
import { verifyAdmin } from "@/lib/server/admin-auth";

export async function GET(req: Request) {
  try {
    const authError = await verifyAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim().toLowerCase();

    if (!q) return NextResponse.json([]);
    // Search is intentionally bounded because this route searches normalized data in memory.
    if (q.length > 100) return NextResponse.json([]);

    const [bikes, customers] = await Promise.all([
      getAllBikes(),
      getCustomers(),
    ]);

    const results = customers
      .map((customer: any) => {
        const bike = bikes.find((b: any) => b.number === customer.bikeId);

        if (!bike) return null;

        return {
          bikeId: bike.id,
          number: bike.number,
          model: bike.model,
          image: bike.image,
          status: bike.status,

          seller: customer.seller,
          buyer: customer.buyer,
        };
      })
      .filter(Boolean)
      .filter((item: any) => {
        return (
          item.number.toLowerCase().includes(q) ||
          item.model.toLowerCase().includes(q) ||
          item.seller?.name?.toLowerCase().includes(q) ||
          item.seller?.phone?.includes(q) ||
          item.buyer?.name?.toLowerCase().includes(q) ||
          item.buyer?.phone?.includes(q)
        );
      })
      // A bike can have multiple customer records; return each matching bike once.
      .filter(
        (item: any, index: number, items: any[]) =>
          items.findIndex((candidate) => candidate.bikeId === item.bikeId) === index
      );

    return NextResponse.json(results.slice(0, 8));
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
