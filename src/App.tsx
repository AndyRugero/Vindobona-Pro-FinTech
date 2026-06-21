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
import SettingsView from './Components/SettingsView';
import CardWidget from './Components/CardWidget';
import FXConverter from './Components/FXConverter';
import Chatbot from './Components/Chatbot';
import ATMMap from './Components/ATMMap';
import BudgetManager from './Components/BudgetManager';
import MemberTransfers from './Components/MemberTransfers';
import AdminPanel from './Components/AdminPanel';
import AddTeamMember from './Components/AddTeamMember';
import { API_BASE_URL } from './config';

// ⏱Define timeout limit: 10 seconds (10 * 1000ms) for quick testing!
// Once we verify it works, we will set this to 15 minutes (15 * 60 * 1000ms).
const INACTIVITY_LIMIT = 15 * 60 * 1000;

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!token) {
      setAvatarUrl(null);
      setUsername(null);
      return;
    }
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
          if (data.username) {
            setUsername(data.username);
            localStorage.setItem('username', data.username);
          }
        }
      } catch (err) {
        console.error('Failed to load profile avatar:', err);
      }
    };
    fetchProfile();
  }, [token]);

  // Callback when login is successful
  const handleLoginSuccess = (newToken: string, newUsername: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    setToken(newToken);
    setUsername(newUsername);
  };

  // Callback when user logs out
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
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
      setUsername(urlUsername);

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
      <div className={`app-shell view-${currentView}`}>
        <Sidebar currentView={currentView}
          onViewChange={setCurrentView} token={token}
          avatarUrl={avatarUrl} username={username} />

        <main className="main-content">
          <Topbar onLogout={handleLogout} theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} username={username} />

          {currentView === 'import' ? (
            <CSVImportView
              onBack={() => setCurrentView('dashboard')}
            />
          ) : currentView === 'cards' ? (
            <CardWidget token={token} />

          )
            : currentView === 'transfer' ? (
              <MemberTransfers token={token} />
            )

              : currentView === 'settings' ? (
                <SettingsView token={token} username={username} avatarUrl={avatarUrl} onAvatarUpdate={setAvatarUrl} />
              ) : currentView === 'exchange' ? (
                <FXConverter token={token} />
              ) : currentView === 'budgets' ? (
                <BudgetManager token={token} />
              ) : currentView === 'admin' ? (
                <AdminPanel token={token} />
              ) : currentView === 'add-team' ? (
                <AddTeamMember token={token} />
              ) :

                (
                  <>
                    <DashboardHeader />
                    <StatsRow />

                    <section className="analytic-grid">
                      <CashFlowTrend />
                      <SpendingDistribution />
                    </section>

                    <div className="dashboard-content">
                      <div className="dashboard-left-column">
                        <TransactionList />
                        <ATMMap token={token} />
                      </div>
                      <TransactionForm />

                    </div>
                  </>
                )}
        </main>
      </div>
      <Chatbot token={token} />
    </TransactionProvider >
  );
}

export default App;
