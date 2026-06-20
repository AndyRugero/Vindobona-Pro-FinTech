import TransactionControls from './TransactionControls';
import { useTransactionContext } from '../Context/TransactionContext';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { API_BASE_URL } from '../config';
import '../Styles/TransactionList.css';

const TransactionList = () => {
  const { filteredData, deleteTransaction } = useTransactionContext();

  // 📄 Triggers the browser statement download for CSV or PDF formats (Lesson 54)
  const handleExport = async (format: 'csv' | 'pdf') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions/export/${format}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error(`Failed to generate ${format.toUpperCase()} statement.`);

      // Convert response stream to blob object
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary hidden anchor to trigger download action in browser
      const link = document.createElement('a');
      link.href = url;
      
      const username = localStorage.getItem('username') || 'customer';
      link.download = format === 'csv' 
        ? 'vindobona_transactions.csv' 
        : `vindobona_statement_${username}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Statement export failed:`, err);
    }
  };

  return (
    <div className="central-ledger">
      {/* Flex container separating title from file stream download buttons */}
      <div className="ledger-header">
        <div className="section-header ledger-title">Recent Transactions</div>
        <div className="export-btn-group">
          <button 
            onClick={() => handleExport('csv')} 
            className="export-btn"
            title="Download CSV spreadsheet"
          >
            <FileSpreadsheet size={16} />
            Export CSV
          </button>
          <button 
            onClick={() => handleExport('pdf')} 
            className="export-btn"
            title="Download PDF statement"
          >
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      </div>

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