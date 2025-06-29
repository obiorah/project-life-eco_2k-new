import type { User, Group, Transaction, RecentAdminAction, SecurityLog } from '~/types/admin';
import type { MarketplaceItem, PurchaseRecord } from '~/types/market';

// Mock Users
export const mockUsers: User[] = [
  { 
    id: "u101", 
    fullName: "Alice Wonderland", 
    email: "alice@example.com", 
    role: "User", 
    groupId: "g1", 
    groupName: "Explorers", 
    balance: 1500, 
    createdAt: "2024-01-15", 
    status: "Active" 
  },
  { 
    id: "u102", 
    fullName: "Bob The Builder", 
    email: "bob@example.com", 
    role: "User", 
    groupId: "g2", 
    groupName: "Creators", 
    balance: 800, 
    createdAt: "2024-01-20", 
    status: "Active" 
  },
  { 
    id: "u103", 
    fullName: "Charlie Chaplin", 
    email: "charlie@example.com", 
    role: "Admin", 
    groupId: "g1", 
    groupName: "Explorers", 
    balance: 2500, 
    createdAt: "2024-02-01", 
    status: "Active" 
  },
  { 
    id: "u104", 
    fullName: "Diana Prince", 
    email: "diana@example.com", 
    role: "Super Admin", 
    groupId: "g0", 
    groupName: "System", 
    balance: 10000, 
    createdAt: "2024-01-01", 
    status: "Active" 
  },
  { 
    id: "u105", 
    fullName: "Evan Almighty", 
    email: "evan@example.com", 
    role: "User", 
    groupId: "g2", 
    groupName: "Creators", 
    balance: 300, 
    createdAt: "2024-03-10", 
    status: "Suspended" 
  },
];

// Mock Groups
const mockGroups: Group[] = [
  { id: "g0", name: "System", description: "System administrators", type: "Admin" },
  { id: "g1", name: "Explorers", description: "Users who explore content", type: "Standard" },
  { id: "g2", name: "Creators", description: "Users who create content", type: "Standard" },
];

// Mock Marketplace Items
const mockMarketplaceItems: MarketplaceItem[] = [
  { 
    id: "item001", 
    name: "Digital Badge - Explorer", 
    description: "A cool badge for exploration achievements.", 
    price: 50, 
    imageUrl: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400", 
    category: "Digital Goods", 
    stock: -1, 
    status: 'active',
    deleted: false
  },
  { 
    id: "item002", 
    name: "T-Shirt - Creator Logo", 
    description: "High-quality cotton t-shirt with the Creator logo.", 
    price: 250, 
    imageUrl: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400", 
    category: "Merchandise", 
    stock: 50, 
    status: 'active',
    deleted: false
  },
  { 
    id: "item003", 
    name: "Sticker Pack - Assorted", 
    description: "Pack of 5 assorted vinyl stickers.", 
    price: 75, 
    imageUrl: "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=400", 
    category: "Merchandise", 
    stock: 100, 
    status: 'active',
    deleted: false
  },
];

// Mock ESSENCE Time Series Data
const mockEssenceTimeSeries = [
  { date: '2024-01', totalEssence: 5000 },
  { date: '2024-02', totalEssence: 7500 },
  { date: '2024-03', totalEssence: 9000 },
  { date: '2024-04', totalEssence: 11200 },
  { date: '2024-05', totalEssence: 13500 },
  { date: '2024-06', totalEssence: 15100 },
  { date: '2024-07', totalEssence: 16850 },
];

// Mock Reward vs Fine Summary
const mockRewardFineSummary = [
  { type: 'Rewards', amount: 3200 },
  { type: 'Fines', amount: -450 },
];

// Mock Central Fine Account Activity
const mockFineAccountActivity = [
  { id: 'fa001', timestamp: '2024-07-10 09:15', userId: 'u102', amount: -50, reason: 'Late submission' },
  { id: 'fa002', timestamp: '2024-07-12 14:30', userId: 'u105', amount: -100, reason: 'Policy violation' },
  { id: 'fa003', timestamp: '2024-07-18 11:00', userId: 'u101', amount: -25, reason: 'Minor infraction' },
];

// Mock Central Fine Account Balance
const mockCentralFineAccountBalance = 450;

// Mock Activity Participation
const mockActivityParticipation = [
  { activity: 'Code Review', usersParticipated: 15 },
  { activity: 'Team Meeting', usersParticipated: 22 },
  { activity: 'Training Session', usersParticipated: 8 },
  { activity: 'Project Planning', usersParticipated: 12 },
];

// Mock User Engagement
const mockUserEngagement = [
  { userId: 'u101', fullName: 'Alice Wonderland', engagementScore: 85 },
  { userId: 'u102', fullName: 'Bob The Builder', engagementScore: 72 },
  { userId: 'u103', fullName: 'Charlie Chaplin', engagementScore: 91 },
  { userId: 'u104', fullName: 'Diana Prince', engagementScore: 88 },
  { userId: 'u105', fullName: 'Evan Almighty', engagementScore: 45 },
];

// Mock Group Performance
const mockGroupPerformance = [
  { groupName: 'Explorers', avgBalance: 2000, avgActivity: 78 },
  { groupName: 'Creators', avgBalance: 550, avgActivity: 65 },
  { groupName: 'System', avgBalance: 10000, avgActivity: 95 },
];

// Mock Reward Fine Trends
const mockRewardFineTrends = [
  { date: '2024-01', rewards: 1200, fines: 150 },
  { date: '2024-02', rewards: 1500, fines: 200 },
  { date: '2024-03', rewards: 1800, fines: 100 },
  { date: '2024-04', rewards: 2100, fines: 250 },
  { date: '2024-05', rewards: 1900, fines: 180 },
  { date: '2024-06', rewards: 2200, fines: 120 },
  { date: '2024-07', rewards: 2400, fines: 90 },
];

// Mock User Activity
const mockUserActivity = [
  { userId: 'u101', actions: 45, logins: 28 },
  { userId: 'u102', actions: 32, logins: 22 },
  { userId: 'u103', actions: 67, logins: 31 },
  { userId: 'u104', actions: 89, logins: 30 },
  { userId: 'u105', actions: 12, logins: 8 },
];

// Mock Group Balances
const mockGroupBalances = [
  { groupName: 'Explorers', balance: 4000 },
  { groupName: 'Creators', balance: 1100 },
  { groupName: 'System', balance: 10000 },
];

// Mock Admin Actions
const mockAdminActions = [
  { actionType: 'User Created', count: 15 },
  { actionType: 'User Updated', count: 32 },
  { actionType: 'Group Created', count: 3 },
  { actionType: 'Balance Adjusted', count: 28 },
  { actionType: 'Role Changed', count: 8 },
];

// Mock System Health
const mockSystemHealth = [
  { metric: 'CPU Usage (%)', value: 45 },
  { metric: 'Memory Usage (%)', value: 62 },
  { metric: 'Active Users', value: 127 },
  { metric: 'Response Time (ms)', value: 245 },
];

// Mock Security Logs
export const mockSecurityLogs: SecurityLog[] = [
  { 
    id: 'sec001', 
    userId: 'u104', 
    action: 'Login', 
    details: 'Successful login from new device', 
    timestamp: '2024-07-28 10:30:00', 
    ipAddress: '192.168.1.100',
    category: 'authentication',
    severity: 'info'
  },
  { 
    id: 'sec002', 
    userId: 'u103', 
    action: 'Password Change', 
    details: 'Password updated successfully', 
    timestamp: '2024-07-28 09:15:00', 
    ipAddress: '192.168.1.101',
    category: 'security',
    severity: 'info'
  },
  { 
    id: 'sec003', 
    userId: 'u105', 
    action: 'Failed Login', 
    details: 'Multiple failed login attempts', 
    timestamp: '2024-07-27 22:45:00', 
    ipAddress: '10.0.0.50',
    category: 'authentication',
    severity: 'warning'
  },
];