import React from 'react';
import { UsersIcon, UsersRoundIcon, DollarSignIcon, TrendingUpIcon } from 'lucide-react';
import type { User, Group, Transaction } from '~/types/admin';

interface AdminOverviewProps {
  users: User[];
  groups: Group[];
  transactions: Transaction[];
}

export function AdminOverview({ users, groups, transactions }: AdminOverviewProps) {
  const totalUsers = users.length;
  const totalGroups = groups.length;
  const totalTransactions = transactions.length;
  const totalEssenceTransacted = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
          <UsersIcon className="h-5 w-5 text-gray-400" />
        </div>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{totalUsers}</p>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Groups</h3>
          <UsersRoundIcon className="h-5 w-5 text-gray-400" />
        </div>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{totalGroups}</p>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transactions</h3>
          <TrendingUpIcon className="h-5 w-5 text-gray-400" />
        </div>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{totalTransactions}</p>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Essence Transacted</h3>
          <DollarSignIcon className="h-5 w-5 text-gray-400" />
        </div>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{totalEssenceTransacted.toFixed(2)}</p>
      </div>
    </div>
  );
}
