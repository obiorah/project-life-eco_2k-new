import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Form, useNavigation } from '@remix-run/react';
import type { Group } from '~/types/admin';

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionData: any;
  navigation: any;
}

export function AddGroupModal({ isOpen, onClose, actionData, navigation }: AddGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Group['type']>('Standard');
  const [formError, setFormError] = useState<string | null>(null);

  const isSubmitting = navigation.state === 'submitting' && navigation.formData?.get('intent') === 'create-group';

  useEffect(() => {
    if (!isOpen) {
      setGroupName('');
      setDescription('');
      setType('Standard');
      setFormError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (actionData?.intent === 'create-group' && !actionData?.success && actionData?.error) {
      setFormError(actionData.error);
    } else if (actionData?.intent === 'create-group' && actionData?.success) {
      setFormError(null);
    }
  }, [actionData]);

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
                  Add New Group
                </Dialog.Title>

                <Form method="post" action="/admin" className="mt-4 space-y-4">
                   <input type="hidden" name="intent" value="create-group" />

                   {formError && (
                     <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200 text-sm">
                       {formError}
                     </div>
                   )}

                  <div>
                    <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group Name</label>
                    <input
                      type="text"
                      name="groupName"
                      id="groupName"
                      required
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                   <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Group Type</label>
                    <select
                      name="type"
                      id="type"
                      required
                      value={type}
                      onChange={(e) => setType(e.target.value as Group['type'])}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Admin">Admin</option>
                      <option value="Restricted">Restricted</option>
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
                      {isSubmitting ? 'Adding...' : 'Add Group'}
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
