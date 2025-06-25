import React from 'react';
import { Form, useActionData } from '@remix-run/react';
import type { Navigation } from '@remix-run/router';
import type { MarketplaceItem } from '~/types/market';

interface ActionData {
  success?: boolean;
  error?: string;
  productId?: string;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: MarketplaceItem | null;
  navigation: Navigation;
  defaultPlaceholderImageUrl: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  product,
  navigation,
  defaultPlaceholderImageUrl,
}: DeleteConfirmationModalProps) {
  const actionData = useActionData() as ActionData;
  if (!isOpen || !product) return null;

  const isSubmitting = navigation.state === 'submitting' && 
                       navigation.formData?.get('intent') === (product.deleted ? 'restoreMarketplaceItem' : 'deleteMarketplaceItem') && 
                       navigation.formData?.get('productId') === product.id;

  const isCustomImage = product.imageUrl && product.imageUrl !== defaultPlaceholderImageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          {product.deleted ? 'Restore Product' : 'Archive Product'}
        </h2>
        
        {actionData?.error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm dark:bg-red-900 dark:text-red-200">
            {actionData.error}
          </div>
        )}

        <p className="mb-6 text-gray-600 dark:text-gray-300">
          {product.deleted ? (
            <>Are you sure you want to restore the product "<strong>{product.name}</strong>"? This will make it available in the marketplace again.</>
          ) : (
            <>Are you sure you want to archive the product "<strong>{product.name}</strong>"? 
            This will remove it from the marketplace but preserve its data.
            {isCustomImage && (
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                The associated custom image will be retained.
              </span>
            )}</>
          )}
        </p>

        <Form method="post" action="/market">
          <input 
            type="hidden" 
            name="intent" 
            value={product.deleted ? "restoreMarketplaceItem" : "deleteMarketplaceItem"} 
          />
          <input type="hidden" name="productId" value={product.id} />
          {product.imageUrl && <input type="hidden" name="imageUrl" value={product.imageUrl} />}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500 dark:hover:bg-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 ${
                product.deleted 
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              {isSubmitting 
                ? product.deleted 
                  ? 'Restoring...' 
                  : 'Archiving...'
                : product.deleted 
                  ? 'Restore Product' 
                  : 'Archive Product'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
