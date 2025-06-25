import React from 'react';
import { Link } from '@remix-run/react';
import { UserPlusIcon, UsersIcon, SettingsIcon, UploadCloudIcon, FileTextIcon } from 'lucide-react'; // Example icons

export function AdminShortcuts() {
  const shortcuts = [
    { name: 'Add User', icon: <UserPlusIcon className="h-5 w-5" />, path: '/admin?tab=users' }, // Assuming admin route structure
    { name: 'Manage Groups', icon: <UsersIcon className="h-5 w-5" />, path: '/admin?tab=groups' },
    { name: 'System Settings', icon: <SettingsIcon className="h-5 w-5" />, path: '/admin?tab=settings' },
    { name: 'Bulk Upload', icon: <UploadCloudIcon className="h-5 w-5" />, path: '/admin?tab=bulk' },
    { name: 'View Reports', icon: <FileTextIcon className="h-5 w-5" />, path: '/reports' },
  ];

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-3 text-lg font-semibold">Admin Shortcuts</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.name}
            to={shortcut.path}
            className="flex flex-col items-center justify-center rounded-md border bg-gray-50 p-3 text-center text-sm font-medium transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            {shortcut.icon}
            <span className="mt-1">{shortcut.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
