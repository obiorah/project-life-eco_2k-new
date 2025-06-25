import type { MarketplaceItem } from "~/types/market";
import { MarketplaceItemCard } from "./MarketplaceItemCard";

interface ProductGridProps {
  items: MarketplaceItem[];
  onSelectItem: (item: MarketplaceItem) => void; // Callback when an item card is clicked
}

export function ProductGrid({ items, onSelectItem }: ProductGridProps) {
  if (!items || items.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No items found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <MarketplaceItemCard key={item.id} item={item} onViewDetails={onSelectItem} />
      ))}
    </div>
  );
}
