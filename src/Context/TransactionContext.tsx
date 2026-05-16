import { createContext, useContext, useState, useMemo, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import type { Transaction } from '../Interfaces/Interfaces';
import { processTransactions } from '../Logic/TransactionLogic';
import { preparePieData, prepareTrendData } from '../Logic/AnalyticLogic';

/**
 * STEP 1: THE INTERFACE (The Menu)
 */
export interface TransactionContextType {
    // 1. The master list of all transactions
    ledgerData: Transaction[];
    
    // 2. Function to add/remove/edit transactions
    setLedgerData: Dispatch<SetStateAction<Transaction[]>>;
    
    // 3. The current text inside the search bar
    searchTerm: string;
    
    // 4. Function to change the search text
    setSearchTerm: Dispatch<SetStateAction<string>>;
    
    // 5. The "Smart List" that updates as you search
    filteredData: Transaction[];

    // --- The Math Totals (calculator) ---
    totalBalance: number;
    income: number;
    expenses: number;

    // --- Analytic Data (Charts) ---
    pieData: any[];
    trendData: any[];
}

/**
 * THE CLOUD BLUEPRINT
 */
export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

/**
 * THE POWER STATION (The Provider)
 */
export const TransactionProvider = ({ children }: { children: ReactNode }) => {
    // A. Storage Units
    const [ledgerData, setLedgerData] = useState<Transaction[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // B. THE SMART FILTER (memorizes filteredData)
    const filteredData = useMemo(() => {
        return processTransactions(ledgerData, searchTerm, "Date", "");
    }, [ledgerData, searchTerm]);

    // C. THE ACCOUNTING DEPARTMENT (The Math)
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

    // D. THE ANALYTIC BRAIN (Charts)
    // We use filteredData here so the charts update as you search!
    const pieData = useMemo(() => preparePieData(filteredData), [filteredData]);
    const trendData = useMemo(() => prepareTrendData(filteredData), [filteredData]);

    // E. THE BROADCAST
    return (
        <TransactionContext.Provider value={{
            ledgerData,
            setLedgerData,
            searchTerm,
            setSearchTerm,
            filteredData,
            totalBalance,
            income,
            expenses,
            pieData,
            trendData
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

/**
 * THE CUSTOM HOOK (The Subscriber)
 */
export const useTransactionContext = () => {
    const context = useContext(TransactionContext);
    
    if (!context) {
        throw new Error("useTransactionContext must be used within a TransactionProvider");
    }
    
    return context;
};
