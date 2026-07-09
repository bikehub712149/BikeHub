export interface Person {
  name: string;
  phone: string;
  address: string;

  documents?: string[];
}

export interface CustomerTransaction {
  id: string;

  bikeId: string;

  seller: Person;

  buyer: Person | null;

  purchasePrice: number;

  sellingPrice: number | null;

  receiptId: string | null;
}