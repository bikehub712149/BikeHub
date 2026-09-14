import { Schema, model, models } from "mongoose";
import { uppercaseDbText } from "@/lib/utils";

const uppercase = (value: unknown) => uppercaseDbText(String(value ?? ""));
const BikeSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },

    number: {
      type: String,
      required: true,
      unique: true,
      set: uppercase,
    },

    model: {
      type: String,
      required: true,
      set: uppercase,
    },

    year: {
      type: String,
      required: true,
      set: uppercase,
    },

    kms: {
      type: String,
      set: uppercase,
    },

    expectedSellingPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Available", "Sold"],
      default: "Available",
    },

    paperwork: {
      type: String,
      enum: ["Completed", "Pending"],
    },

    image: {
      type: String,
      default: "",
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    engineNumber: { type: String, set: uppercase },

    chassisNumber: { type: String, set: uppercase },

    ownerSerial: {
      type: String,
      default: "1st Owner",
      required: true,
      set: uppercase,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Bike || model("Bike", BikeSchema);
