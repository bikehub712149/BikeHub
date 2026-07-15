import { Schema, model, models } from "mongoose";

const PersonSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    documents: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const CustomerTransactionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },

    bikeId: {
      type: String,
      required: true,
    },

    seller: {
      type: PersonSchema,
      required: true,
    },

    buyer: {
      type: PersonSchema,
      default: null,
    },

    purchasePrice: {
      type: Number,
      required: true,
    },

    sellingPrice: {
      type: Number,
      default: null,
    },

    saleDate: {
      type: Date,
      default: null,
    },

    receipt: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default models.CustomerTransaction ||
  model("CustomerTransaction", CustomerTransactionSchema);