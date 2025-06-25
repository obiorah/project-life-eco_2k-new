import React, { useState, useEffect } from 'react';
import { Form, useNavigation, useActionData } from '@remix-run/react'; 
import type { Navigation } from '@remix-run/router'; 
import type { MarketplaceItem } from '~/types/market';
import type { action as marketAction } from '~/routes/market'; 

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: MarketplaceItem | null;
  categories: string[];
  navigation: Navigation; 
  actionData: ReturnType<typeof useActionData<typeof marketAction>>; 
}

export function EditProductModal({
  isOpen,
  onClose,
  product,
  categories,
  navigation,
  actionData
}: EditProductModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isUnlimitedStock, setIsUnlimitedStock] = useState(false);
  const [formError, setFormError] = useState<string | null>(null); 

  const isSubmitting = navigation.state === 'submitting' && navigation.formData?.get('intent') === 'editMarketplaceItem';

  useEffect(() => {
    if (product && isOpen) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setStock(product.stock === -1 ? '' : product.stock);
      setIsUnlimitedStock(product.stock === -1);
      setImagePreview(product.imageUrl || null);
      setImageFile(null); // Clear any previously selected file
      setCategory(product.category);
      setStatus(product.status);
      setNewCategory('');
      setFormError(null); 
    } else if (!isOpen) {
      setImagePreview(null); // Clear preview when modal is not open
      setImageFile(null);
      setFormError(null);
    }
  }, [product, isOpen]);

  useEffect(() => {
    if (actionData && actionData.intent === 'editMarketplaceItem') {
      if (actionData.success) {
        onClose(); // Close modal on successful submission
      } else {
        setFormError(actionData.error || 'An unknown error occurred while editing the product.');
      }
    }
  }, [actionData, onClose]);


  if (!isOpen || !product) return null;

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStock(value === '' ? '' : parseInt(value, 10));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value === '' ? '' : parseFloat(value));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // If file selection is cancelled, revert to original product image or null
      setImageFile(null);
      setImagePreview(product?.imageUrl || null);
    }
  };

  const finalCategory = newCategory.trim() || category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Edit Product: {product.name}</h2>
        <Form method="post" action="/market" encType="multipart/form-data" className="space-y-4">
          <input type="hidden" name="intent" value="editMarketplaceItem" />
          <input type="hidden" name="productId" value={product.id} />
          <input type="hidden" name="currentImageUrl" value={product.imageUrl || ''} />

          <div>
            <label htmlFor="edit-product-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="edit-product-name"
              name="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="edit-product-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              id="edit-product-description"
              name="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="edit-product-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (ESSENCE) <span className="text-red-500">*</span></label>
            <input
              type="number"
              id="edit-product-price"
              name="price" 
              value={price}
              onChange={handlePriceChange}
              required
              min="0"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-grow">
                <label htmlFor="edit-product-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Quantity <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  id="edit-product-stock"
                  name="stock" 
                  value={stock}
                  onChange={handleStockChange}
                  required={!isUnlimitedStock}
                  min="0"
                  step="1"
                  disabled={isUnlimitedStock}
                  className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isUnlimitedStock ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}`}
                />
            </div>
            <div className="pt-6">
                <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                        type="checkbox"
                        name="isUnlimitedStock" 
                        checked={isUnlimitedStock}
                        onChange={(e) => {
                            setIsUnlimitedStock(e.target.checked);
                            if (e.target.checked) setStock('');
                        }}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                    />
                    <span>Unlimited</span>
                </label>
            </div>
          </div>

          <div>
            <label htmlFor="edit-product-category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category <span className="text-red-500">*</span></label>
            <input type="hidden" name="category" value={finalCategory} />
            <select
              id="edit-product-category-select"
              value={category} 
              onChange={(e) => { setCategory(e.target.value); setNewCategory(''); }} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="" disabled>Select existing or add new</option>
              {categories.filter(c => c !== 'all').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="text"
              id="edit-product-category-new"
              placeholder="Or add new category..."
              value={newCategory} 
              onChange={(e) => { setNewCategory(e.target.value); setCategory(''); }} 
              className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
             {!finalCategory && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">Please select or enter a category.</p>
             )}
          </div>

          <div>
            <label htmlFor="edit-product-image-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Image</label>
             {imagePreview && (
                <div className="mt-2 mb-2">
                    <img src={imagePreview} alt="Current product preview" className="h-20 w-20 object-cover rounded-md border dark:border-gray-600" />
                </div>
             )}
            <input
              type="file"
              id="edit-product-image-upload"
              name="productImage" 
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-indigo-50 file:text-indigo-700
                         hover:file:bg-indigo-100
                         dark:file:bg-gray-700 dark:file:text-indigo-300 dark:hover:file:bg-gray-600"
            />
             <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Upload a new image to replace the current one.</p>
          </div>

          <div>
            <label htmlFor="edit-product-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select
              id="edit-product-status"
              name="status" 
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

           {formError && (
             <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
           )}

          <div className="flex justify-end space-x-3 pt-4">
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
              disabled={isSubmitting || !finalCategory || !name || price === '' || (stock === '' && !isUnlimitedStock)} 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </Form> 
      </div>
    </div>
  );
}
