import React, { useState, useEffect } from 'react';
import { Code, Server, Check, Copy, ArrowLeft, RefreshCw, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient, USE_MOCK_DATA } from '../services/apiClient';

export const ApiDocPage = () => {
  const [copiedSection, setCopiedSection] = useState('');
  const [apiHealth, setApiHealth] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testError, setTestError] = useState(null);

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    setTestingConnection(true);
    setTestError(null);
    try {
      const res = await apiClient.get('/');
      setApiHealth(res);
    } catch (err) {
      setTestError(err.message || 'Failed to connect to PHP REST API backend.');
    } finally {
      setTestingConnection(false);
    }
  };

  const copySnippet = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 mb-2">
            <ArrowLeft size={16} />
            <span>Back to App</span>
          </Link>
          <div className="flex items-center gap-2">
            <Code size={24} className="text-purple-600 dark:text-purple-400" />
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Trakz Merchant Backend API Integration Specs
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
            Documentation & Frontend Contracts for the Trakz Merchant Backend Developer
          </p>
        </div>

        <div className="bg-slate-900 dark:bg-slate-950 text-white p-3 rounded-2xl flex items-center gap-3 shrink-0 border border-slate-800">
          <Server size={20} className="text-emerald-400" />
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Current System Mode</span>
            <span className="font-extrabold text-emerald-400">
              {USE_MOCK_DATA ? 'Mock Data Enabled' : 'PHP REST API Backend Active 🟢'}
            </span>
          </div>
        </div>
      </div>

      {/* Live PHP REST API Connection Health Tester */}
      <div className="bg-white dark:bg-[#121927] rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-purple-600 dark:text-purple-400" />
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Live Backend API Connection Test
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium pt-0.5">
              Active API Base URL: <code className="font-mono font-bold text-purple-600 dark:text-purple-400">{apiClient.baseUrl}</code>
            </p>
          </div>

          <button
            onClick={testApiConnection}
            disabled={testingConnection}
            className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw size={14} className={testingConnection ? 'animate-spin' : ''} />
            <span>{testingConnection ? 'Testing Connection...' : 'Ping Live Backend'}</span>
          </button>
        </div>

        {apiHealth && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold font-sans">
              <CheckCircle2 size={16} />
              <span>PHP REST API Operational (HTTP 200 OK)</span>
            </div>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
              <pre>{JSON.stringify(apiHealth, null, 2)}</pre>
            </div>
          </div>
        )}

        {testError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 space-y-1 text-xs font-medium">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle size={16} />
              <span>Backend Connection Warning</span>
            </div>
            <p>{testError}</p>
          </div>
        )}
      </div>

      {/* Environment Config Box */}
      <div className="bg-slate-900 dark:bg-[#0f172a] text-white rounded-3xl p-6 shadow-xl space-y-3 font-mono text-xs border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="font-bold text-purple-400 flex items-center gap-2">
            <Code size={16} />
            .env Configuration Contract
          </span>
          <button
            onClick={() => copySnippet(`VITE_API_BASE_URL=https://api.trakz.app/v1\nVITE_USE_MOCK_DATA=false\nVITE_WS_ORDER_TRACKING_URL=wss://api.trakz.app/ws/orders`, 'env')}
            className="text-slate-400 hover:text-white flex items-center gap-1 font-sans text-xs cursor-pointer"
          >
            {copiedSection === 'env' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedSection === 'env' ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`# Base URL for Trakz Merchant Production Backend
VITE_API_BASE_URL=https://api.trakz.app/v1

# Set to false when connecting to live backend API endpoints
VITE_USE_MOCK_DATA=false

# Optional WebSocket URL for real-time rider tracking
VITE_WS_ORDER_TRACKING_URL=wss://api.trakz.app/ws/orders`}
        </pre>
      </div>

      {/* API Endpoints Summary Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Required API Endpoints & Contracts</h2>

        {/* Auth Section */}
        <div className="bg-white dark:bg-[#121927] rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-card space-y-4">
          <h3 className="font-extrabold text-purple-600 dark:text-purple-400 text-sm uppercase tracking-wider">
            1. Customer Authentication (`/auth`)
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">POST</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 ml-2">/auth/login</span>
              <p className="font-sans text-slate-600 dark:text-slate-400 text-xs">Request Body: <code>{`{ "login": "emailOrPhone", "password": "xxx" }`}</code></p>
              <p className="font-sans text-slate-600 dark:text-slate-400 text-xs">Returns: <code>{`{ "token": "JWT", "user": { "id": "...", "fullName": "...", "email": "...", "phone": "..." } }`}</code></p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">POST</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 ml-2">/auth/register</span>
              <p className="font-sans text-slate-600 dark:text-slate-400 text-xs">Request Body: <code>{`{ "fullName": "...", "email": "...", "phone": "...", "password": "..." }`}</code></p>
            </div>
          </div>
        </div>

        {/* Merchants & Menu Section */}
        <div className="bg-white dark:bg-[#121927] rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-card space-y-4">
          <h3 className="font-extrabold text-purple-600 dark:text-purple-400 text-sm uppercase tracking-wider">
            2. Merchants & Products Discovery
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">GET</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 ml-2">/merchants?category=...&search=...&openOnly=true</span>
              <p className="font-sans text-slate-600 dark:text-slate-400 text-xs">Returns array of merchant objects with ratings, delivery fees, ETA, and categories.</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">GET</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 ml-2">/merchants/:id/products</span>
              <p className="font-sans text-slate-600 dark:text-slate-400 text-xs">Returns menu products for a specific merchant including size variants and extra add-ons.</p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white dark:bg-[#121927] rounded-3xl p-6 border border-slate-200 dark:border-slate-800/80 shadow-card space-y-4">
          <h3 className="font-extrabold text-purple-600 dark:text-purple-400 text-sm uppercase tracking-wider">
            3. Order Placement & Live Tracking
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">POST</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 ml-2">/orders</span>
              <p className="font-sans text-slate-600 dark:text-slate-400 text-xs">Submits order payload for server-side price validation, stock check and order confirmation.</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold">GET</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 ml-2">/orders/:id</span>
              <p className="font-sans text-slate-600 dark:text-slate-400 text-xs">Returns live order status (Pending → Confirmed → Preparing → Ready for pickup → Rider assigned → Picked up → On the way → Delivered → Cancelled).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
