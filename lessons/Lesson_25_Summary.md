# Lesson 25: Data Visualization (Business Intelligence)

## 1. The Concept: Turning Rows into Insights
In the previous lessons, we built a robust system for adding, deleting, and importing transactions. However, a list of 100 rows is difficult for a human to understand at a glance.

**Data Visualization** is the process of taking raw arrays of objects and transforming them into shapes (slices, bars, and lines). This is the "Intelligence" layer of a FinTech app.

## 2. The Tool: Recharts
We are using **Recharts**, a composable charting library built specifically for React. 
*   **Declarative**: You define charts using components like `<LineChart>`, `<XAxis>`, and `<Tooltip>`.
*   **Responsive**: It automatically resizes to fit your dashboard grid.

## 3. The Challenge: Data Transformation
Charts don't understand our `Transaction` objects directly. They expect a specific format:
```json
[
  { "name": "Groceries", "value": 400 },
  { "name": "Rent", "value": 1200 }
]
```
Our main task in this lesson is to write **Logic** that iterates through your `ledgerData` and groups it by category.

## 4. Why This Matters
By building this, you are moving from a "Basic CRUD App" (Create, Read, Update, Delete) to a "Professional Dashboard" that provides real value to the user.

*Next Step: Install Recharts and build the Data Mapping Logic.*
