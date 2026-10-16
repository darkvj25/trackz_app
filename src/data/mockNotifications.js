export const mockNotifications = [
  {
    id: 'notif-1',
    title: 'Order On The Way! 🛵',
    message: 'Rider Ramon is zooming towards your address with order #TRK-89234.',
    type: 'order',
    isRead: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    link: '/tracking/TRK-89234'
  },
  {
    id: 'notif-2',
    title: 'Welcome to Trakz Delivery! 🎉',
    message: 'Enjoy 20% off your first order using promo code TRAKZWELCOME.',
    type: 'promo',
    isRead: true,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    link: '/merchants'
  },
  {
    id: 'notif-3',
    title: 'Order Delivered ✅',
    message: 'Order #TRK-84102 from Bella Napoli was delivered. Enjoy your food!',
    type: 'order',
    isRead: true,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    link: '/orders'
  }
];
