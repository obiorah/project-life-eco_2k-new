import type { MarketplaceItem } from "~/types/market";

interface FilterSortPanelProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sortOption: string) => void;
}

export function FilterSortPanel({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: FilterSortPanelProps) {
  const sortOptions = [
    { value: "default", label: "Default" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end flex-1">
      {/* Category Filter */}
      <div className="flex-1 sm:flex-none">
        <label htmlFor="category-filter" className="sr-only">Filter by category</label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div className="flex-1 sm:flex-none">
         <label htmlFor="sort-by" className="sr-only">Sort by</label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
