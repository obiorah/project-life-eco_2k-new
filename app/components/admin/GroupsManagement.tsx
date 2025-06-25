import React, { useState, useMemo, Fragment } from 'react';
import { Form, useActionData, useNavigation } from "@remix-run/react"; // Import Form, useActionData, useNavigation
import { Dialog, Transition } from '@headlessui/react'; // Keep for modals
import type { Group, User } from '~/types/admin';
import type { action as adminAction } from '~/routes/admin'; // Import action type

// --- Icons (keep as they are) ---
function PlusIcon(props: React.SVGProps<SVGSVGElement>) { /* ... icon svg ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>; }
function EditIcon(props: React.SVGProps<SVGSVGElement>) { /* ... icon svg ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>; }
function DeleteIcon(props: React.SVGProps<SVGSVGElement>) { /* ... icon svg ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>; }
function ViewIcon(props: React.SVGProps<SVGSVGElement>) { /* ... icon svg ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>; }
function SearchIcon(props: React.SVGProps<SVGSVGElement>) { /* ... icon svg ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>; }
function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>; }


// --- Add/Edit Group Modal ---
// Uses Headless UI Dialog + Remix Form
function AddEditGroupModal({ isOpen, onClose, group, isSubmitting }: { isOpen: boolean, onClose: () => void, group: Group | null, isSubmitting: boolean }) {
  const actionData = useActionData<typeof adminAction>();
  const formRef = React.useRef<HTMLFormElement>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [formError, setFormError] = useState<string | null>(null); // Local form validation error

  React.useEffect(() => {
    if (isOpen) {
      setName(group?.name || '');
      setDescription(group?.description || '');
      setType(group?.type || '');
      setFormError(null); // Reset local error on open
      // Reset server error when modal opens or group changes
      // (actionData might persist from previous unrelated actions)
    }
  }, [isOpen, group]);

  // Close modal on successful submission (listen to actionData)
  React.useEffect(() => {
     if (!isSubmitting && actionData?.success && actionData.intent?.includes('group')) {
       onClose();
     }
   }, [actionData, isSubmitting, onClose]);


  const handleLocalValidation = () => {
    if (!name.trim()) {
      setFormError('Group Name is required.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!handleLocalValidation()) {
      event.preventDefault(); // Prevent submission if local validation fails
    }
    // Let Remix handle the actual submission
  };

  if (!isOpen) return null;

  const intent = group ? "update-group" : "create-group";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {group ? 'Edit Group' : 'Add New Group'}
                </Dialog.Title>

                {/* Display Server Error from actionData if it's related to group actions */}
                {actionData?.error && actionData.intent === intent && (
                  <p className="text-red-500 text-sm mb-3">{actionData.error}</p>
                )}
                {/* Display Local Form Error */}
                {formError && (
                  <p className="text-red-500 text-sm mb-3">{formError}</p>
                )}

                {/* Use Remix Form */}
                <Form method="post" action="/admin" ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                  {/* Hidden fields for intent and groupId (if editing) */}
                  <input type="hidden" name="intent" value={intent} />
                  {group && <input type="hidden" name="groupId" value={group.id} />}

                  <div>
                    <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="groupName"
                      name="name" // Name matches form data key
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required // Basic HTML5 validation
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="groupDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      id="groupDesc"
                      name="description" // Name matches form data key
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="groupType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Type</label>
                    <input
                      type="text"
                      id="groupType"
                      name="type" // Name matches form data key
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      placeholder="e.g., Squad, Team"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button" // Important: type="button" to prevent form submission
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting && <SpinnerIcon className="h-4 w-4" />}
                      {isSubmitting ? (group ? 'Updating...' : 'Adding...') : (group ? 'Update Group' : 'Add Group')}
                    </button>
                  </div>
                </Form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// --- Delete Confirmation Modal ---
// Uses Headless UI Dialog + Remix Form for the confirmation action
function DeleteConfirmationModal({ isOpen, onClose, group, isSubmitting }: { isOpen: boolean, onClose: () => void, group: Group | null, isSubmitting: boolean }) {
  const actionData = useActionData<typeof adminAction>();

  // Close modal on successful deletion
  React.useEffect(() => {
    if (!isSubmitting && actionData?.success && actionData.intent === 'delete-group') {
      onClose();
    }
  }, [actionData, isSubmitting, onClose]);

  if (!isOpen || !group) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Content */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Confirm Group Deletion
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Are you sure you want to delete the group <strong>{group.name}</strong>?
                    {group.userCount && group.userCount > 0
                      ? <span className="font-semibold text-red-600 dark:text-red-400"> This group currently has {group.userCount} member(s). Deletion is blocked.</span>
                      : " This action cannot be undone."}
                  </p>
                  {/* Display Server Error from actionData */}
                  {actionData?.error && actionData.intent === 'delete-group' && (
                    <p className="text-red-500 text-sm mt-3">{actionData.error}</p>
                  )}
                </div>

                {/* Use Remix Form for the delete action */}
                <Form method="post" action="/admin" className="mt-6 flex justify-end gap-3">
                  <input type="hidden" name="intent" value="delete-group" />
                  <input type="hidden" name="groupId" value={group.id} />

                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    // Disable delete if group has members
                    disabled={isSubmitting || (group.userCount !== undefined && group.userCount > 0)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && <SpinnerIcon className="h-4 w-4" />}
                    {isSubmitting ? 'Deleting...' : 'Delete'}
                  </button>
                </Form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}


// --- View Members Modal (Remains mostly the same, uses props) ---
function ViewMembersModal({ isOpen, onClose, group, users }: { isOpen: boolean, onClose: () => void, group: Group | null, users: User[] }) {
  if (!isOpen || !group) return null;
  const members = users.filter(u => u.groupId === group.id);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Members of {group.name} ({members.length})</h2>
        <div className="flex-grow overflow-y-auto mb-4 border dark:border-gray-700 rounded">
          {members.length === 0 ? (
            <p className="p-4 text-gray-500 dark:text-gray-400">No users found in this group.</p>
          ) : (
            <ul className="divide-y dark:divide-gray-700">
              {members.map(user => (
                <li key={user.id} className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {user.fullName} ({user.email}) - {user.role}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Close</button>
        </div>
      </div>
    </div>
  );
}


// --- Main GroupsManagement Component ---
// Accepts groups and users from props (loader data)
export function GroupsManagement({ groups: initialGroups, users }: { groups: Group[], users: User[] }) {
  const navigation = useNavigation(); // Get navigation state
  const actionData = useActionData<typeof adminAction>(); // Get action results

  // Determine if a group-related action is submitting
  const isSubmitting = navigation.state === 'submitting' &&
    navigation.formData?.get('intent')?.toString().includes('group');

  // Use props directly, no need for local state for the list itself
  // const [groups, setGroups] = useState<Group[]>(initialGroups); // Remove this

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewMembersModalOpen, setIsViewMembersModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Recalculate derived data based on props
  const groupTypes = useMemo(() => [...new Set(initialGroups.map(g => g.type).filter(Boolean))], [initialGroups]) as string[];

  const filteredGroups = useMemo(() => {
    // Add user count calculation here based on passed 'users' prop
    const groupsWithCounts = initialGroups.map(g => ({
        ...g,
        userCount: users.filter(u => u.groupId === g.id).length
    }));

    return groupsWithCounts.filter(group => {
      const searchMatch = searchTerm === '' || group.name.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = filterType === '' || group.type === filterType;
      return searchMatch && typeMatch;
    });
  }, [initialGroups, users, searchTerm, filterType]);

  // --- Action Handlers ---
  const handleAddGroup = () => {
    setSelectedGroup(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setIsAddEditModalOpen(true);
  };

  // handleSaveGroup is now handled by the AddEditGroupModal's Form submission

  const handleDeleteGroup = (group: Group) => {
    setSelectedGroup(group);
    setIsDeleteModalOpen(true);
  };

  // confirmDeleteGroup is now handled by the DeleteConfirmationModal's Form submission

  const handleViewMembers = (group: Group) => {
    setSelectedGroup(group);
    setIsViewMembersModalOpen(true);
  };

  // Close modals if action was successful but component didn't re-render immediately
  // (e.g., if not using redirect in action)
  React.useEffect(() => {
    if (actionData?.success && actionData.intent?.includes('group')) {
      setIsAddEditModalOpen(false);
      setIsDeleteModalOpen(false);
      setSelectedGroup(null);
    }
  }, [actionData]);


  return (
    <div className="p-4 border rounded-md dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Groups Management</h3>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <button
          onClick={handleAddGroup}
          disabled={isSubmitting} // Disable if any group action is pending
          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" />
          Add New Group
        </button>
        <div className="flex gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <label htmlFor="search-groups" className="sr-only">Search by group name</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search-groups"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-auto pl-10 pr-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          {/* Filter by Type */}
          <div>
            <label htmlFor="filter-group-type" className="sr-only">Filter by Group Type</label>
            <select
              id="filter-group-type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Types</option>
              {groupTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Groups Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Group Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">User Count</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            {filteredGroups.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No groups found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredGroups.map((group) => (
                <tr key={group.id} className={navigation.formData?.get('groupId') === group.id ? 'opacity-50' : ''}> {/* Dim row during action */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{group.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{group.type || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{group.userCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                    <button onClick={() => handleViewMembers(group)} disabled={isSubmitting} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-1 disabled:opacity-50" title="View Members">
                      <ViewIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleEditGroup(group)} disabled={isSubmitting} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-1 disabled:opacity-50" title="Edit Group">
                      <EditIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDeleteGroup(group)} disabled={isSubmitting} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-1 disabled:opacity-50" title="Delete Group">
                      <DeleteIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddEditGroupModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        group={selectedGroup}
        isSubmitting={isSubmitting && (navigation.formData?.get('intent') === 'create-group' || navigation.formData?.get('intent') === 'update-group')}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedGroup(null); }}
        group={selectedGroup}
        isSubmitting={isSubmitting && navigation.formData?.get('intent') === 'delete-group'}
      />
      <ViewMembersModal
        isOpen={isViewMembersModalOpen}
        onClose={() => { setIsViewMembersModalOpen(false); setSelectedGroup(null); }}
        group={selectedGroup}
        users={users} // Pass users from props
      />
    </div>
  );
}
