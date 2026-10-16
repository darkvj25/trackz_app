import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../../hooks/useToast';

export const ProductCustomizerModal = ({ isOpen, onClose, product, merchant }) => {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants && product.variants.length > 0 ? product.variants[0] : null);
      setSelectedAddOns([]);
      setSpecialInstructions('');
      setQuantity(1);
      setAddedToast(false);
    }
  }, [product]);

  if (!product) return null;

  const toggleAddOn = (addOn) => {
    setSelectedAddOns(prev => {
      const exists = prev.some(a => a.id === addOn.id);
      if (exists) {
        return prev.filter(a => a.id !== addOn.id);
      } else {
        return [...prev, addOn];
      }
    });
  };

  const variantPrice = selectedVariant ? selectedVariant.price : 0;
  const addOnsPrice = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const unitTotal = product.price + variantPrice + addOnsPrice;
  const grandTotal = unitTotal * quantity;

  const handleAddToCart = () => {
    if (merchant && merchant.isOpen === false) {
      showToast(`${merchant.name || 'This store'} is currently closed and not taking orders. 🔴`, 'error');
      return;
    }

    const cartPayload = {
      id: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.price,
      selectedVariant,
      selectedAddOns,
      specialInstructions,
      itemTotal: unitTotal,
      quantity
    };

    const added = addItem(cartPayload, merchant);
    if (added) {
      showToast(`${quantity}x ${product.name} added to cart! 🛒`, 'success');
      setAddedToast(true);
      setTimeout(() => {
        setAddedToast(false);
        onClose();
      }, 400);
    } else {
      showToast(`${merchant?.name || 'This store'} is currently closed.`, 'error');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name} maxWidth="max-w-lg">
      <div className="flex flex-col gap-5">
        {/* Hero Image */}
        <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Description & Base Price */}
        <div className="space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{product.description}</p>
          <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(product.price)}</p>
        </div>

        {/* Variants Selection */}
        {product.variants && product.variants.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Select Variant / Size <span className="text-purple-600 dark:text-purple-400">*</span>
            </h4>
            <div className="space-y-1.5">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 text-slate-900 dark:text-slate-100 ring-2 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {v.price > 0 ? `+${formatCurrency(v.price)}` : 'Standard'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add-ons Selection */}
        {product.addOns && product.addOns.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Optional Add-ons & Toppings
            </h4>
            <div className="space-y-1.5">
              {product.addOns.map((addOn) => {
                const isChecked = selectedAddOns.some(a => a.id === addOn.id);
                return (
                  <button
                    key={addOn.id}
                    type="button"
                    onClick={() => toggleAddOn(addOn)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                      isChecked
                        ? 'border-purple-600 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 text-slate-900 dark:text-slate-100'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        isChecked ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 dark:border-slate-700'
                      }`}>
                        {isChecked && <Check size={12} />}
                      </div>
                      <span>{addOn.name}</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 font-bold">+{formatCurrency(addOn.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Instructions Input */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Special Instructions
          </label>
          <input
            type="text"
            placeholder="e.g. Less ice, sauce on the side, no cutlery..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs focus:border-purple-500 outline-none"
          />
        </div>

        {/* Store Closed Warning Banner */}
        {merchant && merchant.isOpen === false && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold rounded-2xl flex items-center justify-between">
            <span>🔴 Store Closed: {merchant.name || 'This merchant'} is currently closed and not taking orders.</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-xs cursor-pointer"
              disabled={merchant && merchant.isOpen === false}
            >
              <Minus size={14} />
            </button>
            <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-xs cursor-pointer"
              disabled={merchant && merchant.isOpen === false}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Add Button */}
          {merchant && merchant.isOpen === false ? (
            <Button
              variant="secondary"
              fullWidth
              size="lg"
              disabled
              icon={ShoppingBag}
            >
              Store Currently Closed 🔴
            </Button>
          ) : (
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleAddToCart}
              icon={ShoppingBag}
            >
              {addedToast ? 'Added to Cart!' : `Add to Cart • ${formatCurrency(grandTotal)}`}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
