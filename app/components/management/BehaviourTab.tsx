import React, { useState, useMemo } from 'react';
import { useToast } from "~/components/ui/use-toast";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "~/components/ui/select";
import { HistoryIcon } from 'lucide-react';
import { cn } from '~/lib/utils';

export function BehaviourTab() {
  const { addToast } = useToast();
  const [mode, setMode] = useState<'reward' | 'fine'>('reward');
  const [targetType, setTargetType] = useState<'user' | 'group'>('user');
  const [targetId, setTargetId] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [groupSearchTerm, setGroupSearchTerm] = useState('');

  // Dummy data for users and groups
  const users = useMemo(() => [
    { id: 'user1', name: 'Alice Smith' },
    { id: 'user2', name: 'Bob Johnson' },
    { id: 'user3', name: 'Charlie Brown' },
    { id: 'user4', name: 'David Lee' },
    { id: 'user5', name: 'Eve Davis' },
    { id: 'user6', name: 'Frank White' },
    { id: 'user7', name: 'Grace Taylor' },
    { id: 'user8', name: 'Henry Clark' },
    { id: 'user9', name: 'Ivy Hall' },
    { id: 'user10', name: 'Jack King' },
  ], []);

  const groups = useMemo(() => [
    { id: 'group1', name: 'Developers' },
    { id: 'group2', name: 'Designers' },
    { id: 'group3', name: 'Marketing' },
    { id: 'group4', name: 'Sales' },
    { id: 'group5', name: 'Support' },
  ], []);

  const [history, setHistory] = useState([
    { id: 1, date: '2023-10-26 10:00', type: 'reward', target: 'Alice Smith', amount: 100, reason: 'Excellent work', issuedBy: 'AdminUser' },
    { id: 2, date: '2023-10-27 14:30', type: 'fine', target: 'Bob Johnson', amount: 50, reason: 'Late submission', issuedBy: 'AdminUser' },
  ]);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [users, userSearchTerm]);

  const filteredGroups = useMemo(() => {
    return groups.filter(group =>
      group.name.toLowerCase().includes(groupSearchTerm.toLowerCase())
    );
  }, [groups, groupSearchTerm]);

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast({
        title: "Action Failed",
        description: "Please enter a valid positive amount.",
        variant: "destructive",
      });
      return;
    }

    if (!targetId) {
      addToast({
        title: "Action Failed",
        description: `Please select a ${targetType}.`,
        variant: "destructive",
      });
      return;
    }

    const targetName = targetType === 'user'
      ? users.find(u => u.id === targetId)?.name
      : groups.find(g => g.id === targetId)?.name;

    setHistory(prev => [
      ...prev,
      {
        id: prev.length + 1,
        date: new Date().toLocaleString(),
        type: mode,
        target: targetName || 'Unknown',
        amount: parsedAmount,
        reason: reason || 'No reason provided',
        issuedBy: 'Current User (Simulated)',
      }
    ]);

    addToast({
      title: `${mode === 'reward' ? 'Reward' : 'Fine'} Successful`,
      description: `${parsedAmount} ESSENCE ${mode === 'reward' ? 'rewarded to' : 'fined from'} ${targetName}.`,
      variant: "default",
    });

    setAmount('');
    setReason('');
    setTargetId('');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Behaviour Management</h2>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          {mode === 'reward' ? 'Reward' : 'Fine'} Users/Groups
        </h3>

        <div className="mb-4">
          <Label htmlFor="mode-toggle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Mode
          </Label>
          <ToggleGroup
            type="single"
            value={mode}
            onValueChange={(value: 'reward' | 'fine') => value && setMode(value)}
            className="flex"
          >
            <ToggleGroupItem
              value="reward"
              aria-label="Toggle reward"
              className={cn(
                "flex-1",
                mode === 'reward' && "data-[state=on]:bg-green-500 data-[state=on]:text-white"
              )}
            >
              Reward
            </ToggleGroupItem>
            <ToggleGroupItem
              value="fine"
              aria-label="Toggle fine"
              className={cn(
                "flex-1",
                mode === 'fine' && "data-[state=on]:bg-red-500 data-[state=on]:text-white"
              )}
            >
              Fine
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="target-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Target Type
            </Label>
            <Select value={targetType} onValueChange={(value: 'user' | 'group') => {
              setTargetType(value);
              setTargetId(''); // Reset targetId when type changes
            }}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select target type" />
              </SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="group">Group</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="target-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select {targetType === 'user' ? 'User' : 'Group'}
            </Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder={`Select ${targetType}`} />
              </SelectTrigger>
              <SelectContent className="z-50">
                {targetType === 'user' ? (
                  <SelectGroup>
                    <SelectLabel>
                      <Input
                        placeholder="Search users..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="mb-2"
                        onClick={(e) => e.stopPropagation()} // Prevent closing select on input click
                      />
                    </SelectLabel>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)
                    ) : (
                      <SelectItem value="no-user" disabled>No users found</SelectItem>
                    )}
                  </SelectGroup>
                ) : (
                  <SelectGroup>
                    <SelectLabel>
                      <Input
                        placeholder="Search groups..."
                        value={groupSearchTerm}
                        onChange={(e) => setGroupSearchTerm(e.target.value)}
                        className="mb-2"
                        onClick={(e) => e.stopPropagation()} // Prevent closing select on input click
                      />
                    </SelectLabel>
                    {filteredGroups.length > 0 ? (
                      filteredGroups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)
                    ) : (
                      <SelectItem value="no-group" disabled>No groups found</SelectItem>
                    )}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount (ESSENCE)
            </Label>
            <Input
              type="number"
              id="amount"
              placeholder="e.g., 100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason (Optional)
            </Label>
            <Input
              type="text"
              id="reason"
              placeholder="e.g., Project completion bonus"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className={cn(
            "w-full mt-4",
            mode === 'reward' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
          )}
        >
          {mode === 'reward' ? 'Reward' : 'Fine'} {targetType === 'user' ? 'User' : 'Group'}
        </Button>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
          <HistoryIcon className="h-5 w-5 mr-2" />
          Behaviour History
        </h3>
        {history.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No behaviour history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Date/Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Target
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Reason
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Issued By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {history.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {record.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">
                      {record.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {record.target}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {record.amount.toLocaleString()} ESSENCE
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {record.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {record.issuedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
