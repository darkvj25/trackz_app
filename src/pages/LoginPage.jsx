import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Mail, Lock, LogIn, Store, Bike } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { INACTIVITY_LOGOUT_FLAG } from '../utils/constants';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { showToast } = useToast();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, automatically redirect to role-specific dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'merchant') {
        navigate('/merchant/dashboard', { replace: true });
      } else if (user.role === 'rider') {
        navigate('/rider', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    if (sessionStorage.getItem(INACTIVITY_LOGOUT_FLAG)) {
      setError('You were automatically logged out due to inactivity.');
      sessionStorage.removeItem(INACTIVITY_LOGOUT_FLAG);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(emailOrPhone, password);
      const loggedUser = result?.user;
      const userName = loggedUser?.fullName || loggedUser?.name || 'User';
      const role = loggedUser?.role || 'customer';

      showToast(`Welcome back, ${userName}! Logged in successfully. 🎉`, 'success');

      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'merchant') {
        navigate('/merchant/dashboard');
      } else if (role === 'rider') {
        navigate('/rider');
      } else {
        navigate('/home');
      }
    } catch (err) {
      setError(err.message || 'Invalid email/phone or password.');
      showToast(err.message || 'Login failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Welcome Back! 👋</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Log in to your Trakz account to order food</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold rounded-2xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email or Mobile Phone"
          required
          placeholder="e.g. user@example.com or 09171234567"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          icon={Mail}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 font-medium">
            <input type="checkbox" defaultChecked className="rounded text-purple-600 focus:ring-purple-500" />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="font-bold text-purple-600 dark:text-purple-400 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          loading={loading}
          icon={LogIn}
        >
          Sign In
        </Button>
      </form>

      <div className="relative border-t border-slate-100 dark:border-slate-800 my-4 text-center">
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 bg-white dark:bg-[#121927] text-[11px] font-bold text-slate-400">
          OR
        </span>
      </div>

      <div className="space-y-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
        <div>
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#ffb100] font-black hover:underline">
            Create Account
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
          <Link
            to="/signup?type=merchant"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#ffb100] border border-[#ffb100]/30 text-xs font-extrabold transition-all active:scale-95 text-center"
          >
            <Store size={14} className="shrink-0 text-[#ffb100]" />
            <span>Register as a Merchant Partner</span>
          </Link>

          <Link
            to="/signup?type=rider"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-extrabold transition-all active:scale-95 text-center"
          >
            <Bike size={14} className="shrink-0 text-purple-400" />
            <span>Apply as a Delivery Rider</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
