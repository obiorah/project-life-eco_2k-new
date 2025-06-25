import React, { useState } from 'react';
import { BellIcon, FilterIcon, CheckIcon } from 'lucide-react'; // Example icons

// Mock notifications
const mockNotifications = [
  { id: 1, type: 'reward', message: 'You received 100 ESSENCE for completing Project Phoenix.', read: false, date: '2024-07-28' },
  { id: 2, type: 'fine', message: 'You were fined 20 ESSENCE for missing the deadline.', read: false, date: '2024-07-27' },
  { id: 3, type: 'activity', message: 'New activity assigned: "Documentation Review".', read: true, date: '2024-07-26' },
  { id: 4, type: 'system', message: 'Your profile information was updated by an admin.', read: false, date: '2024-07-25' },
  { id: 5, type: 'reward', message: 'You received 50 ESSENCE bonus for excellent performance.', read: true, date: '2024-07-24' },
];

export function GlobalNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'reward' | 'fine' | 'activity' | 'system'>('all');

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filteredNotifications = notifications.filter(n => filter === 'all' || n.type === filter);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center text-lg font-semibold">
          <BellIcon className="mr-2 h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </h3>
        {/* Basic Filter Dropdown Placeholder */}
        <div className="relative">
           <select
             value={filter}
             onChange={(e) => setFilter(e.target.value as any)}
             className="appearance-none rounded border bg-gray-50 py-1 pl-2 pr-8 text-sm dark:border-gray-600 dark:bg-gray-800"
           >
             <option value="all">All</option>
             <option value="reward">Rewards</option>
             <option value="fine">Fines</option>
             <option value="activity">Activities</option>
             <option value="system">System</option>
           </select>
           <FilterIcon className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <ul className="max-h-60 space-y-2 overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(n => (
            <li key={n.id} className={`flex items-start justify-between rounded p-2 ${n.read ? 'opacity-70' : 'bg-blue-50 dark:bg-blue-900/30'}`}>
              <div>
                <p className={`text-sm ${!n.read ? 'font-medium' : ''}`}>{n.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{n.date}</p>
              </div>
              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="ml-2 flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  title="Mark as read"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
              )}
            </li>
          ))
        ) : (
          <li className="text-center text-sm text-gray-500 dark:text-gray-400">No notifications{filter !== 'all' ? ` of type '${filter}'` : ''}.</li>
        )}
      </ul>
    </div>
  );
}
