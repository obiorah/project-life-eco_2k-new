import React from 'react';
import type { Group, User } from '~/types/admin';
import { Link } from '@remix-run/react';

interface GroupOverviewProps {
  groups: Group[];
  users: User[]; // Assuming these are users managed by the admin
}

export function GroupOverview({ groups, users }: GroupOverviewProps) {
  // Calculate stats per group
  const groupStats = groups.map(group => {
    const groupUsers = users.filter(u => u.groupId === group.id);
    const totalBalance = groupUsers.reduce((sum, user) => sum + user.balance, 0);
    const activeUsers = groupUsers.filter(u => u.status === 'Active').length;
    return {
      ...group,
      userCount: groupUsers.length,
      totalBalance,
      activeUsers,
    };
  });

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-3 text-lg font-semibold">Managed Group Overview</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Group Name</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Users</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Active</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Total Balance</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {groupStats.map((group) => (
              <tr key={group.id}>
                <td className="whitespace-nowrap px-4 py-2 font-medium">{group.name}</td>
                <td className="whitespace-nowrap px-4 py-2">{group.userCount}</td>
                <td className="whitespace-nowrap px-4 py-2">{group.activeUsers}</td>
                <td className="whitespace-nowrap px-4 py-2">{group.totalBalance.toLocaleString()}</td>
                <td className="whitespace-nowrap px-4 py-2">
                  <Link to={`/admin?tab=groups&groupId=${group.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
