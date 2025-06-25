import React, { useMemo } from 'react';
import { useStore } from '~/store/store';
import type { RecentAdminAction } from '~/types/admin'; // Import the type

export function RecentAdminActions() {
  // Select specific state slices
  const { recentActions: storeRecentActions, users: storeUsers } = useStore(state => ({
    recentActions: state.recentActions,
    users: state.users,
  }));

  // Safeguard: Default to empty arrays if store values are undefined or not yet populated
  const recentActions = storeRecentActions || [];
  const users = storeUsers || [];

  const formattedActions = useMemo(() => {
    return recentActions.map((action: RecentAdminAction) => {
      const adminUser = users.find(u => u.id === action.userId);
      return {
        id: action.id,
        admin: adminUser?.fullName || (action.userId === 'system' ? 'System' : 'Unknown Admin'),
        action: action.action,
        details: action.details,
        timestamp: new Date(action.timestamp).toLocaleString()
      };
    });
  }, [recentActions, users]);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-3 text-lg font-semibold">Recent Admin Actions</h3>
      <ul className="space-y-2">
        {formattedActions.length > 0 ? formattedActions.map((action) => (
          <li key={action.id} className="border-b pb-1 text-sm dark:border-gray-600">
            <span className="font-medium">{action.admin}</span>: {action.action}
            <p className="text-xs text-gray-600 dark:text-gray-400">{action.details}</p>
            <span className="block text-xs text-gray-500 dark:text-gray-400">{action.timestamp}</span>
          </li>
        )) : (
          <li className="text-sm text-gray-500 dark:text-gray-400">No recent actions</li>
        )}
      </ul>
       {/* Add pagination or view more link if needed */}
    </div>
  );
}
