import React from 'react';
import type { User } from '~/types/admin';

interface UserDashboardProps {
  currentUser: User;
}

export function UserDashboard({ currentUser }: UserDashboardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
      <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Your Dashboard</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Welcome, <span className="font-medium">{currentUser.fullName || currentUser.email}</span>!
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        Your current balance is: <span className="font-medium">${currentUser.balance.toFixed(2)}</span>
      </p>
      <p className="mt-4 text-gray-700 dark:text-gray-300">
        This is your personal dashboard. More features will be added here soon.
      </p>
    </div>
  );
}
