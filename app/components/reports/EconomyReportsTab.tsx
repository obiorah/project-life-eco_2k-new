import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"; // Path should now resolve
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"; // Assuming table exists or will be added
import { mockEssenceTimeSeries, mockRewardFineSummary, mockFineAccountActivity, mockCentralFineAccountBalance } from "~/lib/mockData";
import { ClientOnly } from "~/components/ClientOnly";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, BarChart, Bar } from 'recharts';

export function EconomyReportsTab() {
  const formattedEssenceData = mockEssenceTimeSeries.map(item => ({
    ...item,
  }));

  const formattedRewardFineData = mockRewardFineSummary.map(item => ({
    name: item.type,
    Amount: Math.abs(item.amount),
    fill: item.type === 'Rewards' ? '#82ca9d' : '#ff7300',
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Economy Reports</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ESSENCE in Circulation</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockEssenceTimeSeries[mockEssenceTimeSeries.length - 1]?.totalEssence.toLocaleString() ?? 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards Distributed (Last 30d)</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockRewardFineSummary.find(s => s.type === 'Rewards')?.amount.toLocaleString() ?? 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines Collected (Last 30d)</CardTitle>
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.abs(mockRewardFineSummary.find(s => s.type === 'Fines')?.amount ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Central Fine Account Balance</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCentralFineAccountBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ESSENCE Circulation Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
             <ClientOnly fallback={<div className="flex h-full w-full items-center justify-center text-muted-foreground">Loading Chart...</div>}>
              {() => (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedEssenceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="totalEssence" stroke="#8884d8" activeDot={{ r: 8 }} name="Total ESSENCE"/>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ClientOnly>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rewards vs Fines (Last 30d)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ClientOnly fallback={<div className="flex h-full w-full items-center justify-center text-muted-foreground">Loading Chart...</div>}>
              {() => (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formattedRewardFineData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Amount" name="Amount">
                      {/* We defined fill color in the data itself */}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ClientOnly>
          </CardContent>
        </Card>
      </div>

      {/* Fine Account Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Central Fine Account Activity (Last 30d)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFineAccountActivity.length > 0 ? (
                mockFineAccountActivity.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{activity.userId}</TableCell>
                    <TableCell className="text-right">{activity.amount.toLocaleString()}</TableCell>
                    <TableCell>{activity.reason}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No fine activity recorded recently.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
