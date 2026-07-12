import { connectDB } from "@/lib/db";
import Bike from "@/models/Bike";
import { Bike as BikeType } from "@/types/bike";

export async function getAllBikes() {
  await connectDB();

  return await Bike.find()
    .sort({ createdAt: -1 })
    .lean<BikeType[]>();
}

export async function getBikeById(id: string) {
  await connectDB();

  return await Bike.findOne({ id }).lean<BikeType | null>();
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

  return Bike.findOneAndUpdate(
    { number: bikeId },
    {
      status: "Sold",
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
    { number: bikeNumber },
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