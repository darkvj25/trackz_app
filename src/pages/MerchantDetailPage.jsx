import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Utensils, Plus } from 'lucide-react';
import { MerchantHeader } from '../components/merchant/MerchantHeader';
import { CategoryTabs } from '../components/merchant/CategoryTabs';
import { ProductCustomizerModal } from '../components/merchant/ProductCustomizerModal';
import { ReviewsModal } from '../components/merchant/ReviewsModal';
import { Skeleton } from '../components/common/Skeleton';
import { merchantService } from '../services/merchantService';
import { productService } from '../services/productService';
import { formatCurrency } from '../utils/formatters';

export const MerchantDetailPage = () => {
  const { id } = useParams();
  const [merchant, setMerchant] = useState(null);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  useEffect(() => {
    loadMerchantAndProducts();
  }, [id]);

  const loadMerchantAndProducts = async () => {
    setLoading(true);
    try {
      const merch = await merchantService.getMerchantById(id);
      setMerchant(merch);
      const prods = await productService.getProductsByMerchant(id);
      setProducts(prods);
      if (merch?.menuCategories && merch.menuCategories.length > 0) {
        setActiveCategory('All');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="bg-white dark:bg-[#121927] rounded-3xl p-10 text-center space-y-2 border border-slate-100 dark:border-slate-800/80">
        <Utensils size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
        <h3 className="font-extrabold text-slate-800 dark:text-slate-200">Merchant Not Found</h3>
      </div>
    );
  }

  const productCategories = products.map(p => p.category).filter(Boolean);
  const allCategories = ['All', ...Array.from(new Set([
    ...(merchant.menuCategories || []),
    ...productCategories
  ]))];

  const filteredProducts = products.filter(p => {
    const isPopularTab = activeCategory.trim().toLowerCase().includes('popular');
    const matchesCategory =
      activeCategory === 'All' ||
      (isPopularTab && p.isPopular) ||
      (p.category && p.category.trim().toLowerCase() === activeCategory.trim().toLowerCase());

    const matchesSearch = !menuSearchQuery ||
      (p.name && p.name.toLowerCase().includes(menuSearchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(menuSearchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Merchant Banner & Header */}
      <MerchantHeader
        merchant={merchant}
        onOpenReviews={() => setIsReviewsModalOpen(true)}
      />

      {/* Menu Search Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search items in ${merchant.name}...`}
            value={menuSearchQuery}
            onChange={(e) => setMenuSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#121927] rounded-2xl border border-slate-200 dark:border-slate-800/80 py-3 pl-11 pr-4 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-purple-500 outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Store Closed Warning Banner */}
      {merchant.isOpen === false && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-4 bg-rose-500/10 border-2 border-rose-500/40 rounded-3xl text-rose-500 font-extrabold text-xs flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-base">🔴</span>
              <div>
                <div className="text-sm font-extrabold">Store Currently Closed</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {merchant.name} is not accepting orders at this time. You can browse the menu, but items cannot be added to cart.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <CategoryTabs
        categories={allCategories}
        activeCategory={activeCategory}
        onSelect={(cat) => setActiveCategory(cat)}
      />

      {/* Product List Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
          {activeCategory === 'All' ? 'Full Menu' : activeCategory}
        </h3>

        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-[#121927] rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-800/80 space-y-2">
            <Utensils size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No items found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => setActiveProductModal(product)}
                className="group bg-white dark:bg-[#121927] rounded-3xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-card hover:shadow-card-hover transition-all flex gap-4 cursor-pointer"
              >
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isPopular && (
                    <span className="absolute top-1 left-1 px-2 py-0.5 rounded-md bg-purple-600 text-white text-[9px] font-extrabold uppercase">
                      POPULAR
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                      {formatCurrency(product.price)}
                    </span>
                    {merchant.isOpen === false ? (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-extrabold text-[11px]">
                        Closed 🔴
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveProductModal(product);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 hover:bg-purple-600 hover:text-white font-bold text-xs transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Customizer Modal */}
      <ProductCustomizerModal
        isOpen={!!activeProductModal}
        onClose={() => setActiveProductModal(null)}
        product={activeProductModal}
        merchant={merchant}
      />

      {/* Reviews Modal */}
      <ReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        merchant={merchant}
      />
    </div>
  );
};
