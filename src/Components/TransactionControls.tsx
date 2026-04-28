import React from 'react';

// The Blueprint
interface ControlsProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterDate: string;
    setFilterDate: (date: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}

const TransactionControls: React.FC<ControlsProps> = ({ 
    searchTerm, setSearchTerm, 
    filterDate, setFilterDate, 
    sortBy, setSortBy 
}) => {
    return (
        <div className="control-panel">
            {/* Search */}
            <input 
              type="text" 
              placeholder="Search by Receiver..." 
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