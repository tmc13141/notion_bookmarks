// src/components/Sidebar.tsx
import { CategoryData } from '@/lib/category';

interface SidebarProps {
  categories: Record<string, CategoryData>;
  selectedCategory?: string;
  onSelectCategory: (category: string, subCategory?: string) => void;
}

export default function Sidebar({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: SidebarProps) {
  return (
    <nav className="w-64 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full text-left px-4 py-2 rounded-md transition-colors
              ${selectedCategory === 'all' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
          >
            全部链接
          </button>
        </li>
        
        {Object.entries(categories).map(([categoryName, data]) => (
          <li key={categoryName} className="space-y-1">
            {/* 主分类 */}
            <button
              onClick={() => onSelectCategory(categoryName)}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors
                ${selectedCategory === categoryName 
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            >
              {categoryName} ({data.count})
            </button>
            
            {/* 子分类 */}
            {Object.entries(data.subCategories).length > 0 && (
              <ul className="ml-4 space-y-1">
                {Object.entries(data.subCategories).map(([subName, count]) => (
                  <li key={subName}>
                    <button
                      onClick={() => onSelectCategory(categoryName, subName)}
                      className="w-full text-left px-4 py-2 text-sm rounded-md
                        hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {subName} ({count})
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}