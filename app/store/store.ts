import { create } from 'zustand';
import type { User, Transaction, Group, RecentAdminAction, SecurityLog } from '~/types/admin';
import type { MarketplaceItem, PurchaseRecordWithBuyerDetails } from '~/types/market';

interface StoreState {
  // User Management
  currentUser: User | null;
  users: User[];
  
  // Groups
  groups: Group[];
  
  // Transactions
  transactions: Transaction[];
  
  // Marketplace
  marketplaceItems: MarketplaceItem[];
  purchaseRecords: PurchaseRecordWithBuyerDetails[];
  
  // Admin & Security
  recentActions: RecentAdminAction[];
  securityLogs: SecurityLog[];

  // Actions
  setCurrentUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  
  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  deleteGroup: (groupId: string) => void;
  
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>, finalBalance?: number) => void;
  
  updateUserBalance: (userId: string, amount: number) => { success: boolean; finalBalance: number };
  
  setMarketplaceItems: (items: MarketplaceItem[]) => void;
  updateMarketplaceItem: (item: MarketplaceItem) => void;
  deleteMarketplaceItem: (itemId: string) => void;
  
  setPurchaseRecords: (records: PurchaseRecordWithBuyerDetails[]) => void;
  addPurchaseRecord: (record: PurchaseRecordWithBuyerDetails) => void;
  markPurchaseAsDelivered: (recordId: string) => void;
  
  addRecentAction: (action: Omit<RecentAdminAction, 'id' | 'timestamp'>) => void;
  addSecurityLog: (log: Omit<SecurityLog, 'id' | 'timestamp' | 'userId'>) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial State
  currentUser: null,
  users: [],
  groups: [],
  transactions: [],
  marketplaceItems: [],
  purchaseRecords: [],
  recentActions: [],
  securityLogs: [],

  // User Actions
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setUsers: (users) => set({ users }),
  
  addUser: (user) => set((state) => ({
    users: [...state.users, user],
  })),
  
  updateUser: (userId, updates) => set((state) => ({
    users: state.users.map((user) =>
      user.id === userId ? { ...user, ...updates } : user
    ),
    currentUser: state.currentUser?.id === userId
      ? { ...state.currentUser, ...updates }
      : state.currentUser,
  })),
  
  deleteUser: (userId) => set((state) => ({
    users: state.users.filter((user) => user.id !== userId),
    currentUser: state.currentUser?.id === userId ? null : state.currentUser,
  })),

  // Group Actions
  setGroups: (groups) => set({ groups }),
  
  addGroup: (group) => set((state) => ({
    groups: [...state.groups, group],
  })),
  
  updateGroup: (groupId, updates) => set((state) => ({
    groups: state.groups.map((group) =>
      group.id === groupId ? { ...group, ...updates } : group
    ),
  })),
  
  deleteGroup: (groupId) => set((state) => ({
    groups: state.groups.filter((group) => group.id !== groupId),
  })),

  // Transaction Actions
  setTransactions: (transactions) => set({ transactions }),
  
  addTransaction: (transaction, finalBalance) => set((state) => {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      ...transaction,
      created_at: transaction.created_at || new Date().toISOString(),
    };
    
    return {
      transactions: [newTransaction, ...state.transactions],
    };
  }),

  // Balance Management
  updateUserBalance: (userId, amount) => {
    const state = get();
    const user = state.users.find(u => u.id === userId);
    
    if (!user) {
      return { success: false, finalBalance: 0 };
    }
    
    const newBalance = user.balance + amount;
    
    if (newBalance < 0) {
      return { success: false, finalBalance: user.balance };
    }
    
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, balance: newBalance } : u
      ),
      currentUser: state.currentUser?.id === userId
        ? { ...state.currentUser, balance: newBalance }
        : state.currentUser,
    }));
    
    return { success: true, finalBalance: newBalance };
  },

  // Marketplace Actions
  setMarketplaceItems: (items) => set({ marketplaceItems: items }),
  
  updateMarketplaceItem: (item) => set((state) => ({
    marketplaceItems: state.marketplaceItems.map(existing =>
      existing.id === item.id ? item : existing
    ),
  })),
  
  deleteMarketplaceItem: (itemId) => set((state) => ({
    marketplaceItems: state.marketplaceItems.filter(item => item.id !== itemId),
  })),

  // Purchase Record Actions
  setPurchaseRecords: (records) => set({ purchaseRecords: records }),
  
  addPurchaseRecord: (record) => set((state) => ({
    purchaseRecords: [record, ...state.purchaseRecords],
  })),
  
  markPurchaseAsDelivered: (recordId) => set((state) => ({
    purchaseRecords: state.purchaseRecords.map(record =>
      record.id === recordId
        ? { ...record, status: 'delivered' as const, deliveryDate: new Date().toISOString() }
        : record
    ),
  })),

  // Admin & Security Actions
  addRecentAction: (action) => set((state) => {
    const newAction: RecentAdminAction = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: state.currentUser?.id || 'system',
      ...action,
    };
    
    return {
      recentActions: [newAction, ...state.recentActions.slice(0, 49)], // Keep last 50
    };
  }),
  
  addSecurityLog: (log) => set((state) => {
    const newLog: SecurityLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId: state.currentUser?.id || 'system',
      ipAddress: '127.0.0.1', // Placeholder
      ...log,
    };
    
    return {
      securityLogs: [newLog, ...state.securityLogs.slice(0, 999)], // Keep last 1000
    };
  }),
}));