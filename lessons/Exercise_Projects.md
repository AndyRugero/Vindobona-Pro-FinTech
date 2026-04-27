# 🏋️‍♂️ Morning Exercise: 5 Mini-Projects

Use these small challenges to practice the "Vindobona Patterns" (`useState`, `includes`, `||`, and `onAdd`).

---

## 1. The "Smart" To-Do List
**Goal**: Create a task list that "guesses" the category.
*   **The Logic**: If the task text `.includes("Buy")`, set category to "Shopping" using the `||` trick.
*   **Code Pattern**:
    ```tsx
    const handleAddTask = (text: string) => {
        const category = text.includes("Buy") ? "Shopping" : "General";
        const newTask = { text, category: category || "None" };
        // Save to state...
    };
    ```

## 2. The Email Contact Filter
**Goal**: Detect if a contact is Work or Personal.
*   **The Logic**: If the email `.includes("@work.com")`, it's a colleague.
*   **Code Pattern**:
    ```tsx
    const isWork = email.includes("@work.com");
    return <div className={isWork ? "blue-text" : "green-text"}>{name}</div>;
    ```

## 3. The Music Mood Manager
**Goal**: Assign a mood to a song title.
*   **The Logic**: Use the `||` trick to provide a default mood if the user leaves it blank.
*   **Code Pattern**:
    ```tsx
    const addSong = (title: string, mood: string) => {
        const finalMood = mood || (title.includes("Happy") ? "Energetic" : "Chill");
        onAdd(title, finalMood);
    };
    ```

## 4. The Inventory "Alert" System
**Goal**: Flag items that need attention.
*   **The Logic**: If the item name `.includes("!!!")`, mark it as `isUrgent: true`.
*   **Code Pattern**:
    ```tsx
    const [itemName, setItemName] = useState("");
    const isUrgent = itemName.includes("!!!");
    
    <input 
        style={{ borderColor: isUrgent ? "red" : "gray" }}
        onChange={(e) => setItemName(e.target.value)} 
    />
    ```

## 5. The Component "Hand-off" (The App & Form)
**Goal**: Practice passing a function from a Parent to a Child.
*   **The Pattern**: Use the `React.FC<{ onAdd: ... }>` definition.
*   **Code Pattern**:
    ```tsx
    // The Child (Form)
    const SimpleForm: React.FC<{ onAdd: (v: string) => void }> = ({ onAdd }) => {
        const [value, setValue] = useState("");
        return <button onClick={() => onAdd(value)}>Send to Boss</button>;
    };

    // The Parent (App)
    const App = () => {
        const handleValue = (val: string) => console.log("Boss received:", val);
        return <SimpleForm onAdd={handleValue} />;
    };
    ```

---

### 💡 Daily Tip:
Try to write one of these from memory every morning. If you get stuck, look at the `Vindobona_Master_Guide.md`!
