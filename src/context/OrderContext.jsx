import React, { createContext, useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { ORDER_STATUS } from '../utils/constants';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const list = await orderService.getOrders();
      setOrders(list);
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const placeOrder = async (orderPayload) => {
    const result = await orderService.placeOrder(orderPayload);
    await fetchOrders();
    return result;
  };

  const getOrderById = async (orderId) => {
    return orderService.getOrderById(orderId);
  };

  // Simulated live status progression helper for demonstration & testing
  const updateSimulatedOrderStatus = async (orderId, nextStatus) => {
    const updated = await orderService.updateOrderStatus(orderId, nextStatus);
    await fetchOrders();
    return updated;
  };

  const isDeliveredOrCancelled = (st) => {
    const s = String(st || '').toLowerCase().trim();
    return s === 'delivered' || s === 'cancelled';
  };

  const activeOrders = orders.filter(o => !isDeliveredOrCancelled(o.orderStatus));
  const pastOrders = orders.filter(o => isDeliveredOrCancelled(o.orderStatus));

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeOrders,
        pastOrders,
        loading,
        placeOrder,
        getOrderById,
        updateSimulatedOrderStatus,
        refreshOrders: fetchOrders
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
