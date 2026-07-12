import { Schema, model, models } from "mongoose";
console.log("Loading Bike model");
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
      type: Number,
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
      default: "Pending",
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
  },
  {
    timestamps: true,
  }
);

export default models.Bike || model("Bike", BikeSchema);