import { customers } from "@/data/customers";

export async function getCustomers() {
  return customers;
}

export async function getCustomerReceipt(id: string) {
  return customers.find((c) => c.receiptId === id);
}