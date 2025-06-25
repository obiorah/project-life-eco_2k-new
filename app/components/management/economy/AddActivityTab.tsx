import React, { useState } from 'react';
import { Form } from '@remix-run/react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { useToast } from '~/components/ui/use-toast';

interface Activity {
  id: string;
  name: string;
  description: string;
  pay: number;
  frequency: string;
  slotsAvailable: number;
  createdDate: string;
}

export function AddActivityTab() {
  const { addToast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityName, setActivityName] = useState('');
  const [description, setDescription] = useState('');
  const [pay, setPay] = useState('');
  const [paymentFrequency, setPaymentFrequency] = useState('');
  const [slotsAvailable, setSlotsAvailable] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newActivity: Activity = {
      id: Date.now().toString(),
      name: activityName,
      description: description,
      pay: parseFloat(pay),
      frequency: paymentFrequency,
      slotsAvailable: parseInt(slotsAvailable),
      createdDate: new Date().toLocaleDateString(),
    };
    setActivities([...activities, newActivity]);
    addToast({
      title: 'Activity Created',
      description: `Activity '${activityName}' created successfully.`,
      variant: 'success',
    });
    // Clear form
    setActivityName('');
    setDescription('');
    setPay('');
    setPaymentFrequency('');
    setSlotsAvailable('');
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Add New Activity</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Define new activities that users can participate in to earn ESSENCE.
      </p>

      <Form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <Label htmlFor="activityName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Name</Label>
          <Input
            id="activityName"
            name="activityName"
            type="text"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        <div>
          <Label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
          <Input
            id="description"
            name="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        <div>
          <Label htmlFor="pay" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pay (ESSENCE)</Label>
          <Input
            id="pay"
            name="pay"
            type="number"
            value={pay}
            onChange={(e) => setPay(e.target.value)}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        <div>
          <Label htmlFor="paymentFrequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Frequency</Label>
          <Select onValueChange={setPaymentFrequency} value={paymentFrequency} required>
            <SelectTrigger className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="One-time">One-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="slotsAvailable" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slots Available</Label>
          <Input
            id="slotsAvailable"
            name="slotsAvailable"
            type="number"
            value={slotsAvailable}
            onChange={(e) => setSlotsAvailable(e.target.value)}
            required
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
            Add Activity
          </Button>
        </div>
      </Form>

      <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Existing Activities</h4>
      <div className="mb-4 flex space-x-2">
        <Input placeholder="Search activities..." className="flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
        {/* Add filter dropdowns here if needed */}
      </div>
      <div className="overflow-x-auto rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Activity Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Description</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Pay</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Frequency</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Slots Available</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Created Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center dark:text-gray-400">
                  No activities created yet.
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{activity.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{activity.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{activity.pay}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{activity.frequency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{activity.slotsAvailable}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{activity.createdDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
