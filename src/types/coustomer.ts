export type ContactInfo = {
  name: string;
  phone: string;
  address: string;
};

export type CustomerTransaction = {
  id: string;
  bikeId: string;
  seller: ContactInfo;
  buyer: ContactInfo | null;
  purchasePrice: number;        // Changed to number
  sellingPrice: number | null;  // Changed to number or null
  receiptId: string | null;
};