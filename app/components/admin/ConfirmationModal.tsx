import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Form, useNavigation, useActionData } from '@remix-run/react'; // Use Remix Form
import { cn } from '~/lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onConfirm: () => void; // Removed direct confirm handler
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  actionData: any; // Action data from parent
  navigation: any; // Navigation state from parent
  intent: string; // The intent for the form submission
  formData: Record<string, any> | null | undefined; // Allow null/undefined for safety
}

export function ConfirmationModal({
  isOpen,
  onClose,
  // onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700', // Default to red for destructive actions
  actionData,
  navigation, // Received prop
  intent,
  formData,
}: ConfirmationModalProps) {

  // *** ADD LOGGING HERE ***
  // console.log("[ConfirmationModal] Received navigation prop:", navigation);
  // console.log("[ConfirmationModal] Received actionData prop:", actionData);
  // console.log("[ConfirmationModal] Received formData prop:", formData); // Log formData


  const [formError, setFormError] = useState<string | null>(null);

  // Determine if this specific confirmation action is submitting
  // Add optional chaining to safely access navigation.state
  const isSubmitting = navigation?.state === 'submitting' &&
                       navigation?.formData?.get('intent') === intent &&
                       navigation?.formData?.get('userId') === formData?.userId; // Check relevant ID if applicable

   // Handle errors from action data specifically for this intent/data
   useEffect(() => {
    // Check if the actionData corresponds to this modal's action
    // Also check if formData exists before accessing its properties
    const isRelevantAction = actionData?.intent === intent &&
                             formData && // Ensure formData is not null/undefined
                             actionData?.formData?.userId === formData?.userId; // Adjust check as needed

    if (isRelevantAction && !actionData?.success && actionData?.error) {
      setFormError(actionData.error);
    } else if (isRelevantAction && actionData?.success) {
      setFormError(null); // Clear error on success
      // Parent component handles closing the modal
    }
  }, [actionData, intent, formData]);

   // Clear error when modal closes or opens for a new action
  useEffect(() => {
    if (!isOpen) {
      setFormError(null);
    }
  }, [isOpen]);


  return (
    // Use `as="div"` instead of `as={React.Fragment}` for the main Transition
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-20" onClose={onClose}> {/* Increased z-index */}
        {/* Overlay */}
        {/* Use `as="div"` for Transition.Child */}
        <Transition.Child
          as="div" // Changed from React.Fragment
          className="fixed inset-0 bg-black/30" // Apply styles directly here
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        />
          {/* The previous child div is no longer needed as Transition.Child is now the div */}
          {/* <div className="fixed inset-0 bg-black bg-opacity-30" /> */}


        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            {/* Use `as="div"` for Transition.Child */}
            <Transition.Child
              as="div" // Changed from React.Fragment
              className="w-full max-w-md" // Apply layout constraints here
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Dialog.Panel remains the semantic content container */}
              <Dialog.Panel className="w-full transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  {title}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {message}
                  </p>
                </div>

                 {formError && (
                   <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-200 text-sm">
                     {formError}
                   </div>
                 )}

                {/* Use Remix Form for the confirmation action */}
                <Form method="post" action="/market" className="mt-4"> {/* Changed action to /market */}
                  {/* Hidden field for intent */}
                  <input type="hidden" name="intent" value={intent} />
                  {/* Hidden fields for formData - Add safeguard for null/undefined formData */}
                  {Object.entries(formData || {}).map(([key, value]) => (
                    <input key={key} type="hidden" name={key} value={value ?? ''} />
                  ))}

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                      disabled={isSubmitting}
                    >
                      {cancelText}
                    </button>
                    <button
                      type="submit"
                      className={cn(
                        "inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50",
                        confirmButtonClass // Apply dynamic class
                      )}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : confirmText}
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
