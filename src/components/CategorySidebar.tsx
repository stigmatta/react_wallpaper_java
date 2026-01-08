import React from "react";
import { Category } from "@/interfaces/product";

interface CategorySidebarProps {
  categories: Category[];
  onCategoryClick?: (category: string) => void;
  activeCategory?: string;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  onCategoryClick,
  activeCategory,
}) => (
  <aside className="h-100vh border-r border-gray-200 bg-white w-full max-w-xs flex flex-col max-lg:hidden">
    {categories.map((cat) => (
      <button
        key={cat.id}
        className={`text-left px-5 py-4 w-full text-black border-b border-gray-200 transition hover:bg-gray-50 focus:bg-gray-100 ${
          activeCategory === cat.name ? "bg-gray-100" : ""
        }`}
        onClick={() => onCategoryClick?.(cat.id)}
      >
        {cat.name}
      </button>
    ))}
  </aside>
);

export default CategorySidebar;
