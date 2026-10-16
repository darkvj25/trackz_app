import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Banknote, Smartphone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useLocation } from '../hooks/useLocation';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { PAYMENT_METHODS } from '../utils/constants';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartMerchant, cartItems, subtotal, deliveryFee, taxAndFees, discount, total, clearCart } = useCart();
  const { selectedAddress } = useLocation();
  const { placeOrder } = useOrders();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  useEffect(() => {
    if ((!cartItems || cartItems.length === 0) && !confirmedOrder) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems, confirmedOrder, navigate]);

  if ((!cartItems || cartItems.length === 0) && !confirmedOrder) {
    return null;
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a valid delivery address.');
      return;
    }

    setLoading(true);
    try {
      const paymentObj = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod) || PAYMENT_METHODS[0];

      const payload = {
        customerId: user?.id || 'cust-101',
        customerName: user?.fullName || user?.name || 'Default User',
        merchant: cartMerchant,
        items: cartItems,
        subtotal,
        deliveryFee,
        taxAndFees,
        discount,
        total,
        deliveryAddress: selectedAddress,
        deliveryInstructions,
        paymentMethod: paymentObj.name
      };

      const result = await placeOrder(payload);
      if (result.success) {
        setConfirmedOrder(result.order);
        clearCart();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Order Confirmation Success View
  if (confirmedOrder) {
    return (
      <div className="max-w-lg mx-auto my-8 p-6 bg-white dark:bg-[#121927] rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={48} />
        </div>

        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
            Order Placed
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 pt-2">Order Confirmed! 🎉</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Order Reference Code: <span className="font-extrabold text-slate-900 dark:text-slate-100">{confirmedOrder.id}</span></p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl text-xs font-medium text-slate-600 dark:text-slate-300 text-left space-y-1.5 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between">
            <span>Merchant:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{confirmedOrder.merchantName}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount Payable:</span>
            <span className="font-extrabold text-purple-600 dark:text-purple-400">{formatCurrency(confirmedOrder.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{confirmedOrder.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivering To:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{confirmedOrder.deliveryAddress?.street}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Link to={`/tracking/${confirmedOrder.id}`}>
            <Button variant="primary" fullWidth size="lg" icon={ArrowRight}>
              Track Order Status
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" fullWidth size="sm">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">Checkout</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Finalize delivery details and payment method</p>
      </div>

      {/* Delivery Address Section */}
      <div className="bg-white dark:bg-[#121927] rounded-3xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <MapPin size={18} className="text-purple-600 dark:text-purple-400" />
            <span>Delivery Address</span>
          </h3>
        </div>

        {selectedAddress ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{selectedAddress.label}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{selectedAddress.phone}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {selectedAddress.street}, {selectedAddress.barangay}, {selectedAddress.city}
            </p>
          </div>
        ) : (
          <p className="text-xs text-rose-500 font-bold">No delivery address selected.</p>
        )}

        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Rider Delivery Notes</label>
          <input
            type="text"
            placeholder="e.g. Ring bell, leave at guard house..."
            value={deliveryInstructions}
            onChange={(e) => setDeliveryInstructions(e.target.value)}
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:border-purple-500 outline-none"
          />
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white dark:bg-[#121927] rounded-3xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-card space-y-3">
        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Select Payment Method</h3>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedPaymentMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedPaymentMethod(method.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-purple-600 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 text-slate-900 dark:text-slate-100 ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    {method.id === 'cod' ? <Banknote size={20} /> : <Smartphone size={20} />}
                  </div>
                  <div className="text-left space-y-0.5">
                    <span className="font-bold text-sm block">{method.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">{method.description}</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300 dark:border-slate-700'
                }`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Order Summary Box */}
      <div className="bg-white dark:bg-[#121927] rounded-3xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-card space-y-3 font-semibold text-xs text-slate-600 dark:text-slate-400">
        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Order Summary ({cartItems.length} items)</h3>

        <div className="space-y-1 border-b border-slate-100 dark:border-slate-800/80 pb-2">
          {cartItems.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <span>{item.quantity}x {item.name}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(item.itemTotal * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span>{formatCurrency(deliveryFee)}</span>
        </div>
        <div className="flex justify-between">
          <span>Platform Fee</span>
          <span>{formatCurrency(taxAndFees)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-base font-extrabold text-slate-900 dark:text-slate-100 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span>Total Payable</span>
          <span className="text-purple-600 dark:text-purple-400 text-lg">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        variant="primary"
        fullWidth
        size="lg"
        loading={loading}
        onClick={handlePlaceOrder}
        icon={ArrowRight}
      >
        Place Order • {formatCurrency(total)}
      </Button>
    </div>
  );
};
