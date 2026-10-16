import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { MapPin, Home, Briefcase, Building } from 'lucide-react';
import { useLocation } from '../../hooks/useLocation';

export const AddressFormModal = ({ isOpen, onClose }) => {
  const { addNewAddress } = useLocation();
  const [label, setLabel] = useState('Home');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('1200');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!street || !city) return;

    setLoading(true);
    try {
      await addNewAddress({
        label,
        street,
        barangay: barangay || 'Barangay Central',
        city,
        postalCode: postalCode || '1200',
        deliveryInstructions: instructions
      });
      onClose();
      setStreet('');
      setBarangay('');
      setCity('');
      setInstructions('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Delivery Address">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Label Selector */}
        <div>
          <label className="text-xs font-bold text-slate-600 mb-1.5 block">Address Label</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Home', icon: Home },
              { name: 'Office', icon: Briefcase },
              { name: 'Other', icon: Building }
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = label === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setLabel(item.name)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-trakz-500 text-white border-trakz-500 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Street Address / Building / Unit"
          required
          placeholder="e.g. Unit 12B Horizon Condo, 123 Ayala Ave"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          icon={MapPin}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Barangay"
            placeholder="e.g. San Lorenzo"
            value={barangay}
            onChange={(e) => setBarangay(e.target.value)}
          />
          <Input
            label="City"
            required
            placeholder="e.g. Makati City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-600 mb-1.5 block">Delivery Instructions for Rider</label>
          <textarea
            rows={2}
            placeholder="e.g. Ring doorbell, leave at guard house..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:border-trakz-500 outline-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Save Address
          </Button>
        </div>
      </form>
    </Modal>
  );
};
