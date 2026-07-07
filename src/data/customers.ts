import { CustomerTransaction } from "@/types/coustomer";

export const customers: CustomerTransaction[] = [
  {
    id: "1",
    bikeId: "WB15XX1234",

    seller: {
      name: "Rahul Sharma",
      phone: "9876543210",
      address: "Kolkata",
    },

    buyer: {
      name: "Anwar Hossain",
      phone: "9123456789",
      address: "Howrah",
    },

    purchasePrice: 110000,
    sellingPrice: 145000,
    receiptId: "WB15XX1234",
  },

  {
    id: "2",
    bikeId: "WB18AA4587",

    seller: {
      name: "Sourav Pal",
      phone: "9000000000",
      address: "Durgapur",
    },

    buyer: null,

    purchasePrice: 82000,
    sellingPrice: null,

    receiptId: null,
  },
];