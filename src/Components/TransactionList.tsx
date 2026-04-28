import React, { useState } from 'react';
import type { Transaction } from '../Interfaces/Interfaces';
import TransactionControls from './TransactionControls';

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
            <th>Delete transaction</th>
          </tr>
        </thead>
        <tbody>
          {/* This loop prints each transaction as a row */}
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.date}</td>
              <td>{tx.receiver}</td>
              <td>{tx.category}</td>
              <td className={`amount ${tx.isNegative ? 'negative' : 'positive'}`}>
                {tx.amount}
              </td>
              <td><button onClick={() => onDelete(tx.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;