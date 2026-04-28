import React, { useState } from 'react';

//  form to the Brain
const TransactionForm: React.FC<{ onAdd: (r: string, a: string, c: string) => void }> = ({ onAdd }) => {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');


  const handleAdd = () => {
    if (receiver && amount) {
      onAdd(receiver, amount, category);
      setReceiver('');
      setAmount('');
      setCategory('');
    }
  };

  return (
    <div className="transaction-form">
      <div className="section-header">ADD TRANSACTION</div>

      <div className="form-group">
        <label>Receiver</label>
        <input value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="Receiver Name" />
      </div>

      <div className="form-group">
        <label>Amount</label>
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="-$25.00" />
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