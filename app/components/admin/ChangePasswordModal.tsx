import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Form, useNavigation, useActionData } from '@remix-run/react';
import type { User } from '~/types/admin';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  actionData: any;
  navigation: any;
}

export function ChangePasswordModal({ isOpen, onClose, user, actionData, navigation }: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = navigation.state === 'submitting' &&
                       navigation.formData?.get('intent') === 'change-user-password' &&
                       navigation.formData?.get('userId') === user?.id;

  // Clear form and error on close or when user changes
  useEffect(() => {
    if (!isOpen || !user) {
      setNewPassword('');
      setConfirmPassword('');
      setFormError(null);
    }
  }, [isOpen, user]);

  // Handle errors/success from action data
  useEffect(() => {
     const isRelevantAction = actionData?.intent === 'change-user-password' &&
                             actionData?.formData?.userId === user?.id;

    if (isRelevantAction && !actionData?.success && actionData?.error) {
      setFormError(actionData.error);
    } else if (isRelevantAction && actionData?.success) {
      setFormError(null); // Clear error on success
      // Parent component handles closing the modal
    }
  }, [actionData, user]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setFormError(null); // Clear previous errors on new submission attempt
    if (newPassword !== confirmPassword) {
      event.preventDefault(); // Prevent form submission
      setFormError("Passwords do not match.");
    } else if (newPassword.length < 6) { // Basic length check (add more complex rules if needed)
       event.preventDefault();
       setFormError("Password must be at least 6 characters long.");
    }
    // If validation passes, the Remix Form will submit naturally
  };

  if (!user) return null;

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        {/* Overlay */}
        <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={React.Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  Change Password for {user.fullName}
                </Dialog.Title>

                <Form method="post" action="/admin" className="mt-4 space-y-4" onSubmit={handleSubmit}>
                  <input type="hidden" name="intent" value="change-user-password" />
                  <input type="hidden" name="userId" value={user.id} />

                  {formError && (
                     <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200 text-sm">
                       {formError}
                     </div>
                   )}

                  <div>
                    <label htmlFor={`newPassword-${user.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      id={`newPassword-${user.id}`}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor={`confirmPassword-${user.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword" // This field is only for client-side validation
                      id={`confirmPassword-${user.id}`}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                   <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">Warning: Secure password change implementation (hashing/Supabase Auth) is needed on the server.</p>


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
                      disabled={isSubmitting || newPassword !== confirmPassword || newPassword.length < 6} // Disable if passwords don't match or too short
                    >
                      {isSubmitting ? 'Changing...' : 'Change Password'}
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
