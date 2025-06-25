import type { MarketplaceItem } from "~/types/market";
import { ShoppingCartIcon } from 'lucide-react'; // Or another relevant icon

interface MarketplaceItemCardProps {
  item: MarketplaceItem;
  onViewDetails: (item: MarketplaceItem) => void; // Callback when card is clicked
  // Add onAddToCart or onBuyNow later if needed directly on card
}

export function MarketplaceItemCard({ item, onViewDetails }: MarketplaceItemCardProps) {
  const { name, description, price, imageUrl, stock } = item;
  const isAvailable = stock === -1 || stock > 0; // Check if item is in stock or unlimited

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      onClick={() => onViewDetails(item)}
    >
      <img
        src={imageUrl}
        alt={name}
        className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
            {price} <span className="text-xs font-normal">ESSENCE</span>
          </span>
          {stock !== -1 && ( // Display stock only if it's tracked
             <span className={`text-xs font-medium ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
               {isAvailable ? `${stock} in stock` : 'Out of stock'}
             </span>
          )}
           {stock === -1 && ( // Indicate unlimited items
             <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
               Unlimited
             </span>
          )}
        </div>
         {/* Optional: Add a quick buy/add-to-cart button here if desired */}
         {/* <button className="mt-3 w-full ...">Buy Now</button> */}
      </div>
    </div>
  );
}
