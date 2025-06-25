import React from 'react';

interface BalanceHistoryGraphProps {
  userId: string;
}

export function BalanceHistoryGraph({ userId }: BalanceHistoryGraphProps) {
  // Placeholder - Replace with actual chart implementation
  console.log("Rendering Balance History Graph for user:", userId);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-3 text-lg font-semibold">My Balance History</h3>
      <div className="flex h-48 items-center justify-center text-gray-500 dark:text-gray-400">
        [Balance Chart Placeholder - User ID: {userId}]
      </div>
    </div>
  );
}
