import './App.css';
import './App.grid.css';
import DashboardHeader from './Components/DashboardHeader';
import StatsRow from './Components/StatsRow';
import TransactionForm from './Components/TransactionForm';
import TransactionList from './Components/TransactionList';
import Topbar from './Components/Topbar';
import Sidebar from './Components/Sidebar';
import { useTransactions } from './Hooks/useTransactions';
import SpendingDistribution from './Components/SpendingDistribution';
import { useState } from 'react';
import CSVImportView from './Components/CSVImportView';
import CashFlowTrend from './Components/CashFlowTrend';
import { TransactionProvider } from './Context/TransactionContext';

function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard');

  // Accessing the Brain (Hook)
  // We only grab what App.tsx actually NEEDS now.
  const {
    isLoading,
    saveNewEntry,
    importTransactions
  } = useTransactions();

  if (isLoading) {
    return (
      <div className="Loading-screen">
        <div className="spinner"></div>
        <h2>Loading YOUR finances </h2>
      </div>
    );
  }

  return (
    <TransactionProvider>
      <div className="app-shell">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />

        <main className="main-content">
          <Topbar />

          {currentView === 'import' ? (
            <CSVImportView
              onImport={importTransactions}
              onBack={() => setCurrentView('dashboard')}
            />
          ) : (
            <>
              {/* DashboardHeader and StatsRow are now Smart! */}
              <DashboardHeader />
              <StatsRow />
              
              <section className="analytic-grid">
                <CashFlowTrend />
                <SpendingDistribution />
              </section>

              <div className="dashboard-content">
                <TransactionList />
                <TransactionForm onAdd={saveNewEntry} />
              </div>
            </>
          )}
        </main>
      </div>
    </TransactionProvider>
  );
}

export default App;
