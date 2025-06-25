import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// Removed import for mockExpenseClaims as it's no longer in mockData.ts
import { mockActivityParticipation } from '~/lib/mockData';
// Removed useMemo as it was used for mockExpenseClaims
// import { useMemo } from 'react';
import { ClientOnly } from '~/components/ClientOnly'; // Import ClientOnly

// Removed helper function getExpenseCategoryTotals as it's no longer needed

export function ActivityExpenseReportsTab() {
  // Removed calculation for expenseCategoryTotals
  // const expenseCategoryTotals = useMemo(() => getExpenseCategoryTotals(mockExpenseClaims), []);
  // Removed COLORS constant as it was used for the PieChart

  // Fallback content remains the same, but reflects fewer charts now
  const fallback = <div className="grid grid-cols-1 gap-6 md:grid-cols-2"><div className="h-[300px] animate-pulse rounded-lg border bg-muted p-4"></div><div className="h-[300px] animate-pulse rounded-lg border bg-muted p-4"></div></div>;

  return (
    <ClientOnly fallback={fallback}>
      {() => (
        // Adjusted grid layout if needed, keeping md:grid-cols-2 for now
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Activity Participation Rates */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="mb-4 font-medium">Activity Participation Rates</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockActivityParticipation} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                {/* Updated XAxis dataKey to match mockActivityParticipation structure */}
                <XAxis dataKey="activity" />
                <YAxis label={{ value: 'Participants', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}/>
                <Tooltip />
                <Legend />
                 {/* Updated Bar dataKey to match mockActivityParticipation structure */}
                <Bar dataKey="usersParticipated" fill="#82ca9d" name="Participants" />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-sm text-muted-foreground">Number of participants per activity.</p>
          </div>

          {/* Removed Expense Claim Categories Pie Chart */}

          {/* Most Popular Activities (Placeholder) */}
          {/* Requires sorting mockActivityParticipation or similar data */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="mb-4 font-medium">Most Popular Activities (by Participation)</h3>
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              {/* TODO: Implement sorting and display */}
              List/Chart Placeholder
            </div>
             <p className="mt-2 text-sm text-muted-foreground">Identifying highly engaged activities.</p>
          </div>

          {/* Removed Highest Expense Claims Placeholder as data is gone */}

        </div>
      )}
    </ClientOnly>
  );
}
