import {
    createContext, useContext, useState, useEffect, useMemo, type ReactNode,
    type Dispatch, type SetStateAction
} from 'react';
import type { Transaction } from '../Interfaces/Interfaces';
import { processTransactions } from '../Logic/TransactionLogic';
import { preparePieData, prepareTrendData } from '../Logic/AnalyticLogic';
import { API_BASE_URL } from '../config';

/**
 * THE UNIFIED MENU
 */
export interface TransactionContextType {
    ledgerData: Transaction[];
    setLedgerData: Dispatch<SetStateAction<Transaction[]>>;
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    sortBy: string;
    setSortBy: Dispatch<SetStateAction<string>>;
    filterDate: string;
    setFilterDate: Dispatch<SetStateAction<string>>;
    filteredData: Transaction[];
    totalBalance: number;
    income: number;
    expenses: number;
    pieData: any[];
    trendData: any[];
    addTransaction: (receiver: string, amount: string, category: string) => void;
    deleteTransaction: (id: string) => void;
    importTransactions: (data: Transaction[]) => void;
}

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const API_URL = `${API_BASE_URL}/api/transactions`;

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
    const [ledgerData, setLedgerData] = useState<Transaction[]>([]);

    // fetch from Backend (Securely with JWT Token)
    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Authorization Error:", data.error);
                    return;
                }
                setLedgerData(data);
            })
            .catch(error => console.error("Error loading transactions", error));
    }, []);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("Date");
    const [filterDate, setFilterDate] = useState("");

    const filteredData = useMemo(() => {
        return processTransactions(ledgerData, searchTerm, sortBy, filterDate);
    }, [ledgerData, searchTerm, sortBy, filterDate]);

    const totalBalance = useMemo(() => {
        return ledgerData.reduce((acc, tx) => {
            const amount = parseFloat(tx.amount.replace(/[^\d.-]/g, '')) || 0;
            return acc + amount;
        }, 0);
    }, [ledgerData]);

    const income = useMemo(() => {
        return ledgerData
            .filter(tx => !tx.isNegative)
            .reduce((acc, tx) => acc + (parseFloat(tx.amount.replace(/[^\d.-]/g, '')) || 0), 0);
    }, [ledgerData]);

    const expenses = useMemo(() => {
        return ledgerData
            .filter(tx => tx.isNegative)
            .reduce((acc, tx) => acc + (parseFloat(tx.amount.replace(/[^\d.-]/g, '')) || 0), 0);
    }, [ledgerData]);

    const pieData = useMemo(() => preparePieData(filteredData), [filteredData]);
    const trendData = useMemo(() => prepareTrendData(filteredData), [filteredData]);

    //  1. ADD TRANSACTION: Sends new transaction data to the backend Express server
    const addTransaction = (receiver: string, amount: string, category: string) => {
        const token = localStorage.getItem('token');
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Attach secure token
            },
            body: JSON.stringify({ receiver, amount, category })
        })
            .then(response => response.json())
            .then(newTx => {
                if (newTx.error) {
                    console.error("Error adding transaction:", newTx.error);
                    return;
                }
                setLedgerData(prev => [newTx, ...prev]);
            })
            .catch(error => {
                console.error("Error adding transaction:", error);
            });
    };

    // 🚂 2. DELETE TRANSACTION: Tells the backend Express server to delete a transaction by its ID
    const deleteTransaction = (id: string) => {
        const token = localStorage.getItem('token');
        fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}` // Attach secure token
            }
        })
            .then(response => {
                if (response.ok) {
                    setLedgerData(prev => prev.filter(tx => tx.id !== id));
                } else {
                    console.error("Failed to delete transaction from the server");
                }
            })
            .catch(error => {
                console.error("Error deleting transaction:", error);
            });
    };

    const importTransactions = (data: Transaction[]) => {
        setLedgerData(prev => [...data, ...prev]);
    };

    return (
        <TransactionContext.Provider value={{
            ledgerData, setLedgerData, searchTerm, setSearchTerm, sortBy, setSortBy, filterDate, setFilterDate,
            filteredData, totalBalance, income, expenses, pieData, trendData,
            addTransaction, deleteTransaction, importTransactions
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactionContext = () => {
    const context = useContext(TransactionContext);
    if (!context) throw new Error("useTransactionContext must be used within a TransactionProvider");
    return context;
};
