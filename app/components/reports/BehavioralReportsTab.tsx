import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockRewardFineTrends, mockUserEngagement, mockGroupPerformance } from '~/lib/mockData'; // Added import for mockRewardFineTrends
import { ClientOnly } from '~/components/ClientOnly';

export function BehavioralReportsTab() {
  const fallback = <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"><div className="h-[300px] animate-pulse rounded-lg border bg-muted p-4"></div><div className="h-[300px] animate-pulse rounded-lg border bg-muted p-4"></div><div className="h-[300px] animate-pulse rounded-lg border bg-muted p-4"></div></div>;

  return (
    <ClientOnly fallback={fallback}>
      {() => (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Reward vs. Fine Trends */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm lg:col-span-2">
            <h3 className="mb-4 font-medium">Reward vs. Fine Trends Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockRewardFineTrends} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" label={{ value: 'Amount', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}/>
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="rewards" stroke="#82ca9d" name="Rewards" activeDot={{ r: 8 }} />
                <Line yAxisId="left" type="monotone" dataKey="fines" stroke="#ff7300" name="Fines" />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-2 text-sm text-muted-foreground">Tracking the issuance of rewards and fines.</p>
          </div>

          {/* User Engagement Levels */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <h3 className="mb-4 font-medium">User Engagement Levels</h3>
            <ResponsiveContainer width="100%" height={300}>
              {/* Using BarChart for simplicity, could be a list */}
              <BarChart data={mockUserEngagement.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="fullName" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="engagementScore" fill="#8884d8" name="Engagement Score" />
              </BarChart>
            </ResponsiveContainer>
             <p className="mt-2 text-sm text-muted-foreground">Top 5 users by calculated engagement score.</p>
          </div>

          {/* Group Performance Comparison */}
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm lg:col-span-3">
            <h3 className="mb-4 font-medium">Group Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockGroupPerformance} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="groupName" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Avg Balance', angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle' } }}/>
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Avg Activity', angle: 90, position: 'insideRight', offset: -5, style: { textAnchor: 'middle' } }}/>
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="avgBalance" fill="#8884d8" name="Average Balance" />
                <Bar yAxisId="right" dataKey="avgActivity" fill="#82ca9d" name="Average Activity Score" />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-sm text-muted-foreground">Comparing groups by average balance and activity levels.</p>
          </div>
        </div>
      )}
    </ClientOnly>
  );
}
