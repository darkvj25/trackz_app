// Trakz Application Constants

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Trakz';
export const CURRENCY_SYMBOL = '₱';

// Order Status Enum matching 9 prompt statuses
export const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY_FOR_PICKUP: 'Ready for pickup',
  RIDER_ASSIGNED: 'Rider assigned',
  PICKED_UP: 'Picked up',
  ON_THE_WAY: 'On the way',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

export const ORDER_STATUS_DETAILS = {
  [ORDER_STATUS.PENDING]: {
    step: 1,
    label: 'Order Placed',
    description: 'Waiting for restaurant confirmation',
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  [ORDER_STATUS.CONFIRMED]: {
    step: 2,
    label: 'Order Confirmed',
    description: 'Merchant has accepted your order',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  [ORDER_STATUS.PREPARING]: {
    step: 3,
    label: 'Kitchen Preparing',
    description: 'Your food is being freshly prepared',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  [ORDER_STATUS.READY_FOR_PICKUP]: {
    step: 4,
    label: 'Ready for Pickup',
    description: 'Order packed and waiting for rider',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  [ORDER_STATUS.RIDER_ASSIGNED]: {
    step: 5,
    label: 'Rider Assigned',
    description: 'Rider is heading to the merchant',
    color: 'bg-sky-100 text-sky-800 border-sky-300'
  },
  [ORDER_STATUS.PICKED_UP]: {
    step: 6,
    label: 'Picked Up',
    description: 'Rider collected your order',
    color: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  [ORDER_STATUS.ON_THE_WAY]: {
    step: 7,
    label: 'On the Way',
    description: 'Rider is zooming towards your delivery address',
    color: 'bg-trakz-100 text-trakz-800 border-trakz-300'
  },
  [ORDER_STATUS.DELIVERED]: {
    step: 8,
    label: 'Delivered',
    description: 'Enjoy your meal! Thank you for ordering with Trakz',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  [ORDER_STATUS.CANCELLED]: {
    step: 0,
    label: 'Cancelled',
    description: 'Order was cancelled',
    color: 'bg-rose-100 text-rose-800 border-rose-300'
  }
};

export const PAYMENT_METHODS = [
  { id: 'cod', name: 'Cash on Delivery', icon: 'Banknote', description: 'Pay cash when your order arrives' },
  { id: 'gcash', name: 'GCash', icon: 'Smartphone', description: 'Instant mobile wallet payment' },
  { id: 'maya', name: 'Maya', icon: 'CreditCard', description: 'Pay via Maya e-wallet' },
  { id: 'card', name: 'Credit / Debit Card', icon: 'CreditCard', description: 'Visa, Mastercard, JCB' }
];

export const VOUCHERS = [
  { code: 'TRAKZWELCOME', discountPercent: 20, maxDiscount: 100, minOrder: 250, label: '20% off welcome voucher' },
  { code: 'FREEDEL', discountAmount: 49, minOrder: 300, label: 'Free Delivery' },
  { code: 'TRAKZ100', discountAmount: 100, minOrder: 500, label: '₱100 off orders over ₱500' }
];

export const MOCK_USER_STORAGE_KEY = 'trakz_auth_user';
export const CART_STORAGE_KEY = 'trakz_cart_data';
export const SAVED_ADDRESSES_KEY = 'trakz_addresses';
export const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes inactivity timeout
export const LAST_ACTIVITY_STORAGE_KEY = 'trakz_last_activity';
export const INACTIVITY_LOGOUT_FLAG = 'trakz_inactivity_logged_out';

