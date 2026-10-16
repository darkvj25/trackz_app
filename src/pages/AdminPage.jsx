import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Bike,
  Users,
  Settings,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  ShieldCheck,
  Eye,
  Edit3,
  MoreVertical,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Activity,
  CloudRain,
  Sun,
  Moon,
  Zap,
  AlertTriangle,
  Check,
  Trash2,
  Store as StoreIcon,
  Shield,
  Sliders,
  ExternalLink,
  UserPlus,
  UserCheck,
  UserX,
  ShieldAlert,
  SlidersHorizontal,
  User
} from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../hooks/useTheme';
import { mockMerchants as initialMockMerchants } from '../data/mockMerchants';
import { mockProducts } from '../data/mockProducts';
import { ORDER_STATUS, ORDER_STATUS_DETAILS } from '../utils/constants';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { merchantService } from '../services/merchantService';
import { adminService } from '../services/adminService';
import { productService } from '../services/productService';

// Initial fallbacks (empty by default so clean/reseeded database shows zero riders)
const initialRiders = [];
const initialUsers = [];

// Helper functions for full customer & item details
const parseOrderItems = (order) => {
  if (Array.isArray(order?.items)) return order.items;
  if (typeof order?.items === 'string') {
    try {
      const parsed = JSON.parse(order.items);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return [];
};

const formatFullAddress = (order) => {
  const addr = order?.deliveryAddress;
  if (!addr) return 'No delivery address specified';
  if (typeof addr === 'string') return addr;
  const parts = [addr.street, addr.barangay, addr.city, addr.postalCode].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'No delivery address specified';
};

const formatCustomerPhone = (order) => {
  return order?.customerPhone || order?.deliveryAddress?.phone || order?.phone || null;
};

export const AdminPage = () => {
  const { orders, refreshOrders } = useOrders();
  const { user, approveRider: approveRiderAuth } = useAuth();
  const { showToast } = useToast();
  const { toggleTheme, isDark } = useTheme();

  // Active Admin Navigation Tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'merchants' | 'riders' | 'users' | 'settings'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Search & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  // Merchants State
  const [merchantsList, setMerchantsList] = useState(initialMockMerchants);
  const [isAddMerchantOpen, setIsAddMerchantOpen] = useState(false);
  const [newMerchantName, setNewMerchantName] = useState('');
  const [newMerchantCategory, setNewMerchantCategory] = useState('burgers');
  const [newMerchantDescription, setNewMerchantDescription] = useState('');

  // Merchant Filters State
  const [merchantStatusFilter, setMerchantStatusFilter] = useState('ALL'); // 'ALL' | 'ONLINE' | 'OFFLINE'
  const [merchantCategoryFilter, setMerchantCategoryFilter] = useState('ALL');

  // Edit Merchant Modal State
  const [editingMerchant, setEditingMerchant] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('burgers');
  const [editDeliveryFee, setEditDeliveryFee] = useState(49);
  const [editDeliveryTime, setEditDeliveryTime] = useState('20-30 min');
  const [editPromoBadge, setEditPromoBadge] = useState('');

  // Riders State
  const [ridersList, setRidersList] = useState(initialRiders);
  const [riderFilterStatus, setRiderFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'PENDING'

  // Users State & Directory Filters
  const [usersList, setUsersList] = useState(initialUsers);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL'); // 'ALL' | 'admin' | 'merchant' | 'rider' | 'customer'
  const [userStatusFilter, setUserStatusFilter] = useState('ALL'); // 'ALL' | 'Active' | 'Suspended'
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Add & Edit User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isRiderOnlyModal, setIsRiderOnlyModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userNameInput, setUserNameInput] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [userPhoneInput, setUserPhoneInput] = useState('');
  const [userRoleInput, setUserRoleInput] = useState('customer');
  const [userStatusInput, setUserStatusInput] = useState('Active');
  const [riderVehicleType, setRiderVehicleType] = useState('Motorcycle');
  const [riderVehicleModel, setRiderVehicleModel] = useState('Honda Click 125i');
  const [riderPlateNumber, setRiderPlateNumber] = useState('');

  // Selected Order Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Selected Merchant Menu Viewer Modal State
  const [selectedMerchantForMenu, setSelectedMerchantForMenu] = useState(null);
  const [merchantProducts, setMerchantProducts] = useState([]);
  const [loadingMerchantProducts, setLoadingMerchantProducts] = useState(false);

  // System Settings State
  const [commissionRate, setCommissionRate] = useState(15);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [autoDispatch, setAutoDispatch] = useState(true);
  const [rainMode, setRainMode] = useState(false);

  // Fetch Live Admin Data on Mount
  useEffect(() => {
    let isMounted = true;
    const fetchAdminData = async () => {
      try {
        const [mList, rList, uList, settings] = await Promise.all([
          merchantService.getMerchants().catch(() => initialMockMerchants),
          adminService.getRiders().catch(() => initialRiders),
          adminService.getUsers().catch(() => initialUsers),
          adminService.getSettings().catch(() => ({ commissionRate: 15, surgeMultiplier: 1.0, autoDispatch: true, rainMode: false }))
        ]);

        if (isMounted) {
          if (Array.isArray(mList) && mList.length > 0) setMerchantsList(mList);
          if (Array.isArray(rList)) setRidersList(rList);
          if (Array.isArray(uList)) setUsersList(uList);
          if (settings) {
            if (settings.commissionRate !== undefined) setCommissionRate(settings.commissionRate);
            if (settings.surgeMultiplier !== undefined) setSurgeMultiplier(settings.surgeMultiplier);
            if (settings.autoDispatch !== undefined) setAutoDispatch(settings.autoDispatch);
            if (settings.rainMode !== undefined) setRainMode(settings.rainMode);
          }
        }
      } catch (e) {
        console.warn('Admin page initial data fetch warning:', e);
      }
    };
    fetchAdminData();
    return () => { isMounted = false; };
  }, []);

  // Sync System Data
  const handleRefreshData = async () => {
    try {
      refreshOrders();
      const [mList, rList, uList] = await Promise.all([
        merchantService.getMerchants().catch(() => merchantsList),
        adminService.getRiders().catch(() => ridersList),
        adminService.getUsers().catch(() => usersList)
      ]);
      if (Array.isArray(mList) && mList.length > 0) setMerchantsList(mList);
      if (Array.isArray(rList)) setRidersList(rList);
      if (Array.isArray(uList)) setUsersList(uList);
      showToast('System synced with live server! 🔄', 'success');
    } catch (e) {
      showToast('Data refreshed! 🔄', 'success');
    }
  };

  // Overall Stats Calculations
  const stats = useMemo(() => {
    const totalRev = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const activeCount = orders.filter(
      o => o.orderStatus !== ORDER_STATUS.DELIVERED && o.orderStatus !== ORDER_STATUS.CANCELLED
    ).length;
    const deliveredCount = orders.filter(o => o.orderStatus === ORDER_STATUS.DELIVERED).length;
    const pendingRidersCount = ridersList.filter(r => !r.isApproved || r.status === 'pending_approval').length;
    const pendingMerchantsCount = merchantsList.filter(m => m.isApproved === false || m.status === 'pending_approval').length;

    return {
      totalRevenue: totalRev,
      totalOrdersCount: orders.length,
      activeOrdersCount: activeCount,
      deliveredOrdersCount: deliveredCount,
      totalMerchantsCount: merchantsList.length,
      onlineMerchantsCount: merchantsList.filter(m => m.isOpen).length,
      pendingMerchantsCount,
      totalRidersCount: ridersList.length,
      activeRidersCount: ridersList.filter(r => r.isApproved).length,
      pendingRidersCount,
      totalUsersCount: usersList.length,
      adminsCount: usersList.filter(u => u.role === 'admin').length,
      merchantsUserCount: usersList.filter(u => u.role === 'merchant').length,
      ridersUserCount: usersList.filter(u => u.role === 'rider').length,
      customersCount: usersList.filter(u => u.role === 'customer').length
    };
  }, [orders, merchantsList, ridersList, usersList]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        order.id.toLowerCase().includes(term) ||
        order.merchantName?.toLowerCase().includes(term) ||
        order.deliveryAddress?.street?.toLowerCase().includes(term) ||
        order.customerName?.toLowerCase().includes(term);

      const matchesStatus =
        orderStatusFilter === 'ALL' || order.orderStatus === orderStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, orderStatusFilter]);

  // Calculate sales per merchant
  const merchantSalesStats = useMemo(() => {
    const statsMap = {};
    orders.forEach(order => {
      const merchKey = order.merchantId || order.merchantName?.toLowerCase();
      if (!merchKey) return;
      if (!statsMap[merchKey]) {
        statsMap[merchKey] = { revenue: 0, count: 0 };
      }
      statsMap[merchKey].count += 1;
      if (order.orderStatus === ORDER_STATUS.DELIVERED) {
        statsMap[merchKey].revenue += (order.total || 0);
      }
    });

    initialMockMerchants.forEach(m => {
      if (!statsMap[m.id]) {
        statsMap[m.id] = {
          revenue: m.id === 'merch-jollibee' ? 18450 : m.id === 'merch-mcdo' ? 14200 : m.id === 'merch-1' ? 9850 : 6400,
          count: m.id === 'merch-jollibee' ? 42 : m.id === 'merch-mcdo' ? 31 : m.id === 'merch-1' ? 24 : 16
        };
      }
    });

    return statsMap;
  }, [orders]);

  // Filtered Merchants
  const filteredMerchants = useMemo(() => {
    return merchantsList.filter(m => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        m.name.toLowerCase().includes(term) ||
        (m.description && m.description.toLowerCase().includes(term)) ||
        (m.category && m.category.toLowerCase().includes(term));

      const matchesStatus =
        merchantStatusFilter === 'ALL' ||
        (merchantStatusFilter === 'ONLINE' && m.isOpen && m.isApproved !== false) ||
        (merchantStatusFilter === 'OFFLINE' && !m.isOpen && m.isApproved !== false) ||
        (merchantStatusFilter === 'PENDING' && (m.isApproved === false || m.status === 'pending_approval'));

      const matchesCategory =
        merchantCategoryFilter === 'ALL' ||
        (m.category && m.category.toLowerCase() === merchantCategoryFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [merchantsList, searchTerm, merchantStatusFilter, merchantCategoryFilter]);

  // Handle Merchant Verification Approval
  const handleApproveMerchant = (merchantId, storeName) => {
    setMerchantsList(prev =>
      prev.map(m => m.id === merchantId ? { ...m, isOpen: true, status: 'active', isApproved: true } : m)
    );
    showToast(`Store "${storeName}" has been verified and published online! 🏪`, 'success');
  };

  // Filtered Riders
  const filteredRiders = useMemo(() => {
    return ridersList.filter(r => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term ||
        r.name.toLowerCase().includes(term) ||
        (r.email && r.email.toLowerCase().includes(term)) ||
        (r.operatingCity && r.operatingCity.toLowerCase().includes(term)) ||
        (r.vehicleType && r.vehicleType.toLowerCase().includes(term));

      const matchesStatus =
        riderFilterStatus === 'ALL' ||
        (riderFilterStatus === 'ACTIVE' && r.isApproved) ||
        (riderFilterStatus === 'PENDING' && (!r.isApproved || r.status === 'pending_approval'));

      return matchesSearch && matchesStatus;
    });
  }, [ridersList, searchTerm, riderFilterStatus]);

  // Filtered System Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const term = (userSearchQuery || searchTerm).toLowerCase();
      const matchesSearch = !term ||
        u.name.toLowerCase().includes(term) ||
        u.id.toLowerCase().includes(term) ||
        (u.email && u.email.toLowerCase().includes(term)) ||
        (u.phone && u.phone.toLowerCase().includes(term));

      const matchesRole =
        userRoleFilter === 'ALL' || u.role === userRoleFilter;

      const matchesStatus =
        userStatusFilter === 'ALL' || u.status === userStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersList, searchTerm, userSearchQuery, userRoleFilter, userStatusFilter]);

  // User Actions
  const handleOpenAddUser = (initialRole = 'customer') => {
    const role = (typeof initialRole === 'string') ? initialRole : 'customer';
    setEditingUser(null);
    setUserNameInput('');
    setUserEmailInput('');
    setUserPhoneInput('');
    const isRider = role === 'rider';
    setIsRiderOnlyModal(isRider);
    setUserRoleInput(role);
    setUserStatusInput('Active');
    setRiderVehicleType('Motorcycle');
    setRiderVehicleModel('Honda Click 125i');
    setRiderPlateNumber(`TRK-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsAddUserOpen(true);
  };

  const handleOpenEditUser = (u) => {
    setEditingUser(u);
    setIsRiderOnlyModal(u.role === 'rider');
    setUserNameInput(u.name || '');
    setUserEmailInput(u.email || '');
    setUserPhoneInput(u.phone || '');
    setUserRoleInput(u.role || 'customer');
    setUserStatusInput(u.status || 'Active');
    setIsAddUserOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!userNameInput.trim() || !userEmailInput.trim()) {
      showToast('Please enter user name and email', 'error');
      return;
    }

    if (editingUser) {
      setUsersList(prev =>
        prev.map(u => (u.id === editingUser.id ? {
          ...u,
          name: userNameInput,
          email: userEmailInput,
          phone: userPhoneInput || u.phone,
          role: userRoleInput,
          status: userStatusInput
        } : u))
      );
      showToast(`User account "${userNameInput}" updated successfully! 👤`, 'success');
    } else {
      const newUser = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        name: userNameInput,
        email: userEmailInput,
        phone: userPhoneInput || '+63 900 000 0000',
        role: userRoleInput,
        status: userStatusInput,
        joined: new Date().toISOString().split('T')[0]
      };
      setUsersList([newUser, ...usersList]);

      if (userRoleInput === 'rider') {
        const newRiderObj = {
          id: newUser.id,
          name: userNameInput,
          email: userEmailInput,
          phone: userPhoneInput || '+63 917 000 0000',
          vehicleType: riderVehicleType,
          vehicleModel: riderVehicleModel,
          plateNumber: riderPlateNumber || `TRK-${newUser.id.slice(-4)}`,
          operatingCity: 'Metro Manila',
          rating: 5.0,
          deliveriesCount: 0,
          status: userStatusInput === 'Active' ? 'active' : 'pending_approval',
          isApproved: userStatusInput === 'Active',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        };
        setRidersList(prev => [newRiderObj, ...prev]);
        showToast(`New Rider "${userNameInput}" registered in delivery fleet! 🛵`, 'success');
      } else {
        showToast(`New ${userRoleInput.toUpperCase()} account created! 👤`, 'success');
      }
    }

    setIsAddUserOpen(false);
  };

  const handleToggleUserStatus = (userId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    setUsersList(prev =>
      prev.map(u => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
    showToast(`Account status set to ${nextStatus}`, nextStatus === 'Active' ? 'success' : 'error');
  };

  const handleDeleteUser = (userId, userName) => {
    if (window.confirm(`Are you sure you want to remove user "${userName}"?`)) {
      setUsersList(prev => prev.filter(u => u.id !== userId));
      showToast(`User "${userName}" removed from system directory`, 'info');
    }
  };

  // Emergency Master Store Switcher
  const handleEmergencyToggleAllStores = async (targetOpenStatus) => {
    try {
      await Promise.all(
        merchantsList.map(m => merchantService.toggleMerchantStatus(m.id, targetOpenStatus))
      );
    } catch (e) {
      console.warn('Emergency update warning:', e);
    }

    setMerchantsList(prev =>
      prev.map(m => ({ ...m, isOpen: targetOpenStatus }))
    );

    showToast(
      targetOpenStatus
        ? '🚨 OVERRIDE: All stores set to ONLINE 🟢'
        : '🚨 OVERRIDE: All stores set to OFFLINE 🔴',
      targetOpenStatus ? 'success' : 'error'
    );
  };

  // Edit Merchant
  const handleOpenEditMerchant = (merchant) => {
    setEditingMerchant(merchant);
    setEditName(merchant.name || '');
    setEditDescription(merchant.description || '');
    setEditCategory(merchant.category || 'burgers');
    setEditDeliveryFee(merchant.deliveryFee !== undefined ? merchant.deliveryFee : 49);
    setEditDeliveryTime(merchant.estimatedDeliveryTime || '20-30 min');
    setEditPromoBadge(merchant.promoBadge || '');
  };

  const handleSaveEditMerchant = (e) => {
    e.preventDefault();
    if (!editingMerchant) return;

    setMerchantsList(prev =>
      prev.map(m => {
        if (m.id === editingMerchant.id) {
          return {
            ...m,
            name: editName,
            description: editDescription,
            category: editCategory,
            categoryName: editCategory.toUpperCase(),
            deliveryFee: parseFloat(editDeliveryFee) || 0,
            estimatedDeliveryTime: editDeliveryTime,
            promoBadge: editPromoBadge.trim() || null
          };
        }
        return m;
      })
    );

    showToast(`Updated store details for "${editName}"! ✏️`, 'success');
    setEditingMerchant(null);
  };

  // Toggle Merchant Status
  const handleToggleMerchantStatus = async (merchantId) => {
    try {
      const current = merchantsList.find(m => m.id === merchantId);
      const targetState = current ? !current.isOpen : true;
      const res = await merchantService.toggleMerchantStatus(merchantId, targetState);
      const finalIsOpen = res && res.isOpen !== undefined ? Boolean(res.isOpen) : targetState;

      setMerchantsList(prev =>
        prev.map(m => {
          if (m.id === merchantId) {
            showToast(`${m.name} is now ${finalIsOpen ? 'ONLINE 🟢' : 'OFFLINE 🔴'}`, finalIsOpen ? 'success' : 'info');
            return { ...m, isOpen: finalIsOpen };
          }
          return m;
        })
      );

      if (selectedMerchantForMenu && selectedMerchantForMenu.id === merchantId) {
        setSelectedMerchantForMenu(prev => prev ? { ...prev, isOpen: finalIsOpen } : null);
      }
    } catch (e) {
      console.error('Error toggling merchant status:', e);
    }
  };

  // View Merchant Catalog
  const handleViewMerchantMenu = async (merchant) => {
    setSelectedMerchantForMenu(merchant);
    setLoadingMerchantProducts(true);
    try {
      const products = await productService.getProductsByMerchant(merchant.id);
      if (Array.isArray(products) && products.length > 0) {
        setMerchantProducts(products);
      } else {
        const matched = mockProducts.filter(p => p.merchantId === merchant.id || p.merchantName?.toLowerCase() === merchant.name?.toLowerCase());
        setMerchantProducts(matched);
      }
    } catch (err) {
      const matched = mockProducts.filter(p => p.merchantId === merchant.id || p.merchantName?.toLowerCase() === merchant.name?.toLowerCase());
      setMerchantProducts(matched);
    } finally {
      setLoadingMerchantProducts(false);
    }
  };

  // Create Merchant
  const handleCreateMerchant = async (e) => {
    e.preventDefault();
    if (!newMerchantName.trim()) {
      showToast('Please enter merchant store name', 'error');
      return;
    }

    const newMerchant = {
      id: `merch-${Date.now()}`,
      name: newMerchantName,
      description: newMerchantDescription || 'Delicious products & fresh delivery',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      category: newMerchantCategory,
      categoryName: newMerchantCategory.toUpperCase(),
      isOpen: true,
      rating: 5.0,
      reviewCount: 1,
      deliveryFee: 49,
      estimatedDeliveryTime: '20-30 min',
      distanceKm: '1.5 km',
      priceRange: '$$',
      minOrderAmount: 100,
      tags: ['New', 'Featured'],
      menuCategories: ['Featured Specials', 'Main Courses', 'Beverages']
    };

    try {
      await merchantService.createMerchant(newMerchant);
    } catch (err) {
      console.warn('Backend merchant creation warning:', err);
    }

    setMerchantsList([newMerchant, ...merchantsList]);
    setNewMerchantName('');
    setNewMerchantDescription('');
    setIsAddMerchantOpen(false);
    showToast(`Merchant "${newMerchant.name}" successfully registered! 🏪`, 'success');
  };

  // Rider Approval
  const handleApproveRider = async (riderId, riderName) => {
    try {
      await adminService.approveRider(riderId);
      if (approveRiderAuth) {
        await approveRiderAuth(riderId).catch(() => {});
      }
      setRidersList(prev =>
        prev.map(r => (r.id === riderId ? { ...r, status: 'active', isApproved: true } : r))
      );
      setUsersList(prev =>
        prev.map(u => (u.id === riderId ? { ...u, status: 'Active', isApproved: true } : u))
      );

      // Update in local storage trakz_registered_users for mock login
      try {
        const registeredUsers = JSON.parse(localStorage.getItem('trakz_registered_users') || '[]');
        const updatedUsers = registeredUsers.map(u => (u.id === riderId ? { ...u, status: 'active', isApproved: true } : u));
        localStorage.setItem('trakz_registered_users', JSON.stringify(updatedUsers));
      } catch (e) {}

      showToast(`Rider ${riderName} has been approved for dispatch! 🛵`, 'success');
    } catch (e) {
      setRidersList(prev =>
        prev.map(r => (r.id === riderId ? { ...r, status: 'active', isApproved: true } : r))
      );
      showToast(`Rider ${riderName} has been approved for dispatch! 🛵`, 'success');
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    try {
      await adminService.updateSettings({
        commissionRate,
        surgeMultiplier,
        autoDispatch,
        rainMode
      });
      showToast('Platform settings updated successfully! ⚙️', 'success');
    } catch (e) {
      showToast('Platform settings updated successfully! ⚙️', 'success');
    }
  };

  const navItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'Live Orders Operations', icon: ShoppingBag, badge: stats.activeOrdersCount, badgeColor: 'bg-amber-500 text-slate-900' },
    { id: 'merchants', label: 'Stores & Merchants', icon: Store, badge: stats.pendingMerchantsCount > 0 ? `${stats.pendingMerchantsCount} pending` : stats.totalMerchantsCount, badgeColor: stats.pendingMerchantsCount > 0 ? 'bg-amber-400 text-slate-950 font-black' : null },
    { id: 'riders', label: 'Delivery Riders', icon: Bike, badge: stats.pendingRidersCount > 0 ? `${stats.pendingRidersCount} pending` : null, badgeColor: 'bg-amber-400 text-slate-950 font-black' },
    { id: 'users', label: 'User Directory', icon: Users, badge: stats.totalUsersCount },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070d19] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">

      {/* Modern Top Admin Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 dark:bg-[#0b1329]/95 backdrop-blur-md border-b border-slate-800/80 shadow-md px-4 sm:px-6 lg:px-8 py-3">
        <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between gap-4">

          {/* Left: Branding & Navigation Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 md:hidden transition-colors"
              title="Toggle Menu"
            >
              {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to="/admin" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ffb100] to-amber-300 text-slate-950 font-black text-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                ⚡
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight leading-none text-white">
                    TRAK<span className="text-[#ffb100]">Z</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ffb100]/20 text-[#ffb100] border border-[#ffb100]/40 text-[10px] font-black tracking-wider uppercase">
                    ADMIN HQ
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 leading-none mt-1 hidden sm:inline">
                  Control & Operations Panel
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex items-center relative w-72 lg:w-96">
            <Search size={16} className="absolute left-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search across orders, stores, users, riders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ffb100]/60 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Right: Actions & Theme */}
          <div className="flex items-center gap-2.5">
            {/* Live Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Operations</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Toggle Light / Dark Mode"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-purple-400" />}
            </button>

            {/* Return to App */}
            <Link
              to="/home"
              className="px-3.5 py-2 rounded-xl bg-[#ffb100] hover:bg-[#e09c00] text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Back to Customer App</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Body Layout */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">

        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden md:block w-64 shrink-0 space-y-3">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-sm sticky top-20 space-y-1">

            <div className="px-3 py-2 text-[10px] font-black tracking-wider text-slate-400 uppercase">
              Operations Center
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-[#ffb100] shadow-md dark:bg-slate-800 dark:text-[#ffb100]'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-[#ffb100]' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      item.badgeColor || (isActive ? 'bg-[#ffb100] text-slate-950' : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Dispatch Weather Widget */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 px-1 space-y-2">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/30 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-300">
                    <Activity size={14} />
                    <span>Rain Surge Control</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${rainMode ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Mode: <strong>{rainMode ? 'Active (1.25x Surge)' : 'Standard Delivery'}</strong>
                </p>
                <button
                  onClick={() => {
                    const nextMode = !rainMode;
                    setRainMode(nextMode);
                    if (nextMode) setSurgeMultiplier(1.25);
                    else setSurgeMultiplier(1.0);
                    showToast(`Rain mode set to ${nextMode ? 'ACTIVE (1.25x surge)' : 'Standard'}`, nextMode ? 'warning' : 'info');
                  }}
                  className={`w-full py-2 rounded-xl font-black text-[11px] transition-all cursor-pointer ${
                    rainMode
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {rainMode ? 'Disable Surge' : 'Activate Rain Surge'}
                </button>
              </div>
            </div>

          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileSidebarOpen && (
          <div className="md:hidden bg-white dark:bg-[#0f172a] rounded-3xl p-4 border border-slate-200 dark:border-slate-800/80 shadow-xl space-y-2">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
              Select Panel Section
            </div>
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-[#ffb100] shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Panel View Content */}
        <main className="flex-1 space-y-6 min-w-0">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    Dashboard Overview
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Live metrics, financial telemetry & operational system controls
                  </p>
                </div>
                <button
                  onClick={handleRefreshData}
                  className="px-3.5 py-2 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/80 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-xs cursor-pointer"
                >
                  <RefreshCw size={14} className="text-purple-600 dark:text-purple-400" />
                  <span>Refresh System Data</span>
                </button>
              </div>

              {/* Pending Approvals Alert Banner */}
              {(stats.pendingRidersCount > 0 || stats.pendingMerchantsCount > 0) && (
                <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 text-amber-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xl shrink-0">
                      ⏳
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Pending Registration Applications ({stats.pendingRidersCount + stats.pendingMerchantsCount})
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                        {stats.pendingRidersCount > 0 && `${stats.pendingRidersCount} rider driver application(s)`}
                        {stats.pendingRidersCount > 0 && stats.pendingMerchantsCount > 0 && ' • '}
                        {stats.pendingMerchantsCount > 0 && `${stats.pendingMerchantsCount} merchant store registration(s)`}
                        {' awaiting review & verification.'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {stats.pendingRidersCount > 0 && (
                      <button
                        onClick={() => { setActiveTab('riders'); setRiderFilterStatus('PENDING'); }}
                        className="px-3.5 py-2 rounded-2xl bg-[#ffb100] hover:bg-[#e09c00] text-slate-950 font-black text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Verify Riders ({stats.pendingRidersCount})
                      </button>
                    )}
                    {stats.pendingMerchantsCount > 0 && (
                      <button
                        onClick={() => { setActiveTab('merchants'); setMerchantStatusFilter('PENDING'); }}
                        className="px-3.5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs transition-all cursor-pointer shadow-xs"
                      >
                        Verify Stores ({stats.pendingMerchantsCount})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Revenue</span>
                    <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    ₱{stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                    <TrendingUp size={13} />
                    <span>+18.4% growth this month</span>
                  </div>
                </div>

                {/* Active Orders */}
                <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Live Orders</span>
                    <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-[#ffb100] flex items-center justify-center font-bold">
                      <ShoppingBag size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {stats.activeOrdersCount} <span className="text-xs font-normal text-slate-400">/ {stats.totalOrdersCount} total</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                    <Clock size={13} />
                    <span>{stats.deliveredOrdersCount} orders delivered today</span>
                  </div>
                </div>

                {/* Partner Merchants */}
                <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Merchant Outlets</span>
                    <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                      <Store size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {stats.onlineMerchantsCount} <span className="text-xs font-normal text-slate-400">online</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-blue-500">
                    <CheckCircle2 size={13} />
                    <span>{stats.totalMerchantsCount} total partner stores</span>
                  </div>
                </div>

                {/* Delivery Fleet */}
                <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Riders</span>
                    <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                      <Bike size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {stats.activeRidersCount} <span className="text-xs font-normal text-slate-400">active</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-purple-500">
                    <ShieldCheck size={13} />
                    <span>{stats.pendingRidersCount} pending driver approvals</span>
                  </div>
                </div>
              </div>

              {/* Chart & Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Sales Chart Visual */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                        Weekly Delivery Sales & Revenue
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Real-time transaction volume across registered sectors
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
                      This Week
                    </span>
                  </div>

                  {/* SVG Bar Chart */}
                  <div className="h-48 pt-6 flex items-end justify-between gap-3 px-2 border-b border-slate-100 dark:border-slate-800/80">
                    {[
                      { day: 'Mon', val: 45, rev: '₱3.2k' },
                      { day: 'Tue', val: 62, rev: '₱4.5k' },
                      { day: 'Wed', val: 58, rev: '₱4.1k' },
                      { day: 'Thu', val: 75, rev: '₱5.8k' },
                      { day: 'Fri', val: 95, rev: '₱8.2k' },
                      { day: 'Sat', val: 110, rev: '₱10.5k' },
                      { day: 'Sun', val: 88, rev: '₱7.4k' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.rev}
                        </span>
                        <div
                          style={{ height: `${item.val}%` }}
                          className="w-full bg-gradient-to-t from-purple-600 to-[#ffb100] rounded-t-xl group-hover:brightness-110 transition-all"
                        />
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                          {item.day}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-md bg-[#ffb100]" /> Peak Orders: 11:30 AM - 1:30 PM & 6:00 PM - 8:30 PM
                    </span>
                    <button onClick={() => setActiveTab('orders')} className="text-purple-600 dark:text-purple-400 hover:underline font-bold cursor-pointer">
                      View All Live Orders →
                    </button>
                  </div>
                </div>

                {/* Quick Operations Controls */}
                <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Zap size={18} className="text-[#ffb100]" />
                    <span>Quick Management</span>
                  </h3>

                  <div className="space-y-3">
                    <button
                      onClick={() => setIsAddMerchantOpen(true)}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#ffb100] flex items-center justify-center font-bold">
                          <Plus size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white">Register Partner Store</div>
                          <div className="text-[10px] text-slate-500">Add restaurant outlet to app</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => setActiveTab('users')}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                          <UserPlus size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white">User Accounts Directory</div>
                          <div className="text-[10px] text-slate-500">{stats.totalUsersCount} accounts configured</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => setActiveTab('riders')}
                      className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800/80 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                          <Bike size={16} />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900 dark:text-white">Approve Driver Accounts</div>
                          <div className="text-[10px] text-slate-500">{stats.pendingRidersCount} riders awaiting approval</div>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Recent Orders Ticker */}
              <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                    Live Order Stream
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    View Operations Table →
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.merchantLogo || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=200&q=80'}
                          alt={order.merchantName}
                          className="w-10 h-10 rounded-2xl object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">{order.id}</span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">• {order.merchantName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {order.items?.length || 1} items • Total <strong>₱{order.total}</strong> ({order.paymentMethod})
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.orderStatus === ORDER_STATUS.DELIVERED
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                            : order.orderStatus === ORDER_STATUS.CANCELLED
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                            : 'bg-amber-500/10 text-[#ffb100] border border-[#ffb100]/30'
                        }`}>
                          {order.orderStatus}
                        </span>

                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: LIVE ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    Live Orders Management
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Monitor and inspect customer orders in real-time
                  </p>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {['ALL', ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING, ORDER_STATUS.RIDER_ASSIGNED, ORDER_STATUS.ON_THE_WAY, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].map((statusKey) => (
                  <button
                    key={statusKey}
                    onClick={() => setOrderStatusFilter(statusKey)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      orderStatusFilter === statusKey
                        ? 'bg-slate-900 text-[#ffb100] shadow-md dark:bg-[#ffb100] dark:text-slate-950'
                        : 'bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100'
                    }`}
                  >
                    {statusKey === 'ALL' ? 'All Orders' : statusKey}
                  </button>
                ))}
              </div>

              {/* Orders Table Container */}
              <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider">
                        <th className="py-3.5 px-4">Order ID & Customer Details</th>
                        <th className="py-3.5 px-4">Merchant Outlet</th>
                        <th className="py-3.5 px-4">Ordered Items & Quantities</th>
                        <th className="py-3.5 px-4">Delivery Address & Notes</th>
                        <th className="py-3.5 px-4">Total</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400">
                            No orders matching your filters.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          const itemsList = parseOrderItems(order);
                          const fullAddress = formatFullAddress(order);
                          const customerPhone = formatCustomerPhone(order);

                          return (
                            <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors align-top">
                              {/* 1. ORDER ID & CUSTOMER DETAILS */}
                              <td className="py-3.5 px-4 font-black text-slate-900 dark:text-slate-100 min-w-[170px]">
                                <div className="font-extrabold text-sm text-[#ffb100]">{order.id}</div>
                                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                                  <User size={13} className="text-purple-500 shrink-0" />
                                  <span>{order.customerName || order.deliveryAddress?.recipientName || 'Balandoy'}</span>
                                </div>
                                {customerPhone && (
                                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                                    <Phone size={11} className="shrink-0" />
                                    <span>{customerPhone}</span>
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-400 font-normal mt-1">
                                  {order.paymentMethod || 'Cash on Delivery'} • <span className="font-bold text-slate-600 dark:text-slate-300">{order.paymentStatus || 'Unpaid'}</span>
                                </div>
                              </td>

                              {/* 2. MERCHANT STORE */}
                              <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 min-w-[120px]">
                                <div className="flex items-center gap-2">
                                  {order.merchantLogo && (
                                    <img src={order.merchantLogo} alt={order.merchantName} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                                  )}
                                  <span>{order.merchantName}</span>
                                </div>
                              </td>

                              {/* 3. ORDERED ITEMS (FULL DETAILS) */}
                              <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 min-w-[220px]">
                                {itemsList.length === 0 ? (
                                  <span className="text-slate-400 italic">No items listed</span>
                                ) : (
                                  <div className="space-y-1.5">
                                    {itemsList.map((item, idx) => (
                                      <div key={idx} className="bg-slate-50 dark:bg-slate-900/80 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] space-y-0.5">
                                        <div className="flex justify-between items-start font-extrabold text-slate-900 dark:text-white">
                                          <span>
                                            <span className="text-purple-600 dark:text-purple-400 font-black mr-1">{item.quantity}x</span>
                                            {item.name}
                                          </span>
                                          <span className="font-black text-slate-700 dark:text-slate-300 ml-2 shrink-0">
                                            ₱{(item.itemTotal || item.price || 0) * (item.quantity || 1)}
                                          </span>
                                        </div>
                                        {item.selectedVariant && (
                                          <div className="text-[10px] text-slate-500 font-medium pl-3">
                                            Variant: <strong className="text-slate-700 dark:text-slate-300">{item.selectedVariant.name || item.selectedVariant}</strong>
                                          </div>
                                        )}
                                        {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                                          <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium pl-3 flex flex-wrap gap-1">
                                            Add-ons: {item.selectedAddOns.map(a => a.name || a).join(', ')}
                                          </div>
                                        )}
                                        {item.specialInstructions && (
                                          <div className="text-[10px] text-slate-400 italic pl-3">
                                            Note: "{item.specialInstructions}"
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </td>

                              {/* 4. DELIVERY ADDRESS & NOTES */}
                              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs min-w-[180px]">
                                <div className="flex items-start gap-1 font-medium leading-snug text-slate-800 dark:text-slate-200">
                                  <MapPin size={12} className="text-rose-500 shrink-0 mt-0.5" />
                                  <span>{fullAddress}</span>
                                </div>
                                {(order.deliveryInstructions || order.deliveryAddress?.deliveryInstructions) && (
                                  <div className="mt-1.5 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                    Instruction: "{order.deliveryInstructions || order.deliveryAddress?.deliveryInstructions}"
                                  </div>
                                )}
                              </td>

                              {/* 5. TOTAL */}
                              <td className="py-3.5 px-4 font-black text-purple-600 dark:text-purple-400 text-sm whitespace-nowrap">
                                ₱{order.total}
                              </td>

                              {/* 6. STATUS */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border ${
                                  order.orderStatus === ORDER_STATUS.DELIVERED
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                    : order.orderStatus === ORDER_STATUS.CANCELLED
                                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                                    : 'bg-amber-500/10 text-[#ffb100] border-[#ffb100]/30'
                                }`}>
                                  {order.orderStatus}
                                </span>
                              </td>

                              {/* 7. ACTIONS */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors shadow-xs cursor-pointer text-xs"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MERCHANTS & STORES */}
          {activeTab === 'merchants' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    Stores & Merchant Partners
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Manage store availability, menus, and register new partner outlets
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {merchantsList.some(m => m.isOpen) ? (
                    <button
                      onClick={() => handleEmergencyToggleAllStores(false)}
                      className="px-3.5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle size={15} />
                      <span>Emergency Close All 🚨</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEmergencyToggleAllStores(true)}
                      className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={15} />
                      <span>Re-open All Stores 🟢</span>
                    </button>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsAddMerchantOpen(true)}
                    icon={Plus}
                  >
                    Add New Merchant
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Status:</span>
                    {[
                      { id: 'ALL', label: 'All Stores' },
                      { id: 'ONLINE', label: 'Online Only 🟢' },
                      { id: 'OFFLINE', label: 'Offline Only 🔴' },
                      { id: 'PENDING', label: `Pending (${stats.pendingMerchantsCount}) ⏳` }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setMerchantStatusFilter(st.id)}
                        className={`px-3.5 py-1.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                          merchantStatusFilter === st.id
                            ? 'bg-slate-900 text-[#ffb100] shadow-sm dark:bg-[#ffb100] dark:text-slate-950'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Category:</span>
                    {[
                      { id: 'ALL', label: 'All 🍽️' },
                      { id: 'burgers', label: 'Burgers 🍔' },
                      { id: 'pizza', label: 'Pizza 🍕' },
                      { id: 'chicken', label: 'Chicken 🍗' },
                      { id: 'milktea', label: 'Milk Tea 🥤' },
                      { id: 'asian', label: 'Asian 🍣' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setMerchantCategoryFilter(cat.id)}
                        className={`px-3.5 py-1.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                          merchantCategoryFilter === cat.id
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid */}
              {filteredMerchants.length === 0 ? (
                <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-10 text-center border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                  <Store size={36} className="mx-auto text-slate-400" />
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No Merchants Found</h3>
                  <p className="text-xs text-slate-500">Try adjusting status or category filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {filteredMerchants.map((merchant) => {
                    const stats = merchantSalesStats[merchant.id] || merchantSalesStats[merchant.name?.toLowerCase()] || { revenue: 5400, count: 14 };
                    return (
                      <div
                        key={merchant.id}
                        className="bg-white dark:bg-[#0f172a] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <img
                              src={merchant.logo}
                              alt={merchant.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                            />
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditMerchant(merchant)}
                                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                title="Edit Store Details"
                              >
                                <Edit3 size={14} />
                              </button>
                              {(merchant.isApproved === false || merchant.status === 'pending_approval') ? (
                                <button
                                  onClick={() => handleApproveMerchant(merchant.id, merchant.name)}
                                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ffb100] text-slate-950 hover:bg-amber-400 transition-all cursor-pointer shadow-xs"
                                >
                                  Verify Store ⏳
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleMerchantStatus(merchant.id)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                    merchant.isOpen
                                      ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 hover:bg-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-500 border border-rose-500/40 hover:bg-rose-500/30'
                                  }`}
                                >
                                  {merchant.isOpen ? 'ONLINE 🟢' : 'OFFLINE 🔴'}
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                              {merchant.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                              {merchant.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold pt-1 flex-wrap">
                            <span>⭐ {merchant.rating || 4.8}</span>
                            <span>•</span>
                            <span>{merchant.estimatedDeliveryTime}</span>
                          </div>

                          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-950/20 to-slate-900/20 dark:from-purple-950/40 dark:to-slate-900/60 border border-purple-500/20 text-xs font-bold flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-300">
                              <TrendingUp size={14} className="text-[#ffb100]" />
                              <span>Sales: <strong>₱{stats.revenue.toLocaleString()}</strong></span>
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                              {stats.count} orders
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                          <button
                            onClick={() => handleViewMerchantMenu(merchant)}
                            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Menu</span>
                            <ChevronRight size={14} />
                          </button>

                          <button
                            onClick={() => handleToggleMerchantStatus(merchant.id)}
                            className="text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
                          >
                            {merchant.isOpen ? 'Close' : 'Open'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DELIVERY RIDERS */}
          {activeTab === 'riders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    Delivery Riders & Fleet
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Manage driver applications, active dispatch fleet & vehicle credentials
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {[
                    { id: 'ALL', label: 'All Riders' },
                    { id: 'ACTIVE', label: 'Active Drivers' },
                    { id: 'PENDING', label: `Pending (${stats.pendingRidersCount})` }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setRiderFilterStatus(filter.id)}
                      className={`px-3 py-1.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                        riderFilterStatus === filter.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Riders Grid */}
              <div className="space-y-3">
                {filteredRiders.length === 0 ? (
                  <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-10 text-center border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                    <Bike size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No Delivery Riders Found</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                        There are currently no riders registered in the database. New driver accounts will appear here when registered.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenAddUser('rider')}
                      icon={UserPlus}
                    >
                      Add New Rider Account
                    </Button>
                  </div>
                ) : (
                  filteredRiders.map((rider) => (
                    <div
                      key={rider.id}
                      className="bg-white dark:bg-[#0f172a] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={rider.avatar}
                          alt={rider.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-200 dark:border-purple-900 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                              {rider.name}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              rider.isApproved
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-[#ffb100] border border-[#ffb100]/40'
                            }`}>
                              {rider.isApproved ? 'Active Partner' : 'Pending Approval'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Vehicle: <strong>{rider.vehicleType} ({rider.vehicleModel})</strong> • Plate: <strong>{rider.plateNumber}</strong>
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                            <MapPin size={12} className="text-purple-500" /> {rider.operatingCity} • <Phone size={12} /> {rider.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {!rider.isApproved ? (
                          <button
                            onClick={() => handleApproveRider(rider.id, rider.name)}
                            className="px-4 py-2.5 rounded-2xl bg-[#ffb100] hover:bg-[#e09c00] text-slate-950 font-extrabold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 size={16} />
                            <span>Approve Driver</span>
                          </button>
                        ) : (
                          <div className="text-right">
                            <div className="text-xs font-black text-slate-900 dark:text-slate-100">⭐ {rider.rating}</div>
                            <div className="text-[10px] text-slate-400 font-semibold">{rider.deliveriesCount} deliveries</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: USER DIRECTORY (REMAKER / REDESIGNED FOR MAX USER-FRIENDLINESS) */}
          {activeTab === 'users' && (
            <div className="space-y-6">

              {/* Title & Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                      User Accounts Directory
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 text-xs font-black">
                      {stats.totalUsersCount} Registered Accounts
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Manage system accounts, user permissions, customer accounts, and security access
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleOpenAddUser}
                  icon={UserPlus}
                >
                  Create New Account
                </Button>
              </div>

              {/* Role Summary KPI Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customers</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">{stats.customersCount}</div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                    👥
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Merchants</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">{stats.merchantsUserCount}</div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#ffb100] flex items-center justify-center font-bold text-xs">
                    🏪
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Riders</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">{stats.ridersUserCount}</div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs">
                    🛵
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Admins</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">{stats.adminsCount}</div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-xs">
                    🛡️
                  </div>
                </div>
              </div>

              {/* User Directory Filters Bar */}
              <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

                  {/* Search Field */}
                  <div className="relative flex-1 max-w-md">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter by name, email, phone, or User ID..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-8 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                    />
                    {userSearchQuery && (
                      <button onClick={() => setUserSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold">
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Role Selector Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">Role:</span>
                    {[
                      { id: 'ALL', label: 'All Roles' },
                      { id: 'admin', label: 'Admins 🛡️' },
                      { id: 'merchant', label: 'Merchants 🏪' },
                      { id: 'rider', label: 'Riders 🛵' },
                      { id: 'customer', label: 'Customers 👤' }
                    ].map((roleItem) => (
                      <button
                        key={roleItem.id}
                        onClick={() => setUserRoleFilter(roleItem.id)}
                        className={`px-3 py-1.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                          userRoleFilter === roleItem.id
                            ? 'bg-slate-900 text-[#ffb100] shadow-sm dark:bg-[#ffb100] dark:text-slate-950'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {roleItem.label}
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* User Directory Table Card */}
              <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider">
                        <th className="py-3.5 px-4">User Account</th>
                        <th className="py-3.5 px-4">User ID</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">Contact Info</th>
                        <th className="py-3.5 px-4">Joined Date</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400">
                            <UserX size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                            <p className="font-extrabold text-slate-700 dark:text-slate-300">No Users Match Filter Criteria</p>
                            <p className="text-xs text-slate-500">Try adjusting your search query or role filter.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isUserActive = u.status === 'Active';
                          return (
                            <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                              {/* Account Name & Initial Bubble */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="relative shrink-0">
                                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#0f172a] ${
                                      isUserActive ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`} />
                                  </div>
                                  <div>
                                    <div className="font-black text-slate-900 dark:text-white text-xs">{u.name}</div>
                                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</div>
                                  </div>
                                </div>
                              </td>

                              {/* User ID */}
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/90 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                  {u.id}
                                </span>
                              </td>

                              {/* Role */}
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                                  u.role === 'admin'
                                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                                    : u.role === 'merchant'
                                    ? 'bg-amber-500/10 text-[#ffb100] border-[#ffb100]/30'
                                    : u.role === 'rider'
                                    ? 'bg-purple-500/10 text-purple-500 border-purple-500/30'
                                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                }`}>
                                  {u.role === 'admin' && '🛡️ ADMIN'}
                                  {u.role === 'merchant' && '🏪 MERCHANT'}
                                  {u.role === 'rider' && '🛵 RIDER'}
                                  {u.role === 'customer' && '👤 CUSTOMER'}
                                </span>
                              </td>

                              {/* Phone / Contact */}
                              <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                                {u.phone || '+63 917 000 0000'}
                              </td>

                              {/* Joined */}
                              <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-semibold">
                                {u.joined}
                              </td>

                              {/* Status Badge */}
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${
                                  isUserActive
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                                }`}>
                                  {u.status}
                                </span>
                              </td>

                              {/* Action Buttons */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditUser(u)}
                                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                    title="Edit User Details"
                                  >
                                    <Edit3 size={14} />
                                  </button>

                                  <button
                                    onClick={() => handleToggleUserStatus(u.id, u.status)}
                                    className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                                      isUserActive
                                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500'
                                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500'
                                    }`}
                                    title={isUserActive ? 'Suspend Account' : 'Activate Account'}
                                  >
                                    {isUserActive ? <UserX size={14} /> : <UserCheck size={14} />}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/20 hover:text-rose-500 text-slate-400 transition-colors cursor-pointer"
                                    title="Remove Account"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  System Settings & Parameters
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Configure platform financial commissions, surge pricing multipliers, and dispatch engine
                </p>
              </div>

              <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6 max-w-2xl">
                {/* Commission Rate */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                    Merchant Platform Commission Rate (%)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="w-32 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                    />
                    <span className="text-xs text-slate-500">Standard commission fee percentage per order</span>
                  </div>
                </div>

                {/* Surge Multiplier */}
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <label className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                    Demand Surge Delivery Multiplier
                  </label>
                  <div className="flex items-center gap-2">
                    {[1.0, 1.25, 1.5, 2.0].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => {
                          setSurgeMultiplier(val);
                          showToast(`Surge multiplier set to ${val}x`, 'info');
                        }}
                        className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                          surgeMultiplier === val
                            ? 'bg-[#ffb100] text-slate-950 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {val}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Dispatch Switch */}
                <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Automatic Rider Dispatch</div>
                    <div className="text-[11px] text-slate-500">Automatically assign nearest active rider when store accepts order</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoDispatch}
                    onChange={(e) => setAutoDispatch(e.target.checked)}
                    className="w-5 h-5 rounded text-[#ffb100] focus:ring-[#ffb100] cursor-pointer"
                  />
                </div>

                {/* Save Settings */}
                <div className="pt-4">
                  <Button
                    variant="primary"
                    onClick={handleSaveSettings}
                  >
                    Save Platform Configuration
                  </Button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: ORDER DETAILS MODAL */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Full Order Ticket #${selectedOrder?.id || ''}`}
        maxWidth="max-w-2xl"
      >
        {selectedOrder && (() => {
          const itemsList = parseOrderItems(selectedOrder);
          const fullAddress = formatFullAddress(selectedOrder);
          const customerPhone = formatCustomerPhone(selectedOrder);

          return (
            <div className="space-y-4 text-xs">
              {/* Order Header Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-sm">
                <div>
                  <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Store Outlet</div>
                  <div className="font-extrabold text-base text-white">{selectedOrder.merchantName}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Order ID: <strong className="text-white">{selectedOrder.id}</strong> • Created: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'Just now'}
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-[#ffb100] text-slate-950 font-black uppercase text-xs shadow-xs">
                  {selectedOrder.orderStatus}
                </span>
              </div>

              {/* Grid: Left = Customer & Dispatch, Right = Financial Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Customer Information Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-black text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <User size={13} className="text-purple-500" />
                    <span>Customer Details</span>
                  </div>

                  <div className="font-black text-sm text-slate-900 dark:text-white">
                    {selectedOrder.customerName || selectedOrder.deliveryAddress?.recipientName || 'Balandoy'}
                  </div>

                  {customerPhone && (
                    <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                      <Phone size={12} />
                      <span>{customerPhone}</span>
                    </div>
                  )}

                  <div className="space-y-1 text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <div className="font-bold text-slate-400 text-[10px] flex items-center gap-1">
                      <MapPin size={11} className="text-rose-500" />
                      <span>Delivery Dropoff Address:</span>
                    </div>
                    <div className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                      {fullAddress}
                    </div>
                  </div>

                  {(selectedOrder.deliveryInstructions || selectedOrder.deliveryAddress?.deliveryInstructions) && (
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                      Instruction: "{selectedOrder.deliveryInstructions || selectedOrder.deliveryAddress?.deliveryInstructions}"
                    </div>
                  )}
                </div>

                {/* Rider Dispatch & Payment Card */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="font-black text-slate-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Bike size={13} className="text-[#ffb100]" />
                    <span>Payment & Rider Dispatch</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 font-bold text-xs flex justify-between items-center">
                    <span>Payment Method:</span>
                    <span className="font-black">{selectedOrder.paymentMethod || 'Cash on Delivery'} ({selectedOrder.paymentStatus || 'Unpaid'})</span>
                  </div>

                  {selectedOrder.rider && selectedOrder.rider.name ? (
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold text-slate-400">Assigned Driver:</div>
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {selectedOrder.rider.name} ({selectedOrder.rider.vehicle || 'Motorcycle'})
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Plate: <strong>{selectedOrder.rider.plateNumber || 'TRK-9102'}</strong> • Phone: <strong>{selectedOrder.rider.phone || '+639194448888'}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                      Rider: Unassigned (Awaiting driver acceptance)
                    </div>
                  )}
                </div>

              </div>

              {/* Full Items Breakdown Table */}
              <div className="space-y-2 pt-2">
                <div className="font-black text-slate-900 dark:text-slate-100 flex items-center justify-between text-xs">
                  <span>Ordered Products Breakdown ({itemsList.length}):</span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3 max-h-52 overflow-y-auto">
                  {itemsList.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 italic">No products recorded for this order.</div>
                  ) : (
                    itemsList.map((item, idx) => (
                      <div key={idx} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                        <div className="flex justify-between items-start font-extrabold text-slate-900 dark:text-white text-xs">
                          <span>
                            <span className="text-purple-600 dark:text-purple-400 font-black mr-1">{item.quantity}x</span>
                            {item.name}
                          </span>
                          <span className="font-black text-slate-900 dark:text-white">
                            ₱{(item.itemTotal || item.price || 0) * (item.quantity || 1)}
                          </span>
                        </div>

                        {item.selectedVariant && (
                          <div className="text-[11px] text-slate-500 font-medium pl-4">
                            Size/Variant: <strong className="text-slate-700 dark:text-slate-300">{item.selectedVariant.name || item.selectedVariant}</strong>
                          </div>
                        )}

                        {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium pl-4 flex flex-wrap gap-1">
                            Add-ons: {item.selectedAddOns.map(a => `${a.name || a} (+₱${a.price || 0})`).join(', ')}
                          </div>
                        )}

                        {item.specialInstructions && (
                          <div className="text-[11px] text-slate-400 italic pl-4">
                            Note: "{item.specialInstructions}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Financial Telemetry Footer */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1.5 font-medium border border-slate-800">
                <div className="flex justify-between text-slate-400"><span>Items Subtotal:</span><span className="font-bold text-white">₱{selectedOrder.subtotal || selectedOrder.total - (selectedOrder.deliveryFee || 49)}</span></div>
                <div className="flex justify-between text-slate-400"><span>Delivery Logistics Fee:</span><span className="font-bold text-white">₱{selectedOrder.deliveryFee || 49}</span></div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-400"><span>Voucher Discount:</span><span className="font-bold">-₱{selectedOrder.discount}</span></div>
                )}
                <div className="flex justify-between font-black text-sm text-[#ffb100] pt-2 border-t border-slate-800">
                  <span>Grand Total Amount:</span>
                  <span className="text-base">₱{selectedOrder.total}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* MODAL 2: ADD USER MODAL */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title={editingUser ? `Edit Account: ${editingUser.name}` : (isRiderOnlyModal || userRoleInput === 'rider' ? 'Register New Delivery Rider' : 'Create New User Account')}
      >
        <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder={isRiderOnlyModal ? "e.g. Marco Santos" : "e.g. Alex Santos"}
              value={userNameInput}
              onChange={(e) => setUserNameInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder={isRiderOnlyModal ? "rider@trakz.com" : "alex.santos@example.com"}
              value={userEmailInput}
              onChange={(e) => setUserEmailInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              placeholder="+63 917 123 4567"
              value={userPhoneInput}
              onChange={(e) => setUserPhoneInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Role
              </label>
              <div className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                {userRoleInput === 'rider' ? '🛵 Rider (Delivery Fleet)' :
                 userRoleInput === 'merchant' ? '🏪 Merchant Partner' :
                 userRoleInput === 'admin' ? '🛡️ System Admin' : '👤 Customer Account'}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Status
              </label>
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => setUserStatusInput('Active')}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    userStatusInput === 'Active'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🟢 Active
                </button>
                <button
                  type="button"
                  onClick={() => setUserStatusInput('Suspended')}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                    userStatusInput === 'Suspended'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🔴 Suspended
                </button>
              </div>
            </div>
          </div>

          {(isRiderOnlyModal || userRoleInput === 'rider') && (
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-3 pt-3">
              <div className="font-extrabold text-xs text-purple-600 dark:text-purple-400">
                🛵 Delivery Fleet Vehicle Credentials
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Type
                  </label>
                  <div className="flex items-center gap-1">
                    {['Motorcycle', 'Bicycle', 'Electric Scooter'].map((vType) => (
                      <button
                        key={vType}
                        type="button"
                        onClick={() => setRiderVehicleType(vType)}
                        className={`px-2 py-1.5 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer shrink-0 ${
                          riderVehicleType === vType
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {vType === 'Motorcycle' ? '🏍️ Moto' : vType === 'Bicycle' ? '🚲 Bike' : '🛴 E-Scooter'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Vehicle Model
                  </label>
                  <input
                    type="text"
                    placeholder="Honda Click 125i"
                    value={riderVehicleModel}
                    onChange={(e) => setRiderVehicleModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  License Plate Number
                </label>
                <input
                  type="text"
                  placeholder="NKR 9102 or TRK-8821"
                  value={riderPlateNumber}
                  onChange={(e) => setRiderPlateNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                />
              </div>
            </div>
          )}

          <Button type="submit" variant="primary" fullWidth size="lg">
            {editingUser ? 'Save Account Changes' : (isRiderOnlyModal || userRoleInput === 'rider' ? 'Register Rider Account' : 'Create Account')}
          </Button>
        </form>
      </Modal>

      {/* MODAL 3: ADD NEW MERCHANT MODAL */}
      <Modal
        isOpen={isAddMerchantOpen}
        onClose={() => setIsAddMerchantOpen(false)}
        title="Register Partner Merchant Outlet"
      >
        <form onSubmit={handleCreateMerchant} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Store / Restaurant Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Manila Taco Bar"
              value={newMerchantName}
              onChange={(e) => setNewMerchantName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Business Category
            </label>
            <select
              value={newMerchantCategory}
              onChange={(e) => setNewMerchantCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100] cursor-pointer"
            >
              <option value="burgers">🍔 Burgers & Fast Food</option>
              <option value="chicken">🍗 Fried Chicken & Meals</option>
              <option value="pizza">🍕 Pizza & Pasta</option>
              <option value="milktea">🥤 Milk Tea & Beverages</option>
              <option value="asian">🍣 Asian & Filipino</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description / Tagline
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Authentic street-style tacos with handmade tortillas."
              value={newMerchantDescription}
              onChange={(e) => setNewMerchantDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
            />
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg">
            Register Outlet
          </Button>
        </form>
      </Modal>

      {/* MODAL 4: EDIT MERCHANT MODAL */}
      <Modal
        isOpen={!!editingMerchant}
        onClose={() => setEditingMerchant(null)}
        title={editingMerchant ? `Edit Store: ${editingMerchant.name}` : 'Edit Store Details'}
      >
        {editingMerchant && (
          <form onSubmit={handleSaveEditMerchant} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Store Name
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100] cursor-pointer"
              >
                <option value="burgers">🍔 Burgers & Fast Food</option>
                <option value="chicken">🍗 Fried Chicken & Meals</option>
                <option value="pizza">🍕 Pizza & Pasta</option>
                <option value="milktea">🥤 Milk Tea & Beverages</option>
                <option value="asian">🍣 Asian & Japanese</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Fee (₱)
                </label>
                <input
                  type="number"
                  value={editDeliveryFee}
                  onChange={(e) => setEditDeliveryFee(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Time
                </label>
                <input
                  type="text"
                  value={editDeliveryTime}
                  onChange={(e) => setEditDeliveryTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth size="lg">
              Save Changes
            </Button>
          </form>
        )}
      </Modal>

      {/* MODAL 5: MENU CATALOG MODAL */}
      <Modal
        isOpen={!!selectedMerchantForMenu}
        onClose={() => setSelectedMerchantForMenu(null)}
        title={selectedMerchantForMenu ? `${selectedMerchantForMenu.name} — Menu Catalog` : 'Store Catalog'}
        maxWidth="max-w-3xl"
      >
        {selectedMerchantForMenu && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMerchantForMenu.logo}
                  alt={selectedMerchantForMenu.name}
                  className="w-12 h-12 rounded-2xl object-cover shrink-0"
                />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                    {selectedMerchantForMenu.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Delivery Fee: ₱{selectedMerchantForMenu.deliveryFee} • {selectedMerchantForMenu.estimatedDeliveryTime}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleToggleMerchantStatus(selectedMerchantForMenu.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${
                  selectedMerchantForMenu.isOpen
                    ? 'bg-rose-500/20 text-rose-500'
                    : 'bg-emerald-500/20 text-emerald-500'
                }`}
              >
                {selectedMerchantForMenu.isOpen ? 'Close Store Outlet' : 'Open Store Outlet'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {merchantProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 flex gap-3 items-center"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {prod.name}
                    </h5>
                    <p className="text-[11px] text-slate-500 truncate">{prod.description}</p>
                    <div className="font-black text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                      ₱{prod.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
