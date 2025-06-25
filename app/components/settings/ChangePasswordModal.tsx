import { useState, Fragment, useEffect } from "react";
import { useActionData, Form } from "@remix-run/react";
import { Dialog, Transition } from '@headlessui/react';
import type { action as settingsAction } from '~/routes/settings'; // Import action type

// Define the props type, userId is no longer needed
interface ChangePasswordModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function ChangePasswordModal({ isOpen, setIsOpen }: ChangePasswordModalProps) {
  // Use the imported action type for useActionData
  const actionData = useActionData<typeof settingsAction>();
  const [showSuccess, setShowSuccess] = useState(false);

  // Function to close the modal and reset state
  const closeModal = () => {
    setIsOpen(false);
    setShowSuccess(false);
  };

  // Use useEffect to handle the success message display and auto-close
  useEffect(() => {
    // Check if actionData exists and if it's from the password change intent
    if (actionData && 'intent' in actionData && actionData.intent === 'changePassword') {
      if (actionData.success) {
        setShowSuccess(true);
        const timer = setTimeout(() => {
          closeModal();
        }, 2500);
        return () => clearTimeout(timer);
      } else if (actionData.error) {
        setShowSuccess(false); // Ensure success is false if there's an error
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- closeModal includes setIsOpen
  }, [actionData]); // Removed setIsOpen from deps as closeModal covers it

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Change Password
                </Dialog.Title>

                {/* Success Message Area */}
                {showSuccess && actionData?.success && (
                  <div className="mt-4 rounded border border-green-400 bg-green-100 p-3 text-sm text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-300">
                    {actionData.message}
                  </div>
                )}

                {/* Error Message Area - Only show if not showing success */}
                {!showSuccess && actionData?.error && (
                  <div className="mt-4 rounded border border-red-400 bg-red-100 p-3 text-sm text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300">
                    {actionData.error}
                  </div>
                )}

                {/* Form Area - Hide if success message is shown */}
                {!showSuccess && (
                  // IMPORTANT: The Form needs to point to the settings route action
                  <Form method="post" action="/settings" className="mt-4 space-y-4">
                    {/* Add a hidden input to identify the action intent */}
                    <input type="hidden" name="intent" value="changePassword" />

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        minLength={6}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                       <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum 6 characters</p>
                    </div>
                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        minLength={6}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                      />
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      >
                        Update Password
                      </button>
                    </div>
                  </Form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
