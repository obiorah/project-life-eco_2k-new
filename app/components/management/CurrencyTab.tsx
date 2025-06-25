import React, { useState, useEffect } from 'react';
import { DollarSignIcon, HistoryIcon, WalletIcon } from 'lucide-react';
import { useToast } from "~/components/ui/use-toast";
import { supabase } from '~/lib/supabase';
import { useUser } from '~/lib/auth';
import { useUserRole } from '~/hooks/useUserRole'; // Import the useUserRole hook
import { useStore } from '~/store/store'; // Import Zustand store
import type { Transaction } from '~/store/types'; // Import Transaction type

export function CurrencyTab() {
  const { addToast } = useToast();
  const user = useUser();
  const userRole = useUserRole(); // Get the current user's role
  const addTransaction = useStore((state) => state.addTransaction); // Get addTransaction from Zustand
  const updateUserBalance = useStore((state) => state.updateUserBalance); // Get updateUserBalance from Zustand

  const [totalEssence, setTotalEssence] = useState(1000000); // Example initial value
  const [mintAmount, setMintAmount] = useState('');
  const [mintReason, setMintReason] = useState('');
  const [issuanceHistory, setIssuanceHistory] = useState<Transaction[]>([]); // Use Transaction type for history
  const [userBalance, setUserBalance] = useState<number | null>(null);

  // Set Supabase session explicitly when user changes
  useEffect(() => {
    if (user?.id && user.accessToken) {
      // Set the session on the client-side Supabase instance
      supabase.auth.setSession({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
        expires_in: user.expiresIn,
        token_type: 'Bearer',
        user: user // Pass the full user object if needed by Supabase client
      }).catch(error => {
        console.error("Error setting Supabase session:", error);
      });
    } else {
      // Clear session if no user
      supabase.auth.signOut().catch(error => {
        console.error("Error clearing Supabase session:", error);
      });
    }
  }, [user]);


  // Fetch user balance on component mount and when user changes
  useEffect(() => {
    const fetchUserBalance = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user balance:", error);
          addToast({
            title: "Error",
            description: "Failed to fetch your current balance.",
            variant: "destructive",
          });
        } else if (data) {
          setUserBalance(parseFloat(data.balance));
        }
      }
    };

    fetchUserBalance();
  }, [user, addToast]);

  // Simulate fetching total essence and issuance history (replace with actual DB calls)
  useEffect(() => {
    // In a real app, you'd fetch this from a central ledger or aggregate from transactions
    // For now, we'll keep the dummy data for totalEssence and issuanceHistory
    // You might fetch actual issuance history from a 'transactions' table filtered by type 'Minting'
  }, []);

  const handleMintCurrency = async () => {
    console.log("DEBUG: Mint Currency button clicked!"); // Added for debugging
    console.log("DEBUG: mintAmount state:", mintAmount); // New debug log
    const amount = parseFloat(mintAmount);
    console.log("DEBUG: Parsed amount:", amount); // New debug log

    console.log("DEBUG: User object:", user); // New debug log
    console.log("DEBUG: User ID:", user?.id); // New debug log

    if (isNaN(amount) || amount <= 0) {
      addToast({
        title: "Minting Failed",
        description: "Please enter a valid positive amount to mint.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      addToast({
        title: "Minting Failed",
        description: "User not authenticated.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 1. Update user's balance in the profiles table
      const newBalance = (userBalance || 0) + amount;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // 2. Add transaction to the transactions table
      const transaction: Transaction = {
        id: crypto.randomUUID(), // Generate a unique ID
        user_id: user.id, // Changed from userId to user_id
        created_at: new Date().toISOString(), // Changed from 'date' to 'created_at'
        type: 'Minting',
        narration: mintReason || 'ESSENCE minting',
        debit: null,
        credit: amount,
        balance_after: newBalance,
      };

      // --- DEBUGGING RLS ISSUE ---
      console.log("DEBUG: Attempting to insert transaction.");
      console.log("DEBUG: Authenticated user ID from useUser():", user?.id);
      console.log("DEBUG: Transaction object being inserted:", transaction);
      // --- END DEBUGGING ---

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([transaction]);

      if (transactionError) {
        throw transactionError;
      }

      // 3. Update local state and Zustand store
      setTotalEssence(prevTotal => prevTotal + amount);
      setUserBalance(newBalance);
      setIssuanceHistory(prevHistory => [transaction, ...prevHistory]); // Add to history
      addTransaction(transaction); // Add to global Zustand transactions

      updateUserBalance(user.id, newBalance); // Update user balance in Zustand

      addToast({
        title: "Minting Successful",
        description: `Successfully minted ${amount.toLocaleString()} ESSENCE. Your new balance is ${newBalance.toLocaleString()}.`,
        variant: "default",
      });
      setMintAmount('');
      setMintReason('');

    } catch (error: any) {
      console.error("Error minting currency:", error);
      addToast({
        title: "Minting Failed",
        description: `An error occurred: ${error.message || error.toString()}`,
        variant: "destructive",
      });
    }
  };

  // Restrict access to Super Admin
  if (userRole !== 'Super Admin') {
    return (
      <div className="p-4 text-center text-red-500 dark:text-red-400">
        <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
        <p>You do not have the necessary permissions to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Currency Management</h2>

      {/* Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Total ESSENCE in Circulation Card */}
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg shadow-md flex items-center justify-between">
          <div className="flex items-center">
            <DollarSignIcon className="h-8 w-8 text-blue-600 dark:text-blue-300 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-200">Total ESSENCE in Circulation</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">{totalEssence.toLocaleString()} ESSENCE</p>
            </div>
          </div>
        </div>

        {/* Your Current Balance Card */}
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg shadow-md flex items-center justify-between">
          <div className="flex items-center">
            <WalletIcon className="h-8 w-8 text-blue-600 dark:text-blue-300 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-200">Your Current Balance</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-100">
                {userBalance !== null ? `${userBalance.toLocaleString()} ESSENCE` : 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mint Currency Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Mint New ESSENCE</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mintAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount to Mint
            </label>
            <input
              type="number"
              id="mintAmount"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., 10000"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="mintReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Reason (Optional)
            </label>
            <input
              type="text"
              id="mintReason"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g., Community event rewards"
              value={mintReason}
              onChange={(e) => setMintReason(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleMintCurrency}
          className="mt-6 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Mint Currency
        </button>
      </div>

      {/* Issuance History Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center">
          <HistoryIcon className="h-5 w-5 mr-2" />
          Issuance History
        </h3>
        {issuanceHistory.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No issuance history found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Date/Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Issued By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {issuanceHistory.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {new Date(record.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {record.credit?.toLocaleString()} ESSENCE
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {record.narration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {user?.email || 'System'} {/* Display user email or 'System' */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
