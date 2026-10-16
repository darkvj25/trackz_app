import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useCart } from '../hooks/useCart';
import { useToast } from '../hooks/useToast';
import { OrderItemCard } from '../components/orders/OrderItemCard';
import { ReceiptModal } from '../components/orders/ReceiptModal';
import { merchantService } from '../services/merchantService';

export const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { activeOrders, pastOrders, loading } = useOrders();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('active');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const handleReorder = async (order) => {
    try {
      const merchant = await merchantService.getMerchantById(order.merchantId);
      order.items.forEach(item => {
        addItem(item, merchant);
      });
      showToast(`Items from ${merchant.name} added to cart! 🛒`, 'success');
      navigate('/cart');
    } catch (err) {
      console.error(err);
      showToast('Could not reorder. Merchant details unavailable.', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">My Orders / POS Log</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Track live food deliveries or reorder your favorite meals</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-3 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'active'
              ? 'border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Active Deliveries ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-3 text-xs font-extrabold text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'past'
              ? 'border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Past Orders ({pastOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="bg-white dark:bg-[#121927] rounded-3xl p-10 text-center border border-slate-100 dark:border-slate-800/80 space-y-3">
          <ClipboardList size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
          <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
            {activeTab === 'active' ? 'No Active Deliveries' : 'No Order History Yet'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeTab === 'active'
              ? 'When you place an order, it will appear here in real-time.'
              : 'Your completed orders will be stored here for easy reordering.'}
          </p>
          <Link to="/merchants" className="inline-block pt-1">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">Explore Merchants</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {displayOrders.map((order) => (
            <OrderItemCard
              key={order.id}
              order={order}
              onViewReceipt={(ord) => setSelectedReceiptOrder(ord)}
              onReorder={handleReorder}
            />
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedReceiptOrder}
        onClose={() => setSelectedReceiptOrder(null)}
        order={selectedReceiptOrder}
      />
    </div>
  );
};
