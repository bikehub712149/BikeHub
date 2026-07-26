import { z } from "zod";

const bikeSchema = z.object({
  number: z.string().trim().default("NA"),
  model: z.string().trim().default("NA"),
  year: z.string().trim().default("NA"),
  kms: z.string().trim().default("0"),

  expectedSellingPrice: z.coerce.number().default(0),

  engineNumber: z.string().trim().default("NA"),
  chassisNumber: z.string().trim().default("NA"),

  sellerName: z.string().trim().default("NA"),
  sellerPhone: z.string().trim().default("NA"),
  sellerAddress: z.string().trim().default("NA"),

  purchasePrice: z.coerce.number().default(0),

  ownerSerial: z.string().default("1"),
});

export function validateBike(data: unknown) {
  return bikeSchema.parse(data);
}

export function safeValidateBike(data: unknown) {
  return bikeSchema.safeParse(data);
}


const soldBikeSchema = z.object({
  buyerName: z.string().trim().default("NA"),
  buyerPhone: z.string().trim().default("NA"),
  buyerAddress: z.string().trim().default("NA"),

  sellingPrice: z.coerce.number().default(0),

  saleDate: z.string().default(() => new Date().toISOString()),
});

export function validateSoldBike(data: unknown) {
  return soldBikeSchema.parse(data);
}