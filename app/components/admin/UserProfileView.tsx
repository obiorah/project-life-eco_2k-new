// Placeholder for the detailed user view component
// This could be a modal, a drawer, or navigate to a new route like /admin/users/:userId

import React, { useMemo } from 'react';
import type { User } from '~/types/admin';
import { useStore } from '~/store/store';

interface UserProfileViewProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileView({ user, isOpen, onClose }: UserProfileViewProps) {
  const { transactions } = useStore();
  
  // Filter transactions for this user (placeholder - add user ID to transactions later)
  const userTransactions = useMemo(() => {
    return transactions.slice(-5); // For now, just show last 5 transactions
  }, [transactions]);

  if (!isOpen || !user) return null;

  // Basic Modal Structure - Replace with more detailed layout later
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">User Profile: {user.fullName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            &times; {/* Close icon */}
          </button>
        </div>

        {/* --- Placeholder Sections --- */}
        <div className="space-y-6">
          {/* 1. Personal Info */}
          <section className="p-4 border rounded dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Personal Info</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Group:</strong> {user.groupName}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> {user.status}</p>
          </section>

          {/* 2. ESSENCE Balance */}
          <section className="p-4 border rounded dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">ESSENCE Balance</h3>
            <p className="text-2xl font-bold">{user.balance ?? 0} <span className="text-sm font-normal">ESSENCE</span></p>
          </section>

          {/* 3. Transaction History */}
          <section className="p-4 border rounded dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
            <p className="text-gray-500 dark:text-gray-400">(Placeholder: Table with Date, Type, Amount, Description, Search, Date Filter)</p>
          </section>

          {/* 4. Activity Log */}
          <section className="p-4 border rounded dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Activity Log</h3>
            <p className="text-gray-500 dark:text-gray-400">(Placeholder: Table of user actions - login, updates, etc.)</p>
          </section>

          {/* 5. Rewards Summary */}
           <section className="p-4 border rounded dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Rewards Summary</h3>
            <p className="text-gray-500 dark:text-gray-400">(Placeholder: Total rewards, list with reasons/dates)</p>
          </section>

          {/* 6. Expenses List */}
           <section className="p-4 border rounded dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Expenses List</h3>
            <p className="text-gray-500 dark:text-gray-400">(Placeholder: Assigned expenses, amounts, frequency)</p>
          </section>

          {/* 7. Fines Record */}
           <section className="p-4 border rounded dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Fines Record</h3>
            <p className="text-gray-500 dark:text-gray-400">(Placeholder: Fine history, issuer, amount, reasons)</p>
          </section>

           {/* 8. Activity List */}
           <section className="p-4 border rounded dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Assigned Activities</h3>
            <p className="text-gray-500 dark:text-gray-400">(Placeholder: List of assigned activities, pay amount, frequency)</p>
          </section>

        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
