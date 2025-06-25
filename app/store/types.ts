import type { MarketplaceItem, PurchaseRecordWithBuyerDetails } from "~/types/market"; // Import market types

export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: 'User' | 'Admin' | 'Super Admin';
  full_name?: string; // Added full_name as it's used in profiles table
  group_id?: string | null; // Added group_id
  is_suspended?: boolean; // Added is_suspended
  created_at?: string; // Added created_at
}

export interface Group {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  created_at: string;
  type: 'Minting' | 'Transfer' | 'Purchase' | 'Reward' | 'Adjustment';
  narration: string;
  debit: number | null;
  credit: number | null;
  balance_after: number;
}

export interface StoreState {
  currentUser: User | null;
  users: User[];
  groups: Group[]; // Added groups to store state
  transactions: Transaction[];
  marketplaceItems: MarketplaceItem[]; // Added marketplaceItems
  purchaseRecords: PurchaseRecordWithBuyerDetails[]; // Added purchaseRecords

  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUserBalance: (userId: string, newBalance: number) => void;
  addTransaction: (transaction: Transaction) => void;
  setUsers: (users: User[]) => void; // Added setUsers action
  setGroups: (groups: Group[]) => void; // Added setGroups action
  setTransactions: (transactions: Transaction[]) => void; // Added setTransactions action
  setMarketplaceItems: (items: MarketplaceItem[]) => void; // Added setMarketplaceItems action
  updateMarketplaceItem: (item: MarketplaceItem) => void; // Added updateMarketplaceItem action
  deleteMarketplaceItem: (itemId: string) => void; // Added deleteMarketplaceItem action
  setPurchaseRecords: (records: PurchaseRecordWithBuyerDetails[]) => void; // Added setPurchaseRecords action
  addPurchaseRecord: (record: PurchaseRecordWithBuyerDetails) => void; // Added addPurchaseRecord action
}
