import React, { useState } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { Package } from 'lucide-react';

export const ProductGrid: React.FC = () => {
  const { t } = useTranslation();
  const { products, addToOrder } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, any[]>);

  if (selectedCategory) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 flex-shrink-0 bg-white sticky top-0 z-10 border-b">
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
          >
            ← {t('pos.backToCategories')}
          </button>
          <h3 className="text-base font-semibold capitalize">{t(`pos.${selectedCategory}`)}</h3>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 grid grid-cols-2 gap-2">
            {Object.values(groupedProducts[selectedCategory])
              .flat()
              .map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToOrder(product)}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow
                           flex flex-col h-16 relative"
                >
                  <div className="relative p-2 flex flex-col justify-center h-full bg-gradient-to-br from-white/80 to-white/40">
                    <span className="font-medium text-xs line-clamp-1">
                      {product.name}
                    </span>
                    <span className="text-green-600 font-semibold text-xs">
                      €{product.price.toFixed(2)}
                    </span>
                  </div>
                </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 grid grid-cols-2 gap-2">
          {Object.entries(groupedProducts).map(([category, products]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow
                       flex flex-col h-16 relative"
            >
              <div className="relative p-2 flex flex-col justify-center h-full bg-gradient-to-br from-white/80 to-white/40">
                <Package size={16} className="mb-1 text-gray-600" />
                <span className="font-medium text-xs capitalize">
                  {category}
                </span>
                <span className="text-gray-500 text-xs">
                  {products.length} {t('pos.products')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};