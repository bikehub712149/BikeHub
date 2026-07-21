import { Schema, model, models } from "mongoose";
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
    },

    model: {
      type: String,
      required: true,
    },

    year: {
      type: String,
      required: true,
    },

    kms: {
      type: String,
      required: true,
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
    },

    images: {
      type: [String],
      default: [],
    },

    engineNumber: String,

    chassisNumber: String,

    ownerSerial: {
      type: String,
      default: "1st Owner",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Bike || model("Bike", BikeSchema);
