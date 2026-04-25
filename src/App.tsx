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
  const { ledgerData, saveNewEntry } = useTransactions();

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <Topbar />
        <DashboardHeader />
        <StatsRow />

        <div className="dashboard-content">
          {/* Passing the logic to the Form */}
          <TransactionForm onAdd={saveNewEntry} />
          {/* Passing the data to the List */}
          <TransactionList transactions={ledgerData} />
        </div>
      </main>
    </div>
  );
}

export default App;
