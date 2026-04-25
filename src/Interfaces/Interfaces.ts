export interface Transaction {
    id: string;
    date: string;
    amount: string;
    category: string;
    receiver: string;
    isNegative: boolean;
}

export interface StatItem {
    label: string;
    value: string;
    animationDelay?: string; // ?optional
}
