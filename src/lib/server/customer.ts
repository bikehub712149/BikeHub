import { connectDB, getMemoryStore } from "@/lib/db";
import CustomerTransaction from "@/models/CustomerTransaction";
import { uppercaseDbText } from "@/lib/utils";
import { buildPagination } from "./pagination";

function normalizeCustomer(customer: any) {
  if (!customer) return customer;

  return {
    ...customer,
    bikeId: uppercaseDbText(customer.bikeId),
    broker: customer.broker
      ? { ...customer.broker, name: uppercaseDbText(customer.broker.name ?? "") }
      : customer.broker,
    seller: customer.seller
      ? {
          ...customer.seller,
          name: uppercaseDbText(customer.seller.name ?? ""),
          address: uppercaseDbText(customer.seller.address ?? ""),
        }
      : customer.seller,
    buyer: customer.buyer
      ? {
          ...customer.buyer,
          name: uppercaseDbText(customer.buyer.name ?? ""),
          address: uppercaseDbText(customer.buyer.address ?? ""),
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

function applyUpdatePatch(target: any, updatePayload: any) {
  const patch = updatePayload?.$set ?? updatePayload ?? {};
  const next = structuredClone(target);

  for (const [key, value] of Object.entries(patch)) {
    if (key.includes(".")) {
      const [parent, child] = key.split(".");
      next[parent] = {
        ...(next[parent] ?? {}),
        [child]: value,
      };
    } else {
      next[key] = value;
    }
  }

  return normalizeCustomer(next);
}

export async function getCustomers() {
  const isConnected = await connectDB();
  if (!isConnected) {
    return getMemoryStore().customers.map(normalizeCustomer);
  }

  const customers = await CustomerTransaction.find().lean();
  return customers.map(normalizeCustomer);
}

export async function getCustomerByBikeId(bikeId: string) {
  const isConnected = await connectDB();
  const target = uppercaseDbText(bikeId);

  if (!isConnected) {
    const customer = getMemoryStore().customers.find(
      (c) => uppercaseDbText(c.bikeId) === target || c.id === bikeId
    );
    return normalizeCustomer(customer ?? null);
  }

  const customer = await CustomerTransaction.findOne(bikeIdFilter(bikeId)).lean();
  return normalizeCustomer(customer);
}

export async function createCustomer(data: any) {
  const isConnected = await connectDB();
  if (!isConnected) {
    const store = getMemoryStore();
    const created = normalizeCustomer({
      ...data,
      buyer: data.buyer ?? null,
      sellingPrice: data.sellingPrice ?? null,
      saleDate: data.saleDate ?? null,
      receipt: data.receipt ?? null,
      createdAt: new Date().toISOString(),
    });
    store.customers.unshift(created);
    return created;
  }

  return CustomerTransaction.create(data);
}

export async function updateCustomer(
  bikeId: string,
  data: any
) {
  const isConnected = await connectDB();
  const target = uppercaseDbText(bikeId);

  if (!isConnected) {
    const store = getMemoryStore();
    const index = store.customers.findIndex(
      (c) => uppercaseDbText(c.bikeId) === target
    );
    if (index === -1) return null;

    store.customers[index] = applyUpdatePatch(store.customers[index], data);
    return store.customers[index];
  }

  return CustomerTransaction.findOneAndUpdate(
    bikeIdFilter(bikeId),
    data,
    {
      new: true,
    }
  );
}

export async function deleteCustomerByBikeId(bikeId: string) {
  const isConnected = await connectDB();
  const target = uppercaseDbText(bikeId);

  if (!isConnected) {
    const store = getMemoryStore();
    const index = store.customers.findIndex(
      (c) => uppercaseDbText(c.bikeId) === target
    );
    if (index === -1) return null;
    const [removed] = store.customers.splice(index, 1);
    return removed;
  }

  return CustomerTransaction.findOneAndDelete(bikeIdFilter(bikeId));
}

export async function getCustomersPage({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const isConnected = await connectDB();
  if (!isConnected) {
    const all = getMemoryStore().customers;
    const totalItems = all.length;
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);
    return {
      items: items.map(normalizeCustomer),
      pagination: buildPagination(page, pageSize, totalItems),
    };
  }

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