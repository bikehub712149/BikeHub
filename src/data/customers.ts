import { CustomerTransaction } from "@/types/coustomer";

export const customers: CustomerTransaction[] = [
  {
    id: "1",
    bikeId: "WB15XX1234",

    seller: {
      name: "Rahul Sharma",
      phone: "9876543210",
      address: "Kolkata",
      documents: ["aadhaar.jpg", "pan.jpg"],
    },

    buyer: {
      name: "Anwar Hossain",
      phone: "9123456789",
      address: "Howrah",
      documents: ["aadhaar.jpg"],
    },

    purchasePrice: 110000,
    sellingPrice: 145000,

    receiptId: "receipt-wb15xx1234.jpg",
  },

  {
    id: "2",
    bikeId: "WB24BT7821",

    seller: {
      name: "Arup Ghosh",
      phone: "9831123456",
      address: "Bardhaman",
      documents: ["aadhaar.jpg"],
    },

    buyer: null,

    purchasePrice: 108000,
    sellingPrice: null,

    receiptId: null,
  },

  {
    id: "3",
    bikeId: "WB20CC6719",

    seller: {
      name: "Subhajit Roy",
      phone: "9874412233",
      address: "Siliguri",
      documents: [],
    },

    buyer: null,

    purchasePrice: 142000,
    sellingPrice: null,

    receiptId: null,
  },

  {
    id: "4",
    bikeId: "WB16DD3198",

    seller: {
      name: "Prasenjit Dey",
      phone: "9007123456",
      address: "Kolkata",
      documents: ["voter-id.jpg"],
    },

    buyer: {
      name: "Rakesh Kumar",
      phone: "8899123456",
      address: "Asansol",
      documents: ["aadhaar.jpg", "pan.jpg"],
    },

    purchasePrice: 98000,
    sellingPrice: 118000,

    receiptId: "receipt-wb16dd3198.jpg",
  },

  {
    id: "5",
    bikeId: "WB26EF9043",

    seller: {
      name: "Debashis Mondal",
      phone: "9123450000",
      address: "Krishnanagar",
      documents: [],
    },

    buyer: null,

    purchasePrice: 151000,
    sellingPrice: null,

    receiptId: null,
  },

  {
    id: "6",
    bikeId: "WB11GH2875",

    seller: {
      name: "Sayan Chatterjee",
      phone: "7001002233",
      address: "Hooghly",
      documents: ["aadhaar.jpg"],
    },

    buyer: null,

    purchasePrice: 162000,
    sellingPrice: null,

    receiptId: null,
  },

  {
    id: "7",
    bikeId: "WB22JK5641",

    seller: {
      name: "Bikram Saha",
      phone: "9433001122",
      address: "Kalyani",
      documents: ["pan.jpg"],
    },

    buyer: null,

    purchasePrice: 135000,
    sellingPrice: null,

    receiptId: null,
  },

  {
    id: "8",
    bikeId: "WB18AA4587",

    seller: {
      name: "Sourav Pal",
      phone: "9000000000",
      address: "Durgapur",
      documents: ["aadhaar.jpg"],
    },

    buyer: {
      name: "Md. Imran",
      phone: "7980123456",
      address: "Howrah",
      documents: ["aadhaar.jpg", "driving-license.jpg"],
    },

    purchasePrice: 82000,
    sellingPrice: 95000,

    receiptId: "receipt-wb18aa4587.jpg",
  },
];