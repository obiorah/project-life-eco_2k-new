import React from 'react';
import { SearchIcon } from 'lucide-react'; // Example icon

export function GlobalSearch() {
  return (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        placeholder="Search users, activities, groups..."
        className="w-full rounded-md border bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 sm:w-64"
      />
    </div>
  );
}
