import { z } from "zod";

const str = (fallback = "NA") =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? fallback : v));

const num = () => z.coerce.number().catch(0);

const bikeSchema = z.object({
  number: str(),
  model: str(),
  year: str(),
  kms: str("0"),

  expectedSellingPrice: num(),

  engineNumber: str(),
  chassisNumber: str(),
  brokerName: z.string().trim().optional().default(""),
  brokerPhone: z.string().trim().optional().default(""),

  sellerName: str(),
  sellerPhone: str(),
  sellerAddress: str(),

  purchasePrice: num(),

  ownerSerial: str("1"),
});

export function validateBike(data: unknown) {
  return bikeSchema.parse(data);
}

const soldBikeSchema = z.object({
  buyerName: str(),
  buyerPhone: str(),
  buyerAddress: str(),

  sellingPrice: num(),

  saleDate: str(new Date().toISOString()),
});

export function validateSoldBike(data: unknown) {
  return soldBikeSchema.parse(data);
}
