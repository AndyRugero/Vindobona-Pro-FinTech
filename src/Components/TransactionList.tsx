import TransactionControls from './TransactionControls';
import { useTransactionContext } from '../Context/TransactionContext';
// 1. Corrected 'FilreText' typo to 'FileText' so the icon loads properly
import { FileSpreadsheet, FileText } from 'lucide-react';
// 2. Import the API URL from your configuration file
import { API_BASE_URL } from '../config';
import '../Styles/TransactionList.css';

const TransactionList = () => {
  const { filteredData, deleteTransaction } = useTransactionContext();

  // 📄 Triggers the browser statement download for CSV or PDF formats
  // Why: To securely request generated files from the backend and save them locally.
  const handleExport = async (format: 'csv' | 'pdf') => {
    // A. Retrieve the secure session token from browser localStorage
    // Why: Gated backend routes require authorization to verify session validity
    const token = localStorage.getItem('token');
    if (!token) return; // Abort early if the user is not logged in

    try {
      // B. Fetch the generated document file from the server
      // Why: Requests the backend to generate the CSV text or compile the PDF statement
      const response = await fetch(`${API_BASE_URL}/api/transactions/export/${format}`, {
        method: 'GET',
        headers: {
          // Why: Passes the Bearer token with a space so the backend knows which user's ledger to export
          Authorization: `Bearer ${token}`
        }
      });

      // C. Check if the server successfully completed the document generation
      // Why: If the database query failed or token is invalid, throw an error
      if (!response.ok) {
        throw new Error(`Failed to generate ${format.toUpperCase()} statement`);
      }

      // D. Convert the incoming raw response stream into a binary Blob (Binary Large Object)
      // Why: Keeps the file contents safe in browser memory as a raw file data container
      const blob = await response.blob();

      // E. Create a temporary URL pointing to the Blob object in the browser's RAM
      // Why: This lets the browser access the binary file using a simple string URL
      const url = window.URL.createObjectURL(blob);

      // G. Programmatically create a virtual anchor element <a> in the document memory
      // Why: React does not have a native "download file" hook, so we mimic standard HTML link clicks
      const link = document.createElement('a');
      link.href = url; // Link the virtual anchor to our temporary memory URL

      const username = localStorage.getItem('username') || 'customer';

      // H. Select filename based on format and assign to link.download attribute
      // Why: Personalizes the PDF filename to match the user account owner
      link.download = format === 'csv'
        ? 'vindobona_transactions.csv'
        : `vindobona_statement_${username}.pdf`;

      // I. Attach the link to the DOM body, click it, and clean it up immediately
      // Why: Browser security policies require the element to exist in the body for clicks to trigger the download
      document.body.appendChild(link);
      link.click(); // Trigger the click execution
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Free up RAM from the temporary Blob URL

    } catch (err) {
      // Why: Catches server network offline errors, database lockups, or connection timeouts
      console.error('Statement export failed:', err);
    }
  };

  return (
    <div className="central-ledger">
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
                  {tx.amount.includes('€') 
                    ? (tx.amount.startsWith('+') ? tx.amount.replace('+', '') : tx.amount) 
                    : `${tx.isNegative ? '-' : ''}€${Math.abs(parseFloat(tx.amount)).toFixed(2)}`}
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