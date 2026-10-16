import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Bike, Clock } from 'lucide-react';
import { OrderStatusTimeline } from '../components/tracking/OrderStatusTimeline';
import { LiveMapTracker } from '../components/tracking/LiveMapTracker';
import { RiderInfoCard } from '../components/tracking/RiderInfoCard';
import { useOrders } from '../hooks/useOrders';
import { formatCurrency } from '../utils/formatters';

export const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchOrderData = async (isInitial = false) => {
      if (isInitial) {
        setLoading(true);
      }

      try {
        const match = await getOrderById(orderId);
        if (isMounted && match) {
          setOrder(match);
        }
      } catch (err) {
        console.error('Realtime order tracking sync error:', err);
      } finally {
        if (isMounted && isInitial) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchOrderData(true);

    // Live real-time polling every 3 seconds to auto-update order status from backend
    const intervalId = setInterval(() => {
      fetchOrderData(false);
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [orderId, getOrderById]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-3 bg-white dark:bg-[#121927] rounded-3xl p-8 border border-slate-100 dark:border-slate-800/80">
        <AlertCircle size={40} className="mx-auto text-rose-500" />
        <h3 className="font-extrabold text-slate-900 dark:text-slate-100">Order Not Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Order #{orderId} could not be located in history.</p>
        <Link to="/orders" className="inline-block pt-2">
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline">View All Orders</span>
        </Link>
      </div>
    );
  }

  // Check whether a rider has been assigned yet based on status
  const isRiderAssigned = ['Rider assigned', 'Picked up', 'On the way', 'Delivered'].includes(order.orderStatus);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400">
          <ArrowLeft size={16} />
          <span>My Orders</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            LIVE TRACKING
          </span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">Order #{order.id}</span>
        </div>
      </div>

      {/* Live Map Canvas */}
      <LiveMapTracker order={order} />

      {/* Rider Info Card or Pending Assignment Status */}
      {isRiderAssigned && order.rider ? (
        <RiderInfoCard rider={order.rider} />
      ) : order.orderStatus !== 'Cancelled' ? (
        <div className="bg-white dark:bg-[#121927] rounded-3xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-200 dark:border-purple-800/80">
            <Bike size={22} className="animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Assigning Nearest Rider...</h4>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-800/60">
                In Progress
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              A delivery rider will be assigned automatically as soon as the merchant accepts and prepares your order.
            </p>
          </div>
        </div>
      ) : null}

      {/* Status Timeline Progress */}
      <OrderStatusTimeline currentStatus={order.orderStatus} />

      {/* Order Summary & Address details */}
      <div className="bg-white dark:bg-[#121927] rounded-3xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-card space-y-3 text-xs text-slate-600 dark:text-slate-400">
        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Order Summary</h4>

        <div className="space-y-1.5 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{item.quantity}x {item.name}</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(item.itemTotal * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between font-extrabold text-slate-900 dark:text-slate-100 text-sm pt-1">
          <span>Total Paid ({order.paymentMethod})</span>
          <span className="text-purple-600 dark:text-purple-400">{formatCurrency(order.total)}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl space-y-0.5 border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery Address</span>
          <p className="font-bold text-slate-800 dark:text-slate-200">{order.deliveryAddress?.label} - {order.deliveryAddress?.street}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{order.deliveryAddress?.barangay}, {order.deliveryAddress?.city}</p>
        </div>
      </div>
    </div>
  );
};
