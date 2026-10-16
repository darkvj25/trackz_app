import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Plus, Check, Home, Briefcase, Building, Navigation, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { useLocation } from '../../hooks/useLocation';

export const AddressSelectorModal = ({ isOpen, onClose }) => {
  const { addresses, selectedAddress, selectAddress, addNewAddress, deleteAddress } = useLocation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [newLabel, setNewLabel] = useState('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newBarangay, setNewBarangay] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  const handleUseCurrentLocation = () => {
    setErrorMessage('');
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by this browser.');
      return;
    }
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          let street = 'Current Street / Area';
          let barangay = 'Current Barangay';
          let city = 'Taguig City';
          let postalCode = '1634';

          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              const a = geoData.address || {};
              const roadName = a.road || a.pedestrian || a.footway || a.street || a.suburb || a.neighbourhood;
              const houseNum = a.house_number ? `${a.house_number} ` : '';

              if (roadName) {
                street = `${houseNum}${roadName}`;
              } else if (geoData.display_name) {
                street = geoData.display_name.split(',')[0];
              }

              barangay = a.quarter || a.suburb || a.village || a.neighbourhood || a.district || 'Barangay Area';
              city = a.city || a.town || a.municipality || a.county || a.state_district || 'City';
              postalCode = a.postcode || '1000';
            }
          } catch (geoErr) {
            console.warn('Reverse geocoding failed:', geoErr);
          }

          const autoAddr = await addNewAddress({
            label: 'GPS Location',
            street: street,
            barangay: barangay,
            city: city,
            postalCode: postalCode,
            deliveryInstructions: `Detected via GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
          });
          selectAddress(autoAddr);
          onClose();
        } catch (err) {
          console.error(err);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        // Soft fallback without OS alert modal
        if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
          setErrorMessage('GPS access requires HTTPS when accessing over mobile network IP. Please choose or enter an address manually.');
        } else {
          setErrorMessage('Could not retrieve GPS location. Please check browser location permissions or choose an address below.');
        }
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const handleDeleteAddress = async (e, addressId) => {
    e.stopPropagation();
    try {
      await deleteAddress(addressId);
      if (selectedAddress?.id === addressId) {
        const remaining = addresses.filter(a => a.id !== addressId);
        if (remaining.length > 0) {
          selectAddress(remaining[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (addr) => {
    selectAddress(addr);
    onClose();
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!newStreet || !newCity) return;
    await addNewAddress({
      label: newLabel,
      street: newStreet,
      barangay: newBarangay || 'Barangay Central',
      city: newCity,
      postalCode: '1000',
      deliveryInstructions: newInstructions || 'Call on arrival.'
    });
    setShowAddForm(false);
    setNewStreet('');
    setNewCity('');
    setNewInstructions('');
    onClose();
  };

  const getLabelIcon = (label) => {
    switch (label.toLowerCase()) {
      case 'home': return <Home size={18} className="text-purple-600 dark:text-purple-400" />;
      case 'office': case 'work': return <Briefcase size={18} className="text-blue-500" />;
      default: return <Building size={18} className="text-emerald-500" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Delivery Location">
      {!showAddForm ? (
        <div className="flex flex-col gap-4">
          {/* GPS Auto-Detect Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full py-3 px-4 rounded-2xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isLocating ? (
              <>
                <Loader2 size={16} className="animate-spin text-purple-600 dark:text-purple-400" />
                <span>Detecting GPS Location...</span>
              </>
            ) : (
              <>
                <Navigation size={16} className="text-purple-600 dark:text-purple-400 fill-purple-600/20" />
                <span>Use Current GPS Location</span>
              </>
            )}
          </button>

          {errorMessage && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-2">
            {addresses.map((addr) => {
              const isSelected = selectedAddress?.id === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelect(addr)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-purple-600 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 shadow-sm ring-2 ring-purple-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 mt-0.5 shrink-0">
                    {getLabelIcon(addr.label)}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      {addr.street}, {addr.barangay}, {addr.city}
                    </p>
                    {addr.deliveryInstructions && (
                      <p className="text-[11px] text-slate-400 italic">"{addr.deliveryInstructions}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center">
                        <Check size={14} />
                      </div>
                    )}
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteAddress(e, addr.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors cursor-pointer"
                        title="Remove location"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            variant="outline"
            fullWidth
            icon={Plus}
            onClick={() => setShowAddForm(true)}
          >
            Add New Address
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSaveAddress} className="flex flex-col gap-4">
          <div className="flex gap-2">
            {['Home', 'Office', 'Other'].map((lbl) => (
              <button
                key={lbl}
                type="button"
                onClick={() => setNewLabel(lbl)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  newLabel === lbl
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Street / Building / Unit</label>
            <input
              type="text"
              required
              placeholder="e.g. Unit 4B Sunshine Condo, 123 Main St"
              value={newStreet}
              onChange={(e) => setNewStreet(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:border-purple-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Barangay</label>
              <input
                type="text"
                placeholder="e.g. Brgy. San Jose"
                value={newBarangay}
                onChange={(e) => setNewBarangay(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:border-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">City</label>
              <input
                type="text"
                required
                placeholder="e.g. Makati City"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:border-purple-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block">Delivery Instructions (Landmark / Notes)</label>
            <input
              type="text"
              placeholder="e.g. House with green gate, call on arrival"
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:border-purple-500 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setShowAddForm(false)}>
              Back
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Save Address
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
