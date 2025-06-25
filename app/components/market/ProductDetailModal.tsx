import { useState, useEffect } from 'react';
import { Form, useNavigation, useActionData } from '@remix-run/react';
import type { Navigation } from '@remix-run/router';
import type { MarketplaceItem } from "~/types/market";
import { useStore } from "~/store/store";
import { X, Minus, Plus } from 'lucide-react';
import type { action as marketAction } from '~/routes/market'; // Import action type

interface ProductDetailModalProps {
  item: MarketplaceItem | null;
  onClose: () => void;
}

export function ProductDetailModal({ item, onClose }: ProductDetailModalProps) {
  const navigation = useNavigation();
  const actionData = useActionData<typeof marketAction>();

  const { currentUser } = useStore((state) => ({
    currentUser: state.currentUser,
  }));

  const [quantity, setQuantity] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setFeedbackMessage(null); 
    }
  }, [item]);

  useEffect(() => {
    if (actionData && actionData.intent === 'purchaseItem') {
      if (actionData.success) {
        setFeedbackMessage({ type: 'success', message: actionData.message || 'Purchase successful!' });
        const timer = setTimeout(() => {
          onClose(); // Modal closes, parent (Marketplace route) useEffect handles Zustand update
        }, 1500); 
        return () => clearTimeout(timer);
      } else {
        setFeedbackMessage({ type: 'error', message: actionData.error || 'Purchase failed. Please try again.' });
      }
    }
  }, [actionData, onClose]);


  if (!item) return null;

  const { id: itemId, name, description, price, imageUrl, category, stock } = item;
  const isUnlimitedStock = stock === -1;
  
  // Reflect stock changes from a successful purchase action immediately in the modal
  const currentItemStock = (actionData?.intent === 'purchaseItem' && actionData.success && actionData.updatedItem?.id === itemId)
                            ? actionData.updatedItem.stock 
                            : stock;

  const maxQuantity = isUnlimitedStock ? Infinity : currentItemStock;
  const totalPrice = price * quantity;
  const isStockAvailableForQuantity = isUnlimitedStock || currentItemStock >= quantity;
  
  // Reflect balance changes from a successful purchase action immediately
  const currentUserBalance = (actionData?.intent === 'purchaseItem' && actionData.success && actionData.finalBalance !== undefined && currentUser?.id === actionData.userId)
                              ? actionData.finalBalance
                              : currentUser?.balance;
  
  const canAfford = currentUserBalance !== undefined && currentUserBalance >= totalPrice;
  // Ensure item is actually in stock (currentItemStock > 0 or unlimited)
  const canPurchase = isStockAvailableForQuantity && canAfford && (isUnlimitedStock || currentItemStock > 0);

  const isSubmitting = navigation.state === 'submitting' && navigation.formData?.get('intent') === 'purchaseItem';

  const handleQuantityChange = (newQuantity: number) => {
    const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity === Infinity ? 999 : maxQuantity));
    setQuantity(validQuantity);
    setFeedbackMessage(null); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <Form method="post" action="/market" className="flex flex-col gap-6 md:flex-row">
          <input type="hidden" name="intent" value="purchaseItem" />
          <input type="hidden" name="itemId" value={itemId} />
          {currentUser && <input type="hidden" name="userId" value={currentUser.id} />}
          
          <div className="flex-shrink-0 md:w-1/3">
            <img
              src={imageUrl}
              alt={name}
              className="h-auto w-full rounded-md object-cover"
            />
          </div>

          <div className="flex flex-col justify-between md:w-2/3">
            <div>
              <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{name}</h2>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">{description}</p>
              <div className="mb-4 space-y-1 text-sm">
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Category:</span> {category}</p>
                <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Availability:</span>
                  {isUnlimitedStock ? (
                    <span className="ml-1 text-blue-600 dark:text-blue-400">Unlimited</span>
                  ) : (
                    <span className={`ml-1 ${currentItemStock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {currentItemStock > 0 ? `${currentItemStock} in stock` : 'Out of stock'}
                    </span>
                  )}
                </p>
                 <p>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Your Balance:</span>
                  <span className="ml-1">{currentUserBalance ?? 'N/A'} ESSENCE</span>
                 </p>
              </div>

              <div className="mt-4">
                <label htmlFor="quantity-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1 || isSubmitting}
                    className="rounded-l-md border border-r-0 border-gray-300 p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    id="quantity-input"
                    name="quantity" 
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
                    min="1"
                    max={isUnlimitedStock ? undefined : currentItemStock} // Max based on current stock
                    readOnly={isSubmitting}
                    className="w-16 border-y border-gray-300 p-2 text-center text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={!isStockAvailableForQuantity || quantity >= maxQuantity || isSubmitting || (!isUnlimitedStock && currentItemStock === 0)}
                    className="rounded-r-md border border-l-0 border-gray-300 p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {feedbackMessage && (
              <div className={`mt-4 text-sm ${feedbackMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {feedbackMessage.message}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t pt-4 dark:border-gray-700">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                {totalPrice} <span className="text-sm font-normal">ESSENCE</span>
              </span>
              <button
                type="submit"
                disabled={!canPurchase || isSubmitting}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  canPurchase
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                    : 'cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400'
                }`}
              >
                {isSubmitting
                  ? 'Processing...'
                  : (!isUnlimitedStock && currentItemStock === 0)
                  ? 'Out of Stock'
                  : !isStockAvailableForQuantity
                  ? 'Insufficient Stock'
                  : !canAfford
                  ? 'Insufficient Funds'
                  : `Buy ${quantity}`}
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
