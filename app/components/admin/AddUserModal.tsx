import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Form, useNavigation, useActionData } from '@remix-run/react';
import type { Group, UserRole } from '~/types/admin';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  actionData: any; // From useActionData in parent
  navigation: any; // From useNavigation in parent
}

export function AddUserModal({ isOpen, onClose, groups, actionData, navigation }: AddUserModalProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('User');
  const [groupId, setGroupId] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = navigation.state === 'submitting' && navigation.formData?.get('intent') === 'create-user';

  // Clear form and error on close
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setFullName('');
      setPassword('');
      setRole('User');
      setGroupId('');
      setFormError(null);
    }
  }, [isOpen]);

  // Handle errors from action data
  useEffect(() => {
    if (actionData?.intent === 'create-user' && !actionData?.success && actionData?.error) {
      setFormError(actionData.error);
    } else if (actionData?.intent === 'create-user' && actionData?.success) {
      setFormError(null); // Clear error on success
      // Modal closing is handled by parent component via useEffect on actionData
    }
  }, [actionData]);


  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  Add New User
                </Dialog.Title>

                {/* Use Remix Form */}
                <Form method="post" action="/admin" className="mt-4 space-y-4">
                   {/* Intent Hidden Field */}
                   <input type="hidden" name="intent" value="create-user" />

                   {formError && (
                     <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200 text-sm">
                       {formError}
                     </div>
                   )}

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                   <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                     <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">Warning: Password will be stored insecurely in this example. Use hashing in production.</p>
                  </div>
                   <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                    <select
                      name="role"
                      id="role"
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
                    <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group (Optional)</label>
                    <select
                      name="groupId"
                      id="groupId"
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
                      {isSubmitting ? 'Adding...' : 'Add User'}
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
