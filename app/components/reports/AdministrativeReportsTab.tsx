import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Remove Link import as it's no longer needed here
// import { Link } from '@remix-run/react';
import { mockAdminActions, mockSystemHealth, mockSecurityLogs, mockUsers } from '~/lib/mockData';
import { ClientOnly } from '~/components/ClientOnly';

// Helper function to get user name from ID
const getUserName = (userId: string) => {
  const user = mockUsers.find(u => u.id === userId);
  return user ? user.fullName : userId; // Fallback to ID if user not found
};

export function AdministrativeReportsTab() {

  // Fallback content
  const fallback = <div className="grid grid-cols-1 gap-6 md:grid-cols-2"><div className="h-[300px] animate-pulse rounded-lg border bg-muted p-4"></div><div className="h-[300px] animate-pulse rounded-lg border bg-muted p-4"></div><div className="h-[300px] animate-pulse rounded-lg border bg-muted p-4"></div><div className="h-[300px] animate-pulse rounded-lg border bg-muted p-4"></div></div>;

  // Get the 5 most recent security logs
  const recentSecurityLogs = mockSecurityLogs.slice(-5).reverse();

  return (
    <ClientOnly fallback={fallback}>
      {() => (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Admin Action Log Summary */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="mb-4 font-medium">Admin Action Log Summary (by Type)</h3>
            <ResponsiveContainer width="100%" height={300}>
              {/* Use mockAdminActions data */}
              <BarChart data={mockAdminActions} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="actionType" />
                 <YAxis />
                 <Tooltip />
                 <Legend />
                 <Bar dataKey="count" fill="#8884d8" name="Action Count" />
               </BarChart>
            </ResponsiveContainer>
             <p className="mt-2 text-sm text-muted-foreground">Overview of administrative activities performed.</p>
          </div>

          {/* System Health/Performance Metrics */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="mb-4 font-medium">System Health &amp; Performance</h3>
             <ResponsiveContainer width="100%" height={300}>
               {/* Use mockSystemHealth data */}
               <BarChart data={mockSystemHealth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="metric" />
                 <YAxis />
                 <Tooltip />
                 <Legend />
                 <Bar dataKey="value" fill="#82ca9d" name="Value" />
               </BarChart>
             </ResponsiveContainer>
             <p className="mt-2 text-sm text-muted-foreground">Monitoring key system performance indicators.</p>
          </div>

          {/* Security Audit Log Summary */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="mb-4 font-medium">Recent Security Events</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium text-muted-foreground">Timestamp</th>
                    <th className="py-2 text-left font-medium text-muted-foreground">User</th>
                    <th className="py-2 text-left font-medium text-muted-foreground">Action</th>
                    <th className="py-2 text-left font-medium text-muted-foreground">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSecurityLogs.map((log) => (
                    <tr key={log.id} className="border-b last:border-b-0">
                      <td className="py-2">{log.timestamp}</td>
                      <td className="py-2">{getUserName(log.userId)}</td>
                      <td className="py-2">{log.action}</td>
                      <td className="py-2">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
             {/* Remove the link - the full log is now in its own tab */}
             {/*
             <div className="mt-4 text-right">
               <Link to="/reports/security-log" className="text-sm text-primary hover:underline">
                 View Full Log
               </Link>
             </div>
             */}
             <p className="mt-2 text-sm text-muted-foreground">Summary of recent important security-related events. Full log available in the 'Security Log' tab.</p>
          </div>

           {/* Backup/Restore Status (Placeholder) */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="mb-4 font-medium">Backup &amp; Restore Status</h3>
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Status Indicator/Log Placeholder (Requires Backup System Integration)
            </div>
             <p className="mt-2 text-sm text-muted-foreground">Confirmation of data backup and recovery readiness.</p>
          </div>
        </div>
      )}
    </ClientOnly>
  );
}
