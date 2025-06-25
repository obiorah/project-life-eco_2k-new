import React, { useState } from 'react';
import { useStore, type Transaction } from '~/store/store';

function CoinsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>
    </svg>
  );
}

export function MintCurrency() {
  const { addTransaction, addSecurityLog, currentUser, transactions } = useStore();
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Get current total supply
  const currentSupply = transactions.reduce((sum, tx) => 
    sum + (tx.credit || 0) - (tx.debit || 0), 0
  );

  const handleMint = () => {
    setError('');
    
    // Validate amount
    const mintAmount = Number(amount);
    if (!mintAmount || mintAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for minting');
      return;
    }

    const mintTransaction: Omit<Transaction, "id"> = {
      date: new Date().toISOString(),
      narration: `Currency Minted: ${reason}`,
      debit: null,
      credit: mintAmount,
      balance: 0, // The store will calculate the actual balance
      type: 'mint',
      userId: currentUser?.id
    };

    // Add transaction
    addTransaction(mintTransaction);

    // Add security log
    addSecurityLog({
      userId: currentUser?.id || 'unknown',
      action: 'Currency Minted',
      details: `Minted ${mintAmount} ESSENCE. Reason: ${reason}. New total supply: ${currentSupply + mintAmount}`
    });

    // Reset form
    setAmount('');
    setReason('');

    // Show detailed success message
    alert(`Successfully minted ${mintAmount} ESSENCE. New total supply: ${currentSupply + mintAmount}`);
  };

  return (
    <div className="p-4 border rounded-md dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CoinsIcon className="h-5 w-5 text-yellow-500" />
        Mint Currency (Current Supply: {currentSupply})
      </h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="mintAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount to Mint
          </label>
          <div className="relative">
          <input
            type="number"
            id="mintAmount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="1"
            className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter amount"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">ESSENCE</span>
          </div>
        </div>

        <div>
          <label htmlFor="mintReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reason
          </label>
          <textarea
            id="mintReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            placeholder="Explain why you're minting new currency"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          onClick={handleMint}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center gap-2"
        >
          <CoinsIcon className="h-4 w-4" />
          Mint Currency
        </button>
      </div>
    </div>
  );
}
