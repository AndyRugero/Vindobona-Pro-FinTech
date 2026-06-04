# Lesson 48 Explanation: Containerization with Docker 🐳📦🚢

In this explanation, we document the containerization of our backend Node/Express server and SQLite database, explaining how we resolved Windows/Linux environment discrepancies.

---

## 📍 1. Real-World Analogies for Docker

To understand Docker conceptually, we use these two real-life models:

### 📦 The IKEA Flatpack Analogy (How Docker builds apps)
*   **The Problem:** Buying an assembled dining table is hard to fit in your car, and mailing it can cause scratches. You might also need special tools at home to set it up.
*   **The IKEA Solution:** IKEA packs everything inside a single **flatpack box** 📦:
    1.  The wooden table parts.
    2.  The exact screws and pegs.
    3.  A simple Allen key tool.
    4.  An instruction booklet.
    It doesn't matter what tools you own or what car you drive. You have everything inside the box, and following the booklet yields the **exact same table** every time.
*   **The Mapping:**
    *   **Instruction Booklet** = `Dockerfile` (text recipes).
    *   **IKEA Box** = `Docker Image` (frozen packages).
    *   **Built Table** = `Docker Container` (running server).

---

### 🌿 The Greenhouse/Plantbox Analogy (Why Docker prevents crashes)
*   **The Problem:** Growing a tropical plant directly in Austria's winter will kill it, and growing it in a dry desert will dehydrate it. The outside weather controls its survival.
*   **The Greenhouse Solution:** Place the plant inside a small, glass **greenhouse box** with its own heater and water mister. Whether you place the box in cold Vienna or in a hot desert, the plant inside lives in the **exact same climate**.
*   **The Mapping:** Your code is the tropical plant. The container is the greenhouse. Whether you run the container on Windows or Linux, the app inside runs in the **exact same virtual climate**, preventing version crashes!

---

## 📍 2. Lesson 48 Docker Quiz

Here are the questions and answers we solved to check our understanding:

1.  **Question:** *If the `Dockerfile` is the instruction booklet, what is the `Docker Container`?*
    *   **Answer:** The `Docker Container` is the active, running server (like the fully built table standing in your room).
2.  **Question:** *Why does Docker prevent the problem of "It works on my computer, but crashes on the server"?*
    *   **Answer:** Because the app runs inside its own isolated virtual container box. It carries its own operating system version, Node.js version, and libraries. The external server environment does not affect it directly.

---

## 📍 3. Dockerfile Configuration

We created a custom build recipe at [backend/Dockerfile](file:///c:/Vindobona-Pro-FinTech/backend/Dockerfile):

```dockerfile
# 1. Use the official Node 20 runtime on Alpine Linux (an extremely small, secure Linux distribution)
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /usr/src/app

# 3. Copy package description files first (enables caching behavior in Docker)
COPY package*.json ./

# 4. Install production dependencies (skips dev dependencies to keep container small)
RUN npm ci --only=production

# 5. Copy the remaining local files into the container
COPY . .

# 6. Expose port 5001 so the outside world can make HTTP requests to Express
EXPOSE 5001

# 7. Default command executed when starting the container
CMD ["node", "server/server.js"]
```

---

## 📍 4. Docker Compose Configuration

We created the container orchestrator at the root level [docker-compose.yml](file:///c:/Vindobona-Pro-FinTech/docker-compose.yml):

```yaml
# The version of the Compose configuration layout format
version: '3.8'

# Starts the list of containerized services to run
services:

  # Configuration for our backend server service
  backend:
    # Build context points to the folder containing the Dockerfile
    build: ./backend
    # Name given to the running container instance
    container_name: vindobona-backend

    # Link host port 5001 to container port 5001
    ports:
      - "5001:5001"

    # Map the server subfolder to persist SQLite database updates on your hard drive
    volumes:
      - ./backend/server:/usr/src/app/server

    # Inject runtime environment variables
    environment:
      - PORT=5001
      - NODE_ENV=development
```

---

## 📍 5. The `.dockerignore` Filter

We created a file filter at [backend/.dockerignore](file:///c:/Vindobona-Pro-FinTech/backend/.dockerignore):

```text
node_modules
```

*   **Why is this critical?** It prevents Docker from copying the Windows-compiled local `node_modules` folder into the Linux container, which would cause an `Exec format error (ERR_DLOPEN_FAILED)` crash.

---

## 📍 6. Resolved Dependency Bugs

1.  **`cors` Module Missing:** Installed using `npm.cmd install cors`.
2.  **`sqlite3` Driver Missing:** Installed using `npm.cmd install sqlite3`.
3.  **`sqlite` Wrapper Missing:** Installed using `npm.cmd install sqlite`.
4.  **Syntax Typo in server.js:** Removed a stray `co` character on line 9 of `server.js` that threw a `ReferenceError` on boot.
