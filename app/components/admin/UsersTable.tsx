import React from 'react';
import type { User, UserRole, UserStatus } from '~/types/admin';
import { cn } from '~/lib/utils';

// --- Icons --- (Keep existing icons)
function ViewIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EditIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>; }
function DeleteIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>; }
function SuspendIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" x2="10" y1="15" y2="9"/><line x1="14" x2="14" y1="15" y2="9"/></svg>; }
function RestoreIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>; }
function PasswordIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z"/><circle cx="16.5" cy="7.5" r=".5"/></svg>; }


interface UsersTableProps {
  users: User[];
  onViewProfile: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onSuspend: (user: User) => void;
  onRestore: (user: User) => void;
  onChangePassword: (user: User) => void;
}

export function UsersTable({
  users,
  onViewProfile,
  onEdit,
  onDelete,
  onSuspend,
  onRestore,
  onChangePassword,
}: UsersTableProps) {

  // Use isSuspended to determine status class
  const getStatusClass = (isSuspended: boolean | undefined) => {
    return isSuspended
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  };

  const getRoleClass = (role: UserRole | undefined) => {
     switch (role) {
      case 'Super Admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'User': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Full Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Email</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Group</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Role</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No users found matching your criteria.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.groupName ?? 'N/A'}</td> {/* Display group name */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", getRoleClass(user.role))}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", getStatusClass(user.isSuspended))}>
                    {user.isSuspended ? 'Suspended' : 'Active'} {/* Display status based on isSuspended */}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                  {/* Buttons now just trigger the modal open handlers passed as props */}
                  <button onClick={() => onViewProfile(user)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-1" title="View Profile">
                    <ViewIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => onEdit(user)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-1" title="Edit User">
                     <EditIcon className="h-5 w-5" />
                  </button>
                   {/* Use isSuspended to decide which button to show */}
                   {!user.isSuspended ? (
                    <button onClick={() => onSuspend(user)} className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200 p-1" title="Suspend User">
                      <SuspendIcon className="h-5 w-5" />
                    </button>
                  ) : (
                    <button onClick={() => onRestore(user)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200 p-1" title="Restore User">
                      <RestoreIcon className="h-5 w-5" />
                    </button>
                  )}
                   <button onClick={() => onChangePassword(user)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 p-1" title="Change Password">
                     <PasswordIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => onDelete(user)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-1" title="Delete User">
                    <DeleteIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
