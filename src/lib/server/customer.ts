import { connectDB } from "@/lib/db";
import CustomerTransaction from "@/models/CustomerTransaction";
import { uppercaseDbText } from "@/lib/utils";
import { buildPagination } from "./pagination";

function normalizeCustomer(customer: any) {
  if (!customer) return customer;

  return {
    ...customer,
    bikeId: uppercaseDbText(customer.bikeId),
    broker: customer.broker
      ? { ...customer.broker, name: uppercaseDbText(customer.broker.name) }
      : customer.broker,
    seller: customer.seller
      ? {
          ...customer.seller,
          name: uppercaseDbText(customer.seller.name),
          address: uppercaseDbText(customer.seller.address),
        }
      : customer.seller,
    buyer: customer.buyer
      ? {
          ...customer.buyer,
          name: uppercaseDbText(customer.buyer.name),
          address: uppercaseDbText(customer.buyer.address),
        }
      : customer.buyer,
  };
}

function bikeIdFilter(bikeId: string) {
  return {
    bikeId: new RegExp(`^${escapeRegex(uppercaseDbText(bikeId))}$`, "i"),
  };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getCustomers() {
  await connectDB();
  const customers = await CustomerTransaction.find().lean();
  return customers.map(normalizeCustomer);
}

export async function getCustomerByBikeId(bikeId: string) {
  await connectDB();
  const customer = await CustomerTransaction.findOne(bikeIdFilter(bikeId)).lean();
  return normalizeCustomer(customer);
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
    bikeIdFilter(bikeId),
    data,
    {
      new: true,
    }
  );
}

export async function deleteCustomerByBikeId(bikeId: string) {
  await connectDB();

  return CustomerTransaction.findOneAndDelete(bikeIdFilter(bikeId));
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
    items: items.map(normalizeCustomer),
    pagination: buildPagination(page, pageSize, totalItems),
  };
}