import React, { useState } from 'react';
import { Form } from '@remix-run/react';
import { Label } from '~/components/ui/label';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import { Input } from '~/components/ui/input';
import { useToast } from '~/components/ui/use-toast';

interface AssignedActivity {
  id: string;
  assigneeName: string;
  assigneeType: 'User' | 'Group';
  activityName: string;
  assignedDate: string;
  assignedBy: string; // Placeholder for current admin/super admin
}

export function AssignActivityTab() {
  const { addToast } = useToast();
  const [assignTo, setAssignTo] = useState<'User' | 'Group'>('User');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [assignedActivities, setAssignedActivities] = useState<AssignedActivity[]>([]);
  const [assigneeSearchTerm, setAssigneeSearchTerm] = useState('');
  const [activitySearchTerm, setActivitySearchTerm] = useState('');

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
  const activities = [
    { id: 'act1', name: 'Daily Code Review' },
    { id: 'act2', name: 'Weekly Standup' },
    { id: 'act3', name: 'Client Meeting' },
    { id: 'act4', name: 'Project Planning' },
    { id: 'act5', name: 'Bug Fixing Session' },
  ];

  const filteredAssignees = (assignTo === 'User' ? users : groups).filter(item =>
    item.name.toLowerCase().includes(assigneeSearchTerm.toLowerCase())
  );

  const filteredActivities = activities.filter(activity =>
    activity.name.toLowerCase().includes(activitySearchTerm.toLowerCase())
  );

  const handleAssign = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const assignee = assignTo === 'User' ? users.find(u => u.id === selectedAssignee) : groups.find(g => g.id === selectedAssignee);
    const activity = activities.find(a => a.id === selectedActivity);

    if (!assignee || !activity) {
      addToast({
        title: 'Assignment Failed',
        description: 'Please select a valid assignee and activity.',
        variant: 'destructive',
      });
      return;
    }

    const newAssignment: AssignedActivity = {
      id: Date.now().toString(),
      assigneeName: assignee.name,
      assigneeType: assignTo,
      activityName: activity.name,
      assignedDate: new Date().toLocaleDateString(),
      assignedBy: 'Admin User', // This should come from authenticated user context
    };
    setAssignedActivities([...assignedActivities, newAssignment]);
    addToast({
      title: 'Activity Assigned',
      description: `Activity '${activity.name}' assigned to ${assignee.name}.`,
      variant: 'success',
    });
    // Clear form
    setSelectedAssignee('');
    setSelectedActivity('');
    setAssigneeSearchTerm('');
    setActivitySearchTerm('');
  };

  const handleUnassign = (id: string) => {
    setAssignedActivities(assignedActivities.filter(assignment => assignment.id !== id));
    addToast({
      title: 'Assignment Removed',
      description: 'Activity assignment removed successfully.',
      variant: 'success',
    });
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Assign Activity</h3>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Assign specific activities to users or groups.
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
          <Label htmlFor="activitySelector" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activity Selector</Label>
          <Select onValueChange={setSelectedActivity} value={selectedActivity} required>
            <SelectTrigger id="activitySelector" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
              <SelectValue placeholder="Select activity" />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
              <Input
                placeholder="Search activities..."
                className="mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                value={activitySearchTerm}
                onChange={(e) => setActivitySearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()} // Prevent closing select when clicking input
              />
              {filteredActivities.length === 0 ? (
                <SelectItem value="no-results" disabled>No results found</SelectItem>
              ) : (
                filteredActivities.map((activity) => (
                  <SelectItem key={activity.id} value={activity.id}>{activity.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
            Assign Activity
          </Button>
        </div>
      </Form>

      <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Current Activity Assignments</h4>
      <div className="mb-4 flex space-x-2">
        <Input placeholder="Search assignments..." className="flex-grow dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
        {/* Add filter dropdowns here if needed */}
      </div>
      <div className="overflow-x-auto rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">User/Group Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Activity Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Assigned Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Assigned By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {assignedActivities.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center dark:text-gray-400">
                  No activities assigned yet.
                </td>
              </tr>
            ) : (
              assignedActivities.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{assignment.assigneeName} ({assignment.assigneeType})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{assignment.activityName}</td>
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
