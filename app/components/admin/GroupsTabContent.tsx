import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigation, Form } from '@remix-run/react';
import { GroupsTable } from './GroupsTable.tsx';
import { AddGroupModal } from './AddGroupModal.tsx';
import { EditGroupModal } from './EditGroupModal.tsx'; // Explicitly add .tsx extension
import { ConfirmationModal } from './ConfirmationModal';
import type { Group, User } from '~/types/admin';

// --- Icons ---
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

interface GroupsTabContentProps {
  groups: Group[];
  users: User[]; // Pass users to count members
  actionData: any;
  navigation: ReturnType<typeof useNavigation>;
}

export function GroupsTabContent({ groups, users, actionData, navigation }: GroupsTabContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalFromOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Close modals on successful actions
  useEffect(() => {
    if (actionData?.success) {
      const intent = actionData.intent;
      if (intent === 'create-group') setIsAddModalOpen(false);
      if (intent === 'update-group') setIsEditModalFromOpen(false);
      if (intent === 'delete-group') setIsDeleteModalOpen(false);
      setSelectedGroup(null);
    }
  }, [actionData]);

  const groupsWithMemberCount = useMemo(() => {
    return groups.map(group => ({
      ...group,
      memberCount: users.filter(user => user.groupId === group.id).length,
    }));
  }, [groups, users]);

  const filteredGroups = useMemo(() => {
    return groupsWithMemberCount.filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groupsWithMemberCount, searchTerm]);

  const handleAddGroupClick = useCallback(() => setIsAddModalOpen(true), []);

  const handleEditGroup = useCallback((groupToEdit: Group) => {
    setSelectedGroup(groupToEdit);
    setIsEditModalFromOpen(true);
  }, []);

  const handleDeleteGroup = useCallback((groupToDelete: Group) => {
    setSelectedGroup(groupToDelete);
    setIsDeleteModalOpen(true);
  }, []);

  return (
    <div className="p-4 border rounded-b-md dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Group Management</h2>
        <button
          onClick={handleAddGroupClick}
          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          Add New Group
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
        <label htmlFor="search-groups" className="sr-only">Search groups</label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          id="search-groups"
          placeholder="Search groups by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Groups Table */}
      <GroupsTable
        groups={filteredGroups}
        onEdit={handleEditGroup}
        onDelete={handleDeleteGroup}
      />

      {/* Modals */}
      <AddGroupModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        actionData={actionData}
        navigation={navigation}
      />
      <EditGroupModal
        isOpen={isEditModalOpen}
        group={selectedGroup}
        onClose={() => { setIsEditModalFromOpen(false); setSelectedGroup(null); }}
        actionData={actionData}
        navigation={navigation}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedGroup(null); }}
        title="Confirm Deletion"
        message={
          <span>Are you sure you want to delete group <strong>{selectedGroup?.name}</strong>? This action cannot be undone.</span>
        }
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        actionData={actionData}
        navigation={navigation}
        intent="delete-group"
        formData={{ groupId: selectedGroup?.id ?? '' }}
      />
    </div>
  );
}
