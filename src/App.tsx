import { useState, useEffect } from 'react';
import './App.css';
import DashboardHeader from './Components/DashboardHeader';
import StatsRow from './Components/StatsRow';
import TransactionForm from './Components/TransactionForm';
import TransactionList from './Components/TransactionList';
import Topbar from './Components/Topbar';
import Sidebar from './Components/Sidebar';
import SpendingDistribution from './Components/SpendingDistribution';
import CSVImportView from './Components/CSVImportView';
import CashFlowTrend from './Components/CashFlowTrend';
import AuthScreen from './Components/AuthScreen'; // 📥 Import AuthScreen
import { TransactionProvider } from './Context/TransactionContext'; // 📥 Import Provider
import SettingsView from './Components/settingsView';

// ⏱Define timeout limit: 10 seconds (10 * 1000ms) for quick testing!
// Once we verify it works, we will set this to 15 minutes (15 * 60 * 1000ms).
const INACTIVITY_LIMIT = 15 * 60 * 1000;

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // Callback when login is successful
  const handleLoginSuccess = (newToken: string, username: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', username);
    setToken(newToken);
  };

  // Callback when user logs out
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
  };

  // 🕵️‍♂️ Google Callback Reader: Scans URL parameters for login keys on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlUsername = params.get('username');

    if (urlToken && urlUsername) {
      // Save keys in browser memory
      localStorage.setItem('token', urlToken);
      localStorage.setItem('username', urlUsername);
      setToken(urlToken); // Update React state to log in

      // Clean the address bar back to clear "http://localhost:5173/"
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []); // Only runs once when the app boots up

  // 🕵️‍♂️ useEffect: Monitors mouse movements and clicks to track inactivity
  useEffect(() => {
    // If user is not logged in, do not start the activity tracker
    if (!token) return;

    let timer: ReturnType<typeof setTimeout>;

    // Resets the timer candle back to 10 seconds
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(handleLogout, INACTIVITY_LIMIT); // Trigger logout when timer runs out
    };

    // Initialize the timer immediately on mount
    resetTimer();

    // List of events that prove the user is active
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

    // Bind events to the window
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup: runs when the user logs out or closes the tab
    return () => {
      clearTimeout(timer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [token]); // Re-run this tracker only when the token state changes

  //  Gatekeeper: If there is no token, show the Login/Register Screen
  if (!token) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 🚀 Render the dashboard when authenticated
  return (
    <TransactionProvider>
      <div className="app-shell">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />

        <main className="main-content">
          <Topbar onLogout={handleLogout} />

          {currentView === 'import' ? (
            <CSVImportView
              onBack={() => setCurrentView('dashboard')}
            />
          ) : currentView === 'settings' ? (
            <SettingsView token={token} username={localStorage.getItem('username')} />
          ) : (
            <>
              <DashboardHeader />
              <StatsRow />

              <section className="analytic-grid">
                <CashFlowTrend />
                <SpendingDistribution />
              </section>

              <div className="dashboard-content">
                <TransactionList />
                <TransactionForm />
              </div>
            </>
          )}
      </main>
    </div>
    </TransactionProvider >
  );
}

export default App;
