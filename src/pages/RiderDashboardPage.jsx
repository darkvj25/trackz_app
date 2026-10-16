import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bike,
  Navigation,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Store,
  User,
  ShieldCheck,
  AlertCircle,
  Power,
  RefreshCw,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Check,
  Compass,
  Zap,
  Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../hooks/useTheme';
import { riderService } from '../services/riderService';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ORDER_STATUS } from '../utils/constants';

export const RiderDashboardPage = () => {
  const navigate = useNavigate();
  const { user, approveRider } = useAuth();
  const { showToast } = useToast();
  const { toggleTheme, isDark } = useTheme();

  // Rider Profile Details
  const riderName = user?.fullName || user?.name || 'Marco Santos';
  const riderPhone = user?.phone || '+63 919 444 8888';
  const vehicleType = user?.vehicleType || 'Motorcycle';
  const plateNumber = user?.plateNumber || 'NKR 9102';
  const operatingCity = user?.operatingCity || 'Metro Manila';
  const isApproved = user?.isApproved !== false && user?.status !== 'pending_approval';

  // Duty State & Navigation Tabs
  const [isOnDuty, setIsOnDuty] = useState(() => riderService.isRiderOnDuty());
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'available' | 'earnings' | 'profile'

  // Data States
  const [availableOrders, setAvailableOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [stats, setStats] = useState({
    todayEarnings: 1250,
    deliveryFees: 950,
    tips: 300,
    completedDeliveries: 12,
    activeTripCount: 1,
    rating: 4.9,
    acceptanceRate: 98
  });
  const [loading, setLoading] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Active Order State (The current ongoing delivery)
  const [activeOrder, setActiveOrder] = useState(null);

  // Load Rider Data on Mount & Interval Sync
  const loadRiderData = async () => {
    setLoading(true);
    try {
      const [avail, ordersList, riderStats] = await Promise.all([
        riderService.getAvailableOrders().catch(() => []),
        riderService.getRiderOrders().catch(() => []),
        riderService.getRiderStats().catch(() => null)
      ]);

      if (Array.isArray(avail)) setAvailableOrders(avail);
      if (Array.isArray(ordersList)) {
        setAllOrders(ordersList);

        // Find active order (in progress)
        const currentActive = ordersList.find(
          o => o.orderStatus === ORDER_STATUS.RIDER_ASSIGNED ||
               o.orderStatus === ORDER_STATUS.ON_THE_WAY ||
               o.orderStatus === ORDER_STATUS.PREPARING
        ) || ordersList[0];

        setActiveOrder(currentActive || null);
      }
      if (riderStats) setStats(riderStats);
    } catch (err) {
      console.warn('Rider load warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRiderData();
  }, []);

  // Handle Duty Switch
  const handleToggleDuty = () => {
    const nextState = !isOnDuty;
    setIsOnDuty(nextState);
    riderService.setRiderOnDuty(nextState);
    showToast(`Rider duty status: ${nextState ? 'ON DUTY 🟢 Ready for orders!' : 'OFF DUTY 🔴 Offline'}`, nextState ? 'success' : 'info');
  };

  // Handle Claiming an Order
  const handleAcceptOrder = async (orderId) => {
    if (!isOnDuty) {
      showToast('Please toggle your duty status to ON DUTY to accept orders!', 'error');
      return;
    }

    try {
      const riderInfo = {
        name: riderName,
        phone: riderPhone,
        rating: 4.9,
        vehicle: `${vehicleType} (${plateNumber})`,
        plateNumber: plateNumber,
        photo: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        currentLocation: { lat: 14.5530, lng: 121.0220 }
      };

      await riderService.acceptOrder(orderId, riderInfo);

      showToast(`Order #${orderId} accepted! Drive safely to the store. 🛵`, 'success');
      await loadRiderData();
      setActiveTab('active');
    } catch (err) {
      showToast(`Could not accept order: ${err.message}`, 'error');
    }
  };

  // Handle Progression of Delivery Steps
  const handleUpdateActiveStatus = async (orderId, nextStatus) => {
    try {
      await riderService.updateOrderStatus(orderId, nextStatus);

      if (nextStatus === ORDER_STATUS.DELIVERED) {
        showToast(`Order #${orderId} successfully delivered! ₱${activeOrder?.deliveryFee || 49} added to earnings. 🎉`, 'success');
      } else {
        showToast(`Order #${orderId} status set to "${nextStatus}"! 🛵`, 'info');
      }

      await loadRiderData();
    } catch (err) {
      showToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  // Self-Approve Account Action (If Pending)
  const handleSelfApprove = async () => {
    try {
      if (approveRider) {
        await approveRider(user?.id);
      }
      showToast('Rider account approved! You are ready for live dispatch. 🟢', 'success');
    } catch (err) {
      showToast('Rider account approved! 🟢', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070d19] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">

      {/* Top Rider Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md px-4 sm:px-6 py-3">
        <div className="w-full px-2 sm:px-4 flex items-center justify-between gap-3">

          {/* Left Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-xl flex items-center justify-center shadow-lg">
              🛵
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight leading-none text-white">
                  {riderName}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black tracking-widest uppercase">
                  RIDER APP
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 leading-none mt-1">
                {vehicleType} • {plateNumber} ({operatingCity})
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Duty Toggle Button */}
            <button
              onClick={handleToggleDuty}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                isOnDuty
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
              }`}
            >
              <Power size={14} />
              <span>{isOnDuty ? 'ON DUTY 🟢' : 'OFFLINE 🔴'}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-purple-400" />}
            </button>

            {/* Customer App Link */}
            <Link
              to="/home"
              className="px-3 py-1.5 rounded-xl bg-[#ffb100] hover:bg-[#e09c00] text-slate-950 font-black text-xs hidden sm:flex items-center gap-1 shadow-xs"
            >
              <ExternalLink size={14} />
              <span>Customer App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Account Approval Verification Alert Banner (if pending) */}
      {!isApproved && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 font-bold text-xs">
          <div className="w-full px-2 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>Your rider account is pending admin verification. Activate now to receive live orders!</span>
            </div>
            <button
              onClick={handleSelfApprove}
              className="px-3 py-1 rounded-xl bg-slate-900 text-amber-400 hover:bg-slate-800 font-extrabold text-[11px] transition-all cursor-pointer"
            >
              Approve My Driver Account
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Rider KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today's Earnings</div>
            <div className="text-2xl font-black text-emerald-500">₱{stats.todayEarnings.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500 font-medium">Base: ₱{stats.deliveryFees} • Tips: ₱{stats.tips}</div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Trips</div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{stats.completedDeliveries}</div>
            <div className="text-[11px] text-slate-500 font-medium">Acceptance Rate: {stats.acceptanceRate}%</div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Driver Rating</div>
            <div className="text-2xl font-black text-amber-500">⭐ {stats.rating}</div>
            <div className="text-[11px] text-slate-500 font-medium">Top Rated Fleet Partner</div>
          </div>

          <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Deliveries</div>
            <div className="text-2xl font-black text-[#ffb100]">{activeOrder ? 1 : 0}</div>
            <div className="text-[11px] text-slate-500 font-medium">{availableOrders.length} available requests nearby</div>
          </div>
        </div>

        {/* App Section Navigation Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'active', label: '🛵 Active Delivery Trip', badge: activeOrder ? '1' : null },
            { id: 'available', label: '📋 Available Dispatch Orders', badge: availableOrders.length },
            { id: 'earnings', label: '💰 Earnings & Trip History' },
            { id: 'profile', label: '🏍️ Rider Profile & Vehicle' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-[#ffb100] shadow-md dark:bg-slate-800 dark:text-[#ffb100]'
                  : 'bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== null && tab.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#ffb100] text-slate-950">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: ACTIVE TRIP / ORDER PROGRESSION */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            {!activeOrder ? (
              <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-10 text-center space-y-4 border border-slate-200/80 dark:border-slate-800/80 shadow-card">
                <Bike size={48} className="mx-auto text-purple-500 animate-bounce" />
                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">No Ongoing Delivery Trip</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You currently have no active orders. Check the available dispatch orders list to accept a delivery request!
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setActiveTab('available')}
                  icon={ArrowRight}
                >
                  View {availableOrders.length} Available Orders
                </Button>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-6">

                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-slate-900 dark:text-white">Order #{activeOrder.id}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-[#ffb100]/20 text-[#ffb100] border border-[#ffb100]/30">
                        {activeOrder.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                      Merchant: <strong className="text-slate-800 dark:text-slate-200">{activeOrder.merchantName}</strong> • Est. Payout: <strong className="text-emerald-500">₱{activeOrder.deliveryFee || 49}</strong>
                    </p>
                  </div>

                  {/* Payment Method Badge */}
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
                    <DollarSign size={16} />
                    <span>
                      {activeOrder.paymentMethod === 'Cash on Delivery'
                        ? `Collect ₱${activeOrder.total} CASH on Delivery`
                        : `Prepaid via ${activeOrder.paymentMethod}`}
                    </span>
                  </div>
                </div>

                {/* Live Step Progress Visualizer */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Delivery Step Progression</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    {/* Step 1: Accepted & Heading to Store */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      activeOrder.orderStatus === ORDER_STATUS.RIDER_ASSIGNED || activeOrder.orderStatus === ORDER_STATUS.PREPARING
                        ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-300 ring-2 ring-purple-500/30'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs">1. Pickup at Store</span>
                        <Store size={18} />
                      </div>
                      <p className="text-[11px] font-medium mt-1">Drive to {activeOrder.merchantName}</p>
                    </div>

                    {/* Step 2: Picked Up & On the Way */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      activeOrder.orderStatus === ORDER_STATUS.ON_THE_WAY
                        ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-300 ring-2 ring-purple-500/30'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs">2. On the Way</span>
                        <Navigation size={18} />
                      </div>
                      <p className="text-[11px] font-medium mt-1">Navigate to customer location</p>
                    </div>

                    {/* Step 3: Delivered */}
                    <div className={`p-4 rounded-2xl border transition-all ${
                      activeOrder.orderStatus === ORDER_STATUS.DELIVERED
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs">3. Complete & Collect</span>
                        <CheckCircle2 size={18} />
                      </div>
                      <p className="text-[11px] font-medium mt-1">Hand over items & get paid</p>
                    </div>

                  </div>
                </div>

                {/* Route Visualizer & Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Store Pickup Info */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#ffb100] flex items-center justify-center font-bold">
                          🏪
                        </div>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">Store Pickup Location</span>
                      </div>
                      <a
                        href={`tel:${activeOrder.merchantPhone || '+639188887777'}`}
                        className="px-2.5 py-1 rounded-xl bg-purple-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Phone size={12} /> Call Store
                      </a>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-black text-slate-900 dark:text-white">{activeOrder.merchantName}</div>
                      <div className="text-slate-500 font-medium">Category: Fast Food & Meals</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#070d19] border border-slate-200 dark:border-slate-800 text-[11px] font-medium space-y-1">
                      <div className="font-bold text-slate-700 dark:text-slate-300">Items to Collect ({activeOrder.items?.length || 0}):</div>
                      <div className="space-y-0.5">
                        {activeOrder.items?.map((item, idx) => (
                          <div key={idx} className="text-slate-600 dark:text-slate-400 flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-bold">₱{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Customer Dropoff Info */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                          📍
                        </div>
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">Customer Dropoff Address</span>
                      </div>
                      <a
                        href={`tel:${activeOrder.deliveryAddress?.phone || '+639171234567'}`}
                        className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <Phone size={12} /> Call Customer
                      </a>
                    </div>

                    <div className="text-xs space-y-1">
                      <div className="font-black text-slate-900 dark:text-white">
                        {activeOrder.customerName || activeOrder.deliveryAddress?.recipientName || 'Default Customer'}
                      </div>
                      <div className="text-slate-500 font-medium">
                        {activeOrder.deliveryAddress?.street || 'Bonifacio High Street'}, {activeOrder.deliveryAddress?.city || 'Taguig'}
                      </div>
                    </div>

                    {activeOrder.deliveryInstructions && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        Instructions: "{activeOrder.deliveryInstructions}"
                      </div>
                    )}
                  </div>

                </div>

                {/* RIDER STATUS ACTION BUTTONS */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Update Trip Progress</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    <button
                      onClick={() => handleUpdateActiveStatus(activeOrder.id, ORDER_STATUS.PREPARING)}
                      className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-slate-950 font-black text-xs transition-all cursor-pointer text-center"
                    >
                      Arrived at Store 🍳
                    </button>

                    <button
                      onClick={() => handleUpdateActiveStatus(activeOrder.id, ORDER_STATUS.ON_THE_WAY)}
                      className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all cursor-pointer text-center shadow-md"
                    >
                      Order Picked Up — On the Way 🚚
                    </button>

                    <button
                      onClick={() => handleUpdateActiveStatus(activeOrder.id, ORDER_STATUS.DELIVERED)}
                      className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all cursor-pointer text-center shadow-md"
                    >
                      Mark Delivered & Collect Payment ✅
                    </button>

                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 2: AVAILABLE DISPATCH ORDERS */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Available Delivery Requests
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Nearby orders waiting for rider dispatch & pickup
                </p>
              </div>

              <button
                onClick={loadRiderData}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Refresh List 🔄
              </button>
            </div>

            {availableOrders.length === 0 ? (
              <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-10 text-center space-y-3 border border-slate-200/80 dark:border-slate-800/80">
                <Package size={40} className="mx-auto text-slate-400" />
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No Unassigned Orders Nearby</h3>
                <p className="text-xs text-slate-500">New delivery requests from merchants will appear here live.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-[#0f172a] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <span className="font-black text-sm text-slate-900 dark:text-white">Order #{order.id}</span>
                          <div className="text-xs font-bold text-slate-500">{order.merchantName}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-emerald-500">₱{order.deliveryFee || 49}</div>
                          <span className="text-[10px] text-slate-400 font-bold">Rider Earnings</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs font-medium">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Store size={14} className="text-amber-500 shrink-0" />
                          <span className="truncate">Pickup: {order.merchantName}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <MapPin size={14} className="text-purple-500 shrink-0" />
                          <span className="truncate">Dropoff: {order.deliveryAddress?.street || 'Taguig City'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-500">
                          <DollarSign size={14} className="text-emerald-500 shrink-0" />
                          <span>Payment: {order.paymentMethod} (₱{order.total})</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => handleAcceptOrder(order.id)}
                        icon={Bike}
                      >
                        Accept Delivery Request
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EARNINGS & TRIP HISTORY */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Earnings Telemetry</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-xs font-bold text-slate-500">Base Delivery Fees</div>
                  <div className="text-xl font-black text-emerald-500">₱{stats.deliveryFees}</div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <div className="text-xs font-bold text-slate-500">Customer Tips</div>
                  <div className="text-xl font-black text-purple-500">₱{stats.tips}</div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-xs font-bold text-slate-500">Peak Performance Bonus</div>
                  <div className="text-xl font-black text-amber-500">₱150</div>
                </div>
              </div>
            </div>

            {/* Trip Log History */}
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Completed Trip Log</h3>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {allOrders.map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white">#{o.id} — {o.merchantName}</div>
                      <div className="text-slate-500">{o.paymentMethod} • {o.orderStatus}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-emerald-500">+₱{o.deliveryFee || 49}</div>
                      <span className="text-[10px] text-slate-400">Earned</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RIDER PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={riderName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500"
              />
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{riderName}</h2>
                <div className="text-xs text-slate-500">{riderPhone} • {user?.email || 'marco.santos@trakz.com'}</div>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {isApproved ? 'Verified Rider 🟢' : 'Pending Verification ⏳'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="font-bold text-slate-900 dark:text-white text-sm">Vehicle & Region Info</div>
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900">
                <div>Vehicle Type: <strong>{vehicleType}</strong></div>
                <div>Plate Number: <strong>{plateNumber}</strong></div>
                <div>Operating Region: <strong>{operatingCity}</strong></div>
                <div>Fleet Status: <strong>{isOnDuty ? 'On Duty 🟢' : 'Offline 🔴'}</strong></div>
              </div>
            </div>

            {!isApproved && (
              <Button variant="primary" fullWidth onClick={handleSelfApprove}>
                Approve Driver Credentials
              </Button>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
