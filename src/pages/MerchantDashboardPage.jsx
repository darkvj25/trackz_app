import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  RefreshCw,
  ExternalLink,
  ChefHat,
  Package,
  TrendingUp,
  Power,
  Edit3,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Upload,
  Image,
  Trash2,
  Phone,
  MapPin,
  User,
  Bike,
  LogOut
} from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useTheme } from '../hooks/useTheme';
import { ORDER_STATUS } from '../utils/constants';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { mockProducts } from '../data/mockProducts';
import { mockMerchants } from '../data/mockMerchants';
import { merchantService } from '../services/merchantService';
import { productService } from '../services/productService';
import { MapLocationPicker } from '../components/common/MapLocationPicker';

export const MerchantDashboardPage = () => {
  const navigate = useNavigate();
  const { orders, updateSimulatedOrderStatus, refreshOrders } = useOrders();
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  const { toggleTheme, isDark } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation & Modal State
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'store' | 'analytics'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper to format clean store name without duplicate "'s Store"
  const formatDefaultStoreName = (fullName, storeName) => {
    if (storeName && storeName.trim()) {
      return storeName.trim();
    }
    if (!fullName || !fullName.trim()) return 'My Store';
    const name = fullName.trim();
    if (/\bstore\b/i.test(name)) {
      return name;
    }
    return `${name}'s Store`;
  };

  // Store Details State
  const merchantName = formatDefaultStoreName(user?.fullName, user?.storeName);
  const merchantId = user?.merchantId || user?.id || null;
  const [isOpen, setIsOpen] = useState(true);

  // Store Edit Settings State
  const [storeEditName, setStoreEditName] = useState('');
  const [storeEditCategory, setStoreEditCategory] = useState('burgers');
  const [storeEditDesc, setStoreEditDesc] = useState('');
  const [storeEditLogo, setStoreEditLogo] = useState('');
  const [storeEditCover, setStoreEditCover] = useState('');
  const [storeEditFee, setStoreEditFee] = useState(49);
  const [storeEditTime, setStoreEditTime] = useState('20-30 min');
  const [storeEditMinOrder, setStoreEditMinOrder] = useState(100);
  const [storeEditPromo, setStoreEditPromo] = useState('');
  const [storeEditAddress, setStoreEditAddress] = useState('Bonifacio High Street');
  const [storeEditCity, setStoreEditCity] = useState('Taguig City');
  const [storeEditLat, setStoreEditLat] = useState(14.5515);
  const [storeEditLng, setStoreEditLng] = useState(121.0505);
  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [savingStore, setSavingStore] = useState(false);

  // Products / Menu State
  const initialStoreProducts = useMemo(() => {
    if (!merchantId && !merchantName) return [];
    let customProds = [];
    try {
      const stored = JSON.parse(localStorage.getItem('trakz_custom_products') || '[]');
      if (Array.isArray(stored)) {
        customProds = stored.filter(p =>
          (merchantId && p.merchantId === merchantId) ||
          (merchantName && p.merchantName?.toLowerCase() === merchantName?.toLowerCase())
        );
      }
    } catch (e) {}

    const matchedMock = mockProducts.filter(p =>
      (merchantId && p.merchantId === merchantId) ||
      (merchantName && p.merchantName?.toLowerCase() === merchantName?.toLowerCase())
    );

    return [...customProds, ...matchedMock];
  }, [merchantId, merchantName]);

  const [productsList, setProductsList] = useState(initialStoreProducts);

  // Auto-sync merchant store & products to MySQL database
  useEffect(() => {
    if (!user || !user.id || !merchantId || !merchantName || merchantId === 'merch-new') return;

    const syncMerchantAndProducts = async () => {
      // 1. Sync merchant store entry
      try {
        await merchantService.updateMerchant(merchantId, {
          id: merchantId,
          name: storeEditName || merchantName,
          description: storeEditDesc || 'Delicious products & fresh local store delivery',
          logo: storeEditLogo || user?.avatar || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
          coverImage: storeEditCover || user?.coverImage || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
          category: storeEditCategory || user?.category || 'burgers',
          categoryName: (storeEditCategory || user?.category || 'BURGERS').toUpperCase(),
          address: storeEditAddress || user?.address || 'Bonifacio High Street',
          city: storeEditCity || user?.city || 'Taguig City',
          latitude: storeEditLat !== undefined ? parseFloat(storeEditLat) : (user?.latitude !== undefined ? parseFloat(user.latitude) : 14.5515),
          longitude: storeEditLng !== undefined ? parseFloat(storeEditLng) : (user?.longitude !== undefined ? parseFloat(user.longitude) : 121.0505)
        });
      } catch (err) {
        console.warn('Merchant auto-sync warning:', err);
      }

      // 2. Sync any local products in localStorage (like Coffee Machiato) to MySQL DB
      try {
        const stored = JSON.parse(localStorage.getItem('trakz_custom_products') || '[]');
        if (Array.isArray(stored) && stored.length > 0) {
          for (const item of stored) {
            await productService.createProduct({
              ...item,
              merchantId: item.merchantId || merchantId,
              merchantName: item.merchantName || merchantName
            }).catch(() => {});
          }
        }
      } catch (e) {}

      // 3. Re-fetch merged products from productService to update state
      try {
        const prods = await productService.getProductsByMerchant(merchantId);
        if (Array.isArray(prods) && prods.length > 0) {
          setProductsList(prods);
        }
      } catch (e) {}
    };

    syncMerchantAndProducts();
  }, [merchantId, merchantName, user?.avatar, user?.category]);

  // Load current store details for editing
  useEffect(() => {
    if (!merchantId) return;
    const fetchCurrentStore = async () => {
      try {
        const store = await merchantService.getMerchantById(merchantId);
        if (store) {
          setStoreEditName(store.name || merchantName || '');
          setStoreEditCategory(store.category || 'burgers');
          setStoreEditDesc(store.description || 'Delicious products & fresh local store delivery');
          setStoreEditLogo(store.logo || user?.avatar || '');
          setLogoPreview(store.logo || user?.avatar || null);
          setStoreEditCover(store.coverImage || '');
          setCoverPreview(store.coverImage || null);
          setStoreEditFee(store.deliveryFee !== undefined ? store.deliveryFee : 49);
          setStoreEditTime(store.estimatedDeliveryTime || '20-30 min');
          setStoreEditMinOrder(store.minOrderAmount !== undefined ? store.minOrderAmount : 100);
          setStoreEditPromo(store.promoBadge || '');
          setStoreEditAddress(store.address || 'Bonifacio High Street');
          setStoreEditCity(store.city || 'Taguig City');
          setStoreEditLat(store.latitude !== undefined && store.latitude !== null ? store.latitude : 14.5515);
          setStoreEditLng(store.longitude !== undefined && store.longitude !== null ? store.longitude : 121.0505);
        }
      } catch (e) {
        setStoreEditName(merchantName || '');
        setStoreEditLogo(user?.avatar || '');
      }
    };
    fetchCurrentStore();
  }, [merchantId, merchantName, user?.avatar]);

  const handleSaveStoreProfile = async (e) => {
    e.preventDefault();
    if (!storeEditName.trim()) {
      showToast('Store name is required', 'error');
      return;
    }

    setSavingStore(true);
    const updatedStore = {
      id: merchantId,
      name: storeEditName,
      category: storeEditCategory,
      categoryName: storeEditCategory.toUpperCase(),
      description: storeEditDesc,
      logo: storeEditLogo || user?.avatar || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
      coverImage: storeEditCover || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
      deliveryFee: parseFloat(storeEditFee) || 0,
      estimatedDeliveryTime: storeEditTime || '20-30 min',
      minOrderAmount: parseFloat(storeEditMinOrder) || 0,
      promoBadge: storeEditPromo.trim() || null,
      address: storeEditAddress.trim() || 'Bonifacio High Street',
      city: storeEditCity.trim() || 'Taguig City',
      latitude: parseFloat(storeEditLat) || 14.5515,
      longitude: parseFloat(storeEditLng) || 121.0505
    };

    try {
      await merchantService.updateMerchant(merchantId, updatedStore);

      if (updateProfile) {
        await updateProfile({
          storeName: storeEditName,
          avatar: updatedStore.logo,
          address: updatedStore.address,
          city: updatedStore.city,
          latitude: updatedStore.latitude,
          longitude: updatedStore.longitude
        }).catch(() => {});
      }

      showToast(`Store details & profile updated for "${storeEditName}"! 🏪`, 'success');
    } catch (err) {
      showToast(`Could not update store details: ${err.message}`, 'error');
    } finally {
      setSavingStore(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size should be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreEditLogo(reader.result);
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size should be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoreEditCover(reader.result);
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Main Courses');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  // Handle Image Upload & Conversion
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image file size should be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProdImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewProdImage('');
    setImagePreview(null);
  };

  // Filter Orders Relevant to this Merchant
  const merchantOrders = useMemo(() => {
    return orders.filter(o => {
      const matchMerchant = o.merchantId === merchantId || o.merchantName?.toLowerCase() === merchantName.toLowerCase();
      const matchSearch = !searchTerm ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = orderStatusFilter === 'ALL' || o.orderStatus === orderStatusFilter;
      return matchMerchant && matchSearch && matchStatus;
    });
  }, [orders, merchantId, merchantName, searchTerm, orderStatusFilter]);

  // Merchant Key Metrics
  const stats = useMemo(() => {
    const totalRev = merchantOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingCount = merchantOrders.filter(
      o => o.orderStatus === ORDER_STATUS.PENDING || o.orderStatus === ORDER_STATUS.PREPARING
    ).length;
    const completedCount = merchantOrders.filter(
      o => o.orderStatus === ORDER_STATUS.DELIVERED
    ).length;

    return {
      totalRevenue: totalRev,
      totalOrders: merchantOrders.length,
      pendingOrders: pendingCount,
      completedOrders: completedCount,
      activeMenuCount: productsList.filter(p => p.isAvailable !== false).length
    };
  }, [merchantOrders, productsList]);

  // Handle Order Status Progression (Merchant Responsibility!)
  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      await updateSimulatedOrderStatus(orderId, nextStatus);
      showToast(`Order #${orderId} status set to "${nextStatus}"! 🍳`, 'success');
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: nextStatus }));
      }
    } catch (err) {
      showToast(`Could not update status: ${err.message}`, 'error');
    }
  };

  // Handle Toggle Product Availability
  const handleToggleProductStock = async (productId) => {
    const prod = productsList.find(p => p.id === productId);
    if (!prod) return;

    const nextState = !prod.isAvailable;
    const updated = { ...prod, isAvailable: nextState };

    setProductsList(prev => prev.map(p => p.id === productId ? updated : p));

    try {
      await productService.updateProduct(productId, updated);
      showToast(`"${prod.name}" marked as ${nextState ? 'IN STOCK 🟢' : 'OUT OF STOCK 🔴'}`, nextState ? 'success' : 'info');
    } catch (err) {
      console.warn('Failed to update stock status:', err);
    }
  };

  // Dynamic Product Variants & Add-ons State
  const [newProdVariants, setNewProdVariants] = useState([]);
  const [newProdAddOns, setNewProdAddOns] = useState([]);
  const [variantNameInput, setVariantNameInput] = useState('');
  const [variantPriceInput, setVariantPriceInput] = useState('');
  const [addOnNameInput, setAddOnNameInput] = useState('');
  const [addOnPriceInput, setAddOnPriceInput] = useState('');

  const handleAddVariant = () => {
    if (!variantNameInput.trim()) return;
    const newV = {
      id: `v-${Date.now()}`,
      name: variantNameInput.trim(),
      price: parseFloat(variantPriceInput) || 0
    };
    setNewProdVariants(prev => [...prev, newV]);
    setVariantNameInput('');
    setVariantPriceInput('');
  };

  const handleRemoveVariant = (vId) => {
    setNewProdVariants(prev => prev.filter(v => v.id !== vId));
  };

  const handleAddAddOn = () => {
    if (!addOnNameInput.trim()) return;
    const newA = {
      id: `a-${Date.now()}`,
      name: addOnNameInput.trim(),
      price: parseFloat(addOnPriceInput) || 0
    };
    setNewProdAddOns(prev => [...prev, newA]);
    setAddOnNameInput('');
    setAddOnPriceInput('');
  };

  const handleRemoveAddOn = (aId) => {
    setNewProdAddOns(prev => prev.filter(a => a.id !== aId));
  };

  // Open Modal for Adding New Product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdCategory('Main Courses');
    setNewProdDesc('');
    setNewProdImage('');
    setNewProdVariants([]);
    setNewProdAddOns([]);
    setVariantNameInput('');
    setVariantPriceInput('');
    setAddOnNameInput('');
    setAddOnPriceInput('');
    setImagePreview(null);
    setIsAddProductOpen(true);
  };

  // Open Modal for Editing Existing Product
  const handleStartEditProduct = (prod) => {
    setEditingProduct(prod);
    setNewProdName(prod.name || '');
    setNewProdPrice(prod.price !== undefined ? String(prod.price) : '');
    setNewProdCategory(prod.category || 'Main Courses');
    setNewProdDesc(prod.description || '');
    setNewProdImage(prod.image || '');
    setNewProdVariants(Array.isArray(prod.variants) ? prod.variants : []);
    setNewProdAddOns(Array.isArray(prod.addOns) ? prod.addOns : []);
    setVariantNameInput('');
    setVariantPriceInput('');
    setAddOnNameInput('');
    setAddOnPriceInput('');
    setImagePreview(prod.image || null);
    setIsAddProductOpen(true);
  };

  // Save Product (Add or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) {
      showToast('Please provide product name and price', 'error');
      return;
    }

    if (editingProduct) {
      // EDIT PRODUCT
      const updatedData = {
        ...editingProduct,
        name: newProdName,
        price: parseFloat(newProdPrice),
        category: newProdCategory,
        description: newProdDesc || 'Freshly prepared item',
        image: newProdImage || editingProduct.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        variants: newProdVariants,
        addOns: newProdAddOns
      };

      try {
        await productService.updateProduct(editingProduct.id, updatedData);
        setProductsList(prev => prev.map(p => p.id === editingProduct.id ? updatedData : p));
        showToast(`"${updatedData.name}" updated in catalog! ✏️`, 'success');
      } catch (err) {
        showToast(`Could not update product: ${err.message}`, 'error');
      }
    } else {
      // ADD PRODUCT
      const newProd = {
        id: `prod-${Date.now()}`,
        merchantId,
        merchantName,
        name: newProdName,
        price: parseFloat(newProdPrice),
        category: newProdCategory,
        description: newProdDesc || 'Freshly prepared item',
        image: newProdImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isPopular: false,
        rating: 5.0,
        variants: newProdVariants,
        addOns: newProdAddOns
      };

      try {
        await productService.createProduct(newProd);
        setProductsList(prev => [newProd, ...prev]);
        showToast(`"${newProd.name}" added to menu catalog! 🍽️`, 'success');
      } catch (err) {
        showToast(`Could not add product: ${err.message}`, 'error');
      }
    }

    setEditingProduct(null);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
    setNewProdImage('');
    setNewProdVariants([]);
    setNewProdAddOns([]);
    setImagePreview(null);
    setIsAddProductOpen(false);
  };

  // Delete Product
  const handleDeleteProduct = async (prod) => {
    if (!window.confirm(`Are you sure you want to delete "${prod.name}" from your store menu catalog?`)) {
      return;
    }

    try {
      await productService.deleteProduct(prod.id);
      setProductsList(prev => prev.filter(p => p.id !== prod.id));
      showToast(`"${prod.name}" deleted from store catalog! 🗑️`, 'info');
    } catch (err) {
      showToast(`Could not delete product: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070d19] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">

      {/* Top Merchant Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-lg px-4 sm:px-6 py-3">
        <div className="w-full px-2 sm:px-4 flex items-center justify-between gap-4">

          {/* Left: Branding & Mobile Drawer Switch */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 md:hidden transition-colors"
            >
              {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-[#0a1c36] font-black text-xl flex items-center justify-center shadow-lg">
                🏪
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight leading-none text-white">
                    {merchantName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ffb100]/20 text-[#ffb100] border border-[#ffb100]/40 text-[10px] font-black tracking-widest uppercase">
                    MERCHANT PORTAL
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 leading-none mt-1">
                  Store Kitchen & Order Fulfillment Dashboard
                </span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Store Status Toggle */}
            <button
              onClick={() => {
                const nextState = !isOpen;
                setIsOpen(nextState);
                showToast(`Store is now ${nextState ? 'ONLINE 🟢' : 'OFFLINE 🔴'}`, nextState ? 'success' : 'info');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                isOpen
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
              }`}
            >
              <Power size={14} />
              <span>{isOpen ? 'STORE ONLINE' : 'STORE CLOSED'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-purple-400" />}
            </button>

            {/* Edit Store Profile Button */}
            <button
              onClick={() => setActiveTab('store')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
            >
              <Edit3 size={14} className="text-[#ffb100]" />
              <span className="hidden sm:inline">Edit Store Profile</span>
            </button>

            {/* View Store Page */}
            <Link
              to={`/merchants/${merchantId}`}
              className="px-3 py-1.5 rounded-xl bg-[#ffb100] hover:bg-[#e09c00] text-[#0a1c36] font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Store Page</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              title="Log Out of Merchant Account"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">

        {/* Sidebar Navigation */}
        <aside className="hidden md:block w-64 shrink-0 space-y-2">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-3 border border-slate-200 dark:border-slate-800/80 shadow-card space-y-1 sticky top-20">
            <div className="px-3 py-2 text-[11px] font-black tracking-wider text-slate-400 uppercase">
              Merchant Operations
            </div>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#0a1c36] text-[#ffb100] shadow-md dark:bg-[#1a2b48]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ChefHat size={18} className={activeTab === 'orders' ? 'text-[#ffb100]' : 'text-slate-400'} />
                <span>Live Kitchen Orders</span>
              </div>
              {stats.pendingOrders > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-[#0a1c36]">
                  {stats.pendingOrders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#0a1c36] text-[#ffb100] shadow-md dark:bg-[#1a2b48]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package size={18} className={activeTab === 'products' ? 'text-[#ffb100]' : 'text-slate-400'} />
                <span>Menu & Inventory</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {stats.activeMenuCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('store')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'store'
                  ? 'bg-[#0a1c36] text-[#ffb100] shadow-md dark:bg-[#1a2b48]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Store size={18} className={activeTab === 'store' ? 'text-[#ffb100]' : 'text-slate-400'} />
                <span>Store Profile & Info</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#0a1c36] text-[#ffb100] shadow-md dark:bg-[#1a2b48]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp size={18} className={activeTab === 'analytics' ? 'text-[#ffb100]' : 'text-slate-400'} />
                <span>Sales Analytics</span>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-extrabold text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer mt-1 border border-rose-500/20"
            >
              <div className="flex items-center gap-3">
                <LogOut size={18} />
                <span>Log Out</span>
              </div>
            </button>

            {/* Merchant Annual Registration Fee & Membership Pass Widget */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 space-y-2">
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0a1c36] to-slate-900 border border-[#ffb100]/40 text-white space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#ffb100]">
                    <ShieldCheck size={15} />
                    <span>Annual Partner Pass</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-black uppercase">
                    Active 🟢
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-snug">
                  Fee: <strong className="text-emerald-400 font-bold">₱0.00 (Waived)</strong>
                </div>

                <div className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                  <Sparkles size={12} className="text-emerald-400" />
                  <span>Hanap Shop Merchant Promo</span>
                </div>

                <button
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="w-full py-1.5 rounded-xl bg-[#ffb100] hover:bg-[#e09c00] text-[#0a1c36] font-extrabold text-[11px] transition-colors cursor-pointer mt-1"
                >
                  Manage Membership
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Dashboard Content */}
        <main className="flex-1 space-y-6">

          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase">Today's Revenue</div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">₱{stats.totalRevenue.toLocaleString()}</div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase">Total Orders</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalOrders}</div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase">Pending Prep</div>
              <div className="text-2xl font-black text-[#ffb100]">{stats.pendingOrders}</div>
            </div>

            <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase">Completed</div>
              <div className="text-2xl font-black text-emerald-500">{stats.completedOrders}</div>
            </div>
          </div>

          {/* TAB 1: LIVE KITCHEN ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    Merchant Order Fulfillment Panel
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Accept orders, update status & manage item preparation for {merchantName}
                  </p>
                </div>

                <div className="relative flex items-center w-full sm:w-64">
                  <Search size={15} className="absolute left-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search order ID or customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#ffb100]/50"
                  />
                </div>
              </div>

              {/* Status Filter Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {['ALL', ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING, ORDER_STATUS.RIDER_ASSIGNED, ORDER_STATUS.ON_THE_WAY, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                      orderStatusFilter === st
                        ? 'bg-[#0a1c36] text-[#ffb100] shadow-md dark:bg-[#ffb100] dark:text-[#0a1c36]'
                        : 'bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800/80 hover:bg-slate-50'
                    }`}
                  >
                    {st === 'ALL' ? 'All Store Orders' : st}
                  </button>
                ))}
              </div>

              {/* Orders List / Cards */}
              <div className="space-y-4">
                {merchantOrders.length === 0 ? (
                  <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-10 text-center space-y-3 border border-slate-200/80 dark:border-slate-800/80">
                    <ChefHat size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No Store Orders Found</h3>
                    <p className="text-xs text-slate-500">Incoming orders for {merchantName} will appear here live.</p>
                  </div>
                ) : (
                  merchantOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-[#0f172a] rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-4"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-base text-slate-900 dark:text-white">Order #{order.id}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#ffb100]/20 text-[#ffb100] border border-[#ffb100]/30">
                            {order.orderStatus}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                            {order.paymentMethod} • {order.paymentStatus || 'Paid'}
                          </span>
                          {order.createdAt && (
                            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 ml-1">
                              <Clock size={12} />
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                        >
                          Full Ticket Details
                        </button>
                      </div>

                      {/* Main Body Grid: Left = Kitchen Items & Financials, Right = Customer & Dispatch Info */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs">

                        {/* LEFT COLUMN: Items Breakdown (Kitchen View) */}
                        <div className="md:col-span-7 space-y-3">
                          <div className="font-black text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <ChefHat size={14} className="text-[#ffb100]" />
                            <span>Ordered Items ({order.items?.length || 0})</span>
                          </div>

                          <div className="space-y-2 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="pb-2 border-b border-slate-200/60 dark:border-slate-800/60 last:border-0 last:pb-0 space-y-1">
                                <div className="flex justify-between items-start font-bold text-slate-900 dark:text-slate-100">
                                  <span>
                                    <span className="text-purple-600 dark:text-purple-400 font-black mr-1">{item.quantity}x</span>
                                    {item.name}
                                  </span>
                                  <span className="font-black">₱{(item.itemTotal || item.price || 0) * item.quantity}</span>
                                </div>

                                {item.selectedVariant && (
                                  <div className="text-[11px] text-slate-500 font-medium pl-4">
                                    Size/Variant: <strong className="text-slate-700 dark:text-slate-300">{item.selectedVariant.name}</strong>
                                    {item.selectedVariant.price > 0 && ` (+₱${item.selectedVariant.price})`}
                                  </div>
                                )}

                                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                                  <div className="text-[11px] text-slate-500 font-medium pl-4 flex flex-wrap gap-1 items-center">
                                    <span>Add-ons:</span>
                                    {item.selectedAddOns.map((a, aIdx) => (
                                      <span key={aIdx} className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                                        +{a.name} (₱{a.price})
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {item.specialInstructions && (
                                  <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold pl-4 italic">
                                    Note: "{item.specialInstructions}"
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs font-bold pt-1 text-slate-700 dark:text-slate-300">
                            <span>Total Payable Amount:</span>
                            <span className="text-purple-600 dark:text-purple-400 font-black text-base">₱{order.total}</span>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Customer Details & Delivery Address */}
                        <div className="md:col-span-5 space-y-3 pl-0 md:pl-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0">
                          <div className="font-black text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <User size={14} className="text-purple-500" />
                            <span>Customer & Delivery Details</span>
                          </div>

                          <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                            {/* Customer Name & Phone */}
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="font-black text-slate-900 dark:text-white text-xs">
                                  {order.customerName || order.deliveryAddress?.recipientName || 'Balandoy'}
                                </div>
                                <div className="text-[11px] font-bold text-slate-500">
                                  {order.deliveryAddress?.phone || order.customerPhone || '+63 917 123 4567'}
                                </div>
                              </div>

                              {(order.deliveryAddress?.phone || order.customerPhone) && (
                                <a
                                  href={`tel:${order.deliveryAddress?.phone || order.customerPhone}`}
                                  className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                                >
                                  <Phone size={11} />
                                  <span>Call</span>
                                </a>
                              )}
                            </div>

                            {/* Delivery Address */}
                            <div className="space-y-0.5 text-[11px]">
                              <div className="font-bold text-slate-400 flex items-center gap-1">
                                <MapPin size={12} className="text-rose-500 shrink-0" />
                                <span>Dropoff Location:</span>
                              </div>
                              <div className="font-medium text-slate-800 dark:text-slate-200 pl-4 leading-snug">
                                {order.deliveryAddress?.street ? (
                                  <>
                                    {order.deliveryAddress.street}, {order.deliveryAddress.barangay || ''} {order.deliveryAddress.city || 'Taguig'}
                                  </>
                                ) : (
                                  'Taguig City, Metro Manila'
                                )}
                              </div>
                            </div>

                            {/* Instructions */}
                            {order.deliveryInstructions && (
                              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                Delivery Instruction: "{order.deliveryInstructions}"
                              </div>
                            )}

                            {/* Rider Info if assigned */}
                            {order.rider && order.rider.name && ['rider assigned', 'picked up', 'on the way', 'delivered'].includes(String(order.orderStatus || '').toLowerCase()) ? (
                              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px] space-y-0.5">
                                <div className="font-bold text-slate-400 flex items-center gap-1">
                                  <Bike size={12} className="text-amber-500 shrink-0" />
                                  <span>Assigned Rider:</span>
                                </div>
                                <div className="font-extrabold text-slate-800 dark:text-slate-200 pl-4">
                                  {order.rider.name} ({order.rider.vehicle || 'Rider'}) • {order.rider.phone || '+639194448888'}
                                </div>
                              </div>
                            ) : (
                              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px] space-y-0.5">
                                <div className="font-bold text-slate-400 flex items-center gap-1">
                                  <Bike size={12} className="text-amber-500/60 shrink-0" />
                                  <span>Rider Dispatch:</span>
                                </div>
                                <div className="font-bold text-amber-500/90 pl-4">
                                  Unassigned • Waiting for nearby rider
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* MERCHANT ORDER STATUS CONTROLS */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Total Amount: <span className="text-purple-600 dark:text-purple-400 font-black text-sm">₱{order.total}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-slate-400 mr-1">Merchant Status Action:</span>
                          <button
                            onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.PREPARING)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-[#0a1c36] text-xs font-bold transition-all cursor-pointer"
                          >
                            Set Preparing 🍳
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.RIDER_ASSIGNED)}
                            className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-600 text-purple-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            Ready for Rider 🛵
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.ON_THE_WAY)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-600 text-indigo-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            On the Way 🚚
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.DELIVERED)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            Delivered ✅
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MENU & INVENTORY MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    Store Menu & Catalog
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Manage food products, set pricing & toggle item stock availability
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAddModal}
                  icon={Plus}
                >
                  Add New Item
                </Button>
              </div>

              {/* Product Catalog Grid */}
              {productsList.length === 0 ? (
                <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-10 text-center space-y-3 border border-slate-200/80 dark:border-slate-800/80">
                  <Package size={40} className="mx-auto text-slate-300 dark:text-slate-600" />
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No Menu Items Yet</h3>
                  <p className="text-xs text-slate-500">Your store menu catalog is currently empty. Click "Add New Item" to create your first item!</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenAddModal}
                    icon={Plus}
                  >
                    Add Your First Item
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsList.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white dark:bg-[#0f172a] rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="relative">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-36 rounded-2xl object-cover"
                          />
                          <div className="absolute top-2 right-2 flex items-center gap-1.5">
                            <button
                              onClick={() => handleStartEditProduct(prod)}
                              className="p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-purple-600 transition-colors backdrop-blur-md cursor-pointer"
                              title="Edit item"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod)}
                              className="p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors backdrop-blur-md cursor-pointer"
                              title="Delete item"
                            >
                              <Trash2 size={12} />
                            </button>
                            <button
                              onClick={() => handleToggleProductStock(prod.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md cursor-pointer ${
                                prod.isAvailable !== false
                                  ? 'bg-emerald-500/90 text-white'
                                  : 'bg-rose-500/90 text-white'
                              }`}
                            >
                              {prod.isAvailable !== false ? 'In Stock 🟢' : 'Sold Out 🔴'}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {prod.name}
                          </h3>
                          <span className="font-black text-purple-600 dark:text-purple-400 text-sm">
                            ₱{prod.price}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-2">
                          {prod.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">
                          {prod.category || 'Main Course'}
                        </span>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleStartEditProduct(prod)}
                            className="text-xs font-bold text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            className="text-xs font-bold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ANALYTICS & SALES */}
          {activeTab === 'analytics' && (
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-4 text-center">
              <TrendingUp size={48} className="mx-auto text-[#ffb100]" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Store Analytics & Performance</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Live order telemetry, top selling items, and monthly store revenue reports for {merchantName}.
              </p>
            </div>
          )}

          {/* TAB 4: STORE PROFILE & DETAILS */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    Store Profile & Information
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Manage store branding, cuisine category, tagline, logo, cover banner & delivery details
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveStoreProfile} className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-card space-y-6 w-full">

                {/* Banner & Logo Visual Preview */}
                <div className="space-y-3">
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-wider">
                    Store Branding & Visuals
                  </label>

                  <div className="relative h-48 sm:h-56 rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-md">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover Banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                        No Store Cover Banner Set
                      </div>
                    )}

                    {/* Dark gradient overlay for text legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent pointer-events-none" />

                    <label className="absolute top-3 right-3 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-extrabold text-[11px] backdrop-blur-md cursor-pointer transition-all flex items-center gap-1.5 shadow-md border border-white/10">
                      <Upload size={14} />
                      <span>Upload Cover Banner</span>
                      <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                    </label>

                    {/* Logo Overlay */}
                    <div className="absolute left-4 sm:left-6 bottom-4 flex items-center gap-4 z-10">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-900 shadow-xl bg-slate-100 dark:bg-slate-800 relative group shrink-0">
                        <img
                          src={logoPreview || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80'}
                          alt="Store Logo"
                          className="w-full h-full object-cover"
                        />
                        <label className="absolute inset-0 bg-slate-900/75 text-white font-bold text-[10px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <Upload size={14} />
                          <span>Change Logo</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                      </div>
                      <div className="text-white drop-shadow-md">
                        <div className="font-black text-base sm:text-xl leading-tight">{storeEditName || merchantName}</div>
                        <div className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider mt-0.5">{storeEditCategory}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields Section 1: Basic Store Info */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                    General Store Information
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                        Store Outlet Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Van Jasper Benzon's Store"
                        value={storeEditName}
                        onChange={(e) => setStoreEditName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                        Cuisine Category
                      </label>
                      <select
                        value={storeEditCategory}
                        onChange={(e) => setStoreEditCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100] cursor-pointer"
                      >
                        <option value="burgers">🍔 Burgers & Fast Food</option>
                        <option value="chicken">🍗 Fried Chicken & Meals</option>
                        <option value="pizza">🍕 Pizza & Pasta</option>
                        <option value="milktea">🥤 Milk Tea & Beverages</option>
                        <option value="asian">🍣 Asian & Japanese</option>
                        <option value="filipino">🍲 Filipino Local Favorites</option>
                        <option value="bakery">🍰 Bakery & Desserts</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                        Store Description & Tagline
                      </label>
                      <textarea
                        rows="2"
                        placeholder="e.g. Delicious products & fresh local store delivery"
                        value={storeEditDesc}
                        onChange={(e) => setStoreEditDesc(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Fields Section 2: Logistics & Pricing */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                    Delivery Logistics & Pricing Settings
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                        Delivery Fee (₱)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 49"
                        value={storeEditFee}
                        onChange={(e) => setStoreEditFee(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                        Estimated Delivery Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 20-30 min"
                        value={storeEditTime}
                        onChange={(e) => setStoreEditTime(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                        Minimum Order (₱)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 100"
                        value={storeEditMinOrder}
                        onChange={(e) => setStoreEditMinOrder(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                        Promo Badge / Notice
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 10% OFF First Order"
                        value={storeEditPromo}
                        onChange={(e) => setStoreEditPromo(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Fields Section 3: Store Location & Address on Map */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                    <MapPin size={14} className="text-amber-500" />
                    <span>Store Location Address & Map Pin</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                        Street Address / Building / Landmark <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 7th Ave, Bonifacio High Street, BGC"
                        value={storeEditAddress}
                        onChange={(e) => setStoreEditAddress(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                      />
                    </div>

                    <div>
                      <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">
                        City / District <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Taguig City"
                        value={storeEditCity}
                        onChange={(e) => setStoreEditCity(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-[#ffb100]"
                      />
                    </div>
                  </div>

                  {/* Embedded Interactive Map Location Picker */}
                  <MapLocationPicker
                    latitude={storeEditLat}
                    longitude={storeEditLng}
                    address={storeEditAddress}
                    city={storeEditCity}
                    label="Store Map Pin (Click or drag marker to set exact store pin on map)"
                    onChange={({ latitude, longitude, address, city }) => {
                      setStoreEditLat(latitude);
                      setStoreEditLng(longitude);
                      if (address) setStoreEditAddress(address);
                      if (city) setStoreEditCity(city);
                    }}
                  />
                </div>



                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={savingStore}
                    icon={CheckCircle2}
                  >
                    {savingStore ? 'Saving Changes...' : 'Save Store Details'}
                  </Button>
                </div>

              </form>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: ORDER DETAILS MODAL */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Store Order Details #${selectedOrder?.id || ''}`}
      >
        {selectedOrder && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div>
                <div className="font-extrabold text-slate-900 dark:text-white text-sm">{selectedOrder.customerName || 'Customer'}</div>
                <div className="text-xs font-bold text-slate-500 mt-1">Payment: {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#ffb100]/20 text-[#ffb100] font-extrabold uppercase text-[10px]">
                {selectedOrder.orderStatus}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 dark:text-slate-100">Ordered Products:</div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-bold">{item.quantity}x</span> {item.name}
                    </div>
                    <span className="font-bold">₱{item.itemTotal || (item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Merchant Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-slate-900 dark:text-slate-100">Update Fulfillment Status:</div>
              <div className="grid grid-cols-2 gap-2">
                {[ORDER_STATUS.PREPARING, ORDER_STATUS.RIDER_ASSIGNED, ORDER_STATUS.ON_THE_WAY, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#ffb100] hover:text-[#0a1c36] text-[11px] font-bold transition-all text-center cursor-pointer"
                  >
                    Set {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 2: ADD / EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isAddProductOpen}
        onClose={() => {
          setIsAddProductOpen(false);
          setEditingProduct(null);
          setImagePreview(null);
          setNewProdImage('');
        }}
        title={editingProduct ? `Edit Menu Item: ${editingProduct.name}` : "Add New Menu Product"}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold mb-1">Product Item Name</label>
            <input
              type="text"
              required
              placeholder='e.g. Special Truffle Pizza 12"'
              value={newProdName}
              onChange={(e) => setNewProdName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Price (₱)</label>
            <input
              type="number"
              required
              placeholder="e.g. 350"
              value={newProdPrice}
              onChange={(e) => setNewProdPrice(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Product Category</label>
            <select
              value={newProdCategory}
              onChange={(e) => setNewProdCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
            >
              <option value="Main Courses">Main Courses</option>
              <option value="Appetizers & Snacks">Appetizers & Snacks</option>
              <option value="Beverages & Drinks">Beverages & Drinks</option>
              <option value="Desserts & Sweets">Desserts & Sweets</option>
              <option value="Combos & Deals">Combos & Deals</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold">Product Photo</label>
              <span className="text-[10px] text-slate-400 font-medium">Upload photo or paste URL</span>
            </div>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 h-36 group">
                <img src={imagePreview} alt="Product Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  title="Remove photo"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center w-full h-28 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer text-center p-3">
                  <Upload size={22} className="text-amber-500 mb-1" />
                  <span className="font-extrabold text-xs text-slate-700 dark:text-slate-300">
                    Click to upload product image
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Supports PNG, JPG, WEBP (Max 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                <div className="relative flex items-center">
                  <Image size={14} className="absolute left-3 text-slate-400" />
                  <input
                    type="url"
                    placeholder="Or paste image URL (https://...)"
                    value={newProdImage}
                    onChange={(e) => {
                      setNewProdImage(e.target.value);
                      setImagePreview(e.target.value || null);
                    }}
                    className="w-full pl-9 pr-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold mb-1">Item Description</label>
            <textarea
              placeholder="Fresh ingredients, baked to order..."
              value={newProdDesc}
              onChange={(e) => setNewProdDesc(e.target.value)}
              className="w-full px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
            />
          </div>

          {/* Variants & Sizes Management */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="block font-bold">Item Variants & Sizes (Optional)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Variant name (e.g. Large / 12-inch)"
                value={variantNameInput}
                onChange={(e) => setVariantNameInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
              />
              <input
                type="number"
                placeholder="+Price (₱)"
                value={variantPriceInput}
                onChange={(e) => setVariantPriceInput(e.target.value)}
                className="w-24 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
              />
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-3 py-2 rounded-xl bg-purple-600 text-white font-extrabold text-xs hover:bg-purple-700 transition-colors cursor-pointer"
              >
                + Add
              </button>
            </div>
            {newProdVariants.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {newProdVariants.map((v) => (
                  <span
                    key={v.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-extrabold text-[11px]"
                  >
                    <span>{v.name} (+₱{v.price})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(v.id)}
                      className="hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Add-ons & Extra Toppings Management */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <label className="block font-bold">Product Add-ons & Extra Toppings (Optional)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add-on name (e.g. Extra Cheese / Dip)"
                value={addOnNameInput}
                onChange={(e) => setAddOnNameInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
              />
              <input
                type="number"
                placeholder="+Price (₱)"
                value={addOnPriceInput}
                onChange={(e) => setAddOnPriceInput(e.target.value)}
                className="w-24 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold"
              />
              <button
                type="button"
                onClick={handleAddAddOn}
                className="px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
              >
                + Add
              </button>
            </div>
            {newProdAddOns.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {newProdAddOns.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-extrabold text-[11px]"
                  >
                    <span>{a.name} (+₱{a.price})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAddOn(a.id)}
                      className="hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" variant="primary" fullWidth>
            {editingProduct ? 'Save Item Changes' : 'Add Product to Menu'}
          </Button>
        </form>
      </Modal>

      {/* MODAL 3: ANNUAL PARTNER MEMBERSHIP PASS MODAL */}
      <Modal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        title="Trakz Merchant Partner Annual Membership"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0a1c36] to-slate-900 border-2 border-[#ffb100] text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-300 text-xs">Annual Membership Status</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-black text-[10px]">
                PROMO ACTIVE 🎁
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400">
              ₱0.00 <span className="line-through text-slate-400 text-xs font-normal">₱999.00</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Store Partner: <strong>{merchantName}</strong> (ID: {merchantId})
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 space-y-2 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
              <span>Standard Registration Fee:</span>
              <span className="line-through text-slate-400">₱999.00</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-500">
              <span>Promo Discount (Hanap Shop):</span>
              <span>-₱999.00 (100% Waived)</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Registration Status:</span>
              <span className="font-extrabold text-emerald-500">Waived & Verified 🎁</span>
            </div>
            <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Renewal Cycle:</span>
              <span className="font-bold text-amber-500">Annual Promo Pass</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
            🎁 As a registered partner from <strong>Hanap Shop</strong>, your ₱999 annual registration fee has been 100% WAIVED. Enjoy unlimited orders, live rider dispatch, and zero setup fees!
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={() => {
              showToast('Annual Membership Pass is currently ACTIVE! Next renewal in October 2025. 🟢', 'success');
              setIsSubscriptionModalOpen(false);
            }}
          >
            Close & Keep Active
          </Button>
        </div>
      </Modal>

    </div>
  );
};
