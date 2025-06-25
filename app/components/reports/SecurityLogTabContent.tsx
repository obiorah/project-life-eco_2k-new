import React, { useState, useMemo } from 'react';
import { ClientOnly } from '~/components/ClientOnly';
import { DateFilter } from '~/components/DateFilter'; // Reusing the basic date filter
import { mockSecurityLogs, mockUsers } from '~/lib/mockData';
import { SearchIcon } from 'lucide-react'; // Import SearchIcon

// Helper function to get user name from ID (can be moved to utils if used elsewhere)
const getUserName = (userId: string) => {
  const user = mockUsers.find(u => u.id === userId);
  return user ? user.fullName : userId; // Fallback to ID if user not found
};

export function SecurityLogTabContent() {
  const [searchTerm, setSearchTerm] = useState('');
  // Add state for date filtering if DateFilter component is enhanced later
  // const [dateRange, setDateRange] = useState({ start: null, end: null });

  const filteredLogs = useMemo(() => {
    return mockSecurityLogs.filter(log => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const userName = getUserName(log.userId).toLowerCase();
      // Basic search across relevant fields
      return (
        log.timestamp.toLowerCase().includes(lowerSearchTerm) ||
        userName.includes(lowerSearchTerm) ||
        log.action.toLowerCase().includes(lowerSearchTerm) ||
        log.ipAddress.toLowerCase().includes(lowerSearchTerm) ||
        log.details.toLowerCase().includes(lowerSearchTerm)
      );
      // Add date filtering logic here when DateFilter is implemented
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort descending by timestamp
  }, [searchTerm /*, dateRange */]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Fallback for ClientOnly
  const fallback = <div className="p-4"><div className="h-12 animate-pulse rounded bg-muted"></div><div className="mt-4 h-64 animate-pulse rounded bg-muted"></div></div>;

  return (
    <div className="space-y-4">
      <ClientOnly fallback={fallback}>
        {() => (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Custom Search Input for this tab */}
              <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search logs (user, action, IP, details...)"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full rounded-md border bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                />
              </div>
              <DateFilter /> {/* Placeholder Date Filter */}
            </div>

            <div className="overflow-x-auto rounded-lg border bg-card text-card-foreground shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Timestamp</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">IP Address</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b last:border-b-0 hover:bg-muted/50">
                        <td className="whitespace-nowrap px-4 py-3">{log.timestamp}</td>
                        <td className="px-4 py-3">{getUserName(log.userId)}</td>
                        <td className="px-4 py-3">{log.action}</td>
                        <td className="px-4 py-3">{log.ipAddress}</td>
                        <td className="px-4 py-3">{log.details}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        No matching logs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Add Pagination controls here if needed */}
          </>
        )}
      </ClientOnly>
    </div>
  );
}
