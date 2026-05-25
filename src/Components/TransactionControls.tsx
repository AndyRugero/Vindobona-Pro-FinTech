import React from 'react';
import { useTransactionContext } from '../Context/TransactionContext';

const TransactionControls: React.FC = () => {
    // Grab everything directly from the Cloud!
    const { 
        searchTerm, setSearchTerm, 
        filterDate, setFilterDate, 
        sortBy, setSortBy 
    } = useTransactionContext();

    return (
        <div className="control-panel">
            {/* Search */}
            <input 
              type="text" 
              placeholder="Search Receiver or Category..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            
            {/* Calendar */}
            <input 
              type="date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)} 
            />
            
            {/* Dropdown */}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="Date">Sort by Date</option>
              <option value="Amount">Sort by Amount</option>
              <option value="Receiver">Sort by Name</option>
              <option value="Category">Sort by Category</option>
            </select>
        </div>
    );
};

export default TransactionControls;