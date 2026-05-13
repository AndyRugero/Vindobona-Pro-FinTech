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