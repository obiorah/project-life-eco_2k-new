import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Form, useNavigation, useActionData } from '@remix-run/react';
import type { User, Group, UserRole } from '~/types/admin';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  groups: Group[];
  actionData: any;
  navigation: any;
}

export function EditUserModal({ isOpen, onClose, user, groups, actionData, navigation }: EditUserModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('User');
  const [groupId, setGroupId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = navigation.state === 'submitting' && navigation.formData?.get('intent') === 'update-user' && navigation.formData?.get('userId') === user?.id;

  // Populate form when user prop changes
  useEffect(() => {
    if (user) {
      setEmail(user.email ?? '');
      setFullName(user.fullName ?? '');
      setRole(user.role ?? 'User');
      setGroupId(user.groupId ?? '');
      setFormError(null); // Clear previous errors when opening for a new user
    } else {
      // Clear form if user is null (e.g., modal closed)
      setEmail('');
      setFullName('');
      setRole('User');
      setGroupId('');
      setFormError(null);
    }
  }, [user]);

  // Handle errors from action data specifically for this user update
   useEffect(() => {
    if (actionData?.intent === 'update-user' && actionData?.formData?.userId === user?.id && !actionData?.success && actionData?.error) {
      setFormError(actionData.error);
    } else if (actionData?.intent === 'update-user' && actionData?.formData?.userId === user?.id && actionData?.success) {
      setFormError(null); // Clear error on success
      // Parent component handles closing the modal
    }
  }, [actionData, user]);


  // Clear form and error on close explicitly
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setFullName('');
      setRole('User');
      setGroupId('');
      setFormError(null);
    }
  }, [isOpen]);


  if (!user) return null; // Don't render if no user is selected

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Edit User: {user.fullName}
                </Dialog.Title>

                <Form method="post" action="/admin" className="mt-4 space-y-4">
                  <input type="hidden" name="intent" value="update-user" />
                  <input type="hidden" name="userId" value={user.id} />

                   {formError && (
                     <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200 text-sm">
                       {formError}
                     </div>
                   )}

                  <div>
                    <label htmlFor={`edit-fullName-${user.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      id={`edit-fullName-${user.id}`}
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor={`edit-email-${user.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      id={`edit-email-${user.id}`}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                   <div>
                    <label htmlFor={`edit-role-${user.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <select
                      name="role"
                      id={`edit-role-${user.id}`}
                      required
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                      <option value="Super Admin">Super Admin</option>
                    </select>
                  </div>
                   <div>
                    <label htmlFor={`edit-groupId-${user.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group</label>
                    <select
                      name="groupId"
                      id={`edit-groupId-${user.id}`}
                      value={groupId}
                      onChange={(e) => setGroupId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">-- No Group --</option>
                      {groups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
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
