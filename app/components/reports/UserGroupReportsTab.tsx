import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// Import mockUsers to map userId to fullName
import { mockUserActivity, mockGroupBalances, mockUsers } from '~/lib/mockData';
import { useMemo } from 'react';
import { ClientOnly } from '~/components/ClientOnly'; // Import ClientOnly

// Helper function for role distribution
const getRoleDistribution = (users: typeof mockUsers) => {
  const distribution: { [key: string]: number } = {};
  users.forEach(user => {
    distribution[user.role] = (distribution[user.role] || 0) + 1;
  });
  return Object.entries(distribution).map(([name, value]) => ({ name, value }));
};

// Helper function to get user name by ID
const getUserNameById = (userId: string): string => {
  const user = mockUsers.find(u => u.id === userId);
  return user ? user.fullName : 'Unknown User'; // Return name or fallback
};

export function UserGroupReportsTab() {
  const roleDistribution = useMemo(() => getRoleDistribution(mockUsers), []);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Prepare data for User Activity Chart with full names
  const userActivityWithNames = useMemo(() => {
    return mockUserActivity.map(activity => ({
      ...activity,
      userName: getUserNameById(activity.userId) // Add userName field
    }));
  }, []); // Removed mockUserActivity from dependency array as it's constant mock data

  // Fallback content
  const fallback = <div className="grid grid-cols-1 gap-6 md:grid-cols-2"><div className="h-[300px] animate-pulse rounded-lg border bg-muted p-4"></div><div className="h-[300px] animate-pulse rounded-lg border bg-muted p-4"></div><div className="h-[300px] animate-pulse rounded-lg border bg-muted p-4"></div><div className="h-[300px] animate-pulse rounded-lg border bg-muted p-4"></div></div>;


  return (
     <ClientOnly fallback={fallback}>
      {() => (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* User Activity Levels */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="mb-4 font-medium">User Activity Levels (e.g., Logins/Actions)</h3>
            <ResponsiveContainer width="100%" height={300}>
              {/* Use userActivityWithNames data */}
              <BarChart data={userActivityWithNames} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                {/* Update XAxis dataKey to userName */}
                <XAxis dataKey="userName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="actions" fill="#8884d8" name="Actions" />
                <Bar dataKey="logins" fill="#82ca9d" name="Logins" />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-sm text-muted-foreground">Comparison of user engagement metrics.</p>
          </div>

          {/* Group Balance Summary */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="mb-4 font-medium">Group Balance Summary</h3>
            <ResponsiveContainer width="100%" height={300}>
              {/* Ensure mockGroupBalances has groupName */}
              <BarChart data={mockGroupBalances} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                {/* YAxis dataKey should be "groupName" (already correct based on mockData) */}
                <YAxis dataKey="groupName" type="category" width={120} interval={0} /> {/* Increased width for longer names, interval 0 */}
                <Tooltip />
                <Legend />
                <Bar dataKey="balance" fill="#ffc658" name="Total Balance" />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-sm text-muted-foreground">Total ESSENCE held by each group.</p>
          </div>

          {/* User Role Distribution */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="mb-4 font-medium">User Role Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
             <p className="mt-2 text-sm text-muted-foreground">Breakdown of users by assigned role.</p>
          </div>

          {/* New vs. Deactivated Users (Placeholder) */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="mb-4 font-medium">New vs. Deactivated Users (Period)</h3>
            {/* Placeholder - Requires data tracking user creation/deactivation dates */}
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Chart Placeholder (Requires Data)
            </div>
             <p className="mt-2 text-sm text-muted-foreground">Tracking user base growth and churn.</p>
          </div>
        </div>
      )}
    </ClientOnly>
  );
}
