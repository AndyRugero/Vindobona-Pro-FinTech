import { useState } from 'react';
import type { Transaction } from '../Interfaces/Interfaces';
//   
import { TransactionService } from './TransactionService';

export const useTransactions = () => {
    const [ledgerData, setLedgerData] = useState<Transaction[]>([
        {
            id: '1',
            date: '15.05.2026',
            amount: '-$33.50',
            category: 'Groceries',
            receiver: 'BILLA AG',
            isNegative: true
        }
    ]);


    const saveNewEntry = (receiver: string, amount: string, category: string) => {
        const finalCategory = category || TransactionService.predictCategory(receiver);

        const newTx: Transaction = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            amount: amount,
            category: finalCategory,
            receiver: receiver,
            isNegative: amount.includes('-')
        };

        setLedgerData([...ledgerData, newTx]);
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
        income,
        expenses,
        totalBalance,
    };
};
