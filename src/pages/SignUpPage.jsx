import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import {
  User,
  Mail,
  Phone,
  Lock,
  UserPlus,
  Store,
  Building,
  MapPin,
  Tag,
  Sparkles,
  ShoppingBag,
  Bike,
  Truck,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  DollarSign,
  Gift
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const SignUpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || searchParams.get('role');
  const initialType = ['merchant', 'rider', 'driver'].includes(typeParam)
    ? (typeParam === 'driver' ? 'rider' : typeParam)
    : 'customer';

  const { signUp } = useAuth();
  const { showToast } = useToast();

  const [accountType, setAccountType] = useState(initialType);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Merchant specific fields
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('burgers');
  const [storeAddress, setStoreAddress] = useState('');
  const [isHanapShopMerchant, setIsHanapShopMerchant] = useState(true);
  const [regFeePaymentMethod, setRegFeePaymentMethod] = useState('GCash / Maya');

  // Rider specific fields
  const [vehicleType, setVehicleType] = useState('Motorcycle');
  const [plateNumber, setPlateNumber] = useState('');
  const [operatingCity, setOperatingCity] = useState('Metro Manila');

  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('You must accept the Terms and Privacy Policy.');
      return;
    }

    if (accountType === 'merchant' && !storeName.trim()) {
      setError('Please provide your Store / Business Name.');
      return;
    }

    if (accountType === 'rider' && !plateNumber.trim() && vehicleType !== 'Bicycle') {
      setError('Please enter your vehicle plate number or registration.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const extraDetails = accountType === 'merchant'
        ? {
            storeName,
            category,
            storeAddress,
            registrationFee: isHanapShopMerchant ? 0 : 999,
            registrationFeeWaived: isHanapShopMerchant,
            isHanapShopPromo: isHanapShopMerchant,
            registrationFeePaid: true,
            paymentMethod: isHanapShopMerchant ? 'Waived (Hanap Shop Promo)' : regFeePaymentMethod,
            renewalCycle: 'annual',
            membershipExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          }
        : accountType === 'rider'
        ? { vehicleType, plateNumber, operatingCity }
        : null;

      const result = await signUp(fullName, email, phone, password, accountType, extraDetails);

      if (accountType === 'merchant') {
        const name = storeName || fullName || 'Merchant Partner';
        if (isHanapShopMerchant) {
          showToast(`Welcome ${name}! ₱999 Annual Registration Fee 100% WAIVED via Hanap Shop Promo! 🎁`, 'success');
        } else {
          showToast(`Merchant account registered & ₱999 Annual Partner Pass activated for ${name}! 🎉`, 'success');
        }
        navigate('/merchant/dashboard');
      } else if (accountType === 'rider') {
        const name = fullName || 'Rider';
        showToast(`Application submitted! Please wait for Admin approval before logging in, ${name}. 🛵`, 'info');
        navigate('/login');
      } else {
        const name = result?.user?.fullName || fullName || 'User';
        showToast(`Account created! Welcome to Trakz, ${name}! 🎉`, 'success');
        navigate('/home');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title Header */}
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {accountType === 'merchant'
            ? 'Register Merchant Account'
            : accountType === 'rider'
            ? 'Apply as Delivery Driver / Rider'
            : 'Create Trakz Account'}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {accountType === 'merchant'
            ? 'Partner with Trakz to list your store & expand your orders'
            : accountType === 'rider'
            ? 'Earn on your schedule by delivering food and products in your city'
            : 'Join us to enjoy fast food and product delivery'}
        </p>
      </div>

      {/* Account Type Tab Switcher */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 dark:bg-[#051020] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setAccountType('customer');
            setError('');
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition-all ${
            accountType === 'customer'
              ? 'bg-white dark:bg-[#0a1c36] text-[#0a1c36] dark:text-[#ffb100] shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <ShoppingBag size={14} />
          <span>Customer</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAccountType('merchant');
            setError('');
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition-all ${
            accountType === 'merchant'
              ? 'bg-[#ffb100] text-[#0a1c36] shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Store size={14} />
          <span>Merchant</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAccountType('rider');
            setError('');
          }}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-black transition-all ${
            accountType === 'rider'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Bike size={14} />
          <span>Driver / Rider</span>
        </button>
      </div>

      {/* Banner Notice for Merchants */}
      {accountType === 'merchant' && (
        <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-[#ffb100]/30 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#ffb100]/20 text-[#ffb100] flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-snug">
            Partner with Trakz Deliveries to gain instant online store exposure and live rider dispatch for your products!
          </p>
        </div>
      )}

      {/* Banner Notice for Riders */}
      {accountType === 'rider' && (
        <div className="p-3.5 bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/30 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Bike size={18} />
          </div>
          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-snug">
            Become a Trakz Delivery Rider partner! Flexible hours, competitive payouts, and live order dispatch.
          </p>
        </div>
      )}

      {/* Error Message Alert */}
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name / Representative Name */}
        <Input
          label={accountType === 'merchant' ? 'Owner / Representative Name' : accountType === 'rider' ? 'Full Driver Name' : 'Full Name'}
          required
          placeholder={accountType === 'merchant' ? 'e.g. Juan dela Cruz' : 'e.g. Maria Santos'}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          icon={User}
        />

        {/* Merchant Specific Input Fields */}
        {accountType === 'merchant' && (
          <>
            <Input
              label="Store / Business Name"
              required
              placeholder="e.g. Grill Craft & Burgers"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              icon={Building}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Business Category <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Tag size={18} />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#051020] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#ffb100]/50 transition-all appearance-none"
                >
                  <option value="burgers">🍔 Burgers & American</option>
                  <option value="chicken">🍗 Fried Chicken & Meals</option>
                  <option value="pizza">🍕 Pizza & Pasta</option>
                  <option value="milktea">🥤 Milk Tea & Beverages</option>
                  <option value="asian">🍣 Asian & Filipino Cuisine</option>
                  <option value="donuts">🍩 Bakery & Desserts</option>
                  <option value="coffee">☕ Coffee & Cafe</option>
                  <option value="essentials">🛒 Grocery & Essentials</option>
                </select>
              </div>
            </div>

            <Input
              label="Store Physical Address / City"
              placeholder="e.g. 123 Katipunan Ave, Quezon City"
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              icon={MapPin}
            />

            {/* Merchant Annual Membership Registration Fee Card with Hanap Shop Promo Waiver */}
            <div className="p-4 bg-gradient-to-br from-amber-500/10 via-[#0a1c36]/90 to-[#0a1c36] border-2 border-[#ffb100] rounded-3xl text-white space-y-3 shadow-xl">

              {/* Hanap Shop Promo Banner Switch */}
              <div
                onClick={() => setIsHanapShopMerchant(!isHanapShopMerchant)}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/40 flex items-center justify-between gap-3 cursor-pointer group hover:border-emerald-400 transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Gift size={18} />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-emerald-300 flex items-center gap-1.5">
                      <span>Hanap Shop Merchant Promo</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[9px] uppercase font-black">
                        PROMO ACTIVE
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium">
                      Registered on Hanap Shop? Waived 100% ang ₱999 annual fee!
                    </div>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={isHanapShopMerchant}
                  onChange={(e) => setIsHanapShopMerchant(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-400 cursor-pointer shrink-0"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#ffb100] text-[#0a1c36] font-black flex items-center justify-center">
                    ₱
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Trakz Merchant Partner Pass</h4>
                    <p className="text-[10px] text-amber-300 font-semibold">Annual Registration & Membership Fee</p>
                  </div>
                </div>

                <div className="text-right">
                  {isHanapShopMerchant ? (
                    <div>
                      <span className="line-through text-slate-400 text-xs mr-1 font-bold">₱999.00</span>
                      <div className="text-xl font-black text-emerald-400">₱0.00</div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-extrabold uppercase">
                        100% WAIVED 🎁
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xl font-black text-[#ffb100]">₱999.00</div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-extrabold uppercase">
                        Renewable Yearly
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Included Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium text-slate-200 pt-1 border-t border-slate-700/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#ffb100] shrink-0" />
                  <span>Unlimited store orders & zero setup fee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#ffb100] shrink-0" />
                  <span>Automated live GPS rider dispatch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#ffb100] shrink-0" />
                  <span>Store catalog & menu management</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#ffb100] shrink-0" />
                  <span>Business insights & sales reports</span>
                </div>
              </div>

              {/* Payment Selector or Waived Promo Message */}
              {!isHanapShopMerchant ? (
                <div className="pt-2 border-t border-slate-700/80 space-y-2">
                  <label className="block text-xs font-bold text-amber-200">
                    Select Registration Payment Method (₱999) <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'GCash / Maya', label: '📱 GCash / Maya' },
                      { id: 'Credit Card', label: '💳 Credit / Debit' },
                      { id: 'Bank Transfer', label: '🏦 Bank Transfer' }
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setRegFeePaymentMethod(pm.id)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-extrabold transition-all border text-center ${
                          regFeePaymentMethod === pm.id
                            ? 'bg-[#ffb100] text-[#0a1c36] border-[#ffb100] shadow-md'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    * ₱999 annual fee is billed upon registration and automatically renewable every 12 months.
                  </p>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-700/80 text-[11px] font-bold text-emerald-300 flex items-center gap-2">
                  <Gift size={16} className="text-emerald-400 shrink-0" />
                  <span>Hanap Shop Partner Promo applied: No payment required upon registration!</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Rider / Driver Specific Input Fields */}
        {accountType === 'rider' && (
          <>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Vehicle Type <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Bike size={18} />
                </div>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#051020] border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none"
                >
                  <option value="Motorcycle">🛵 Motorcycle</option>
                  <option value="Scooter">🛴 Electric Scooter</option>
                  <option value="Bicycle">🚲 Bicycle</option>
                  <option value="Car / Van">🚗 Car / Delivery Van</option>
                </select>
              </div>
            </div>

            <Input
              label={vehicleType === 'Bicycle' ? 'Bike Model / ID (Optional)' : 'Plate Number / Registration'}
              required={vehicleType !== 'Bicycle'}
              placeholder={vehicleType === 'Bicycle' ? 'e.g. Mountain Bike' : 'e.g. ABC 1234'}
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              icon={Truck}
            />

            <Input
              label="Operating City / Region"
              required
              placeholder="e.g. Metro Manila / Quezon City"
              value={operatingCity}
              onChange={(e) => setOperatingCity(e.target.value)}
              icon={MapPin}
            />
          </>
        )}

        {/* Email Address */}
        <Input
          label={accountType === 'merchant' ? 'Business Email Address' : 'Email Address'}
          type="email"
          required
          placeholder="e.g. contact@business.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={Mail}
        />

        {/* Phone Number */}
        <Input
          label={accountType === 'merchant' ? 'Business Mobile Phone' : 'Mobile Phone Number'}
          type="tel"
          required
          placeholder="e.g. 09171234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          icon={Phone}
        />

        {/* Password */}
        <Input
          label="Password"
          type="password"
          required
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
        />

        {/* Terms Checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-300 font-medium pt-1">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 rounded text-[#ffb100] focus:ring-[#ffb100]"
          />
          <span>
            I agree to the{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200 underline">
              {accountType === 'merchant' ? 'Merchant Partner Agreement' : accountType === 'rider' ? 'Delivery Partner Agreement' : 'Terms of Service'}
            </span>{' '}
            and <span className="font-bold text-slate-800 dark:text-slate-200 underline">Privacy Policy</span>.
          </span>
        </label>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          loading={loading}
          icon={accountType === 'merchant' ? Store : accountType === 'rider' ? Bike : UserPlus}
        >
          {accountType === 'merchant'
            ? 'Register Merchant Account'
            : accountType === 'rider'
            ? 'Submit Driver Application'
            : 'Create Account'}
        </Button>
      </form>

      {/* Switch to Login Link */}
      <div className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400 pt-2">
        Already registered?{' '}
        <Link to="/login" className="text-[#ffb100] font-black hover:underline">
          Log In Here
        </Link>
      </div>
    </div>
  );
};
