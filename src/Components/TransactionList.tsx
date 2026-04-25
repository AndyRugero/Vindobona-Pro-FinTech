import React from 'react';
import type { Transaction } from '../Interfaces/Interfaces';

// Lesson 13: Connecting the list to the data
const TransactionList: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  return (
    <div className="central-ledger">
      <div className="section-header">CENTRAL LEDGER</div>
      <table className="ledger-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Receiver</th>
            <th>Category</th>
            <th>Amount</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;