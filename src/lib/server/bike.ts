import { connectDB } from "@/lib/db";
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
  await connectDB();

  const bikes = await Bike.find()
    .sort({ createdAt: -1 })
    .lean<BikeType[]>();
  return normalizeBikes(bikes);
}

export async function getBikeById(id: string) {
  await connectDB();

  const bike = await Bike.findOne({ id }).lean<BikeType | null>();
  return bike ? normalizeBike(bike) : null;
}

export async function createBike(data: BikeType) {
  await connectDB();

  return await Bike.create(data);
}

export async function updateBike(
  id: string,
  data: Partial<BikeType>
) {
  await connectDB();

  return await Bike.findOneAndUpdate({ id }, data, {
    new: true,
  }).lean<BikeType | null>();
}

export async function markBikeAsSold(bikeId: string) {
  await connectDB();

  // Sales are keyed by registration number; completing a sale also resets paperwork to pending.
  return Bike.findOneAndUpdate(
    { number: new RegExp(`^${escapeRegex(uppercaseDbText(bikeId))}$`, "i") },
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
  await connectDB();

  return Bike.updateOne(
    { number: new RegExp(`^${escapeRegex(uppercaseDbText(bikeNumber))}$`, "i") },
    {
      $set: {
        paperwork,
      },
    }
  );
}

export async function deleteBike(id: string) {
  await connectDB();

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
  await connectDB();

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
  await connectDB();

  if (numbers.length === 0) return [];

  const normalizedNumbers = numbers.map((number) => uppercaseDbText(number));
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
  await connectDB();

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