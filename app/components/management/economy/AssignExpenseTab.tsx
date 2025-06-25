import React, { useState } from 'react';
import { Form } from '@remix-run/react';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import { Input } from '~/components/ui/input';
import { useToast } from '~/components/ui/use-toast';

interface AssignedExpense {
  id: string;
  assigneeName: string;
  assigneeType: 'User' | 'Group';
  expenseName: string;
  assignedDate: string;
  assignedBy: string; // Placeholder for current admin/super admin
}

export function AssignExpenseTab() {
  const { addToast } = useToast();
  const [assignTo, setAssignTo] = useState<'User' | 'Group'>('User');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedExpense, setSelectedExpense] = useState('');
  const [assignedExpenses, setAssignedExpenses] = useState<AssignedExpense[]>([]);
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState('');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');

  // Dummy data for selectors
  const users = [
    { id: 'user1', name: 'Alice Smith' },
    { id: 'user2', name: 'Bob Johnson' },
    { id: 'user3', name: 'Charlie Brown' },
    { id: 'user4', name: 'David Lee' },
    { id: 'user5', name: 'Eve Davis' },
  ];
  const groups = [
    { id: 'group1', name: 'Developers' },
    { id: 'group2', name: 'Designers' },
    { id: 'group3', name: 'Marketing' },
    { id: 'group4', name: 'Sales' },
    { id: 'group5', name: 'HR' },
  ];
  const expenses = [
    { id: 'exp1', name: 'Monthly Rent' },
    { id: 'exp2', name: 'Software Subscription' },
    { id: 'exp3', name: 'Team Lunch' },
    { id: 'exp4', name: 'Office Supplies' },
    { id: 'exp5', name: 'Travel Expenses' },
  ];

  const filteredAssignees = (assignTo === 'User' ? users : groups).filter(item =>
    item.name.toLowerCase().includes(assigneeSearchTerm.toLowerCase())
  );

  const filteredExpenses = expenses.filter(expense =>
    expense.name.toLowerCase().includes(expenseSearchTerm.toLowerCase())
  );

  const handleAssign = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const assignee = assignTo === 'User' ? users.find(u => u.id === selectedAssignee) : groups.find(g => g.id === selectedAssignee);
    const expense = expenses.find(e => e.id === selectedExpense);

    if (!assignee || !expense) {
      addToast({
        title: 'Assignment Failed',
        description: 'Please select a valid assignee and expense.',
        variant: 'destructive',
      });
      return;
    }

    const newAssignment: AssignedExpense = {
      id: Date.now().toString(),
      assigneeName: assignee.name,
      assigneeType: assignTo,
      expenseName: expense.name,
      assignedDate: new Date().toLocaleDateString(),
      assignedBy: 'Admin User', // This should come from authenticated user context
    };
    setAssignedExpenses([...assignedExpenses, newAssignment]);
    addToast({
      title: 'Expense Assigned',
      description: `Expense '${expense.name}' assigned to ${assignee.name}.`,
      variant: 'success',
    });
    // Clear form
    setSelectedAssignee('');
    setSelectedExpense('');
    setAssigneeSearchTerm('');
    setExpenseSearchTerm('');
  };

  const handleUnassign = (id: string) => {
    setAssignedExpenses(assignedExpenses.filter(assignment => assignment.id !== id));
    addToast({
      title: 'Assignment Removed',
      description: 'Expense assignment removed successfully.',
      variant: 'success',
    });
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Assign Expense</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Assign specific expenses to users or groups.
      </p>

      <Form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="md:col-span-2">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign To</Label>
          <ToggleGroup type="single" value={assignTo} onValueChange={(value: 'User' | 'Group') => {
            setAssignTo(value);
            setSelectedAssignee(''); // Clear selected assignee when type changes
            setAssigneeSearchTerm(''); // Clear search term
          }} className="w-full">
            <ToggleGroupItem value="User" className="flex-1 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 data-[state=on]:bg-blue-500 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600">User</ToggleGroupItem>
            <ToggleGroupItem value="Group" className="flex-1 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 data-[state=on]:bg-blue-500 data-[state=on]:text-white dark:data-[state=on]:bg-blue-600">Group</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div>
          <Label htmlFor="assigneeSelector" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{assignTo} Selector</Label>
          <Select onValueChange={setSelectedAssignee} value={selectedAssignee} required>
            <SelectTrigger id="assigneeSelector" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <SelectValue placeholder={`Select ${assignTo.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              <Input
                placeholder={`Search ${assignTo.toLowerCase()}s...`}
                className="mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={assigneeSearchTerm}
                onChange={(e) => setAssigneeSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()} // Prevent closing select when clicking input
              />
              {filteredAssignees.length === 0 ? (
                <SelectItem value="no-results" disabled>No results found</SelectItem>
              ) : (
                filteredAssignees.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="expenseSelector" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expense Selector</Label>
          <Select onValueChange={setSelectedExpense} value={selectedExpense} required>
            <SelectTrigger id="expenseSelector" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <SelectValue placeholder="Select expense" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              <Input
                placeholder="Search expenses..."
                className="mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={expenseSearchTerm}
                onChange={(e) => setExpenseSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()} // Prevent closing select when clicking input
              />
              {filteredExpenses.length === 0 ? (
                <SelectItem value="no-results" disabled>No results found</SelectItem>
              ) : (
                filteredExpenses.map((expense) => (
                  <SelectItem key={expense.id} value={expense.id}>{expense.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
            Assign Expense
          </Button>
        </div>
      </Form>

      <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Current Expense Assignments</h4>
      <div className="mb-4 flex space-x-2">
        <Input placeholder="Search assignments..." className="flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
        {/* Add filter dropdowns here if needed */}
      </div>
      <div className="overflow-x-auto rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">User/Group Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Expense Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Assigned Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Assigned By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {assignedExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center dark:text-gray-400">
                  No expenses assigned yet.
                </td>
              </tr>
            ) : (
              assignedExpenses.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{assignment.assigneeName} ({assignment.assigneeType})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{assignment.expenseName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{assignment.assignedDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{assignment.assignedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUnassign(assignment.id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Unassign
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
