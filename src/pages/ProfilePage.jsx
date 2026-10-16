import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Bell, ShieldCheck, FileText, Code, LogOut, Edit3, Plus, Trash2, Sun, Moon, Camera, Bike, Clock, CheckCircle2, ShieldAlert, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useLocation } from '../hooks/useLocation';
import { useTheme } from '../hooks/useTheme';
import { Button } from '../components/common/Button';
import { AddressFormModal } from '../components/profile/AddressFormModal';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { Modal } from '../components/common/Modal';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, approveRider } = useAuth();
  const { showToast } = useToast();
  const { addresses, setDefaultAddress, deleteAddress } = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState(null); // 'terms' or 'privacy'

  const [pushNotifs, setPushNotifs] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">My Account</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage your profile, delivery addresses, theme, and preferences</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-[#121927] rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div
            className="relative group cursor-pointer shrink-0"
            onClick={() => setIsEditProfileOpen(true)}
            title="Click to edit profile & change picture"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user?.fullName}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-purple-200 dark:border-purple-900 shadow-sm transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={18} className="text-white" />
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsEditProfileOpen(true); }}
              className="absolute -bottom-1 -right-1 p-1.5 bg-purple-600 text-white rounded-full shadow-md hover:bg-purple-700 transition-colors border-2 border-white dark:border-[#121927]"
              title="Change Picture"
            >
              <Camera size={11} />
            </button>
          </div>
          <div className="space-y-0.5 min-w-0 overflow-hidden">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg truncate">{user?.fullName || 'Guest User'}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 min-w-0">
              <Mail size={12} className="shrink-0" />
              <span className="truncate">{user?.email || 'Not logged in'}</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 min-w-0">
              <Phone size={12} className="shrink-0" />
              <span className="truncate">{user?.phone || 'No phone number'}</span>
            </p>
          </div>
        </div>

        {user ? (
          <div className="flex justify-end sm:justify-start shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditProfileOpen(true)}
              icon={Edit3}
            >
              Edit
            </Button>
          </div>
        ) : (
          <Link to="/login" className="flex justify-end sm:justify-start shrink-0">
            <Button variant="primary" size="sm">
              Log In
            </Button>
          </Link>
        )}
      </div>

      {/* Delivery Rider Account Approval Card */}
      {user?.role === 'rider' && (
        <div className={`rounded-3xl p-6 border shadow-card transition-all ${
          user?.status === 'pending_approval' || !user?.isApproved
            ? 'bg-amber-500/10 border-[#ffb100]/40 text-slate-800 dark:text-slate-100'
            : 'bg-emerald-500/10 border-emerald-500/40 text-slate-800 dark:text-slate-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                user?.status === 'pending_approval' || !user?.isApproved
                  ? 'bg-[#ffb100] text-[#0a1c36]'
                  : 'bg-emerald-500 text-white'
              }`}>
                <Bike size={22} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base">
                    {user?.status === 'pending_approval' || !user?.isApproved
                      ? 'Rider Application Under Review'
                      : 'Active Delivery Rider Partner'}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    user?.status === 'pending_approval' || !user?.isApproved
                      ? 'bg-[#ffb100]/20 text-[#ffb100] border border-[#ffb100]/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {user?.status === 'pending_approval' || !user?.isApproved ? 'Pending Approval' : 'Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Vehicle: <strong>{user?.vehicleType || 'Motorcycle'}</strong> • Plate: <strong>{user?.plateNumber || 'Pending'}</strong> • Area: <strong>{user?.operatingCity || 'Metro Manila'}</strong>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {user?.status === 'pending_approval' || !user?.isApproved
                    ? 'Your driver credentials are being verified by Trakz Admin. Orders dispatch will unlock upon approval.'
                    : 'You are verified and eligible to receive real-time dispatch orders across your operating area.'}
                </p>
              </div>
            </div>

            {/* Admin Demo Approval Toggle Button */}
            {(user?.status === 'pending_approval' || !user?.isApproved) && (
              <button
                type="button"
                onClick={async () => {
                  await approveRider(user?.id);
                  showToast('Rider account approved by Admin! You can now accept delivery orders. 🛵', 'success');
                }}
                className="shrink-0 px-4 py-2.5 bg-[#ffb100] hover:bg-[#e09c00] text-[#0a1c36] font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 size={16} />
                <span>Simulate Admin Approval</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* App Appearance / Theme Switcher Card */}
      <div className="bg-white dark:bg-[#121927] rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800/80 shadow-card">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3.5 sm:gap-4">
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              {isDark ? <Moon size={18} className="text-purple-400" /> : <Sun size={18} className="text-amber-500" />}
              <span>App Appearance</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current Mode: <strong className="font-bold text-slate-900 dark:text-white capitalize">{theme} Mode</strong>
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 ${
              isDark
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 hover:bg-purple-700'
                : 'bg-slate-900 text-white shadow-md hover:bg-slate-800'
            }`}
          >
            {isDark ? (
              <>
                <Sun size={15} className="text-amber-300 shrink-0" />
                <span>Switch to Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={15} className="text-purple-300 shrink-0" />
                <span>Switch to Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white dark:bg-[#121927] rounded-3xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800/80 shadow-card space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2 min-w-0">
            <MapPin size={18} className="text-purple-600 dark:text-purple-400 shrink-0" />
            <span className="truncate">Saved Delivery Addresses</span>
          </h3>
          <button
            onClick={() => setIsAddressModalOpen(true)}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <Plus size={14} className="shrink-0" />
            <span>Add Address</span>
          </button>
        </div>

        <div className="space-y-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                addr.isDefault
                  ? 'border-purple-500 dark:border-purple-600 bg-purple-50/30 dark:bg-purple-950/30'
                  : 'border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="px-2 py-0.2 rounded-md bg-purple-600 text-white text-[9px] font-bold">
                      DEFAULT
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {addr.street}, {addr.barangay}, {addr.city}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => deleteAddress(addr.id)}
                  className="p-1 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control Portal Banner (Admin / Merchant) */}
      {(user?.role === 'admin' || user?.role === 'merchant') && (
        <div className="bg-[#0a1c36] text-white rounded-3xl p-5 border border-slate-800 shadow-xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-[#ffb100]" />
              <h4 className="font-extrabold text-sm text-[#ffb100]">
                {user?.role === 'merchant' ? 'Trakz Merchant Portal' : 'Trakz Admin Control HQ'}
              </h4>
            </div>
            <p className="text-xs text-slate-300">
              {user?.role === 'merchant'
                ? 'Access your store fulfillment panel, live kitchen orders, and menu catalog management.'
                : 'Access full operations dashboard, live order management, merchant listings, and rider approvals.'}
            </p>
          </div>
          <Link to={user?.role === 'merchant' ? '/merchant/dashboard' : '/admin'}>
            <Button variant="primary" size="sm">
              {user?.role === 'merchant' ? 'Open Merchant Portal' : 'Open Admin HQ'}
            </Button>
          </Link>
        </div>
      )}



      {/* Preferences & Legal */}
      <div className="bg-white dark:bg-[#121927] rounded-3xl p-6 border border-slate-100 dark:border-slate-800/80 shadow-card space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">App Preferences</h3>

        <div className="space-y-3 text-xs font-bold text-slate-700 dark:text-slate-300">
          <label className="flex items-center justify-between cursor-pointer py-1">
            <span>Push Notifications (Order Updates)</span>
            <input
              type="checkbox"
              checked={pushNotifs}
              onChange={(e) => setPushNotifs(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
          </label>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
          <button onClick={() => setActiveLegalModal('terms')} className="hover:text-purple-600 dark:hover:text-purple-400 underline">
            Terms & Conditions
          </button>
          <button onClick={() => setActiveLegalModal('privacy')} className="hover:text-purple-600 dark:hover:text-purple-400 underline">
            Privacy Policy
          </button>
        </div>
      </div>

      {/* Logout */}
      <Button variant="secondary" fullWidth size="lg" onClick={handleLogout} icon={LogOut}>
        Log Out
      </Button>

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* Legal Information Modal */}
      <Modal
        isOpen={!!activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
        title={activeLegalModal === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'}
      >
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Welcome to Trakz Food Delivery Customer Application. By using our platform, you agree to our standard terms regarding order placement, delivery verification, and acceptable use.
          </p>
          <p>
            All delivery order totals, merchant pricing, and stock availability are verified dynamically by the Trakz platform backend.
          </p>
        </div>
      </Modal>
    </div>
  );
};
