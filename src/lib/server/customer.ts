import { connectDB } from "@/lib/db";
import CustomerTransaction from "@/models/CustomerTransaction";
import { uppercaseDbText } from "@/lib/utils";
import { buildPagination } from "./pagination";

export async function getCustomers() {
  await connectDB();
  return CustomerTransaction.find().lean();
}

export async function getCustomerByBikeId(bikeId: string) {
  await connectDB();
  return CustomerTransaction.findOne({ bikeId: uppercaseDbText(bikeId) }).lean();
}

export async function createCustomer(data: any) {
  await connectDB();
  return CustomerTransaction.create(data);
}

export async function updateCustomer(
  bikeId: string,
  data: any
) {
  await connectDB();

  return CustomerTransaction.findOneAndUpdate(
    { bikeId: uppercaseDbText(bikeId) },
    data,
    {
      new: true,
    }
  );
}

export async function deleteCustomerByBikeId(bikeId: string) {
  await connectDB();

  return CustomerTransaction.findOneAndDelete({
    bikeId: uppercaseDbText(bikeId),
  });
}

export async function getCustomersPage({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  await connectDB();

  // Customer records are paginated independently; API routes enrich them with bike data afterward.
  const [items, totalItems] = await Promise.all([
    CustomerTransaction.find()
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    CustomerTransaction.countDocuments(),
  ]);

  return {
    items,
    pagination: buildPagination(page, pageSize, totalItems),
  };
}