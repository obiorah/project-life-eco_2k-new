export type UserRole = 'User' | 'Admin' | 'Super Admin';
export type UserStatus = 'Active' | 'Suspended';

export interface User {
  id: string;
  email: string;
  fullName: string;
  balance: number;
  role: UserRole;
  createdAt: string;
  status: UserStatus;
  groupId?: string;
  groupName?: string;
  avatarUrl?: string;
  isSuspended?: boolean;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  type?: string;
  userCount?: number;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  type: string;
  description: string;
  status: string;
  created_at: string;
  senderName?: string;
  receiverName?: string;
}

export interface RecentAdminAction {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SecurityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  category?: string;
  severity?: 'info' | 'warning' | 'error';
}

export interface BulkUploadResult {
  successCount: number;
  errors: { row: number; message: string }[];
}