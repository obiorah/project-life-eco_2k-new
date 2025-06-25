import type { User, Group } from '~/types/admin';
import type { MarketplaceItem, PurchaseRecord } from '~/types/market';

// Mock Users
export const mockUsers: User[] = [
  { id: "u101", fullName: "Alice Wonderland", email: "alice@example.com", role: "User", groupId: "g1", groupName: "Explorers", balance: 1500, createdAt: "2024-01-15", status: "active" },
  { id: "u102", fullName: "Bob The Builder", email: "bob@example.com", role: "User", groupId: "g2", groupName: "Creators", balance: 800, createdAt: "2024-01-20", status: "active" },
  { id: "u103", fullName: "Charlie Chaplin", email: "charlie@example.com", role: "Admin", groupId: "g1", groupName: "Explorers", balance: 2500, createdAt: "2024-02-01", status: "active" },
  { id: "u104", fullName: "Diana Prince", email: "diana@example.com", role: "Super Admin", groupId: "g0", groupName: "System", balance: 10000, createdAt: "2024-01-01", status: "active" },
  { id: "u105", fullName: "Evan Almighty", email: "evan@example.com", role: "User", groupId: "g2", groupName: "Creators", balance: 300, createdAt: "2024-03-10", status: "suspended" },
];

// Mock Groups
export const mockGroups: Group[] = [
  { id: "g0", name: "System", description: "System administrators" },
  { id: "g1", name: "Explorers", description: "Users who explore content" },
  { id: "g2", name: "Creators", description: "Users who create content" },
];

// Mock Marketplace Items
export const mockMarketplaceItems: MarketplaceItem[] = [
  { id: "item001", name: "Digital Badge - Explorer", description: "A cool badge for exploration achievements.", price: 50, imageUrl: "/icons/badge-explorer.png", category: "Digital Goods", stock: -1, status: 'active' }, // Unlimited stock
  { id: "item002", name: "T-Shirt - Creator Logo", description: "High-quality cotton t-shirt with the Creator logo.", price: 250, imageUrl: "/images/tshirt-creator.jpg", category: "Merchandise", stock: 50, status: 'active' },
  { id: "item003", name: "Sticker Pack - Assorted", description: "Pack of 5 assorted vinyl stickers.", price: 75, imageUrl: "/images/sticker-pack.jpg", category: "Merchandise", stock: 100, status: 'active' },
  { id: "item004", name: "Exclusive Tutorial Access", description: "Unlock access to an exclusive video tutorial.", price: 500, imageUrl: "/icons/tutorial-access.png", category: "Digital Goods", stock: -1, status: 'active' }, // Unlimited stock
  { id: "item005", name: "Limited Edition Poster", description: "Signed poster, only 10 available!", price: 1000, imageUrl: "/images/poster-limited.jpg", category: "Collectibles", stock: 10, status: 'active' },
  { id: "item006", name: "Coffee Mug - Explorer", description: "Ceramic mug with the Explorer insignia.", price: 150, imageUrl: "/images/mug-explorer.jpg", category: "Merchandise", stock: 3, status: 'active' }, // Low stock example
  { id: "item007", name: "Old Gadget", description: "An old, dusty gadget.", price: 20, imageUrl: "/images/old-gadget.jpg", category: "Collectibles", stock: 1, status: 'inactive' }, // Inactive example
];

// Mock Purchase History - Added quantity, status, deliveryDate
export const mockPurchaseHistory: PurchaseRecord[] = [
  { id: "ph001", itemId: "item001", itemName: "Digital Badge - Explorer", price: 50, quantity: 1, purchaseDate: "2024-07-15T10:30:00Z", userId: "u101", status: 'delivered', deliveryDate: "2024-07-15T10:31:00Z" }, // Digital goods delivered instantly
  { id: "ph002", itemId: "item003", itemName: "Sticker Pack - Assorted", price: 75, quantity: 1, purchaseDate: "2024-07-16T14:00:00Z", userId: "u102", status: 'pending', deliveryDate: null },
  { id: "ph003", itemId: "item005", itemName: "Limited Edition Poster", price: 1000, quantity: 1, purchaseDate: "2024-07-18T09:15:00Z", userId: "u103", status: 'pending', deliveryDate: null },
  { id: "ph004", itemId: "item002", itemName: "T-Shirt - Creator Logo", price: 250, quantity: 1, purchaseDate: "2024-07-19T11:00:00Z", userId: "u101", status: 'delivered', deliveryDate: "2024-07-21T15:00:00Z" },
  { id: "ph005", itemId: "item006", itemName: "Coffee Mug - Explorer", price: 150, quantity: 1, purchaseDate: "2024-07-20T16:45:00Z", userId: "u104", status: 'pending', deliveryDate: null },
  { id: "ph006", itemId: "item003", itemName: "Sticker Pack - Assorted", price: 75, quantity: 1, purchaseDate: "2024-07-21T08:20:00Z", userId: "u101", status: 'pending', deliveryDate: null },
];

// --- NEW MOCK DATA FOR REPORTS ---

// Mock ESSENCE Time Series Data
export const mockEssenceTimeSeries = [
  { date: '2024-01', totalEssence: 5000 },
  { date: '2024-02', totalEssence: 7500 },
  { date: '2024-03', totalEssence: 9000 },
  { date: '2024-04', totalEssence: 11200 },
  { date: '2024-05', totalEssence: 13500 },
  { date: '2024-06', totalEssence: 15100 },
  { date: '2024-07', totalEssence: 16850 }, // Current total based on mockUsers sum + some extra
];

// Mock Reward vs Fine Summary
export const mockRewardFineSummary = [
  { type: 'Rewards', amount: 3200 },
  { type: 'Fines', amount: -450 }, // Fines are negative
];

// Mock Central Fine Account Activity
export const mockFineAccountActivity = [
  { id: 'fa001', timestamp: '2024-07-10 09:15', userId: 'u102', amount: -50, reason: 'Late submission' },
  { id: 'fa002', timestamp: '2024-07-12 14:30', userId: 'u105', amount: -100, reason: 'Policy violation' },
  { id: 'fa003', timestamp: '2024-07-18 11:00', userId: 'u101', amount: -25, reason: 'Minor infraction' },
  { id: 'fa004', timestamp: '2024-07-20 16:00', userId: 'u102', amount: -75, reason: 'Repeat late submission' },
  { id: 'fa005', timestamp: '2024-07-22 08:45', userId: 'u105', amount: -200, reason: 'Serious violation' },
];

// Mock Central Fine Account Balance
export const mockCentralFineAccountBalance = 450; // Sum of the negative amounts above
