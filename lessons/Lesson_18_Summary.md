# 🧠 Lesson 18: Bringing the Search and Sort to Life

In Lesson 17, we built the UI controls (Search, Date, Sort) and the "Memory" variables for them. However, right now they don't do anything because we are still printing the raw `transactions` array directly to the table.

In this lesson, we will implement the **Derived State Pipeline** inside `TransactionList.tsx`.

## The Pipeline

Before we draw the `<tbody>`, we want to pass our `transactions` through a pipeline:

1. **The Raw Data**: Start with the raw `transactions` array.
2. **The Filter (Search)**: Remove anything that doesn't match the `searchTerm`.
3. **The Sorter**: Re-order the remaining items based on the `sortBy` dropdown.
4. **The Render**: Hand the final, processed list to the `.map()` loop.

### Why is this powerful?
Because we never actually touch or modify the data in the Brain (`useTransactions.ts`). The real data is perfectly safe. We are just wearing "sunglasses" that change how we *view* the data!

---

## Step 1: The Search Filter
We will create a new variable called `processedList`. We will take `transactions` and run `.filter()` on it to check if the `receiver` name includes the letters we typed into the `searchTerm`.

## Step 2: The Sort
After filtering, we will run `.sort()` on the `processedList`. `.sort()` compares two items (A and B) and decides which one should go first based on our Dropdown variable (`sortBy`).

---

Let's jump into the code!
