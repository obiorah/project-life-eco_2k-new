import React, { useState, useEffect } from 'react';
import { Form, useNavigation, useActionData } from '@remix-run/react';
import type { Navigation } from '@remix-run/router';
import type { MarketplaceItem } from '~/types/market';
import type { action as marketAction } from '~/routes/market'; 

interface AddProductFormProps {
  onCancel: () => void;
  categories: string[];
  navigation: Navigation;
  actionData: ReturnType<typeof useActionData<typeof marketAction>>;
}

export function AddProductForm({ onCancel, categories, navigation, actionData }: AddProductFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState(categories[0] || '');
  const [newCategory, setNewCategory] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isUnlimitedStock, setIsUnlimitedStock] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  const isSubmitting = navigation.state === 'submitting' && 
                      navigation.formData?.get('intent') === 'addMarketplaceItem';

  useEffect(() => {
    if (actionData?.success && navigation.state === 'idle') {
      formRef.current?.reset();
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setImageFile(null);
      setImagePreview(null);
      setCategory(categories[0] || '');
      setNewCategory('');
      setStatus('active');
      setIsUnlimitedStock(false);
      setFormError(null);
    } else if (actionData?.error) {
      setFormError(actionData.error);
    }
  }, [actionData, navigation.state, categories]);

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
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const finalCategory = newCategory.trim() || category;

  return (
    <Form 
      method="post" 
      action="/market" 
      encType="multipart/form-data" 
      className="space-y-4 p-4 border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md"
      ref={formRef}
    >
      <input type="hidden" name="intent" value="addMarketplaceItem" />
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Add New Product</h3>

      <div>
        <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="product-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="product-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="product-description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Price (ESSENCE) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="product-price"
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
          <label htmlFor="product-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Stock Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="product-stock"
            name="stock"
            value={stock}
            onChange={handleStockChange}
            required={!isUnlimitedStock}
            min="0"
            step="1"
            disabled={isUnlimitedStock}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              isUnlimitedStock ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
            }`}
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
        <label htmlFor="product-category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category <span className="text-red-500">*</span>
        </label>
        <input type="hidden" name="category" value={finalCategory} />
        <select
          id="product-category-select"
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
          id="product-category-new"
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
        <label htmlFor="product-image-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Product Image
        </label>
        <input
          type="file"
          id="product-image-upload"
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
        {imagePreview && (
          <div className="mt-2">
            <img src={imagePreview} alt="Selected preview" className="h-20 w-20 object-cover rounded-md border dark:border-gray-600" />
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Upload an image for the product (optional).</p>
      </div>

      <div>
        <label htmlFor="product-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status
        </label>
        <select
          id="product-status"
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
          onClick={onCancel}
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
          {isSubmitting ? 'Adding...' : 'Add Product'}
        </button>
      </div>
    </Form>
  );
}