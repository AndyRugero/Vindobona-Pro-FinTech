import { useState } from 'react';
import TransactionControls from './TransactionControls';
import { useTransactionContext } from '../Context/TransactionContext';


const TransactionList = () => {
  // 1. Grab everything we need from the Cloud
  const { filteredData, setLedgerData } = useTransactionContext();

  // 2. Local UI state for sorting/filtering
  const [sortBy, setSortBy] = useState("Date");
  const [filterDate, setFilterDate] = useState("");

  // 3. Create a delete function that updates the cloud
  const handleDelete = (id: string) => {
    setLedgerData(prev => prev.filter(tx => tx.id !== id));
  };

  return (
    <div className="central-ledger">
      {/* Title */}
      <div className="section-header" style={{ marginBottom: '15px' }}>Transaction Ledger</div>

      {/* The Controls perfectly nestled inside the ledger card */}
      <TransactionControls
        searchTerm="" // Search is now handled globally in the Context
        setSearchTerm={() => {}} 
        filterDate={filterDate} setFilterDate={setFilterDate}
        sortBy={sortBy} setSortBy={setSortBy}
      />

      <table className="ledger-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Receiver</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={6} className="empty-message">
                No Transactions found!
              </td>
            </tr>
          ) : (
            filteredData.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.date}</td>
                <td>{tx.receiver}</td>
                <td>{tx.category}</td>
                <td className={`amount ${tx.isNegative ? 'negative' : 'positive'}`}>
                  {tx.amount}
                </td>
                <td>
                  <span className="status-Pill complete">
                    {tx.status || 'Complete'}
                  </span>
                </td>
                <td>
                  <button className="Delete-button" onClick={() => handleDelete(tx.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;