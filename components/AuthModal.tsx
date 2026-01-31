import React from 'react';
import { Button } from './Button';

interface AuthModalProps {
  onLogin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl"></div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome Architect
          </h2>
          <p className="text-slate-500 text-sm">Sign in to sync your designs and access premium generation tools.</p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={onLogin}
            className="w-full h-12 text-lg relative group overflow-hidden shadow-lg shadow-blue-500/20"
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.571-4.182m1.804 9.388c2.856-1.554 5.34-3.778 7.226-6.398" />
              </svg>
              Login with Manus-Oauth
            </span>
          </Button>
          
          <div className="text-center mt-4">
             <span className="text-xs text-slate-400 uppercase tracking-widest">Secure connection</span>
          </div>
        </div>
      </div>
    </div>
  );
};