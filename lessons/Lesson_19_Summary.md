# 🎨 Lesson 19: Adding the Status Column & Colored Pills

In our previous lesson, we successfully hooked up our Search and Sort logic using the powerful concept of Derived State. 

Now, we are going to make our table look incredibly premium by matching the mockup design you shared yesterday. We are going to add a new **Status** column featuring beautiful, color-coded badges!

## The Goal
Every transaction will now have a `status`. The status can be one of three things:
1. **Complete** (Green pill)
2. **Pending** (Yellow pill)
3. **Flagged** (Red pill)

To build this professional feature, we have to touch three different layers of our architecture:

1. **The Blueprint (`Interfaces.ts`)**: We have to tell TypeScript that the `Transaction` object is now allowed (and required) to have a `status` property.
2. **The Database (`useTransactions.ts`)**: We have to update our hardcoded Dummy Data so that every transaction actually has a status assigned to it.
3. **The UI (`TransactionList.tsx` & `App.css`)**: We have to add a new column to our table and write the CSS to make the pills look like modern glassmorphism badges.

---

## Step 1: Updating the Blueprint

Before we do anything else, we must inform the "Strict Boss" (TypeScript) about this new rule. If we don't update the Blueprint first, TypeScript will throw red errors the second we try to add a status to our data!

Let's go update `Interfaces.ts`!
