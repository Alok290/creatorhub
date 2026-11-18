import React from 'react';

interface CategoryTagProps {
  category: string;
}

export const CategoryTag: React.FC<CategoryTagProps> = ({ category }) => {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200">
      {category}
    </span>
  );
};

