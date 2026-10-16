import React, { createContext, useState, useEffect } from 'react';
import { addressService } from '../services/addressService';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const list = await addressService.getAddresses();
      setAddresses(list);
      const defaultAddr = list.find(a => a.isDefault) || list[0] || null;
      setSelectedAddress(defaultAddr);
    } catch (err) {
      console.error('Error loading addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectAddress = (addr) => {
    setSelectedAddress(addr);
  };

  const addNewAddress = async (newAddrData) => {
    const created = await addressService.addAddress(newAddrData);
    await loadAddresses();
    setSelectedAddress(created);
    return created;
  };

  const setDefaultAddress = async (addressId) => {
    await addressService.setDefaultAddress(addressId);
    await loadAddresses();
  };

  const deleteAddress = async (addressId) => {
    await addressService.deleteAddress(addressId);
    await loadAddresses();
  };

  return (
    <LocationContext.Provider
      value={{
        addresses,
        selectedAddress,
        selectAddress,
        addNewAddress,
        setDefaultAddress,
        deleteAddress,
        loading,
        refreshAddresses: loadAddresses
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
