import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight, Store, Check } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { VOUCHERS } from '../utils/constants';

export const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartMerchant,
    cartItems,
    voucher,
    subtotal,
    deliveryFee,
    taxAndFees,
    discount,
    total,
    updateQuantity,
    removeItem,
    applyVoucher,
    removeVoucher,
    clearCart
  } = useCart();

  const [inputVoucherCode, setInputVoucherCode] = useState('');
  const [voucherError, setVoucherError] = useState('');

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    setVoucherError('');
    const code = inputVoucherCode.trim().toUpperCase();
    const match = VOUCHERS.find(v => v.code === code);

    if (!match) {
      setVoucherError('Invalid voucher code. Try TRAKZWELCOME or FREEDEL');
      return;
    }

    if (subtotal < match.minOrder) {
      setVoucherError(`Minimum order amount for code ${code} is ${formatCurrency(match.minOrder)}`);
      return;
    }

    applyVoucher(match);
    setInputVoucherCode('');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Explore top restaurants & food stores to start your order!</p>
        </div>
        <Link to="/merchants" className="inline-block pt-2">
          <Button variant="primary" size="lg" icon={ArrowRight}>
            Discover Merchants
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">Shopping Cart</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Review your food items and proceed to checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1"
        >
          <Trash2 size={14} />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Merchant Info Banner */}
      {cartMerchant && (
        <div className="bg-white dark:bg-[#121927] rounded-3xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={cartMerchant.logo}
              alt={cartMerchant.name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-100 dark:border-slate-800"
            />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ordering From</span>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{cartMerchant.name}</h3>
            </div>
          </div>
          <Link to={`/merchants/${cartMerchant.id}`}>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
              <Store size={14} />
              <span>Add Items</span>
            </span>
          </Link>
        </div>
      )}

      {/* Cart Item Cards */}
      <div className="space-y-3">
        {cartItems.map((item) => (
          <div
            key={item.itemKey}
            className="bg-white dark:bg-[#121927] rounded-3xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-card flex items-start gap-4"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
            />

            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{item.name}</h4>
                <button
                  onClick={() => removeItem(item.itemKey)}
                  className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {item.selectedVariant && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Size: {item.selectedVariant.name}</p>
              )}

              {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Add-ons: {item.selectedAddOns.map(a => a.name).join(', ')}
                </p>
              )}

              {item.specialInstructions && (
                <p className="text-[11px] text-slate-400 italic">"{item.specialInstructions}"</p>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                  {formatCurrency(item.itemTotal * item.quantity)}
                </span>

                {/* Quantity adjustment (+ / -) */}
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => updateQuantity(item.itemKey, -1)}
                    className="p-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-xs"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 w-5 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.itemKey, 1)}
                    className="p-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-xs"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Voucher Code Form */}
      <div className="bg-white dark:bg-[#121927] rounded-3xl p-4 border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
          <Tag size={16} className="text-purple-600 dark:text-purple-400" />
          <span>Apply Discount Voucher</span>
        </h4>

        {voucher ? (
          <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>Voucher Applied: <span className="font-extrabold">{voucher.code}</span> ({voucher.label})</span>
            </div>
            <button onClick={removeVoucher} className="text-rose-600 hover:underline">
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyVoucher} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code e.g. TRAKZWELCOME"
              value={inputVoucherCode}
              onChange={(e) => setInputVoucherCode(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-bold uppercase text-slate-900 dark:text-slate-100 focus:border-purple-500 outline-none"
            />
            <Button type="submit" variant="primary" size="sm">
              Apply
            </Button>
          </form>
        )}

        {voucherError && <p className="text-xs font-semibold text-rose-500">{voucherError}</p>}
      </div>

      {/* Payment Summary */}
      <div className="bg-white dark:bg-[#121927] rounded-3xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-card space-y-3 font-semibold text-xs text-slate-600 dark:text-slate-400">
        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Payment Breakdown</h4>

        <div className="flex justify-between">
          <span>Items Subtotal</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold">{formatCurrency(deliveryFee)}</span>
        </div>

        <div className="flex justify-between">
          <span>Platform & Service Fee</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold">{formatCurrency(taxAndFees)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
            <span>Voucher Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-base font-extrabold text-slate-900 dark:text-slate-100 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span>Total Payable</span>
          <span className="text-purple-600 dark:text-purple-400 text-lg">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Store Closed Warning Banner in Cart */}
      {cartMerchant && cartMerchant.isOpen === false && (
        <div className="p-4 bg-rose-500/10 border-2 border-rose-500/40 rounded-3xl text-rose-500 font-extrabold text-xs space-y-1 shadow-md">
          <div className="flex items-center gap-2 text-sm font-black">
            <span>🔴 Store Currently Closed</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            <strong>{cartMerchant.name}</strong> is currently closed and not taking orders right now. You can keep items in your cart, but checkout is disabled until the store opens.
          </p>
        </div>
      )}

      {/* Checkout Action */}
      {cartMerchant && cartMerchant.isOpen === false ? (
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          disabled
          icon={ArrowRight}
        >
          Store Currently Closed • Checkout Disabled 🔴
        </Button>
      ) : (
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={() => navigate('/checkout')}
          icon={ArrowRight}
        >
          Proceed to Checkout • {formatCurrency(total)}
        </Button>
      )}
    </div>
  );
};
