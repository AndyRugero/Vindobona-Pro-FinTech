# 🌌 The Hologram Dashboard: Technical Blueprint

This document explains how the **Income & Expenses (Hologram Graph)** and the **Spending Distribution (Donut Chart)** are built using a "Divide & Conquer" architecture.

---

## 🏗️ 1. The Architecture (The Data Flow)

Your dashboard follows a 3-layer system:

1.  **The Source (Context API)**: `TransactionContext.tsx` holds the "Source of Truth." It filters the raw data based on your search/date and provides it to the charts.
2.  **The Brain (Logic Layer)**: `AnalyticLogic.ts` performs the math (sums, groups, and averages).
3.  **The Beauty (Visual Layer)**: `CashFlowTrend.tsx` and `SpendingDistribution.tsx` use **Recharts** to render the data, styled by **Analytics.css**.

---

## 🧮 2. The Math (How we process numbers)

Located in: `src/Logic/AnalyticLogic.ts`

### A. The Trend Math (`prepareTrendData`)
To create a line graph, Recharts needs an array of objects like this: `[{date: 'Mon', income: 5000, expenses: 2000}]`.
*   **Step 1**: We create a map of the last 7 days.
*   **Step 2**: We loop through your transactions.
*   **Step 3**: If a transaction is on "Monday" and is **Positive**, we add it to the `income` bucket for Monday.
*   **Step 4**: If it is **Negative**, we take the `Math.abs()` (to make it a positive number for the graph height) and add it to the `expenses` bucket.

### B. The Pie Math (`preparePieData`)
*   **Step 1**: We group all transactions by their `category` (e.g., "Food", "Tech").
*   **Step 2**: We sum the total spent in each category.
*   **Step 3**: Recharts automatically calculates the "Angle" of the slice based on: 
    ` (Category Total / Grand Total) * 360 degrees `.

---

## 🎨 3. The Visuals (How to build the Hologram)

### A. The Big Graph (`CashFlowTrend.tsx`)
*   **The Glow**: We use `<defs>` and `<linearGradient>` inside the SVG. This creates the "fade-to-transparent" look under the lines.
*   **The Hologram Layers**: 
    *   **Layer 1 (Blue)**: A thick solid line (`strokeWidth={4}`) with white dots (`dot={true}`).
    *   **Layer 2 (Green)**: A dashed line (`strokeDasharray="5 5"`) that sits behind the blue one.
*   **Y-Axis Math**: We use a `tickFormatter` to turn `50000` into `50k`, keeping the UI clean.

### B. The Donut Chart (`SpendingDistribution.tsx`)
*   **Donut Shape**: We set `innerRadius={70}` and `outerRadius={100}`. The gap in the middle creates the "Donut" effect.
*   **Central Text**: We use a `div` with `position: absolute` placed exactly in the center of the chart wrapper.

---

## 🧼 4. The CSS "Divide & Conquer"

Located in: `src/Styles/Analytics.css`

*   **Neon Glow**: We use `filter: drop-shadow(0 0 8px #color)` on the SVG paths. This is what makes the lines look like they are made of light.
*   **Modular Headers**: We use `justify-content: space-between` in the header so the Title is on the left and the **Time Selector** is on the right.
*   **CurrentColor**: In the `StatCards`, we use `stroke="currentColor"`. This allows the chart to "steal" the color defined in the CSS file.

---

## 📝 5. Checklist for Tomorrow
If you want to repeat this tomorrow, follow these steps:
1.  [ ] **State**: Ensure `TransactionContext` provides a `filteredData` array.
2.  [ ] **Logic**: Map that data into a "Chart-Friendly" format in `AnalyticLogic.ts`.
3.  [ ] **Gradients**: Define your `<linearGradient>` IDs first.
4.  [ ] **Glow**: Add the `drop-shadow` filter in your CSS file.
5.  [ ] **Legend**: Build a custom `div` legend instead of the default Recharts one for more control.

**You are now a Master of Fintech UI!** 🚀🤖🦾✨
