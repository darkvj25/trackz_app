import { ORDER_STATUS } from '../utils/constants';

export const mockOrders = [
  {
    id: 'TRK-89234',
    customerId: 'cust-101',
    customerName: 'Default User',
    merchantId: 'merch-1',
    merchantName: 'Burger Craft & Grills',
    merchantLogo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80',
    merchantPhone: '+63 918 888 7777',
    orderStatus: ORDER_STATUS.ON_THE_WAY,
    paymentMethod: 'GCash',
    paymentStatus: 'Paid',
    items: [
      {
        id: 'prod-101',
        name: 'Trakz Supreme Double Smash Burger',
        quantity: 2,
        price: 289,
        variantName: 'Double Patty (Standard)',
        selectedAddOns: [
          { id: 'a1', name: 'Extra Crispy Bacon', price: 45 }
        ],
        itemTotal: 668
      },
      {
        id: 'prod-103',
        name: 'Loaded Cajun Cheese Fries',
        quantity: 1,
        price: 145,
        variantName: 'Regular Size',
        selectedAddOns: [],
        itemTotal: 145
      }
    ],
    subtotal: 813,
    deliveryFee: 49,
    discount: 100,
    voucherCode: 'TRAKZ100',
    taxAndFees: 20,
    total: 782,
    deliveryAddress: {
      label: 'Home',
      street: 'Unit 12B Tower 2, Horizon Condominiums',
      barangay: 'Barangay San Lorenzo',
      city: 'Makati City',
      postalCode: '1223',
      deliveryInstructions: 'Call upon arrival.'
    },
    rider: {
      name: 'Ramon Dela Cruz',
      phone: '+63 919 555 1234',
      rating: 4.9,
      vehicle: 'Red Honda Click 125i',
      plateNumber: 'NKR 8821',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      currentLocation: { lat: 14.5525, lng: 121.0210 }
    },
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    estimatedDeliveryTime: '12-18 mins'
  },
  {
    id: 'TRK-84102',
    customerId: 'cust-101',
    customerName: 'Default User',
    merchantId: 'merch-2',
    merchantName: 'Bella Napoli Woodfired Pizza',
    merchantLogo: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=200&q=80',
    merchantPhone: '+63 918 999 4444',
    orderStatus: ORDER_STATUS.DELIVERED,
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Paid',
    items: [
      {
        id: 'prod-201',
        name: 'Truffle Prosciutto Speciale Pizza 12"',
        quantity: 1,
        price: 495,
        variantName: '12-inch Personal (8 slices)',
        selectedAddOns: [
          { id: 'a3', name: 'Garlic Butter Crust Dip', price: 25 }
        ],
        itemTotal: 520
      }
    ],
    subtotal: 520,
    deliveryFee: 39,
    discount: 0,
    taxAndFees: 15,
    total: 574,
    deliveryAddress: {
      label: 'Office',
      street: 'Floor 15, Tech Tower Plaza, Ayala Ave',
      barangay: 'Barangay Bel-Air',
      city: 'Makati City',
      postalCode: '1209'
    },
    rider: {
      name: 'Marco Santos',
      phone: '+63 917 888 2211',
      rating: 4.8,
      vehicle: 'Yamaha NMAX Black',
      plateNumber: 'ND 9420'
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 28 * 60 * 1000).toISOString()
  }
];
