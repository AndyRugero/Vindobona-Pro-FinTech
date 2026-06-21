import React, { useState } from 'react';
import { useTransactionContext } from '../Context/TransactionContext';
import '../Styles/TransactionForm.css';

const TransactionForm: React.FC = () => {
  const { addTransaction } = useTransactionContext();
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    if (receiver.trim() === '') {
      setError('Receiver name cannot be empty!');
      return;
    }

    if (amount.trim() === '') {
      setError('Amount cannot be empty!');
      return;
    }

    setError(null);
    // Use the global action instead of a prop!
    addTransaction(receiver, amount, category);
    
    // Reset form
    setReceiver('');
    setAmount('');
    setCategory('');
  };

  return (
    <div className="transaction-form">
      <div className="section-header">ADD TRANSACTION</div>
      {error && (<div className="error-box">!!{error}</div>)}

      <div className="form-group">
        <label>Receiver</label>
        <input value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="Receiver Name" />
      </div>

      <div className="form-group">
        <label>Amount</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="-€25.00" />
      </div>

      <div className="form-group">
        <label>Category</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Groceries" />
      </div>

      <button className="submit-button" onClick={handleAdd}>ADD</button>
    </div>
  );
};

export default TransactionForm;