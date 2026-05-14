import type { Transaction } from "../Interfaces/Interfaces";


export const preparePieData = (transactions: Transaction[]) => {
    if (!Array.isArray(transactions)) return [];
    const categoryMap: { [key: string]: number } = {};

    transactions.forEach(tx => {
        if (tx.isNegative) {
            const category = tx.category || "Uncategorized";
            const amount = Math.abs(parseFloat(tx.amount.replace(/[^0-9.-]+/g, "")));

            if (!isNaN(amount)) {
                if (categoryMap[category]) {
                    categoryMap[category] += amount;
                } else {
                    categoryMap[category] = amount;
                }
            }
        }
    });

    return Object.keys(categoryMap).map(catName => ({
        name: catName,
        value: categoryMap[catName]
    }));
};

export const prepareTrendData = (transactions: Transaction[]) => {
    const dateMap: { [key: string]: { income: number; expenses: number } } = {};

    transactions.forEach(tx => {
        const date = tx.date || "Unknown";
        const amount = Math.abs(parseFloat(tx.amount.replace(/[^0-9.-]+/g, "")));

        if (!isNaN(amount)) {
            if (!dateMap[date]) {
                dateMap[date] = { income: 0, expenses: 0 };
            }

            if (tx.isNegative) {
                dateMap[date].expenses += amount;
            } else {
                dateMap[date].income += amount;
            }
        }
    });

    return Object.keys(dateMap)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map(date => ({
            date,
            income: dateMap[date].income,
            expenses: dateMap[date].expenses
        }));
};
