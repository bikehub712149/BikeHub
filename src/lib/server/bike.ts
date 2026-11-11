import { connectDB, getMemoryStore } from "@/lib/db";
import Bike from "@/models/Bike";
import { Bike as BikeType } from "@/types/bike";
import { uppercaseDbText } from "@/lib/utils";
import { buildPagination } from "./pagination";

function normalizeBike(bike: BikeType): BikeType {
  // Normalize read results so identifiers and search comparisons match stored uppercase data.
  return {
    ...bike,
    number: uppercaseDbText(bike.number),
    model: uppercaseDbText(bike.model),
    engineNumber: uppercaseDbText(bike.engineNumber ?? ""),
    chassisNumber: uppercaseDbText(bike.chassisNumber ?? ""),
    ownerSerial: uppercaseDbText(bike.ownerSerial ?? ""),
  };
}

function normalizeBikes(bikes: BikeType[]) {
  return bikes.map(normalizeBike);
}

export async function getAllBikes() {
  const isConnected = await connectDB();
  if (!isConnected) {
    return normalizeBikes(getMemoryStore().bikes);
  }

  const bikes = await Bike.find()
    .sort({ createdAt: -1 })
    .lean<BikeType[]>();
  return normalizeBikes(bikes);
}

export async function getBikeById(id: string) {
  const isConnected = await connectDB();
  if (!isConnected) {
    const found = getMemoryStore().bikes.find((b) => b.id === id);
    return found ? normalizeBike(found) : null;
  }

  const bike = await Bike.findOne({ id }).lean<BikeType | null>();
  return bike ? normalizeBike(bike) : null;
}

export async function createBike(data: BikeType) {
  const isConnected = await connectDB();
  if (!isConnected) {
    const store = getMemoryStore();
    const normalizedNumber = uppercaseDbText(data.number);
    if (
      store.bikes.some(
        (b) => uppercaseDbText(b.number) === normalizedNumber
      )
    ) {
      const duplicateErr: any = new Error("Duplicate registration number");
      duplicateErr.code = 11000;
      duplicateErr.keyPattern = { number: 1 };
      throw duplicateErr;
    }

    const created = {
      ...normalizeBike(data),
      createdAt: new Date().toISOString(),
    };
    store.bikes.unshift(created);
    return created;
  }

  return await Bike.create(data);
}

export async function updateBike(
  id: string,
  data: Partial<BikeType>
) {
  const isConnected = await connectDB();
  if (!isConnected) {
    const store = getMemoryStore();
    const index = store.bikes.findIndex((b) => b.id === id);
    if (index === -1) return null;

    const updated = normalizeBike({
      ...store.bikes[index],
      ...data,
    });
    store.bikes[index] = {
      ...store.bikes[index],
      ...updated,
    };
    return store.bikes[index];
  }

  return await Bike.findOneAndUpdate({ id }, data, {
    new: true,
  }).lean<BikeType | null>();
}

export async function markBikeAsSold(bikeId: string) {
  const isConnected = await connectDB();
  const target = uppercaseDbText(bikeId);

  if (!isConnected) {
    const store = getMemoryStore();
    const bike = store.bikes.find(
      (b) => uppercaseDbText(b.number) === target
    );
    if (!bike) return null;
    bike.status = "Sold";
    bike.paperwork = "Pending";
    return bike;
  }

  // Sales are keyed by registration number; completing a sale also resets paperwork to pending.
  return Bike.findOneAndUpdate(
    { number: new RegExp(`^${escapeRegex(target)}$`, "i") },
    {
      status: "Sold",
      paperwork: "Pending",
    },
    { new: true }
  );
}

export async function updateBikePaperwork(
  bikeNumber: string,
  paperwork: "Pending" | "Completed"
) {
  const isConnected = await connectDB();
  const target = uppercaseDbText(bikeNumber);

  if (!isConnected) {
    const store = getMemoryStore();
    const bike = store.bikes.find(
      (b) => uppercaseDbText(b.number) === target
    );
    if (!bike) {
      return { matchedCount: 0 };
    }
    bike.paperwork = paperwork;
    return { matchedCount: 1 };
  }

  return Bike.updateOne(
    { number: new RegExp(`^${escapeRegex(target)}$`, "i") },
    {
      $set: {
        paperwork,
      },
    }
  );
}

export async function deleteBike(id: string) {
  const isConnected = await connectDB();
  if (!isConnected) {
    const store = getMemoryStore();
    const index = store.bikes.findIndex((b) => b.id === id);
    if (index === -1) return null;
    const [removed] = store.bikes.splice(index, 1);
    return removed;
  }

  return await Bike.findOneAndDelete({ id });
}

export async function getBikesPage({
  status,
  paperwork,
  page,
  pageSize,
}: {
  status?: "Available" | "Sold";
  paperwork?: "Pending" | "Completed";
  page: number;
  pageSize: number;
}) {
  const isConnected = await connectDB();
  if (!isConnected) {
    const filtered = getMemoryStore().bikes.filter((bike) => {
      if (status && bike.status !== status) return false;
      if (paperwork && bike.paperwork !== paperwork) return false;
      return true;
    });
    const totalItems = filtered.length;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return {
      items: normalizeBikes(items),
      pagination: buildPagination(page, pageSize, totalItems),
    };
  }

  // The _id tie-breaker keeps page order stable when bikes share a createdAt timestamp.
  const filter = {
    ...(status ? { status } : {}),
    ...(paperwork ? { paperwork } : {}),
  };
  const [items, totalItems] = await Promise.all([
    Bike.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean<BikeType[]>(),
    Bike.countDocuments(filter),
  ]);

  return {
    items: normalizeBikes(items),
    pagination: buildPagination(page, pageSize, totalItems),
  };
}

export async function getBikesByNumbers(numbers: string[]) {
  if (numbers.length === 0) return [];

  const isConnected = await connectDB();
  const normalizedNumbers = numbers.map((number) => uppercaseDbText(number));

  if (!isConnected) {
    const numSet = new Set(normalizedNumbers);
    const matched = getMemoryStore().bikes.filter((bike) =>
      numSet.has(uppercaseDbText(bike.number))
    );
    return normalizeBikes(matched);
  }

  const bikes = await Bike.find({
    number: {
      $in: normalizedNumbers.map(
        (number) => new RegExp(`^${escapeRegex(number)}$`, "i")
      ),
    },
  }).lean<BikeType[]>();
  return normalizeBikes(bikes);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getBikeOverview() {
  const isConnected = await connectDB();
  if (!isConnected) {
    const bikes = getMemoryStore().bikes;
    return {
      recentBikes: normalizeBikes(bikes.slice(0, 6)),
      totalStock: bikes.filter((b) => b.status === "Available").length,
      soldBikes: bikes.filter((b) => b.status === "Sold").length,
      pendingBikes: bikes.filter((b) => b.paperwork === "Pending").length,
    };
  }

  const [recentBikes, totalStock, soldBikes, pendingBikes] = await Promise.all([
    Bike.find().sort({ createdAt: -1, _id: -1 }).limit(6).lean<BikeType[]>(),
    Bike.countDocuments({ status: "Available" }),
    Bike.countDocuments({ status: "Sold" }),
    Bike.countDocuments({ paperwork: "Pending" }),
  ]);

  return {
    recentBikes: normalizeBikes(recentBikes),
    totalStock,
    soldBikes,
    pendingBikes,
  };
}