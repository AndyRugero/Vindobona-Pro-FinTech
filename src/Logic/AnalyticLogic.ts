import type { Transaction } from '../Interfaces/Interfaces';

// 📈 skeleton for the main graph(income expenses and savings)
export const prepareTrendData = (transactions: Transaction[]) => {
    // 1. map to group everything by date
    const dailyData = new Map<string, { date: string; income: number; expenses: number; savings: number }>();

    // Create an ordered list of days to ensure chronological order
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Pre-populate all 7 days with 0 values so the graph always renders complete lines
    dayOrder.forEach(day => {
        dailyData.set(day, { date: day, income: 0, expenses: 0, savings: 0 });
    });

    // 2. loop every transaction in the list
    transactions.forEach(tx => {
        const amount = Math.abs(parseFloat(tx.amount.replace(/[^\d.-]/g, '')) || 0);

        let dateKey = tx.date;

        // Normalize full dates into short day names (e.g. 'Mon')
        if (!dayOrder.includes(dateKey)) {
            let parsedDate = new Date(dateKey);

            // Handle D.M.YYYY or DD.MM.YYYY formats which would otherwise cause Invalid Date
            // or incorrectly parse (e.g. 12.5.2026 becoming Dec 5th)
            const dotMatch = dateKey.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
            if (dotMatch) {
                const day = parseInt(dotMatch[1], 10);
                const month = parseInt(dotMatch[2], 10) - 1;
                const year = parseInt(dotMatch[3], 10);
                parsedDate = new Date(year, month, day);
            } else if (isNaN(parsedDate.getTime())) {
                // Fallback for DD/MM/YYYY formats if standard parsing fails
                const slashMatch = dateKey.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                if (slashMatch) {
                    const first = parseInt(slashMatch[1], 10);
                    const second = parseInt(slashMatch[2], 10);
                    const year = parseInt(slashMatch[3], 10);
                    parsedDate = new Date(year, second - 1, first);
                }
            }

            if (!isNaN(parsedDate.getTime())) {
                dateKey = parsedDate.toLocaleDateString('en-US', { weekday: 'short' });
            }
        }

        // If this date doesn't exist in our map yet, set it to 0s
        if (!dailyData.has(dateKey)) {
            dailyData.set(dateKey, { date: dateKey, income: 0, expenses: 0, savings: 0 });
        }

        const dayStats = dailyData.get(dateKey)!;

        // Sort the transaction into income or expenses
        if (tx.isNegative) {
            dayStats.expenses += amount;
        } else {
            dayStats.income += amount;
        }

        // Calculate Net Savings (Income - Expenses)
        dayStats.savings = dayStats.income - dayStats.expenses;
    });

    // Convert map to list and sort chronologically (Mon -> Sun)
    return Array.from(dailyData.values()).sort((a, b) => {
        const indexA = dayOrder.indexOf(a.date);
        const indexB = dayOrder.indexOf(b.date);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
    });
};

//  skeleton for the donut pie chart
export const preparePieData = (transactions: Transaction[]) => {
    // 1. Create a map called categories
    const categories = new Map<string, number>();

    // 2. Loop through every transaction in the list
    transactions.forEach(tx => {
        // We ONLY care about negative transactions (spending/expenses)
        if (tx.isNegative) {
            const amount = Math.abs(parseFloat(tx.amount.replace(/[^\d.-]/g, '')) || 0);
            const category = tx.category || 'Other';

            // Get the current total for this category (or 0 if new)
            const currentTotal = categories.get(category) || 0;

            // Add the new amount to the category's running total
            categories.set(category, currentTotal + amount);
        }
    });

    // 3. Convert the categories Map to [{ name, value }] for the chart
    return Array.from(categories.entries()).map(([name, value]) => ({
        name,
        value
    }));
};
