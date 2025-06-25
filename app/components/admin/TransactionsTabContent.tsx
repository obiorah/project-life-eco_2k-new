import React, { useMemo, useState } from 'react';
import type { User, Transaction } from '~/types/admin';
import type { Navigation } from '@remix-run/react';
import { SearchIcon } from 'lucide-react'; // Assuming you have this icon

interface TransactionsTabContentProps {
  transactions: Transaction[];
  users: User[]; // To display sender/receiver names
  actionData: any;
  navigation: Navigation;
}

export function TransactionsTabContent({ transactions, users }: TransactionsTabContentProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const usersMap = useMemo(() => {
    return new Map(users.map(user => [user.id, user.fullName || user.email]));
  }, [users]);

  const filteredTransactions = useMemo(() => {
    const currentTransactions = Array.isArray(transactions) ? transactions : [];
    return currentTransactions.filter(transaction => {
      const senderName = usersMap.get(transaction.sender_id)?.toLowerCase() || '';
      const receiverName = usersMap.get(transaction.receiver_id)?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();

      return (
        senderName.includes(searchLower) ||
        receiverName.includes(searchLower) ||
        transaction.type.toLowerCase().includes(searchLower) ||
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.amount.toString().includes(searchLower)
      );
    });
  }, [transactions, searchTerm, usersMap]);

  return (
    <div className="p-4 border rounded-b-md dark:border-gray-700 bg-white dark:bg-gray-900">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>

      {/* Search */}
      <div className="relative mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
        <label htmlFor="search-transactions" className="sr-only">Search transactions</label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          id="search-transactions"
          placeholder="Search by sender, receiver, type, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Sender
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Receiver
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center dark:text-gray-400">
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(transaction.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {usersMap.get(transaction.sender_id) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {usersMap.get(transaction.receiver_id) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {transaction.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {transaction.description || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
