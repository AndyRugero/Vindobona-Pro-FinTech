import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import type { Transaction } from '../Interfaces/Interfaces';
import { TransactionService } from '../Hooks/TransactionService';

interface Props {
    onImport: (data: Transaction[]) => void;
    onBack: () => void;
}

const CSVImportView: React.FC<Props> = ({ onImport, onBack }) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<Transaction[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setError('Please select a valid CSV file.');
                return;
            }
            setFile(selectedFile);
            setError(null);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').filter(row => row.trim() !== '');

            const dataRows = rows.slice(1);

            const parsedData = dataRows.map((row, index) => {
                const columns = row.split(',').map(col => col.trim().replace(/^"|"$/g, ''));

                const date = columns[0] || new Date().toLocaleDateString();
                const receiver = columns[1] || 'Unknown';
                const amount = columns[2] || '0';
                const category = columns[3] || TransactionService.predictCategory(receiver);

                return {
                    id: `import-${Date.now()}-${index}`,
                    date,
                    receiver,
                    amount,
                    category,
                    isNegative: amount.includes('-'),
                    status: 'Complete'
                };
            });

            setPreview(parsedData);
        };
        reader.readAsText(file);
    };

    const handleConfirmImport = () => {
        if (preview.length > 0) {
            onImport(preview);
            onBack();
        }
    };

    return (
        <div className="csv-import-container">
            <div className="import-header">
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="dashboard-header__title">Import Transactions (CSV)</h2>
            </div>

            <div className="upload-zone">
                <input
                    type="file"
                    accept=".csv"
                    id="csv-upload"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <label htmlFor="csv-upload" className="upload-label">
                    <div className="upload-icon-container">
                        <Upload size={48} color="#eab308" style={{ opacity: 0.8 }} />
                    </div>
                    <h3 className="upload-title">{file ? file.name : 'Choose a CSV file'}</h3>
                    <p className="upload-subtitle">
                        Drag and drop your bank statement or click to browse
                    </p>
                </label>
            </div>

            {error && (
                <div className="import-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {preview.length > 0 && (
                <div className="import-preview-section">
                    <h3 className="preview-status">
                        <CheckCircle size={20} color="#10b981" />
                        Ready to import {preview.length} transactions
                    </h3>

                    <div className="preview-table-wrapper">
                        <table className="ledger-table" style={{ margin: 0 }}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Receiver</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.slice(0, 10).map((tx) => (
                                    <tr key={tx.id}>
                                        <td>{tx.date}</td>
                                        <td>{tx.receiver}</td>
                                        <td>{tx.category}</td>
                                        <td className={`amount ${tx.isNegative ? 'negative' : 'positive'}`}>{tx.amount}</td>
                                    </tr>
                                ))}
                                {preview.length > 10 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                                            + {preview.length - 10} more transactions...
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <button
                        className="submit-button preview-confirm-btn"
                        onClick={handleConfirmImport}
                    >
                        CONFIRM IMPORT
                    </button>
                </div>
            )}
        </div>
    );
};

export default CSVImportView;
