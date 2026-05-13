import { useState, useEffect } from 'react';
import type { Transaction } from '../Interfaces/Interfaces';
//   
import { TransactionService } from './TransactionService';

export const useTransactions = () => {
    const [ledgerData, setLedgerData] = useState<Transaction[]>(() => {
        try {
            const savedData = localStorage.getItem("vindobona_ledger");
            if (savedData && savedData !== "undefined") {
                const parsed = JSON.parse(savedData);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.error("Corrupted data found, resetting ledger.", e);
        }

        return [
            { id: '1', date: '15.05.2026', amount: '-$33.50', category: 'Groceries', receiver: 'BILLA AG', isNegative: true },
            { id: '2', date: '16.05.2026', amount: '-$10.99', category: 'Music', receiver: 'Spotify Premium', isNegative: true },
            { id: '3', date: '17.05.2026', amount: '-$55.00', category: 'Transport', receiver: 'OMV Petrol Station', isNegative: true },
            { id: '4', date: '18.05.2026', amount: '+$2800.00', category: 'Income', receiver: 'Monthly Salary', isNegative: false },
            { id: '8', date: '22.05.2026', amount: '-$42.00', category: 'Dining', receiver: 'Pizza Palace', isNegative: true },
        ];
    });
    //Watcher of useEffect

    useEffect(() => {
        const stringData = JSON.stringify(ledgerData);

        localStorage.setItem('vindobona_ledger', stringData);
    }, [ledgerData]);

    const saveNewEntry = (receiver: string, amount: string, category: string) => {
        const finalCategory = category || TransactionService.predictCategory(receiver);

        const newTx: Transaction = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            amount: amount,
            category: finalCategory,
            receiver: receiver,
            isNegative: amount.includes('-'),
            status: 'pending'
        };

        setLedgerData([...ledgerData, newTx]);

    };
    const deleteEntry = (idToRemove: string) => {
        const updatedList = ledgerData.filter(tx => tx.id !== idToRemove);
        setLedgerData(updatedList);
    };

    const importTransactions = (newList: Transaction[]) => {
        setLedgerData([...ledgerData, ...newList]);
    };




    // Expense Tracker calculation(SIMPLE FUNCTIONS AND variables)
    const cleanAmount = (amt: string) => parseFloat(amt.replace(/[^\d.]/g, '')) || 0;

    let income = 0;
    let expenses = 0;

    ledgerData.forEach(tx => {
        const Value = cleanAmount(tx.amount);

        if (tx.isNegative) {
            expenses += Value;

        }
        else { income += Value; }
    });
    const totalBalance = income - expenses;


    return {
        ledgerData,
        saveNewEntry,
        deleteEntry,
        importTransactions,

        income,
        expenses,
        totalBalance,
        status: 'Complete'
    };
};
