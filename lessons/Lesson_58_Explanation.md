# Lesson 58: Enterprise Cloud Deployment to Microsoft Azure ☁️🚀

In this lesson, we successfully deployed the **Vindobona Pro** backend application and its database to the cloud using **Microsoft Azure**, **Docker Hub**, and **GitHub Actions**.

---

## 🛠️ Step-by-Step Overview of What We Did

### 1. Provisioned the Azure Database for PostgreSQL
We created a managed **Azure Database for PostgreSQL (Flexible Server)** named `vindobona-db-andy` inside the `VindobonaResources` resource group in the **North Europe** region.
*   **Compute size**: Standard burstable `Standard_B1ms` (1 vCore, 2 GiB RAM, 32 GiB storage) to keep costs low.
*   **Security & Firewalls**: Configured the firewall to allow other Azure services to talk to the database and allowed your local laptop's IP address (`78.104.103.95`) so you can migrate data and run local tests.
*   **Admin login**: `vindobona_user`

![PostgreSQL Server List](file:///C:/Users/andru/.gemini/antigravity-ide/brain/3fc43d0d-089c-4b89-8ae1-8529b2d4b23b/media__1781460545470.png)

*   **Resetting the password**: We reset the database administrator password to **`Rugero777#`** using the **Reset password** option in the top toolbar:

![Database Reset Password Toolbar](file:///C:/Users/andru/.gemini/antigravity-ide/brain/3fc43d0d-089c-4b89-8ae1-8529b2d4b23b/media__1781460610900.png)

---

### 2. Configured GitHub Actions CI/CD (Step 3)
Since your local machine didn't have Docker installed, we offloaded the building process entirely to the cloud using a custom GitHub Actions workflow file: [deploy.yml](file:///c:/Vindobona-Pro-FinTech/.github/workflows/deploy.yml).
*   Every time you push code changes to the `main` branch, GitHub runs a temporary Ubuntu virtual builder.
*   It logs in to your public Docker Hub account (`rugero`), builds your backend folder, and pushes the image `rugero/vindobona-backend:latest`.

---

### 3. Deployed the Azure App Service (Step 4)
We created a **Web App for Containers** named `vindobona-api-andy` to host the Docker image.

> [!NOTE]
> During creation, we ran into an Azure quota limitation in our initial region. We resolved it by changing the region to **West Europe**, which successfully created the service plan!

![Web App Deployment Complete](file:///C:/Users/andru/.gemini/antigravity-ide/brain/3fc43d0d-089c-4b89-8ae1-8529b2d4b23b/media__1781459277162.png)

We then set up the **Environment variables** so the containerized application can connect to the database and launch on the correct ports:
*   `DB_TYPE` = `postgres`
*   `PORT` = `5001`
*   `WEBSITES_PORT` = `5001` (forward web traffic to port 5001 inside the container)
*   `DATABASE_URL` = `postgresql://vindobona_user:Rugero777%23@vindobona-db-andy.postgres.database.azure.com:5432/postgres?sslmode=require` *(Note: the `#` character in the password is URL-encoded as `%23` so the connection string parses correctly!)*

![Environment Variables Configured](file:///C:/Users/andru/.gemini/antigravity-ide/brain/3fc43d0d-089c-4b89-8ae1-8529b2d4b23b/media__1781460111155.png)

---

### 4. Executed the Database Migration (Step 5)
We modified the local migration script [migrationToPg.js](file:///c:/Vindobona-Pro-FinTech/backend/server/utils/migrationToPg.js) to:
1. Automatically load database credentials from your local [backend/.env](file:///c:/Vindobona-Pro-FinTech/backend/.env) file.
2. Resolve a type mismatch crash: PostgreSQL columns use `INTEGER` for boolean values, but the script was passing JavaScript booleans (`true`/`false`). We updated the script to pass `0` and `1` directly.

Running `node backend/server/utils/migrationToPg.js` copied all data safely:
```text
🚀 Starting SQLite to PostgreSQL Migration...
👤 Migrating users...
✅ Successfully migrated 1 users!
💱 Migrating wallets...
✅ Successfully migrated 1 wallets!
📜 Migrating audit logs...
✅ Successfully migrated 2 audit logs!
🎉 All tables migrated successfully!
```

---

## 📅 Upcoming Project Roadmap

*   **Monday & Tuesday (Tomorrow)**: 
    *   **Lesson 57**: Kubernetes (K8s) Orchestration (writing deployment configurations and managing containers).
    *   **Lesson 56**: Nginx Web Server configuration and Frontend polish (micro-animations, Light/Dark theme).
*   **Saturday**:
    *   Finalize all outstanding dashboard features.
    *   Perform a production launch on a custom **`.com`** domain!
