CREATE TABLE transactions(
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    receiver TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT  DEFAULT 'General',
    is_negative INTEGER NOT NULL,
    status TEXT DEFAULT 'Completed'

);
--INSERT (Create) two initial transactions
INSERT INTO transactions(id, date, receiver, amount, category, is_negative, status)
VALUES ('m1', 'mon','Salary',75000.00, 'Salary',0, 'Complete');

INSERT INTO transactions (id, date, receiver, amount, category, is_negative, status)
VALUES ('m2', 'Tue', 'Apple', -15000.00, 'Tech', 1, 'Complete');
--read all
SELECT*FROM transactions;
--delet
DELETE FROM transactions WHERE id = 'm2';