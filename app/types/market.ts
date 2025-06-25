import type { UserProfile } from "./user"; // Assuming UserProfile might be used or relevant

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price: number; // Price *per item* in ESSENCE
  imageUrl: string;
  category: string;
  stock: number; // Available quantity, -1 for unlimited/digital
  status: 'active' | 'inactive'; // Status of the item
  deleted: boolean; // Whether item is archived/soft-deleted
  deleted_at?: string | null; // ISO date string when deleted, or null/undefined
}

export interface PurchaseRecord {
  id: string;
  itemId: string;
  itemName: string; // Snapshot of item name at time of purchase
  price: number; // *Total price* for the quantity purchased (maps to DB total_price)
  pricePerItemSnapshot: number; // Price per item at the time of purchase (maps to DB price_per_item_snapshot)
  quantity: number; // Quantity purchased
  purchaseDate: string; // ISO date string
  userId: string;
  status: 'pending' | 'delivered'; // Delivery status
  deliveryDate?: string | null; // ISO date string when delivered, or null/undefined
}

// New type to include buyer details from public.profiles
export interface PurchaseRecordWithBuyerDetails extends PurchaseRecord {
  profiles?: {
    fullName?: string | null;
    // Add other profile fields if needed
  } | null;
}
