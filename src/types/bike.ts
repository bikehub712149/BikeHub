export type BikeStatus = "Available" | "Sold" | "Pending";

export interface Bike {
  id: string;
  number: string;
  model: string;
  year: number;
  kms: string;
  expectedSellingPrice: number;
  status: BikeStatus;
  image: string; // cover image (thumbnail)
  images?: string[]; // all uploaded images
  paperwork?: "Pending" | "Completed";
  ownerSerial: string;
  engineNumber: string;
  chassisNumber: string;
}
