import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Mail, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

export const ForgotPasswordPage = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrPhone) return;
    setLoading(true);
    try {
      await authService.requestPasswordReset(emailOrPhone);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset Password</h2>
        <p className="text-xs text-slate-500 font-medium">
          Enter your registered email or phone to receive reset instructions
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or Mobile Phone"
            required
            placeholder="e.g. user@example.com or 09171234567"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            icon={Mail}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
            icon={KeyRound}
          >
            Send Reset Instructions
          </Button>
        </form>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl text-center space-y-2">
          <CheckCircle2 size={36} className="text-emerald-500 mx-auto" />
          <h4 className="font-extrabold text-emerald-900 text-sm">Instructions Sent!</h4>
          <p className="text-xs text-emerald-700 leading-relaxed">
            We have sent a password reset link and verification code to <span className="font-bold">{emailOrPhone}</span>.
          </p>
        </div>
      )}

      <div className="text-center pt-2">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-trakz-500">
          <ArrowLeft size={16} />
          <span>Back to Log In</span>
        </Link>
      </div>
    </div>
  );
};
