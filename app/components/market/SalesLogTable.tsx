import React, { useState, useMemo } from 'react';
import { useStore } from '~/store/store';
import type { PurchaseRecordWithBuyerDetails } from '~/types/market'; // Use the new type
// import type { User } from '~/types/admin'; // User type might not be needed directly if buyerName is in record
import { cn } from '~/lib/utils';
import { ConfirmationModal } from '~/components/admin/ConfirmationModal';

// Icons
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" /></svg>;
const TruckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657l-4.243 4.243M6.343 16.657l4.243 4.243" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 17l.172-.171a3 3 0 014.242 0L15 17" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 21V10m0 0a8 8 0 110-8 8 8 0 010 8zm0 0a8 8 0 100 8 8 8 0 000-8z" /><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

interface SalesLogTableProps {
  records: PurchaseRecordWithBuyerDetails[]; // Accept records as a prop
}

type SortKey = 'itemName' | 'buyerName' | 'quantity' | 'price' | 'purchaseDate' | 'status' | 'deliveryDate';
type SortDirection = 'asc' | 'desc';

export function SalesLogTable({ records }: SalesLogTableProps) {
  // markPurchaseAsDelivered is still sourced from Zustand for global state modification
  const { markPurchaseAsDelivered } = useStore((state) => ({
    markPurchaseAsDelivered: state.markPurchaseAsDelivered,
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterBuyer, setFilterBuyer] = useState('all'); // This will filter by buyerName from records
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'delivered'>('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('purchaseDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [confirmingDelivery, setConfirmingDelivery] = useState<PurchaseRecordWithBuyerDetails | null>(null);

  // No need for userMap if buyer details are in records
  // const userMap = useMemo(() => { ... });

  const uniqueProducts = useMemo(() => {
    const names = new Set(records.map(p => p.itemName));
    return ['all', ...Array.from(names)];
  }, [records]);

  const uniqueBuyers = useMemo(() => {
    const buyerNames = new Set(records.map(p => p.profiles?.fullName || `Unknown User (${p.userId})`));
    return ['all', ...Array.from(buyerNames)];
  }, [records]);

  const filteredAndSortedHistory = useMemo(() => {
    // Add buyerName to each record for easier filtering/sorting if not already flat
    let processedHistory = records.map(p => ({
      ...p,
      buyerName: p.profiles?.fullName || `Unknown User (${p.userId})`,
    }));

    // Filter by search term (product name or buyer name)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      processedHistory = processedHistory.filter(p =>
        p.itemName.toLowerCase().includes(lowerCaseSearchTerm) ||
        p.buyerName.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Filter by product
    if (filterProduct !== 'all') {
      processedHistory = processedHistory.filter(p => p.itemName === filterProduct);
    }

    // Filter by buyer name
    if (filterBuyer !== 'all') {
      processedHistory = processedHistory.filter(p => p.buyerName === filterBuyer);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      processedHistory = processedHistory.filter(p => p.status === filterStatus);
    }

    // Filter by date range
    const startDate = filterStartDate ? new Date(filterStartDate).getTime() : null;
    const endDate = filterEndDate ? new Date(filterEndDate).setHours(23, 59, 59, 999) : null;

    if (startDate || endDate) {
      processedHistory = processedHistory.filter(p => {
        const purchaseTime = new Date(p.purchaseDate).getTime();
        const startMatch = startDate ? purchaseTime >= startDate : true;
        const endMatch = endDate ? purchaseTime <= endDate : true;
        return startMatch && endMatch;
      });
    }

    // Sort
    processedHistory.sort((a, b) => {
      let valA: any = a[sortKey as keyof typeof a]; // Type assertion for safety
      let valB: any = b[sortKey as keyof typeof b];

      if (sortKey === 'purchaseDate' || sortKey === 'deliveryDate') {
        valA = valA ? new Date(valA).getTime() : (sortDirection === 'asc' ? Infinity : -Infinity);
        valB = valB ? new Date(valB).getTime() : (sortDirection === 'asc' ? Infinity : -Infinity);
      }

      let comparison = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB));
      }

      return sortDirection === 'asc' ? comparison : comparison * -1;
    });

    return processedHistory;
  }, [records, searchTerm, filterProduct, filterBuyer, filterStatus, filterStartDate, filterEndDate, sortKey, sortDirection]);

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
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const handleConfirmDelivery = () => {
    if (confirmingDelivery) {
      markPurchaseAsDelivered(confirmingDelivery.id);
      console.log(`Marked purchase ${confirmingDelivery.id} as delivered.`);
    }
    setConfirmingDelivery(null);
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
        <input
          type="text"
          placeholder="Search Product or Buyer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        >
          {uniqueProducts.map(prod => (
            <option key={prod} value={prod}>{prod === 'all' ? 'All Products' : prod}</option>
          ))}
        </select>
        <select
          value={filterBuyer}
          onChange={(e) => setFilterBuyer(e.target.value)}
          className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        >
          {uniqueBuyers.map(buyer => (
            <option key={buyer} value={buyer}>{buyer === 'all' ? 'All Buyers' : buyer}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'delivered')}
          className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="delivered">Delivered</option>
        </select>
         <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="filter-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Date From</label>
                <input
                    type="date"
                    id="filter-start-date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
             </div>
             <div>
                <label htmlFor="filter-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Date To</label>
                <input
                    type="date"
                    id="filter-end-date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="p-2 border rounded-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
             </div>
         </div>
      </div>

      {/* Sales Log Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('itemName')}>
                Product Name {getSortIcon('itemName')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('buyerName')}>
                Buyer {getSortIcon('buyerName')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('quantity')}>
                Qty {getSortIcon('quantity')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price')}>
                Total Price {getSortIcon('price')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('purchaseDate')}>
                Purchase Date {getSortIcon('purchaseDate')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                Status {getSortIcon('status')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('deliveryDate')}>
                Delivery Date {getSortIcon('deliveryDate')}
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedHistory.length > 0 ? (
              filteredAndSortedHistory.map((record) => (
                <tr key={record.id} className={cn(
                    "hover:bg-gray-50 dark:hover:bg-gray-800",
                    record.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                )}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.itemName}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {record.profiles?.fullName || `Unknown User (${record.userId})`}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">{record.quantity}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{record.price} <span className="text-xs">ESSENCE</span></td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDateTime(record.purchaseDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                      record.status === 'delivered' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    )}>
                      {record.status === 'delivered' ? <CheckCircleIcon /> : <ClockIcon />}
                      <span className="ml-1">{record.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDateTime(record.deliveryDate)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {record.status === 'pending' ? (
                      <button
                        onClick={() => setConfirmingDelivery(record)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                        title="Mark as Delivered"
                      >
                        <TruckIcon /> <span className="ml-1">Deliver</span>
                      </button>
                    ) : (
                      <span className="text-green-600 dark:text-green-400 flex items-center text-xs">
                        <CheckCircleIcon /> <span className="ml-1">Completed</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No purchase records found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={!!confirmingDelivery}
        onClose={() => setConfirmingDelivery(null)}
        onConfirm={handleConfirmDelivery}
        title="Confirm Delivery"
        message={
          <span>
            Are you sure you want to mark the purchase of "<strong>{confirmingDelivery?.itemName}</strong>" by <strong>{confirmingDelivery?.profiles?.fullName || `User ID ${confirmingDelivery?.userId}`}</strong> as delivered?
          </span>
        }
        confirmText="Mark Delivered"
        confirmButtonClass="bg-indigo-600 hover:bg-indigo-700"
      />
    </div>
  );
}
