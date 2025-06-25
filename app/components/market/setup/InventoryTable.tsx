import React, { useState, useMemo } from 'react';
import type { MarketplaceItem } from '~/types/market';
import { cn } from '~/lib/utils';

// Icons (Simple placeholders, replace with actual icons if available)
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const RestoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const SortAscIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
const SortDescIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;

interface InventoryTableProps {
  items: MarketplaceItem[];
  onEdit: (item: MarketplaceItem) => void;
  onDelete: (item: MarketplaceItem) => void;
  onRestore?: (item: MarketplaceItem) => void;
  showDeleted?: boolean;
}

type SortKey = 'name' | 'price' | 'stock' | 'status' | 'category';
type SortDirection = 'asc' | 'desc';

export function InventoryTable({ 
  items, 
  onEdit, 
  onDelete,
  onRestore,
  showDeleted = false 
}: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showArchived, setShowArchived] = useState(false);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(items.map(item => item.category));
    return ['all', ...Array.from(uniqueCategories)];
  }, [items]);

  const filteredAndSortedItems = useMemo(() => {
    let processedItems = [...items];

    // Filter by archived status if not showing archived items
    if (!showArchived) {
      processedItems = processedItems.filter(item => !item.deleted);
    }

    // Filter by search term (name or description)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      processedItems = processedItems.filter(item =>
        item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.description.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      processedItems = processedItems.filter(item => item.category === filterCategory);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      processedItems = processedItems.filter(item => item.status === filterStatus);
    }

    // Sort
    processedItems.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      // Handle unlimited stock (-1) - treat as highest
      if (sortKey === 'stock') {
        valA = valA === -1 ? Infinity : valA;
        valB = valB === -1 ? Infinity : valB;
      }

      let comparison = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        // Fallback for mixed types or other types (e.g., status)
        comparison = String(valA).localeCompare(String(valB));
      }

      return sortDirection === 'asc' ? comparison : comparison * -1;
    });

    return processedItems;
  }, [items, searchTerm, filterCategory, filterStatus, sortKey, sortDirection, showArchived]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? <SortAscIcon /> : <SortDescIcon />;
  };

  const lowStockThreshold = 5;

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
          className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showArchived"
            checked={showArchived}
            onChange={() => setShowArchived(!showArchived)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-600"
          />
          <label htmlFor="showArchived" className="text-sm text-gray-700 dark:text-gray-300">
            Show Archived
          </label>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center">Name {getSortIcon('name')}</div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('category')}>
                <div className="flex items-center">Category {getSortIcon('category')}</div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price')}>
                <div className="flex items-center">Price {getSortIcon('price')}</div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('stock')}>
                <div className="flex items-center">Stock {getSortIcon('stock')}</div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center">Status {getSortIcon('status')}</div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedItems.length > 0 ? (
              filteredAndSortedItems.map((item) => (
                <tr 
                  key={item.id} 
                  className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-800",
                    item.deleted && "bg-gray-100 dark:bg-gray-700"
                  )}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {item.name}
                    {item.deleted && (
                      <span className="ml-2 text-xs text-red-600 dark:text-red-400">(Archived)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.category}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {item.price} <span className="text-xs">ESSENCE</span>
                  </td>
                  <td className={cn(
                    "px-4 py-3 whitespace-nowrap text-sm",
                    item.stock !== -1 && item.stock < lowStockThreshold && item.stock > 0 ? "text-orange-600 dark:text-orange-400 font-semibold" : "text-gray-500 dark:text-gray-400",
                    item.stock === 0 ? "text-red-600 dark:text-red-400 font-semibold" : ""
                  )}>
                    {item.stock === -1 ? 'Unlimited' : item.stock}
                    {item.stock !== -1 && item.stock < lowStockThreshold && item.stock > 0 && <span className="ml-1 text-xs">(Low)</span>}
                    {item.stock === 0 && <span className="ml-1 text-xs">(Out)</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={cn(
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                      item.status === 'active' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => onEdit(item)} 
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" 
                      title="Edit"
                    >
                      <EditIcon />
                    </button>
                    {item.deleted ? (
                      <button 
                        onClick={() => onRestore?.(item)} 
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" 
                        title="Restore"
                      >
                        <RestoreIcon />
                      </button>
                    ) : (
                      <button 
                        onClick={() => onDelete(item)} 
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" 
                        title="Archive"
                      >
                        <DeleteIcon />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No products found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}