import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigation, type Navigation } from '@remix-run/react'; // Import useNavigation
import { UsersTable } from './UsersTable';
import { AddUserModal } from './AddUserModal';
import { BulkUploadModal } from './BulkUploadModal'; // Keep for now, but needs Remix integration
import { ConfirmationModal } from './ConfirmationModal';
import { UserProfileView } from './UserProfileView';
import { EditUserModal } from './EditUserModal';
import { ChangePasswordModal } from './ChangePasswordModal';
// Removed useStore import
import type { User, Group, UserRole, UserStatus, BulkUploadResult } from '~/types/admin';

// --- Icons --- (Keep existing icons)
function PlusIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>; }
function UploadIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>; }
function SearchIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>; }

interface UsersTabContentProps {
  users: User[];
  groups: Group[];
  navigation: Navigation; // Use Remix's navigation state
  actionData: any; // Action data from useActionData
}

export function UsersTabContent({ users, groups, navigation, actionData }: UsersTabContentProps) {
  // Removed useStore() call
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>(''); // Group ID
  const [filterRole, setFilterRole] = useState<UserRole | ''>('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | ''>('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false); // Bulk upload needs separate handling
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileViewOpen, setIsProfileViewOpen] = useState(false);

  // State for selected user for actions
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Close modals on successful actions (check actionData)
  useEffect(() => {
    if (actionData?.success) {
      // Close relevant modals based on intent
      const intent = actionData.intent;
      if (intent === 'create-user') setIsAddModalOpen(false);
      if (intent === 'update-user') setIsEditModalOpen(false);
      if (intent === 'delete-user') setIsDeleteModalOpen(false);
      if (intent === 'suspend-user') setIsSuspendModalOpen(false);
      if (intent === 'restore-user') setIsRestoreModalOpen(false);
      if (intent === 'change-user-password') setIsPasswordModalOpen(false);
      setSelectedUser(null); // Clear selected user after successful action
    }
    // Handle potential errors from actionData if needed (e.g., keep modal open and show error)
  }, [actionData]);


  // Memoized filtered users
  const filteredUsers = useMemo(() => {
    // Ensure users is always an array
    const currentUsers = Array.isArray(users) ? users : [];
    return currentUsers.filter(user => {
      const searchMatch = searchTerm === '' ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || // Add null checks
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const groupMatch = filterGroup === '' || user.groupId === filterGroup;
      const roleMatch = filterRole === '' || user.role === filterRole;
      // Use isSuspended for filtering status
      const statusMatch = filterStatus === '' ||
        (filterStatus === 'Active' && !user.isSuspended) ||
        (filterStatus === 'Suspended' && user.isSuspended);
      return searchMatch && groupMatch && roleMatch && statusMatch;
    });
  }, [users, searchTerm, filterGroup, filterRole, filterStatus]);

  // --- Action Handlers (now just open modals) ---
  const handleAddUserClick = useCallback(() => setIsAddModalOpen(true), []);
  const handleBulkUploadClick = useCallback(() => setIsBulkModalOpen(true), []); // Keep for now

  const handleEditUser = useCallback((userToEdit: User) => {
    setSelectedUser(userToEdit);
    setIsEditModalOpen(true);
  }, []);

  const handleDeleteUser = useCallback((userToDelete: User) => {
    setSelectedUser(userToDelete);
    setIsDeleteModalOpen(true);
  }, []);

  const handleSuspendUser = useCallback((userToSuspend: User) => {
    setSelectedUser(userToSuspend);
    setIsSuspendModalOpen(true);
  }, []);

  const handleRestoreUser = useCallback((userToRestore: User) => {
    setSelectedUser(userToRestore);
    setIsRestoreModalOpen(true);
  }, []);

  const handleChangePassword = useCallback((userToChangePass: User) => {
    setSelectedUser(userToChangePass);
    setIsPasswordModalOpen(true);
  }, []);

  const handleViewProfile = useCallback((userToView: User) => {
    setSelectedUser(userToView);
    setIsProfileViewOpen(true);
  }, []);

  // --- Bulk Upload Handler (Needs Refactoring for Remix) ---
   const handleBulkUpload = useCallback((newUsers: Omit<User, 'id' | 'groupName' | 'balance' | 'createdAt'>[]): BulkUploadResult => {
    // TODO: Refactor this to submit a form to a dedicated Remix action
    // or process client-side and submit multiple 'create-user' actions (less ideal).
    console.warn("Bulk upload needs refactoring for Remix actions.");
    let successCount = 0;
    const errors: { row: number; message: string }[] = [];
    // Simulate processing for now
    newUsers.forEach((_, index) => {
       // errors.push({ row: index + 2, message: `Remix action needed.` });
    });
    return { successCount, errors };
  }, []);


  return (
    <div className="p-4 border rounded-b-md dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Management</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleAddUserClick} // Use handler
            className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            <PlusIcon className="h-4 w-4" />
            Add New User
          </button>
          <button
            onClick={handleBulkUploadClick} // Use handler
            className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            <UploadIcon className="h-4 w-4" />
            Bulk Upload Users
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
        {/* Search */}
        <div className="relative">
           <label htmlFor="search-users" className="sr-only">Search by name or email</label>
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <SearchIcon className="h-5 w-5 text-gray-400" />
           </div>
           <input
            type="text"
            id="search-users"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* Filter by Group */}
        <div>
          <label htmlFor="filter-group" className="sr-only">Filter by Group</label>
          <select
            id="filter-group"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Groups</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
        </div>
        {/* Filter by Role */}
        <div>
           <label htmlFor="filter-role" className="sr-only">Filter by Role</label>
           <select
            id="filter-role"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as UserRole | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>
        {/* Filter by Status */}
        <div>
           <label htmlFor="filter-status" className="sr-only">Filter by Status</label>
           <select
            id="filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as UserStatus | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable
        users={filteredUsers}
        onViewProfile={handleViewProfile}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onSuspend={handleSuspendUser}
        onRestore={handleRestoreUser}
        onChangePassword={handleChangePassword}
      />

      {/* Modals - Pass groups, actionData, navigation */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        groups={groups}
        actionData={actionData} // Pass action data for error display
        navigation={navigation} // Pass navigation for pending UI
        // onAddUser={handleAddUser} // Remove direct add handler
      />
      <BulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onBulkUpload={handleBulkUpload} // Keep for now, needs rework
      />
       <EditUserModal
        isOpen={isEditModalOpen}
        user={selectedUser}
        groups={groups}
        onClose={() => { setIsEditModalOpen(false); setSelectedUser(null); }}
        actionData={actionData}
        navigation={navigation}
        // onUpdateUser={handleUpdateUser} // Remove direct update handler
      />
       <ConfirmationModal // Confirmation modals now trigger form submission
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedUser(null); }}
        // onConfirm={confirmDeleteUser} // Remove direct confirm handler
        title="Confirm Deletion"
        message={
          <span>Are you sure you want to delete user <strong>{selectedUser?.fullName}</strong>? This action cannot be undone.</span>
        }
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        actionData={actionData}
        navigation={navigation}
        intent="delete-user" // Add intent
        formData={{ userId: selectedUser?.id ?? '' }} // Add data for the form
      />
       <ConfirmationModal
        isOpen={isSuspendModalOpen}
        onClose={() => { setIsSuspendModalOpen(false); setSelectedUser(null); }}
        // onConfirm={confirmSuspendUser} // Remove direct confirm handler
        title="Confirm Suspension"
        message={
          <span>Are you sure you want to suspend user <strong>{selectedUser?.fullName}</strong>? They will lose access until restored.</span>
        }
        confirmText="Suspend"
        confirmButtonClass="bg-yellow-600 hover:bg-yellow-700"
        actionData={actionData}
        navigation={navigation}
        intent="suspend-user" // Add intent
        formData={{ userId: selectedUser?.id ?? '' }} // Add data for the form
      />
       <ConfirmationModal
        isOpen={isRestoreModalOpen}
        onClose={() => { setIsRestoreModalOpen(false); setSelectedUser(null); }}
        // onConfirm={confirmRestoreUser} // Remove direct confirm handler
        title="Confirm Restoration"
        message={
          <span>Are you sure you want to restore access for user <strong>{selectedUser?.fullName}</strong>?</span>
        }
        confirmText="Restore"
        confirmButtonClass="bg-green-600 hover:bg-green-700"
        actionData={actionData}
        navigation={navigation}
        intent="restore-user" // Add intent
        formData={{ userId: selectedUser?.id ?? '' }} // Add data for the form
      />
       <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        user={selectedUser}
        onClose={() => { setIsPasswordModalOpen(false); setSelectedUser(null); }}
        actionData={actionData}
        navigation={navigation}
        // onChangePassword={confirmChangePassword} // Remove direct change handler
      />
       <UserProfileView
        isOpen={isProfileViewOpen}
        user={selectedUser}
        onClose={() => { setIsProfileViewOpen(false); setSelectedUser(null); }}
      />

    </div>
  );
}
