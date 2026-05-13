// This is for logic that doesn't need to 'refresh' the screen
export const TransactionService = {

    predictCategory: (receiver: string): string => {
        const name = receiver.toLowerCase();

        // We check if the name contains certain words
        if (name.includes('spar') || name.includes('billa')) {
            return 'Groceries';
        }

        if (name.includes('salary') || name.includes('deposit')) {
            return 'Income';
        }

        if (name.includes('shell') || name.includes('omv') || name.includes('ovm')) {
            return 'Transport';
        }

        if (name.includes('spotify') || name.includes('apple') || name.includes('music')) {
            return 'Music';
        }

        if (name.includes('netflix') || name.includes('disney') || name.includes('hbo')) {
            return 'Entertainment';
        }

        return 'General'; // Fallback if no match is found
    }
};
