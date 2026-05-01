import type { Transaction } from '../Interfaces/Interfaces';

/**
 * This file handles all the heavy math and logic for filtering and sorting.
 * By keeping it here, our UI Components stay clean and easy to read.
 * This is perfect Divide & Conquer (Separation of Concerns).
 */
export function processTransactions(
    rawTransactions: Transaction[],
    searchTerm: string,
    sortBy: string,
    filterDate: string
): Transaction[] {

    // 1. FILTER: Search Bar Logic
    let processedList = rawTransactions.filter((tx) => {
        const matchesSearch = (searchTerm === "") || tx.receiver.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDate = filterDate === "" || tx.date === filterDate;
        return matchesSearch && matchesDate;


        // Check if the Receiver name includes what the user typed

    });

    // 2. SORT: Dropdown Logic
    processedList.sort((a, b) => {
        if (sortBy === "Amount") {
            // Clean the strings (remove EUR, $ etc) to compare raw math numbers
            const numA = parseFloat(a.amount.replace(/[^\d.-]/g, '')) || 0;
            const numB = parseFloat(b.amount.replace(/[^\d.-]/g, '')) || 0;
            return numB - numA; // Sort Highest to Lowest
        }

        if (sortBy === "Receiver") {
            return a.receiver.localeCompare(b.receiver); // Sort A-Z
        }

        if (sortBy === "Category") {
            return a.category.localeCompare(b.category); // Sort A-Z
        }

        return 0; // Default: Date (leave in current order)
    });

    return processedList;
}
