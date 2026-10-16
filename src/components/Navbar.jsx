import React, { useState } from 'react';
import { Menu, X, ShieldCheck, LayoutDashboard, Calculator, BarChart3, Users, UploadCloud, TrendingUp, LogOut, Sun, Moon } from 'lucide-react';
import ApiStatus from './ApiStatus';

export default function Navbar({ activeTab, setActiveTab, isOnline, isCheckingHealth, onCheckHealth, onLogoClick, user, onSignOut, isDarkMode, onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = user?.role === 'owner'
    ? [
        { id: 'dashboard', label: 'My Workspace', icon: LayoutDashboard },
        { id: 'assess', label: 'My Assessment', icon: Calculator },
        { id: 'impact', label: 'How It Works', icon: TrendingUp },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'assess', label: 'Assess MSME', icon: Calculator },
        { id: 'portfolio', label: 'Portfolio', icon: BarChart3 },
        { id: 'batch', label: 'Batch Score', icon: UploadCloud },
        { id: 'fairness', label: 'Fairness Audit', icon: Users },
        { id: 'impact', label: 'Benchmarks', icon: TrendingUp },
      ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={onLogoClick || (() => handleNavClick('dashboard'))}
          >
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">Vridhi AI</span>
                <span className="text-[10px] bg-teal-900/80 text-teal-300 font-semibold px-2 py-0.5 rounded border border-teal-700/50 uppercase tracking-wider">
                  Risk Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal hidden sm:block">
                From credit-invisible to credit-worthy
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === item.id
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Status */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={onToggleTheme} className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors" title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <ApiStatus
              isOnline={isOnline}
              isLoading={isCheckingHealth}
              onCheckHealth={onCheckHealth}
            />
            {user && <span className="text-xs text-slate-300 border-l border-slate-700 pl-3">{user.role === 'owner' ? 'MSME Owner' : 'Lender'}</span>}
            <button onClick={onSignOut} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800" title="Sign out" aria-label="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={onToggleTheme} className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors" title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <ApiStatus
              isOnline={isOnline}
              isLoading={isCheckingHealth}
              onCheckHealth={onCheckHealth}
            />
            <button onClick={onSignOut} className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800" title="Sign out" aria-label="Sign out">
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-teal-700 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
