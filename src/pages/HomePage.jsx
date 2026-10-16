import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ShoppingBag, ShieldCheck, ArrowRight, Store, Utensils, Sparkles } from 'lucide-react';
import { PromoCarousel } from '../components/home/PromoCarousel';
import { CategoryList } from '../components/home/CategoryList';
import { MerchantCard } from '../components/home/MerchantCard';
import { ProductCard } from '../components/home/ProductCard';
import { ProductCustomizerModal } from '../components/merchant/ProductCustomizerModal';
import { MerchantLoader } from '../components/merchant/MerchantLoader';
import { Skeleton } from '../components/common/Skeleton';
import { merchantService } from '../services/merchantService';
import { productService } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [merchants, setMerchants] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [selectedProductMerchant, setSelectedProductMerchant] = useState(null);

  useEffect(() => {
    loadHomeData();
  }, [selectedCategory]);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      const [merchList, productList] = await Promise.all([
        merchantService.getMerchants({ category: selectedCategory }),
        productService.getPopularProducts()
      ]);
      setMerchants(merchList);
      setPopularProducts(productList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/merchants?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSelectProduct = async (product) => {
    try {
      const merchant = await merchantService.getMerchantById(product.merchantId);
      setSelectedProductMerchant(merchant);
      setActiveProductModal(product);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input Bar & Quick Cart Tray Shortcut (Matching Mockup top search) */}
      <div className="flex items-center gap-2 pt-1">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Jollibee, McD, Dunkin', Starbucks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#121927] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 py-3 pl-11 pr-4 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 shadow-xs transition-all outline-none"
          />
        </form>

        <Link
          to="/cart"
          className="relative p-3 rounded-2xl bg-white dark:bg-[#121927] border border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors shrink-0 shadow-xs"
          title="Tray / Cart"
        >
          <ShoppingBag size={20} />
          {itemCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center border border-white dark:border-[#0b0f19]">
              {itemCount}
            </span>
          ) : (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600/80 text-white text-[9px] font-bold flex items-center justify-center">
              0
            </span>
          )}
        </Link>
      </div>

      {/* Promotional Banner Carousel (Matching Mockup) */}
      <PromoCarousel />

      {/* Smart Safety Telemetry Pill Banner (Matching Mockup green pill banner) */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
        <ShieldCheck size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span className="truncate">
          <strong className="font-extrabold">Smart Safety:</strong> Rain & Wet Pavement. Rider speed capped for safety.
        </span>
      </div>

      {/* Food Categories (Matching Mockup "FOOD CATEGORIES") */}
      <CategoryList
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
      />

      {/* Top Merchants Section (Matching Mockup "Top Merchants" - "6 Active") */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Top Merchants
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {merchants.filter(m => m.isOpen !== false).length} Active
          </span>
        </div>

        {loading ? (
          <MerchantLoader count={2} message="Loading top merchants..." />
        ) : merchants.length === 0 ? (
          <div className="bg-white dark:bg-[#121927] rounded-3xl p-8 text-center border border-slate-100 dark:border-slate-800/80 space-y-2">
            <Utensils size={32} className="mx-auto text-slate-300 dark:text-slate-600" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No Merchants Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Try switching categories or clearing search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {merchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
          </div>
        )}
      </div>

      {/* Popular Products Best-Sellers */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <span>🔥 Popular Best-Sellers</span>
          </h2>
          <Link to="/merchants" className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-0.5">
            <span>Explore All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {popularProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onSelect={handleSelectProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Customizer Modal */}
      <ProductCustomizerModal
        isOpen={!!activeProductModal}
        onClose={() => setActiveProductModal(null)}
        product={activeProductModal}
        merchant={selectedProductMerchant}
      />
    </div>
  );
};
