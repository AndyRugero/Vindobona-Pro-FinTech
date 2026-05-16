// This is for logic that doesn't need to 'refresh' the screen
export const TransactionService = {

    //saving methode
    save: (data: any[]) => {
        const jsonString = JSON.stringify(data);
        localStorage.setItem("Vindobona_ledger", jsonString);
    },

    //load from storage method
    fetchAsync: async (): Promise<any[]> => {
        //simulate to 1-second delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const rawData = localStorage.getItem
            ("Vindobona_ledger");
        if (!rawData) return [];//if empty list
        return JSON.parse(rawData);
    },


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

