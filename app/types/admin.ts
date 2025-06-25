export type User = {
  id: string;
  email: string;
  full_name: string | null;
  balance: number;
  role: 'User' | 'Admin' | 'Super Admin';
  created_at: string;
  group_id: string | null;
  is_suspended: boolean;
};

export type Group = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type Transaction = {
  id: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  type: string; // e.g., 'transfer', 'fine', 'reward'
  status: string; // e.g., 'completed', 'pending', 'failed'
  created_at: string;
  // Add other fields as per your transactions table
};
