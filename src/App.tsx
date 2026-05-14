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
import { preparePieData, prepareTrendData } from './Logic/AnalyticLogic';
import { useState } from 'react';
import CSVImportView from './Components/CSVImportView';
import CashFlowTrend from './Components/CashFlowTrend';


function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard');

  // Accessing the Brain (Hook)
  const {
    ledgerData,
    saveNewEntry,
    deleteEntry,
    importTransactions,
    totalBalance,
    income,
    expenses
  } = useTransactions();

  // Step 2: Prepare the data for the Chart
  const pieData = preparePieData(ledgerData);
  const trendData = prepareTrendData(ledgerData);

  return (
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
            <DashboardHeader balance={totalBalance} />
            <StatsRow income={income} expenses={expenses}
              totalCount={ledgerData.length} />
            <section className="analytic-grid">
              <CashFlowTrend data={trendData} />
              <SpendingDistribution data={pieData} />
            </section>
            <div className="dashboard-content">
              {/* Passing the raw data to the List (The List will handle its own search/sort!) */}
              <TransactionList transactions={ledgerData} onDelete={deleteEntry} />

              {/* Passing the logic to the Form */}
              <TransactionForm onAdd={saveNewEntry} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
