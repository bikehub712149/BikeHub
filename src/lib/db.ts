import mongoose from "mongoose";
import { Bike as BikeType } from "@/types/bike";

mongoose.set("bufferCommands", false);

export interface StoredBike extends BikeType {
  createdAt?: string;
}

export interface StoredCustomer {
  id: string;
  bikeId: string;
  broker?: {
    name?: string;
    phone?: string;
  };
  seller: {
    name: string;
    phone: string;
    address: string;
    documents: string[];
  };
  buyer: {
    name: string;
    phone: string;
    address: string;
    documents: string[];
  } | null;
  purchasePrice: number;
  sellingPrice: number | null;
  saleDate: string | Date | null;
  receipt: string | null;
  createdAt?: string;
}

interface MemoryStore {
  bikes: StoredBike[];
  customers: StoredCustomer[];
}

declare global {
  var __bikeHubMemoryStore: MemoryStore | undefined;
}

const INITIAL_BIKES: StoredBike[] = [
  {
    id: "bike-1",
    number: "WB16AB4512",
    model: "ROYAL ENFIELD CLASSIC 350",
    year: "2023-06",
    kms: "12,400",
    expectedSellingPrice: 168000,
    status: "Available",
    image: "/fallback.bikehub.png",
    images: ["/fallback.bikehub.png"],
    ownerSerial: "1",
    engineNumber: "U3S5F1PK084112",
    chassisNumber: "ME3U3S5F1PK084112",
    createdAt: "2026-10-20T10:00:00.000Z",
  },
  {
    id: "bike-2",
    number: "WB18CD8821",
    model: "YAMAHA MT-15 V2",
    year: "2024-02",
    kms: "6,850",
    expectedSellingPrice: 145000,
    status: "Available",
    image: "/fallback.bikehub.png",
    images: ["/fallback.bikehub.png"],
    ownerSerial: "1",
    engineNumber: "G3N4E0294812",
    chassisNumber: "ME1RG6721R0029481",
    createdAt: "2026-10-18T14:30:00.000Z",
  },
  {
    id: "bike-3",
    number: "WB42EF3094",
    model: "BAJAJ PULSAR NS200",
    year: "2022-09",
    kms: "18,200",
    expectedSellingPrice: 112000,
    status: "Sold",
    paperwork: "Pending",
    image: "/fallback.bikehub.png",
    images: ["/fallback.bikehub.png"],
    ownerSerial: "1",
    engineNumber: "JLZCNP44901",
    chassisNumber: "MD2A36FZ2NCP44901",
    createdAt: "2026-10-12T09:15:00.000Z",
  },
  {
    id: "bike-4",
    number: "WB16GH7710",
    model: "TVS APACHE RTR 160 4V",
    year: "2023-04",
    kms: "14,100",
    expectedSellingPrice: 105000,
    status: "Sold",
    paperwork: "Completed",
    image: "/fallback.bikehub.png",
    images: ["/fallback.bikehub.png"],
    ownerSerial: "1",
    engineNumber: "OE4AP2109844",
    chassisNumber: "MD637CE47P2A09844",
    createdAt: "2026-10-05T11:45:00.000Z",
  },
];

const INITIAL_CUSTOMERS: StoredCustomer[] = [
  {
    id: "cust-1",
    bikeId: "WB16AB4512",
    broker: { name: "RAJU DAS", phone: "9830011223" },
    seller: {
      name: "ARINDAM MUKHERJEE",
      phone: "9876543210",
      address: "CHINSURAH, HOOGHLY, WEST BENGAL",
      documents: [],
    },
    buyer: null,
    purchasePrice: 148000,
    sellingPrice: null,
    saleDate: null,
    receipt: null,
    createdAt: "2026-10-20T10:00:00.000Z",
  },
  {
    id: "cust-2",
    bikeId: "WB18CD8821",
    broker: { name: "", phone: "" },
    seller: {
      name: "SOUVIK CHATTERJEE",
      phone: "9123456780",
      address: "PANDUA, HOOGHLY, WEST BENGAL",
      documents: [],
    },
    buyer: null,
    purchasePrice: 126000,
    sellingPrice: null,
    saleDate: null,
    receipt: null,
    createdAt: "2026-10-18T14:30:00.000Z",
  },
  {
    id: "cust-3",
    bikeId: "WB42EF3094",
    broker: { name: "SANJOY ROY", phone: "9800112233" },
    seller: {
      name: "DEBASISH GHOSH",
      phone: "9433098765",
      address: "BARDHAMAN, WEST BENGAL",
      documents: [],
    },
    buyer: {
      name: "RAHUL MONDAL",
      phone: "9007123456",
      address: "KALNA ROAD, PANDUA, WEST BENGAL",
      documents: [],
    },
    purchasePrice: 94000,
    sellingPrice: 112000,
    saleDate: "2026-10-25",
    receipt: null,
    createdAt: "2026-10-12T09:15:00.000Z",
  },
  {
    id: "cust-4",
    bikeId: "WB16GH7710",
    broker: { name: "", phone: "" },
    seller: {
      name: "PRADIP SAHA",
      phone: "9831122334",
      address: "BANDEL, HOOGHLY, WEST BENGAL",
      documents: [],
    },
    buyer: {
      name: "SUMAN BANERJEE",
      phone: "9874455667",
      address: "MEMARI, PURBA BARDHAMAN",
      documents: [],
    },
    purchasePrice: 88000,
    sellingPrice: 104000,
    saleDate: "2026-10-15",
    receipt: null,
    createdAt: "2026-10-05T11:45:00.000Z",
  },
];

export function getMemoryStore(): MemoryStore {
  if (!globalThis.__bikeHubMemoryStore) {
    globalThis.__bikeHubMemoryStore = {
      bikes: structuredClone(INITIAL_BIKES),
      customers: structuredClone(INITIAL_CUSTOMERS),
    };
  }
  return globalThis.__bikeHubMemoryStore;
}

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return false;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      return true;
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });

    return true;
  } catch (err) {
    console.warn("[BikeHub] MongoDB not connected — using in-memory store:", err);
    return false;
  }
}