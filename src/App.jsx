import React, { useState, useEffect, useCallback } from 'react';
import Landing from './Landing';
import SignIn from './SignIn';
import Navbar from './components/Navbar';
import ApiOfflineBanner from './components/ApiOfflineBanner';
import { getHealth, API_BASE_URL } from './api';

import DashboardPage from './pages/Dashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AssessPage from './pages/Assess';
import PortfolioPage from './pages/Portfolio';
import FairnessPage from './pages/Fairness';
import BatchPage from './pages/Batch';
import ImpactPage from './pages/Impact';
import { applyTheme, getStoredTheme, persistTheme } from './theme';
import VridhiAssistant from './components/VridhiAssistant';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authUser, setAuthUser] = useState(null);
  const [entryView, setEntryView] = useState('landing');
  const [isOnline, setIsOnline] = useState(true);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [attemptedUrl, setAttemptedUrl] = useState(API_BASE_URL);
  const [theme, setTheme] = useState(getStoredTheme);
  const [latestAssessment, setLatestAssessment] = useState(null);

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  const checkApiHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      await getHealth();
      setIsOnline(true);
    } catch (err) {
      console.warn('API Health Check failed:', err.message);
      setIsOnline(false);
      setAttemptedUrl(err.baseUrl || API_BASE_URL);
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  useEffect(() => {
    checkApiHealth();
    // Periodically check health every 30 seconds
    const interval = setInterval(checkApiHealth, 30000);
    return () => clearInterval(interval);
  }, [checkApiHealth]);

  if (!authUser) {
    if (entryView === 'signin') {
      return (
        <SignIn
          onBack={() => setEntryView('landing')}
          onSuccess={(user) => {
            setAuthUser(user);
            setActiveTab(user.role === 'owner' ? 'assess' : 'dashboard');
          }}
        />
      );
    }
    return <Landing onEnter={() => setEntryView('signin')} />;
  }

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return authUser.role === 'owner'
          ? <OwnerDashboard isOnline={isOnline} onNavigate={setActiveTab} />
          : <DashboardPage isOnline={isOnline} onNavigate={setActiveTab} />;
      case 'assess':
        return <AssessPage isOnline={isOnline} onAssessmentResult={setLatestAssessment} />;
      case 'portfolio':
        return <PortfolioPage isOnline={isOnline} />;
      case 'fairness':
        return <FairnessPage isOnline={isOnline} />;
      case 'batch':
        return <BatchPage isOnline={isOnline} />;
      case 'impact':
        return <ImpactPage />;
      default:
        return authUser.role === 'owner'
          ? <OwnerDashboard isOnline={isOnline} onNavigate={setActiveTab} />
          : <DashboardPage isOnline={isOnline} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="vridhi-app-shell min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOnline={isOnline}
        isCheckingHealth={isCheckingHealth}
        onCheckHealth={checkApiHealth}
        user={authUser}
        isDarkMode={theme === 'dark'}
        onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
        onSignOut={() => {
          setAuthUser(null);
          setEntryView('landing');
        }}
        onLogoClick={() => setActiveTab(authUser.role === 'owner' ? 'assess' : 'dashboard')}
      />

      {/* Offline Banner */}
      {!isOnline && (
        <ApiOfflineBanner
          attemptedUrl={attemptedUrl}
          onRetry={checkApiHealth}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderCurrentTab()}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800 text-slate-400 py-6 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Vridhi AI</span>
            <span>•</span>
            <span>Explainable Credit Risk Analytics for MSMEs</span>
          </div>
          <div>
            HackConquest 2026 • Problem Statement 12
          </div>
        </div>
      </footer>
      <VridhiAssistant assessment={latestAssessment} />
    </div>
  );
}
