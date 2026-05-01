import React, { useState } from 'react';
import type { Transaction } from '../Interfaces/Interfaces';
import TransactionControls from './TransactionControls';
import { processTransactions } from '../Logic/TransactionLogic';

// The Blueprint for the List
interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  // Tracking the Search, Sort, and Calendar
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Date");
  const [filterDate, setFilterDate] = useState("");

  // --- CLEAN ARCHITECTURE (Divide & Conquer) ---
  // We moved the heavy math into our new Logic folder!
  let processedList = processTransactions(transactions, searchTerm, sortBy, filterDate);

  return (
    <div className="central-ledger">
      {/* Title */}
      <div className="section-header" style={{ marginBottom: '15px' }}>Transaction Ledger</div>

      {/* The Controls perfectly nestled inside the ledger card */}
      <TransactionControls
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
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
            <th>Delete transaction</th>

          </tr>
        </thead>
        <tbody>
          {/* Notice how ONE curly bracket { opens here... */}
          {processedList.length === 0 ? (
            
            /* THIS HAPPENS IF TRUE (Empty) */
            <tr>
              <td colSpan={6} className="empty-message">
                No Transactions found for this search or Date!!
              </td>
            </tr>

          ) : (
            
            /* THIS HAPPENS IF FALSE (Not Empty) */
            processedList.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.date}</td>
                <td>{tx.receiver}</td>
                <td>{tx.category}</td>
                <td className={`amount ${tx.isNegative ? 'negative' : 'positive'}`}>
                  {tx.amount}
                </td>
                <td>
                  <span className={`status-Pill ${(tx.status || 'Complete').toLowerCase()}`}>
                    {tx.status || 'Complete'}
                  </span>
                </td>
                <td><button className="Delete-button" onClick={() => onDelete(tx.id)}>Delete</button></td>
              </tr>
            ))
            
          )} {/* ...and the ONE curly bracket } closes here! */}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList