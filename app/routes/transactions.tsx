import type { MetaFunction } from "@remix-run/node";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "@remix-run/react";
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import the autotable plugin
import { useStore } from '~/store/store'; // Import the Zustand store
import type { Transaction } from '~/store/types'; // Import Transaction type from store

// Extend jsPDF interface for autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}


export const meta: MetaFunction = () => {
  return [
    { title: "Life Economy - Transactions" },
    { name: "description", content: "View your transaction history" },
  ];
};

// --- SVG Icons (Keep existing icons) ---
const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <line x1="10" x2="8" y1="9" y2="9" />
  </svg>
);

const TableIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3v18" />
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18" />
    <path d="M3 15h18" />
  </svg>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

// --- Remove Dummy Transaction Data ---
// const dummyTransactions: Transaction[] = [ ... ]; // REMOVED

const ITEMS_PER_PAGE = 10; // Increased items per page

export default function Transactions() {
  // --- Get transactions and user info from Zustand store ---
  const { transactions: allTransactions, currentUser, users } = useStore((state) => ({
    transactions: state.transactions,
    currentUser: state.currentUser,
    users: state.users, // Needed to potentially display user names if needed later
  }));

  // --- Filter transactions for the current user (or all for admin/superadmin) ---
  // For now, let's assume we show transactions for the *current logged-in user*
  // You might adjust this based on roles later (e.g., show all for admins)
  const userTransactions = useMemo(() => {
    if (!currentUser) return [];
    // Filter transactions where the userId matches the currentUser's ID
    // Also include system-level transactions if they don't have a specific userId
    // Or adjust this logic based on how you assign userId to transactions
    return allTransactions.filter(tx => tx.userId === currentUser.id || !tx.userId);
  }, [allTransactions, currentUser]);


  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [csvDownloadUrl, setCsvDownloadUrl] = useState<string | null>(null);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);

  // --- Cleanup Blob URLs on component unmount ---
  useEffect(() => {
    const currentCsvUrl = csvDownloadUrl;
    const currentPdfUrl = pdfDownloadUrl;
    return () => {
      if (currentCsvUrl) {
        console.log("[Cleanup] Revoking CSV URL:", currentCsvUrl);
        URL.revokeObjectURL(currentCsvUrl);
      }
      if (currentPdfUrl) {
        console.log("[Cleanup] Revoking PDF URL:", currentPdfUrl);
        URL.revokeObjectURL(currentPdfUrl);
      }
    };
  }, [csvDownloadUrl, pdfDownloadUrl]);


  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return "";
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return "";
    return numAmount.toFixed(2);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString(); // More readable format
    } catch (e) {
      return dateString; // Fallback
    }
  };


  const filteredTransactions = useMemo(() => {
    let filtered = userTransactions; // Start with user-specific transactions

    // Date Filtering
    if (startDate) {
      try {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (!isNaN(start.getTime())) {
          filtered = filtered.filter(tx => {
            const txDate = new Date(tx.date);
            return !isNaN(txDate.getTime()) && txDate >= start;
          });
        }
      } catch (e) { console.error("Invalid start date:", e); }
    }
    if (endDate) {
       try {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
         if (!isNaN(end.getTime())) {
          filtered = filtered.filter(tx => {
             const txDate = new Date(tx.date);
            return !isNaN(txDate.getTime()) && txDate <= end;
          });
        }
      } catch (e) { console.error("Invalid end date:", e); }
    }

    // Search Term Filtering (Narration)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.narration?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Sort by date descending (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  }, [userTransactions, startDate, endDate, searchTerm]);

  // Effect to revoke URLs when filters change
  useEffect(() => {
    if (csvDownloadUrl) {
      console.log("[Filter Change] Revoking old CSV URL:", csvDownloadUrl);
      URL.revokeObjectURL(csvDownloadUrl);
      setCsvDownloadUrl(null);
    }
    if (pdfDownloadUrl) {
      console.log("[Filter Change] Revoking old PDF URL:", pdfDownloadUrl);
      URL.revokeObjectURL(pdfDownloadUrl);
      setPdfDownloadUrl(null);
    }
    // Reset to page 1 when filters change
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, searchTerm, userTransactions]); // Add userTransactions dependency


  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // --- Export Functions using Visible Link (Keep existing logic) ---
  const handleExportCSV = useCallback(() => {
    console.log("[Export CSV] Started.");
    if (filteredTransactions.length === 0) {
      alert("No transactions to export.");
      console.log("[Export CSV] Aborted: No transactions.");
      return;
    }
    try {
      if (csvDownloadUrl) {
        console.log("[Export CSV] Revoking previous CSV URL:", csvDownloadUrl);
        URL.revokeObjectURL(csvDownloadUrl);
      }
      if (pdfDownloadUrl) {
        console.log("[Export CSV] Revoking existing PDF URL:", pdfDownloadUrl);
        URL.revokeObjectURL(pdfDownloadUrl);
        setPdfDownloadUrl(null);
      }

      console.log(`[Export CSV] Processing ${filteredTransactions.length} transactions.`);
      const csvData = Papa.unparse(filteredTransactions.map(tx => ({
        Date: formatDate(tx.date), // Use formatted date
        Type: tx.type || 'N/A', // Add Type column
        Narration: tx.narration,
        Debit: formatCurrency(tx.debit),
        Credit: formatCurrency(tx.credit),
        Balance: formatCurrency(tx.balance),
      })), { header: true });
      console.log("[Export CSV] CSV data generated.");

      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      console.log("[Export CSV] Blob created.");
      const url = URL.createObjectURL(blob);
      console.log("[Export CSV] New Blob URL created:", url);

      setCsvDownloadUrl(url);
      console.log("[Export CSV] CSV download URL set in state.");

    } catch (error) {
        console.error("[Export CSV] Failed:", error);
        alert("An error occurred while exporting CSV data.");
        setCsvDownloadUrl(null);
    } finally {
        console.log("[Export CSV] Finished.");
    }
  }, [filteredTransactions, csvDownloadUrl, pdfDownloadUrl]);

  const handleExportPDF = useCallback(() => {
    console.log("[Export PDF] Started.");
     if (filteredTransactions.length === 0) {
      alert("No transactions to export.");
      console.log("[Export PDF] Aborted: No transactions.");
      return;
    }
    try {
      if (pdfDownloadUrl) {
        console.log("[Export PDF] Revoking previous PDF URL:", pdfDownloadUrl);
        URL.revokeObjectURL(pdfDownloadUrl);
      }
      if (csvDownloadUrl) {
        console.log("[Export PDF] Revoking existing CSV URL:", csvDownloadUrl);
        URL.revokeObjectURL(csvDownloadUrl);
        setCsvDownloadUrl(null);
      }

      console.log(`[Export PDF] Processing ${filteredTransactions.length} transactions.`);
      console.log("[Export PDF] Creating jsPDF instance...");
      const doc = new jsPDF();
      doc.text("Transaction History", 14, 15);
      console.log("[Export PDF] Generating PDF table using autoTable...");
      doc.autoTable({
        head: [['Date', 'Type', 'Narration', 'Debit', 'Credit', 'Balance']], // Added Type
        body: filteredTransactions.map(tx => [
          formatDate(tx.date), // Use formatted date
          tx.type || 'N/A',    // Add Type
          tx.narration,
          formatCurrency(tx.debit),
          formatCurrency(tx.credit),
          formatCurrency(tx.balance),
        ]),
        startY: 20,
        headStyles: { fillColor: [22, 160, 133] },
        styles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 30 }, // Date
          1: { cellWidth: 20 }, // Type
          2: { cellWidth: 'auto'}, // Narration
          3: { halign: 'right', cellWidth: 20 }, // Debit
          4: { halign: 'right', cellWidth: 20 }, // Credit
          5: { halign: 'right', cellWidth: 25 }, // Balance
        },
      });
      console.log("[Export PDF] autoTable finished.");

      console.log("[Export PDF] Generating PDF Blob...");
      const pdfBlob = doc.output('blob');
      console.log("[Export PDF] Blob created.");
      const url = URL.createObjectURL(pdfBlob);
      console.log("[Export PDF] New Blob URL created:", url);

      setPdfDownloadUrl(url);
      console.log("[Export PDF] PDF download URL set in state.");

    } catch (error) {
        console.error("[Export PDF] Failed:", error);
        alert("An error occurred while exporting PDF data.");
        setPdfDownloadUrl(null);
    } finally {
        console.log("[Export PDF] Finished.");
    }
  }, [filteredTransactions, pdfDownloadUrl, csvDownloadUrl]);
  // --- End of Visible Link Export Functions ---

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredTransactions.length);


  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-4">Transaction History</h1>

      {/* --- Filters and Export Section --- */}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate && e.target.value > endDate) {
                    setEndDate(""); // Reset end date if start date is after it
                }
            }}
            className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            aria-label="Start Date"
          />
          <span>-</span>
          <input
            type="date"
            placeholder="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || undefined} // Set min based on start date
            className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            aria-label="End Date"
          />
        </div>

        {/* Keyword Search */}
        <div className="relative flex-grow max-w-xs">
          <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          <input
            type="search"
            placeholder="Search narration..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border bg-white py-1.5 pl-8 pr-2 text-sm shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            aria-label="Search transactions"
          />
        </div>

        {/* Export Buttons and Links */}
        <div className="flex flex-col items-end gap-1 ml-auto">
           <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                disabled={filteredTransactions.length === 0}
                className="inline-flex items-center gap-1 rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                aria-label="Generate CSV Export Link"
              >
                <FileTextIcon className="h-4 w-4" />
                Export CSV
              </button>
              <button
                onClick={handleExportPDF}
                disabled={filteredTransactions.length === 0}
                className="inline-flex items-center gap-1 rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                aria-label="Generate PDF Export Link"
              >
                <DownloadIcon className="h-4 w-4" />
                Export PDF
              </button>
           </div>
           {/* Visible Download Links */}
           <div className="flex gap-4 text-sm h-5"> {/* Added fixed height to prevent layout shift */}
             {csvDownloadUrl && (
               <a
                 href={csvDownloadUrl}
                 download="transactions.csv"
                 className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
               >
                 Click to Download CSV
               </a>
             )}
             {pdfDownloadUrl && (
               <a
                 href={pdfDownloadUrl}
                 download="transactions.pdf"
                 className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
               >
                 Click to Download PDF
               </a>
             )}
           </div>
        </div>
      </div>

      {/* --- Transactions Table --- */}
      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Narration</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Debit</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Credit</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{formatDate(tx.date)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{tx.type || 'N/A'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{tx.narration}</td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right text-sm ${tx.debit ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{formatCurrency(tx.debit)}</td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right text-sm ${tx.credit ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>{formatCurrency(tx.credit)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-200">{formatCurrency(tx.balance)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {userTransactions.length === 0 ? "No transactions available for this user." : "No transactions found matching your criteria."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Pagination --- */}
      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-400">
            {filteredTransactions.length > 0 ?
              `Showing ${startIndex + 1} to ${endIndex} of ${filteredTransactions.length} results` :
              'Showing 0 results'
            }
          </span>
          <div className="flex gap-1">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="rounded border bg-white px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:disabled:bg-gray-900 dark:disabled:text-gray-500"
              aria-label="Go to previous page"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="rounded border bg-white px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:disabled:bg-gray-900 dark:disabled:text-gray-500"
              aria-label="Go to next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
