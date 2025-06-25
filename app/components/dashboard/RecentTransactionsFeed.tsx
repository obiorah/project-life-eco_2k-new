import React, { useMemo } from 'react';
import { useStore } from '~/store/store';

export function RecentTransactionsFeed() {
  const { transactions, users, currentUser } = useStore((state) => ({
      transactions: state.transactions,
      users: state.users,
      currentUser: state.currentUser,
  }));

  const recentTransactions = useMemo(() => {
    if (!currentUser) return [];

    // Filter transactions for the current user, sort by date, take the latest
    const userTransactions = transactions
      .filter(tx => tx.userId === currentUser.id) // Filter for current user
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first

    return userTransactions
      .slice(0, 5) // Get last 5 transactions for the user
      .map(tx => {
        // User name lookup is less critical here as we filter by currentUser.id
        // but keep it for potential system transactions or future flexibility
        const userName = tx.userId ? users.find(u => u.id === tx.userId)?.fullName || 'Unknown User' : 'System';
        const isCredit = tx.credit !== null && tx.credit > 0;
        const isDebit = tx.debit !== null && tx.debit > 0;

        let displayType = tx.type || 'Transfer'; // Default type
        let colorClass = 'text-gray-600 dark:text-gray-400'; // Default color

        if (isCredit) {
            colorClass = 'text-green-600 dark:text-green-400';
            if (!tx.type) displayType = 'Credit'; // More specific default if type missing
        } else if (isDebit) {
            colorClass = 'text-red-600 dark:text-red-400';
             if (!tx.type) displayType = 'Debit'; // More specific default if type missing
        }
         // Specific override for Purchase type
        if (tx.type === 'Purchase') {
            colorClass = 'text-red-600 dark:text-red-400'; // Purchases are debits
            displayType = 'Purchase';
        } else if (tx.type === 'Award') {
             colorClass = 'text-green-600 dark:text-green-400'; // Awards are credits
        }


        return {
          id: tx.id,
          type: displayType,
          user: userName, // Keep user name for context if needed
          amount: tx.credit ?? tx.debit ?? 0,
          isCredit: isCredit,
          narration: tx.narration,
          timestamp: new Date(tx.date).toLocaleString(),
          colorClass: colorClass,
        };
      });
  }, [transactions, users, currentUser]);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-3 text-lg font-semibold">Recent Activity</h3> {/* Changed title slightly */}
      {currentUser ? (
        <ul className="space-y-2">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <li key={tx.id} className="flex flex-col sm:flex-row sm:justify-between border-b pb-1 text-sm dark:border-gray-600">
                <span className="flex-grow mb-1 sm:mb-0">
                  <span className={`font-medium ${tx.colorClass}`}>
                    {tx.type}
                  </span>
                  : {tx.narration}
                  <span className={`ml-1 font-semibold ${tx.colorClass}`}>
                     ({tx.isCredit ? '+' : '-'}{tx.amount} ESSENCE)
                  </span>
                   {/* Optionally show user if needed: - by {tx.user} */}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 self-end sm:self-auto">{tx.timestamp}</span>
              </li>
            ))
          ) : (
             <li className="text-sm text-gray-500 dark:text-gray-400">No recent transactions found.</li>
          )}
        </ul>
      ) : (
         <p className="text-sm text-gray-500 dark:text-gray-400">Log in to see your transactions.</p>
      )}
      {/* Add pagination or view more link if needed */}
    </div>
  );
}
