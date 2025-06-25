import { create } from 'zustand';
import type { StoreState, User, Transaction, Group, MarketplaceItem, PurchaseRecordWithBuyerDetails } from './types'; // Import market types

export const useStore = create<StoreState>((set) => ({
  currentUser: null,
  users: [],
  groups: [], // Initialize groups
  transactions: [],
  marketplaceItems: [], // Initialize marketplaceItems as an empty array
  purchaseRecords: [], // Initialize purchaseRecords as an empty array

  setCurrentUser: (user) => set({ currentUser: user }),

  addUser: (user) => set((state) => ({
    users: [...state.users, user],
  })),

  updateUserBalance: (userId, newBalance) => set((state) => ({
    users: state.users.map((user) =>
      user.id === userId ? { ...user, balance: newBalance } : user
    ),
    currentUser: state.currentUser?.id === userId
      ? { ...state.currentUser, balance: newBalance }
      : state.currentUser,
  })),

  addTransaction: (transaction) => set((state) => ({
    transactions: [...state.transactions, transaction],
  })),

  setUsers: (users) => set({ users }), // Implement setUsers
  setGroups: (groups) => set({ groups }), // Implement setGroups
  setTransactions: (transactions) => set({ transactions }), // Implement setTransactions

  setMarketplaceItems: (items) => set({ marketplaceItems: items }), // Implement setMarketplaceItems
  updateMarketplaceItem: (updatedItem) => set((state) => ({
    marketplaceItems: state.marketplaceItems.map(item =>
      item.id === updatedItem.id ? updatedItem : item
    ),
  })), // Implement updateMarketplaceItem
  deleteMarketplaceItem: (itemId) => set((state) => ({
    marketplaceItems: state.marketplaceItems.filter(item => item.id !== itemId),
  })), // Implement deleteMarketplaceItem

  setPurchaseRecords: (records) => set({ purchaseRecords: records }), // Implement setPurchaseRecords
  addPurchaseRecord: (record) => set((state) => ({
    purchaseRecords: [record, ...state.purchaseRecords], // Add new record to the beginning
  })), // Implement addPurchaseRecord
}));
