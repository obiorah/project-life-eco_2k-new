import React from 'react';
import { useStore } from '~/store/store';

interface GroupLeaderboardProps {
  groupId: string;
  currentUserId: string;
}

export function GroupLeaderboard({ groupId, currentUserId }: GroupLeaderboardProps) {
  const { users } = useStore();

  // Placeholder - Replace with actual data fetching and rendering
  const groupUsers = users
    .filter(user => user.groupId === groupId)
    .sort((a, b) => b.balance - a.balance) // Sort by balance descending
    .slice(0, 5); // Show top 5

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-3 text-lg font-semibold">Group Leaderboard (Top 5)</h3>
      {groupUsers.length > 0 ? (
        <ol className="list-inside list-decimal space-y-1 text-sm">
          {groupUsers.map((user) => (
            <li key={user.id} className={user.id === currentUserId ? 'font-bold text-blue-600 dark:text-blue-400' : ''}>
              {user.fullName}: {user.balance.toLocaleString()} ESSENCE
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No users found in this group.</p>
      )}
    </div>
  );
}
