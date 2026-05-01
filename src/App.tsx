import './App.css';
import DashboardHeader from './Components/DashboardHeader';
import StatsRow from './Components/StatsRow';
import TransactionForm from './Components/TransactionForm';
import TransactionList from './Components/TransactionList';
import Topbar from './Components/Topbar';
import Sidebar from './Components/Sidebar';
import { useTransactions } from './Hooks/useTransactions';

function App() {
  // Accessing the Brain (Hook)
  const { ledgerData, saveNewEntry, deleteEntry, totalBalance, income, expenses } = useTransactions();

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <Topbar />
        <DashboardHeader balance={totalBalance} />
        <StatsRow income={income} expenses={expenses}
          totalCount={ledgerData.length} />

        <div className="dashboard-content">
          {/* Passing the raw data to the List (The List will handle its own search/sort!) */}
          <TransactionList transactions={ledgerData} onDelete={deleteEntry} />

          {/* Passing the logic to the Form */}
          <TransactionForm onAdd={saveNewEntry} />
        </div>
      </main>
    </div>
  );
}

export default App;
