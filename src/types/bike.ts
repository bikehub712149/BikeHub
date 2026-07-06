export type BikeStatus = "Available" | "Sold" | "Pending";

export interface Bike {
  id: string;
  number: string;
  model: string;
  year: number;
  kms: string;
  price: string;
  status: BikeStatus;
  image: string;
}