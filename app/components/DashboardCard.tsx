import React from 'react';
import { cn } from '~/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export function DashboardCard({ title, value, icon, description, className }: DashboardCardProps) {
  return (
    <div className={cn("rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        {icon}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-semibold">{value}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}
