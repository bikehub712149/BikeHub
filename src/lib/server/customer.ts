import { connectDB } from "@/lib/db";
import CustomerTransaction from "@/models/CustomerTransaction";

export async function getCustomers() {
  await connectDB();
  return CustomerTransaction.find().lean();
}

export async function getCustomerByBikeId(bikeId: string) {
  await connectDB();
  return CustomerTransaction.findOne({ bikeId }).lean();
}

export async function createCustomer(data: any) {
  await connectDB();
  return CustomerTransaction.create(data);
}

export async function updateCustomer(id: string, data: any) {
  await connectDB();

  return CustomerTransaction.findOneAndUpdate(
    { id },
    data,
    { new: true }
  );
}

export async function deleteCustomerByBikeId(bikeId: string) {
  await connectDB();

  return CustomerTransaction.findOneAndDelete({ bikeId });
}