import type { MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useState, useEffect, useMemo } from "react";
import { ClientOnly } from "~/components/ClientOnly";
import { useStore } from "~/store/store";
import { DashboardCard } from "~/components/DashboardCard";
import type { User as StoreUser } from '~/types/admin'; // Use the main User type

// Simple icon placeholder
const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

export const meta: MetaFunction = () => {
  return [
    { title: "Life Economy - Transfer ESSENCE" },
    { name: "description", content: "Transfer ESSENCE to other users" },
  ];
};

// Local type for recent transfers display
type RecentTransfer = {
  id: string;
  amount: number;
  recipientId: string;
  recipientName: string;
  note?: string;
  timestamp: string;
};

// Action function remains largely the same
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const amount = Number(formData.get("amount"));
  const recipientId = formData.get("recipient") as string;
  const note = formData.get("note") as string;
  const senderId = formData.get("senderId") as string;

  // Basic Input Validation
  if (!amount || amount <= 0) {
    return json({ error: "Please enter a valid amount" }, { status: 400 });
  }
  if (!recipientId) {
    return json({ error: "Please select a recipient" }, { status: 400 });
  }
  if (!senderId) {
    return json({ error: "Sender information missing. Please refresh." }, { status: 400 });
  }

  // Simulate Backend Interaction (delay, placeholder name)
  const simulatedRecipientName = `User ${recipientId}`;
  await new Promise(res => setTimeout(res, 500));

  // Simulate backend failure condition (e.g., insufficient funds check)
  // In a real app, this check would be more robust.
  // We rely on client-side check too, but backend is authoritative.
  // Example: Fetch sender balance and check if amount > balance
  const senderBalance = 1000; // Replace with actual fetch in real app
  if (amount > senderBalance) { // Simulate insufficient funds based on fetched balance
     return json({ error: "Transfer failed. Insufficient funds (simulated backend check)." }, { status: 400 });
  }

  // Return success data for client-side processing
  return json({
    success: true,
    message: `Successfully initiated transfer of ${amount} ESSENCE to ${simulatedRecipientName}`,
    transaction: {
      id: `tx${Date.now()}`,
      amount,
      senderId,
      recipientId,
      recipientName: simulatedRecipientName,
      note,
      timestamp: new Date().toISOString()
    }
  });
}

// Main component wrapper for ClientOnly
export default function Transfer() {
  const fallback = (
    <div className="mx-auto max-w-4xl space-y-8 animate-pulse">
      <div className="h-8 w-1/3 rounded bg-muted"></div>
      {/* Placeholder for Balance Card */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="h-4 w-1/4 rounded bg-muted"></div>
          <div className="h-6 w-6 rounded bg-muted"></div>
        </div>
        <div className="mt-2">
          <div className="h-7 w-1/3 rounded bg-muted"></div>
        </div>
      </div>
      {/* Placeholder for Form */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-6">
          <div className="h-6 w-1/4 rounded bg-muted"></div>
          <div className="h-10 w-full rounded bg-muted"></div>
          <div className="h-10 w-full rounded bg-muted"></div>
          <div className="h-6 w-1/4 rounded bg-muted"></div>
          <div className="h-10 w-full rounded bg-muted"></div>
          <div className="h-6 w-1/4 rounded bg-muted"></div>
          <div className="h-20 w-full rounded bg-muted"></div>
          <div className="flex justify-center">
            <div className="h-10 w-32 rounded bg-muted"></div>
          </div>
        </div>
      </div>
      {/* Placeholder for Recent Transfers */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="h-6 w-1/4 rounded bg-muted mb-4"></div>
        <div className="space-y-4">
          <div className="h-16 w-full rounded bg-muted"></div>
          <div className="h-16 w-full rounded bg-muted"></div>
        </div>
      </div>
    </div>
  );

  return (
    <ClientOnly fallback={fallback}>
      {() => <TransferContent />}
    </ClientOnly>
  );
}

// Component containing the actual logic, rendered only on the client
function TransferContent() {
  // Fetch state and actions from Zustand store
  const {
    currentUser,
    users: allUsers,
    updateUserBalance,
    addTransaction,
    addSecurityLog
  } = useStore((state) => ({
    currentUser: state.currentUser,
    users: state.users,
    updateUserBalance: state.updateUserBalance,
    addTransaction: state.addTransaction,
    addSecurityLog: state.addSecurityLog,
  }));

  // Local UI state
  const [selectedUser, setSelectedUser] = useState<StoreUser | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [recentTransfers, setRecentTransfers] = useState<RecentTransfer[]>([]);
  const [formKey, setFormKey] = useState<number>(0); // For resetting the form
  const [searchTerm, setSearchTerm] = useState<string>("");
  // State to track client-side update status for feedback
  const [clientUpdateStatus, setClientUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Derive the list of possible recipients
  const recipientUsers = useMemo(() => {
    if (!currentUser) return [];
    return allUsers.filter(u => u.id !== currentUser.id);
  }, [allUsers, currentUser]);

  // Filter recipients based on search term
  const filteredRecipientUsers = useMemo(() => {
    if (!searchTerm) {
      return recipientUsers;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return recipientUsers.filter(user =>
      user.fullName.toLowerCase().includes(lowerCaseSearchTerm) ||
      user.id.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [recipientUsers, searchTerm]);

  // Effect to process the action result from the server
  useEffect(() => {
    // Reset client status when actionData changes (before processing)
    setClientUpdateStatus('idle');

    if (actionData?.success && actionData.transaction && currentUser) {
      const { amount, senderId, recipientId, note, timestamp, id: transactionId } = actionData.transaction;

      // Verify the action corresponds to the current user
      if (senderId !== currentUser.id) {
        console.warn("Received transfer success action data, but senderId doesn't match currentUser.id. Ignoring.");
        return;
      }

      // Get recipient details from the store
      const recipient = allUsers.find(u => u.id === recipientId);
      const recipientName = recipient?.fullName || `User ${recipientId}`;

      // Attempt to update the sender's balance in the store
      const { success: balanceUpdated, finalBalance } = updateUserBalance(senderId, -amount);

      if (balanceUpdated) {
        // Set client status to success
        setClientUpdateStatus('success');

        // Add Transaction Record
        addTransaction({
          userId: senderId,
          type: 'Transfer Out',
          narration: `Transfer to ${recipientName}${note ? ` - Note: ${note}` : ''}`,
          debit: amount,
          credit: null,
        }, finalBalance);

        // Add Security Log entry
        addSecurityLog({
          action: 'Transfer Sent',
          details: `Sent ${amount} ESSENCE to ${recipientName} (ID: ${recipientId}). Tx ID: ${transactionId}`,
          category: 'transfer',
          severity: 'info',
        });

        // Update local state for "Recent Transfers Sent" display
        setRecentTransfers(prev => [
          {
            id: transactionId,
            amount,
            recipientId,
            recipientName: recipientName,
            note,
            timestamp
          },
          ...prev.slice(0, 2) // Keep only the 3 most recent
        ]);

        // Reset the form
        setFormKey(prev => prev + 1);
        setSelectedUser(null);
        setSelectedUserId("");
        setSearchTerm("");

      } else {
        // Set client status to error (client-side failure)
        setClientUpdateStatus('error');
        console.error("Transfer failed: Insufficient funds detected during client-side store update.");
      }
    } else if (actionData?.error) {
        // Backend returned an error, set client status accordingly
        setClientUpdateStatus('error');
    }
  }, [actionData, currentUser, allUsers, updateUserBalance, addTransaction, addSecurityLog]);

  // Handler for recipient selection change
  const handleRecipientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    const user = recipientUsers.find(u => u.id === userId);
    setSelectedUser(user || null);
  };

  // --- Render JSX ---
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold">Transfer ESSENCE</h1>

      {/* Current Balance Card */}
      {currentUser && (
        <DashboardCard
          title="Your Current Balance"
          value={`${currentUser.balance.toLocaleString()} ESSENCE`}
          icon={<WalletIcon />}
          className="border-blue-500 dark:border-blue-700"
        />
      )}

      {/* Transfer Form Container */}
      <div className="rounded-lg border bg-card p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        {/* Action Feedback Display */}
        {clientUpdateStatus === 'success' && actionData?.success ? (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-green-800 dark:bg-green-900 dark:text-green-50">
            <p className="font-medium">Transfer successful!</p>
            {actionData.transaction && (
              <p className="mt-2 text-sm">
                Transaction ID: {actionData.transaction.id}
              </p>
            )}
          </div>
        ) : clientUpdateStatus === 'error' && actionData?.error ? ( // Error from backend action
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-50">
            <p className="font-medium">{actionData.error}</p>
          </div>
        ) : clientUpdateStatus === 'error' && actionData?.success ? ( // Success from backend, but client store update failed
           <div className="mb-6 rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-50">
            <p className="font-medium">Transfer Failed: Insufficient funds.</p>
          </div>
        ) : null}


        {/* Transfer Form */}
        <Form key={formKey} method="post" className="space-y-6">
          {/* Hidden input for sender ID */}
          {currentUser && <input type="hidden" name="senderId" value={currentUser.id} />}

          {/* Recipient Search and Selection */}
          <div>
            <label htmlFor="search-recipient" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              Search Recipient
            </label>
            <input
              type="text"
              id="search-recipient"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID..."
              className="mb-2 block w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <label htmlFor="recipient" className="sr-only">Select Recipient</label>
            <select
              id="recipient"
              name="recipient"
              value={selectedUserId}
              className="block w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              onChange={handleRecipientChange}
              required
            >
              <option value="" disabled={!!selectedUserId}>Select a user</option>
              {filteredRecipientUsers.map((user) => (
                <option key={user.id} value={user.id} className="text-gray-900 dark:text-white">
                  {user.fullName} ({user.id})
                </option>
              ))}
              {filteredRecipientUsers.length === 0 && searchTerm && (
                <option value="" disabled className="text-gray-500 dark:text-gray-400">No users found</option>
              )}
               {recipientUsers.length === 0 && !searchTerm && (
                 <option value="" disabled className="text-gray-500 dark:text-gray-400">No other users available</option>
               )}
            </select>
          </div>

          {/* Selected Recipient Preview */}
          {selectedUser && (
            <div className="flex items-center gap-4 rounded-md border p-4 dark:border-gray-700">
              <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300">
                 {selectedUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{selectedUser.fullName}</h3>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label htmlFor="amount" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              Amount (ESSENCE)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              min="1"
              step="1"
              className="block w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Enter amount"
              required
              max={currentUser?.balance} // Client-side check against store balance
            />
             {currentUser && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Available: {currentUser.balance.toLocaleString()} ESSENCE
                </p>
             )}
          </div>

          {/* Note Input */}
          <div>
            <label htmlFor="note" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
              Note (Optional)
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              className="block w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Add a note about this transfer"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || !selectedUserId || !currentUser || currentUser.balance <= 0}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-800 dark:hover:bg-blue-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-950"
            >
              {isSubmitting ? "Processing..." : "Transfer ESSENCE"}
            </button>
          </div>
        </Form>
      </div>

      {/* Recent Transfers List (Local State) */}
      <div className="rounded-lg border bg-card p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Transfers Sent</h2>
        <div className="space-y-4">
          {recentTransfers.length > 0 ? (
            recentTransfers.map((transfer) => {
              const recipientUser = allUsers.find(u => u.id === transfer.recipientId);
              const recipientName = recipientUser?.fullName || transfer.recipientName;
              const recipientInitial = recipientName.charAt(0).toUpperCase();

              return (
                <div key={transfer.id} className="flex items-center justify-between rounded-md border p-4 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-lg font-bold text-gray-600 dark:text-gray-300">
                        {recipientInitial}
                     </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{recipientName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(transfer.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600 dark:text-red-400">
                      -{transfer.amount.toLocaleString()} ESSENCE
                    </p>
                    {transfer.note && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]" title={transfer.note}>
                        {transfer.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No recent transfers sent.</p>
          )}
        </div>
      </div>
    </div>
  );
}
