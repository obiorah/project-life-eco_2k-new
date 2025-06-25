import { useState, useMemo } from 'react';
import { 
  useLoaderData, 
  useActionData, 
  useNavigation, 
  Form,
  useSubmit
} from '@remix-run/react';
import { 
  json,
  redirect
} from '@remix-run/node';
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node';

// Components
import { ProductGrid } from '~/components/market/ProductGrid';
import { SearchBar } from '~/components/market/SearchBar';
import { FilterSortPanel } from '~/components/market/FilterSortPanel';
import { ProductDetailModal } from '~/components/market/ProductDetailModal';
import { AddProductForm } from '~/components/market/setup/AddProductForm';
import { EditProductModal } from '~/components/market/setup/EditProductModal';
import { InventoryTable } from '~/components/market/setup/InventoryTable';
import { DeleteConfirmationModal } from '~/components/market/setup/DeleteConfirmationModal';
import { SalesLogTable } from '~/components/market/SalesLogTable';

// Utilities
import supabaseAdmin from '~/lib/supabase-admin';
import { useStore } from '~/store/store';
import type { MarketplaceItem, PurchaseRecordWithBuyerDetails } from '~/types/market';
import { requireUserId } from '~/lib/auth.server';

const MARKET_IMAGES_BUCKET = 'product-images';
const DEFAULT_PLACEHOLDER_IMAGE = '/images/placeholder-product.png';

// Data transformation functions
function mapDbItemToMarketplaceItem(dbItem: any): MarketplaceItem {
  if (!dbItem) return dbItem;
  const { image_url, created_at, ...rest } = dbItem;
  return {
    ...rest,
    imageUrl: image_url || DEFAULT_PLACEHOLDER_IMAGE,
    createdAt: created_at
  };
}

function mapDbPurchaseRecordToApp(dbRecord: any): PurchaseRecordWithBuyerDetails | null {
  if (!dbRecord) return null;

  const buyer = dbRecord.profiles 
    ? { fullName: dbRecord.profiles.full_name, email: dbRecord.profiles.email }
    : null;

  return {
    id: dbRecord.id,
    itemId: dbRecord.item_id,
    itemName: dbRecord.item_name_snapshot,
    userId: dbRecord.user_id,
    quantity: dbRecord.quantity,
    price: dbRecord.total_price,
    pricePerItemSnapshot: dbRecord.price_per_item_snapshot,
    purchaseDate: dbRecord.purchase_date,
    deliveryDate: dbRecord.delivery_date,
    status: dbRecord.status,
    profiles: buyer
  };
}

type LoaderData = {
  marketplaceItems: MarketplaceItem[];
  purchaseRecords: (PurchaseRecordWithBuyerDetails | null)[];
  currentUserId: string;
  error?: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const userId = await requireUserId(request);
    
    const { data: items, error: itemsError } = await supabaseAdmin
      .from('marketplace_items')
      .select('*')
      .eq('deleted', false)
      .order('name', { ascending: true });

    if (itemsError) {
      console.error('Error loading marketplace items:', itemsError);
      return json<LoaderData>({ 
        marketplaceItems: [], 
        purchaseRecords: [], 
        currentUserId: userId,
        error: 'Failed to load products' 
      }, { status: 500 });
    }

    const { data: records, error: recordsError } = await supabaseAdmin
      .from('purchase_records')
      .select(`
        *,
        profiles!fk_purchase_user(full_name, email)
      `)
      .order('purchase_date', { ascending: false });

    if (recordsError) {
      console.error('Error loading purchase records:', recordsError);
      return json<LoaderData>({ 
        marketplaceItems: items.map(mapDbItemToMarketplaceItem),
        purchaseRecords: [],
        currentUserId: userId,
        error: 'Failed to load sales data'
      }, { status: 500 });
    }

    return json<LoaderData>({
      marketplaceItems: items.map(mapDbItemToMarketplaceItem),
      purchaseRecords: records.map(mapDbPurchaseRecordToApp).filter(Boolean),
      currentUserId: userId
    });

  } catch (error) {
    if (error instanceof Response) throw error;
    console.error('Market loader error:', error);
    return json<LoaderData>({ 
      marketplaceItems: [],
      purchaseRecords: [],
      currentUserId: '',
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}

export default function MarketRoute() {
  const loaderData = useLoaderData<typeof loader>();
  const { marketplaceItems = [], purchaseRecords = [], currentUserId, error } = loaderData;
  const actionData = useActionData();
  const navigation = useNavigation();
  const { currentUser } = useStore();
  const submit = useSubmit();

  // State
  const [view, setView] = useState<'shop' | 'manage' | 'sales'>('shop');
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceItem | null>(null);
  const [editingProduct, setEditingProduct] = useState<MarketplaceItem | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<MarketplaceItem | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sort: 'name-asc'
  });

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...marketplaceItems];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category && filters.category !== 'all') {
      result = result.filter(p => p.category === filters.category);
    }

    const [sortField, sortDirection] = filters.sort.split('-');
    result.sort((a, b) => {
      if (sortField === 'price') {
        return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
      }
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    });

    return result;
  }, [marketplaceItems, filters]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(marketplaceItems.map(item => item.category));
    return ['all', ...Array.from(uniqueCategories)].filter(Boolean);
  }, [marketplaceItems]);

  // Event handlers
  const handlePurchase = (productId: string, quantity: number) => {
    submit(
      { intent: 'purchase', productId, quantity },
      { method: 'POST' }
    );
  };

  const handleEditSubmit = (values: Omit<MarketplaceItem, 'id'>) => {
    if (!editingProduct) return;
    submit(
      { intent: 'edit-product', id: editingProduct.id, ...values },
      { method: 'POST' }
    );
    setEditingProduct(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingProduct) return;
    submit(
      { intent: 'delete-product', id: deletingProduct.id },
      { method: 'POST' }
    );
    setDeletingProduct(null);
  };

  // Handle loader error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-red-600 dark:text-red-400 text-center mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center mb-2">Error Loading Marketplace</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{error}</p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-b-lg">
          <div className="px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
          </div>
        </div>

        {/* View selector */}
        <div className="bg-white dark:bg-gray-800 mt-6 rounded-lg">
          <nav className="flex divide-x divide-gray-200 dark:divide-gray-700" aria-label="Tabs">
            <button
              onClick={() => setView('shop')}
              className={`
                flex-1 py-4 px-4 text-center text-sm font-medium first:rounded-l-lg last:rounded-r-lg
                ${view === 'shop'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-100'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
                }
              `}
            >
              Shop
            </button>
            
            {(currentUser?.role === 'Admin' || currentUser?.role === 'Super Admin') && (
              <>
                <button
                  onClick={() => setView('sales')}
                  className={`
                    flex-1 py-4 px-4 text-center text-sm font-medium
                    ${view === 'sales'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-100'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  Sales Log
                </button>
                <button
                  onClick={() => setView('manage')}
                  className={`
                    flex-1 py-4 px-4 text-center text-sm font-medium
                    ${view === 'manage'
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-100'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  Setup
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Views Container */}
        <div className="views-container mt-6 space-y-6">
          {/* Shop view */}
          {view === 'shop' && (
            <div className="shop-view">
              <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
                <div className="space-y-6">
                  {/* Search and Filter Panel */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Search Products
                        </label>
                        <SearchBar 
                          onSearch={(search) => setFilters({...filters, search})}
                          placeholder="Search by name or description..."
                          disabled={navigation.state !== 'idle'}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Filter & Sort
                        </label>
                        <FilterSortPanel
                          categories={categories}
                          selectedCategory={filters.category}
                          sortValue={filters.sort}
                          onCategoryChange={(category) => setFilters({...filters, category})}
                          onSortChange={(sort) => setFilters({...filters, sort})}
                          disabled={navigation.state !== 'idle'}
                        />
                      </div>
                    </div>
                    {filteredProducts.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                        {filters.search && ` matching "${filters.search}"`}
                        {filters.category !== 'all' && ` in ${filters.category}`}
                      </div>
                    )}
                  </div>

                  {/* Products Grid */}
                  <div>
                    {marketplaceItems.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No products available</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          There are no products available in the marketplace.
                        </p>
                      </div>
                    ) : navigation.state !== 'idle' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow animate-pulse">
                            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                            <div className="p-4 space-y-3">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No products found</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {filters.search 
                            ? `No products match your search "${filters.search}"`
                            : filters.category !== 'all'
                            ? `No products found in category "${filters.category}"`
                            : 'Try adjusting your filters'}
                        </p>
                      </div>
                    ) : (
                      <ProductGrid
                        products={filteredProducts}
                        onSelect={setSelectedProduct}
                        onPurchase={handlePurchase}
                        currentUserId={currentUserId}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales Log view */}
          {view === 'sales' && (
            <div className="sales-view">
              <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Sales History</h2>
                {purchaseRecords.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No sales records</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">There are no sales records to display.</p>
                  </div>
                ) : (
                  <SalesLogTable records={purchaseRecords} />
                )}
              </div>
            </div>
          )}

          {/* Setup view */}
          {view === 'manage' && (
            <div className="setup-view space-y-6">
              <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Add New Product</h2>
                <AddProductForm 
                  onCancel={() => {}} // No-op since we don't need to cancel in this context
                  categories={categories}
                  navigation={navigation}
                  actionData={actionData}
                />
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 dark:bg-gray-800">
                <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Product Inventory</h2>
                {marketplaceItems.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No products</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first product above.</p>
                  </div>
                ) : (
                  <InventoryTable
                    items={marketplaceItems}
                    onEdit={setEditingProduct}
                    onDelete={setDeletingProduct}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onPurchase={(qty) => {
            handlePurchase(selectedProduct.id, qty);
            setSelectedProduct(null); // Close modal after purchase initiation
          }}
          isSubmitting={navigation.state === 'submitting'}
        />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSubmit={handleEditSubmit}
          error={actionData?.error}
          isSubmitting={navigation.state === 'submitting'}
        />
      )}

      {deletingProduct && (
        <DeleteConfirmationModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleDeleteConfirm}
          isSubmitting={navigation.state === 'submitting'}
        />
      )}

      {/* Action feedback messages */}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-50 space-y-4 min-w-[320px] max-w-md">
        {actionData?.error && (
          <div 
            role="alert"
            className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-400 p-4 rounded-lg shadow-lg animate-slide-in-right"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {actionData.error}
                </div>
              </div>
            </div>
          </div>
        )}

        {actionData?.success && (
          <div 
            role="alert"
            className="bg-green-50 dark:bg-green-900/50 border-l-4 border-green-400 p-4 rounded-lg shadow-lg animate-slide-in-right"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Success</h3>
                <div className="mt-1 text-sm text-green-700 dark:text-green-300">
                  {actionData.message || 'Action completed successfully!'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {navigation.state === 'submitting' && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="loading-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl max-w-sm w-full mx-4 relative">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 absolute"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-r-2 border-indigo-600 absolute animation-delay-150"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-indigo-600 absolute animation-delay-300"></div>
              </div>
            </div>
            <h2 
              id="loading-title"
              className="text-center text-lg font-semibold text-gray-900 dark:text-white"
            >
              Processing Your Request
            </h2>
            <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
              {navigation.formData?.get('intent') === 'purchase'
                ? 'Processing your purchase...'
                : navigation.formData?.get('intent') === 'add-product'
                ? 'Adding new product...'
                : navigation.formData?.get('intent') === 'edit-product'
                ? 'Updating product...'
                : navigation.formData?.get('intent') === 'delete-product'
                ? 'Removing product...'
                : 'Please wait...'}
            </p>
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              This may take a few moments
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const userId = await requireUserId(request);
    const formData = await request.formData();
    const intent = formData.get('intent') as string;

    if (!intent) {
      return json({ error: 'No action specified' }, { status: 400 });
    }

    switch (intent) {
      case 'add-product': {
        const name = formData.get('name') as string;
        const price = Number(formData.get('price'));
        const stock = Number(formData.get('stock'));
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const imageFile = formData.get('image') as File | null;

        if (!name || isNaN(price) || price < 0) {
          return json({ error: 'Invalid product data' }, { status: 400 });
        }

        let imageUrl = DEFAULT_PLACEHOLDER_IMAGE;
        if (imageFile && imageFile.size > 0) {
          const fileName = `product-${Date.now()}-${imageFile.name}`;
          const { error: uploadError } = await supabaseAdmin.storage
            .from(MARKET_IMAGES_BUCKET)
            .upload(fileName, imageFile);

          if (uploadError) {
            console.error('Image upload error:', uploadError);
            return json({ error: 'Failed to upload image' }, { status: 500 });
          }
          
          const { data: urlData } = supabaseAdmin.storage
            .from(MARKET_IMAGES_BUCKET)
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }

        const { error: insertError } = await supabaseAdmin
          .from('marketplace_items')
          .insert({
            name,
            description,
            price,
            stock,
            category,
            image_url: imageUrl,
            created_by: userId,
            deleted: false,
            status: 'active'
          });

        if (insertError) {
          console.error('Product creation error:', insertError);
          return json({ error: 'Failed to create product' }, { status: 500 });
        }

        return json({ success: true, message: 'Product created successfully' });
      }

      case 'edit-product': {
        const id = formData.get('id') as string;
        const updates = {
          name: formData.get('name') as string,
          price: Number(formData.get('price')),
          stock: Number(formData.get('stock')),
          category: formData.get('category') as string,
          description: formData.get('description') as string,
          status: formData.get('status') as 'active' | 'inactive'
        };

        const { error } = await supabaseAdmin
          .from('marketplace_items')
          .update(updates)
          .eq('id', id);

        if (error) {
          console.error('Product update error:', error);
          return json({ error: 'Failed to update product' }, { status: 500 });
        }
        return json({ success: true, message: 'Product updated successfully' });
      }

      case 'delete-product': {
        const id = formData.get('id') as string;
        
        const { error } = await supabaseAdmin
          .from('marketplace_items')
          .update({ 
            deleted: true, 
            deleted_at: new Date().toISOString(),
            status: 'inactive'
          })
          .eq('id', id);

        if (error) {
          console.error('Product deletion error:', error);
          return json({ error: 'Failed to delete product' }, { status: 500 });
        }
        return json({ success: true, message: 'Product deleted successfully' });
      }

      case 'purchase': {
        const productId = formData.get('productId') as string;
        const quantity = Number(formData.get('quantity'));

        if (!productId || isNaN(quantity) || quantity <= 0) {
          return json({ error: 'Invalid purchase data' }, { status: 400 });
        }

        const { data: product, error: productError } = await supabaseAdmin
          .from('marketplace_items')
          .select('*')
          .eq('id', productId)
          .eq('deleted', false)
          .eq('status', 'active')
          .single();

        if (productError || !product) {
          console.error('Product fetch error:', productError);
          return json({ error: 'Product not found or not available' }, { status: 404 });
        }

        if (product.stock !== -1 && product.stock < quantity) {
          return json({ error: 'Insufficient stock' }, { status: 400 });
        }

        const { error: purchaseError } = await supabaseAdmin
          .from('purchase_records')
          .insert({
            item_id: productId,
            user_id: userId,
            quantity,
            total_price: product.price * quantity,
            price_per_item_snapshot: product.price,
            item_name_snapshot: product.name,
            purchase_date: new Date().toISOString(),
            status: 'pending'
          });

        if (purchaseError) {
          console.error('Purchase record creation error:', purchaseError);
          return json({ error: 'Failed to process purchase' }, { status: 500 });
        }

        if (product.stock !== -1) {
          const { error: stockUpdateError } = await supabaseAdmin
            .from('marketplace_items')
            .update({ stock: product.stock - quantity })
            .eq('id', productId);

          if (stockUpdateError) {
            console.error('Stock update error:', stockUpdateError);
            return json({ error: 'Failed to update stock' }, { status: 500 });
          }
        }

        return json({ 
          success: true, 
          message: 'Purchase successful',
          purchase: {
            productId,
            quantity,
            totalPrice: product.price * quantity
          }
        });
      }

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Market action error:', error);
    if (error instanceof Response) throw error;
    if (error instanceof Error) {
      return json({ error: error.message }, { status: 500 });
    }
    return json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}