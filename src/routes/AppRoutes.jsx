import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { SignUpPage } from '../pages/SignUpPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { HomePage } from '../pages/HomePage';
import { MerchantsPage } from '../pages/MerchantsPage';
import { MerchantDetailPage } from '../pages/MerchantDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrderTrackingPage } from '../pages/OrderTrackingPage';
import { MyOrdersPage } from '../pages/MyOrdersPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { ApiDocPage } from '../pages/ApiDocPage';
import { AdminPage } from '../pages/AdminPage';
import { MerchantDashboardPage } from '../pages/MerchantDashboardPage';
import { RiderDashboardPage } from '../pages/RiderDashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing / Entry Page as default initial route when app opens */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/welcome" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/merchant" element={<MerchantDashboardPage />} />
      <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />
      <Route path="/rider" element={<RiderDashboardPage />} />
      <Route path="/rider/dashboard" element={<RiderDashboardPage />} />
      <Route path="/rider-app" element={<RiderDashboardPage />} />

      {/* Main Application Layout Routes */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/merchants" element={<MerchantsPage />} />
        <Route path="/merchants/:id" element={<MerchantDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/tracking/:orderId" element={<OrderTrackingPage />} />
        <Route path="/orders" element={<MyOrdersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/api-docs" element={<ApiDocPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Authentication Layout Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>
    </Routes>
  );
};
