
import React, { ReactNode } from 'react';
import Header from './Header';
import { User } from '../../types';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  logoUrl: string;
  backgroundUrl: string;
  // Fix: Made the children prop optional to satisfy the type checker.
  children?: ReactNode;
}

export default function DashboardLayout({ user, onLogout, logoUrl, backgroundUrl, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
        <div className="absolute inset-0 h-1/3 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundUrl})` }}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        </div>
        <div className="relative">
            <Header user={user} onLogout={onLogout} logoUrl={logoUrl} />
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    </div>
  );
}
