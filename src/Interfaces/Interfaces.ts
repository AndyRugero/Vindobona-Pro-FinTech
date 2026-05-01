export interface Transaction {
    id: string;
    date: string;
    amount: string;
    category: string;
    receiver: string;
    isNegative: boolean;
    status: string;
}

export interface StatItem {
    label: string;
    value: string;
    animationDelay?: string; // ?optional
}
