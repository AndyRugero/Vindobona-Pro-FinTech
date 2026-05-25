import TransactionControls from './TransactionControls';
import { useTransactionContext } from '../Context/TransactionContext';
import '../Styles/TransactionList.css';

const TransactionList = () => {
  const { filteredData, deleteTransaction } = useTransactionContext();

  return (
    <div className="central-ledger">
      <div className="section-header ledger-title">Recent Transactions</div>

      <TransactionControls />

      <table className="ledger-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Receiver</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={6} className="empty-message">
                No transactions found for this search.
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
                  <button className="Delete-button" onClick={() => deleteTransaction(tx.id)}>
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