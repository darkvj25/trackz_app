import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, Clock, Bike, RotateCcw, Utensils } from 'lucide-react';
import { MerchantCard } from '../components/home/MerchantCard';
import { MerchantLoader } from '../components/merchant/MerchantLoader';
import { merchantService } from '../services/merchantService';
import { mockCategories } from '../data/mockCategories';

export const MerchantsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [openOnly, setOpenOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('rating');
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMerchants();
  }, [searchQuery, selectedCategory, openOnly, minRating, sortBy]);

  const loadMerchants = async () => {
    setLoading(true);
    try {
      const result = await merchantService.getMerchants({
        search: searchQuery,
        category: selectedCategory,
        openOnly,
        minRating,
        sortBy
      });
      setMerchants(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setOpenOnly(false);
    setMinRating(0);
    setSortBy('rating');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Title & Search Bar */}
      <div className="space-y-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">Discover Restaurants & Stores</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Browse verified Trakz merchants and order delicious food</p>
        </div>

        <div className="relative flex items-center">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search merchant name, cuisine or food item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#121927] rounded-2xl border border-slate-200 dark:border-slate-800/80 py-3.5 pl-11 pr-4 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 shadow-sm outline-none"
          />
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-[#121927] rounded-3xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider shrink-0 mr-1">Category:</span>
          {mockCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.emoji ? `${cat.emoji} ${cat.name}` : cat.name}
            </button>
          ))}
        </div>

        {/* Quick Switches */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold">
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-slate-800 dark:text-slate-200">Open Now</span>
            </label>

            <button
              onClick={() => setMinRating(minRating === 4.5 ? 0 : 4.5)}
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                minRating === 4.5
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold'
                  : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span>4.5+ Rating</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-400 font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="rating">Top Rated ★</option>
              <option value="fastest">Fastest Delivery ⚡</option>
              <option value="deliveryFee">Lowest Delivery Fee 🛵</option>
            </select>
          </div>
        </div>
      </div>

      {/* Merchants Grid */}
      {loading ? (
        <MerchantLoader count={6} message="Discovering top verified merchants..." />
      ) : merchants.length === 0 ? (
        <div className="bg-white dark:bg-[#121927] rounded-3xl p-10 text-center border border-slate-100 dark:border-slate-800/80 space-y-3">
          <Utensils size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-base">No Matching Merchants Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            We couldn't find any stores matching your filters. Try clearing search keywords or resetting filters.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 font-bold text-xs hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
          >
            <RotateCcw size={14} />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {merchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>
      )}
    </div>
  );
};
