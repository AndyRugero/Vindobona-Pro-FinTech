# 📘 Day 1–6 Revision Plan: UI Layouts & Reusable Components

This guide is your step-by-step revision study plan for the first six days of your **Vindobona Pro FinTech** code mastery course. It focuses on translating layout mockups into production-ready React TSX code and Vanilla CSS from scratch.

---

## 🎨 Day 1–3: HTML5 & CSS Layout Mastery (Flexbox & Containers)

### 🎯 Objective
Rebuild the structural dashboard grid, the **Sidebar** layout, and the **Topbar** navbar using HTML5 semantic tags, CSS Flexbox, and CSS Grid. You must understand how to position items without using bootstrap or visual builders.

```
+-----------------------------------------------------------------+
|  Logo  |  Topbar (Breadcrumbs ------------ Welcome, User! [3] ) |
|--------+--------------------------------------------------------|
|  (Nav) |                                                        |
|  Dash  |  Main Content Container                                |
|  Cards |                                                        |
|  Trans |  [ StatCard ] [ StatCard ] [ StatCard ] [ StatCard ]   |
|        |                                                        |
|  Help  |  [      Recent Ledger       ]   [ Add Transaction ]    |
|        |                                                        |
+-----------------------------------------------------------------+
```

### 1. Flexbox Cheat Sheet Reference
Before coding, memorize these core layout behaviors:
*   `display: flex;`: Turns any container into a flex layout context.
*   `flex-direction: row | column;`: Defines the main axis (row = left-to-right, column = top-to-bottom).
*   `justify-content`: Aligns items along the **main** axis.
    *   `space-between`: Pushes items to the absolute edges (e.g., Breadcrumb on left, User profile on right).
    *   `center`: Centers elements.
*   `align-items: center;`: Aligns items along the **cross** axis (e.g., centering text vertically inside a tall topbar).
*   `flex: 1;`: Tells an element to stretch and fill the remaining space in a row/column container.

---

### 🏋️ Exercises: Sidebar & Topbar Layouts

#### Exercise 1: Rebuilding the Topbar Navbar (`src/Components/Topbar.tsx`)
Create a semantic `<header>` wrapper containing a breadcrumb path on the left and utility tools (user greetings, notification bubble, theme toggles, logout action button) on the right.

**TSX Skeleton (`src/Components/Topbar.tsx`):**
```typescript
import React from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';
import '../Styles/Topbar.css';

interface TopbarProps {
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onLogout?: () => void;
  username?: string;
}

const Topbar: React.FC<TopbarProps> = ({ theme = 'dark', onToggleTheme, onLogout, username = 'Andy R.' }) => {
  return (
    <header className="topbar">
      {/* Left: Breadcrumbs (Flex row) */}
      <div className="breadcrumb">
        <span className="breadcrumb__root">Home</span>
        <span className="breadcrumb__separator">/</span>
        <span className="breadcrumb__current">Overview</span>
      </div>

      {/* Right: Actions and Status Indicators (Flex row) */}
      <div className="topbar__actions">
        <span className="user-welcome">Hello, {username}!</span>
        
        {/* Notification Bubble */}
        <div className="topbar-icon notification">
          <span className="notification-badge">3</span>
        </div>

        {/* Theme Action toggle */}
        <div className="theme-toggle" onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </div>

        {onLogout && (
          <button onClick={onLogout} className="logout-btn">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
```

**CSS Layout rules (`src/Styles/Topbar.css`):**
```css
.topbar {
  display: flex;
  justify-content: space-between; /* Pushes breadcrumb left, actions right */
  align-items: center;            /* Vertical centering */
  height: 70px;
  padding: 0 24px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 20px;
}
```

---

## 🎨 Day 4–6: Reusable Visual Components (State & Isolated Props)

### 🎯 Objective
Learn to create independent React presentation widgets that get data injected via TypeScript props. We will construct:
1.  **`<StatCard />`**: Dashboard widgets displaying income, expenses, and savings with stylized micro-sparks charts.
2.  **BEM Styling Patterns**: Utilizing isolated modifier classes (`stat-card--income`, `stat-card--expenses`) to style colors without styling conflicts.

---

### 🏋️ Exercises: StatCard Widget

#### Exercise: Rebuilding the StatCard Component (`src/Components/StatCard.tsx`)
This component maps values dynamically (label, currency amount, custom color styling, and dynamic charts). It uses the BEM (Block, Element, Modifier) CSS schema to keep code clean and isolated.

**TSX Component (`src/Components/StatCard.tsx`):**
```typescript
import React from 'react';
import { Maximize2 } from 'lucide-react';
import '../Styles/StatCard.css';

interface StatCardProps {
  label: string;
  value: string;
  type?: 'income' | 'expenses' | 'savings' | 'warning';
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  type = 'savings',
  icon
}) => {
  return (
    <div className={`stat-card stat-card--${type}`}>
      {/* Top section: Header icon + Action click */}
      <div className="stat-card__top">
        <div className="stat-card__icon-box">
          {icon}
        </div>
        <Maximize2 size={14} className="stat-card__expand" />
      </div>

      {/* Main card info container */}
      <div className="stat-card__body">
        <div className="stat-card__info">
          <div className="stat-card__label">{label}</div>
          <div className="stat-card__value">{value}</div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
```

**BEM Isolated CSS Stylesheet (`src/Styles/StatCard.css`):**
```css
/* Block Layout */
.stat-card {
  background: #131c31;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* Elements Layout */
.stat-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-card__icon-box {
  padding: 8px;
  border-radius: 8px;
}

.stat-card__label {
  color: #64748b;
  font-size: 12px;
  text-transform: uppercase;
}

.stat-card__value {
  font-size: 24px;
  font-weight: 700;
  color: #f8fafc;
  margin-top: 4px;
}

/* Modifiers (Income, Expenses, Savings) */
.stat-card--income .stat-card__icon-box {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-card--expenses .stat-card__icon-box {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-card--savings .stat-card__icon-box {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}
```

---

### 📝 Key Takeaways for Tomorrow's Practice:
1.  **Strict Props Control:** Notice how `StatCard` does not keep its own local state. It accepts `label`, `value`, and `type` from the parent dashboard page, making it 100% reusable across different dashboards.
2.  **No Global Style Overlaps:** Always name classes relative to the block prefix (e.g. `.stat-card__label`) so you can copy and paste this component elsewhere without breaking layout grids.
3.  **Flexbox Mastery:** Make sure you can write the `display: flex; justify-content: space-between;` layouts without needing to look at reference sheets!
