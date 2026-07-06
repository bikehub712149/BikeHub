import { bikes } from "@/data/bikes";

export async function getAllBikes() {
  return bikes;
}

export async function getRecentBikes(limit = 6) {
  return bikes.slice(0, limit);
}

export async function getBikeById(id: string) {
  return bikes.find((bike) => bike.id === id);
}