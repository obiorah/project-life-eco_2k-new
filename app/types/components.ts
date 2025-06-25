import type { Navigation } from '@remix-run/router';
import type { MarketplaceItem, PurchaseRecordWithBuyerDetails } from './market';

export interface SearchBarProps {
  onSearch: (search: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface FilterSortPanelProps {
  categories: string[];
  selectedCategory: string;
  currentSort?: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  disabled?: boolean;
}

export interface ProductGridProps {
  items: MarketplaceItem[];
  onSelect: (product: MarketplaceItem) => void;
  onPurchase: (productId: string, quantity: number) => void;
  currentUserId: string;
}

export interface ProductDetailModalProps {
  item: MarketplaceItem;
  onClose: () => void;
  onPurchase: (quantity: number) => void;
  isSubmitting?: boolean;
}

export interface EditProductModalProps {
  item: MarketplaceItem;
  onClose: () => void;
  onSave: (values: Omit<MarketplaceItem, "id">) => void;
  error?: string;
  isSubmitting?: boolean;
}

export interface DeleteConfirmationModalProps {
  item: MarketplaceItem;
  onClose: () => void;
  onDelete: () => void;
  isSubmitting?: boolean;
}

export interface AddProductFormProps {
  onCancel: () => void;
  categories: string[];
  navigation: Navigation;
  actionData?: {
    success?: boolean;
    error?: string;
    message?: string;
  };
}

export interface SalesLogTableProps {
  records: PurchaseRecordWithBuyerDetails[];
}

export interface InventoryTableProps {
  items: MarketplaceItem[];
  onEdit: (product: MarketplaceItem) => void;
  onDelete: (product: MarketplaceItem) => void;
}