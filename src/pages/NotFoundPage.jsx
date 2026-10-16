import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-4">
      <div className="w-20 h-20 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
        <AlertTriangle size={40} />
      </div>
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-900">404 - Page Not Found</h2>
        <p className="text-xs text-slate-500 font-medium">The page you are looking for does not exist or has been moved.</p>
      </div>
      <Link to="/" className="inline-block pt-2">
        <Button variant="primary" icon={Home}>
          Back to Home Page
        </Button>
      </Link>
    </div>
  );
};
