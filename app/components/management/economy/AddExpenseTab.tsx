import React, { useState } from 'react';
import { Form } from '@remix-run/react';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { useToast } from '~/components/ui/use-toast';

interface Expense {
  id: string;
  name: string;
  description: string;
  cost: number;
  frequency: string;
  createdDate: string;
}

export function AddExpenseTab() {
  const { addToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseName, setExpenseName] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [expenseFrequency, setExpenseFrequency] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newExpense: Expense = {
      id: Date.now().toString(),
      name: expenseName,
      description: description,
      cost: parseFloat(cost),
      frequency: expenseFrequency,
      createdDate: new Date().toLocaleDateString(),
    };
    setExpenses([...expenses, newExpense]);
    addToast({
      title: 'Expense Added',
      description: `Expense '${expenseName}' added successfully.`,
      variant: 'success',
    });
    // Clear form
    setExpenseName('');
    setDescription('');
    setCost('');
    setExpenseFrequency('');
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Add New Expense</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Define new expenses that can be deducted from users’ balances.
      </p>

      <Form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <Label htmlFor="expenseName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expense Name</Label>
          <Input
            id="expenseName"
            name="expenseName"
            type="text"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
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
          <Label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cost (ESSENCE)</Label>
          <Input
            id="cost"
            name="cost"
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>
        <div>
          <Label htmlFor="expenseFrequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expense Frequency</Label>
          <Select onValueChange={setExpenseFrequency} value={expenseFrequency} required>
            <SelectTrigger className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              <SelectItem value="One-time">One-time</SelectItem>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
            Add Expense
          </Button>
        </div>
      </Form>

      <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Existing Expenses</h4>
      <div className="mb-4 flex space-x-2">
        <Input placeholder="Search expenses..." className="flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
        {/* Add filter dropdowns here if needed */}
      </div>
      <div className="overflow-x-auto rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Expense Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Description</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Cost</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Frequency</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Created Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center dark:text-gray-400">
                  No expenses added yet.
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{expense.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{expense.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{expense.cost}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{expense.frequency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{expense.createdDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
