import React from 'react';
import { useStore } from '~/store/store';
import { UserXIcon } from 'lucide-react';

export function SuspendedUsersPanel() {
  const { users: storeUsers } = useStore(state => ({ users: state.users }));
  
  // Safeguard: Default to an empty array if storeUsers is undefined
  const users = storeUsers || [];
  
  const suspendedUsers = users.filter(user => user.status === 'Suspended');

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <UserXIcon className="h-5 w-5 text-red-500" />
        Suspended Users ({suspendedUsers.length})
      </h3>
      {suspendedUsers.length > 0 ? (
        <ul className="space-y-1 text-sm">
          {suspendedUsers.map((user) => (
            <li key={user.id} className="flex justify-between">
              <span>{user.fullName} ({user.email})</span>
              {/* Add quick actions like 'Reactivate' if needed */}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No users are currently suspended.</p>
      )}
    </div>
  );
}
