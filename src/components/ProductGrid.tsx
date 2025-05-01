import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { Package, ChevronLeft } from 'lucide-react';
import { Product } from '../types';

interface ProductGridProps {
  searchQuery?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ searchQuery = '' }) => {
  const { t } = useTranslation();
  const { products, addToOrder } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set initial value
    setIsMobile(window.innerWidth < 768);

    // Add resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="flex items-center justify-between p-2 md:p-4 flex-shrink-0 bg-white sticky top-0 z-10 border-b">
          <button
            onClick={() => setSelectedCategory(null)}
            className="text-blue-600 hover:text-blue-800 font-medium text-xs md:text-sm flex items-center gap-1"
          >
            <ChevronLeft size={isMobile ? 18 : 14} className={isMobile ? '' : 'md:w-4 md:h-4'} /> 
            {t('pos.backToCategories')}
          </button>
          <h3 className={isMobile ? 'text-sm font-semibold capitalize' : 'text-xs md:text-base font-semibold capitalize'}>
            {t(`pos.${selectedCategory}`)}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className={`p-2 md:p-4 grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2'}`}>
            {Object.values(groupedProducts[selectedCategory])
              .flat()
              .map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToOrder(product)}
                  className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow
                           flex flex-col ${isMobile ? 'h-20' : 'h-14 md:h-16'} relative`}
                >
                  <div className="relative p-2 flex flex-col justify-center h-full bg-gradient-to-br from-white/80 to-white/40">
                    <span className={isMobile ? 'font-medium text-sm line-clamp-1' : 'font-medium text-[10px] md:text-xs line-clamp-1'}>
                      {product.name}
                    </span>
                    <span className={isMobile ? 'text-green-600 font-semibold text-sm' : 'text-green-600 font-semibold text-[10px] md:text-xs'}>
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
        <div className={`p-2 md:p-4 grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2'}`}>
          {Object.entries(groupedProducts).map(([category, products]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow
                       flex flex-col ${isMobile ? 'h-20' : 'h-14 md:h-16'} relative`}
            >
              <div className="relative p-2 flex flex-col justify-center h-full bg-gradient-to-br from-white/80 to-white/40">
                <Package size={isMobile ? 18 : 12} className={isMobile ? 'mb-1' : 'mb-1 text-gray-600 md:w-4 md:h-4'} />
                <span className={isMobile ? 'font-medium text-sm capitalize' : 'font-medium text-[10px] md:text-xs capitalize'}>
                  {category}
                </span>
                <span className={isMobile ? 'text-gray-500 text-sm' : 'text-gray-500 text-[10px] md:text-xs'}>
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