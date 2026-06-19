# 🐳 DevOps Mastery: The Docker Guide & Cheat Sheet

This guide serves as your core reference sheet for containerization, Docker Desktop features, CLI commands, security auditing, and bank-grade container deployment. Use this to build your specialization in DevOps and Cloud.

---

## 💻 1. Graphical Management: Docker Desktop (GUI)
Docker Desktop is a desktop application installed on your host system to monitor and control running containers without using the terminal.

*   **Containers Tab:**
    *   *Function:* Displays a list of running, stopped, and paused containers.
    *   *Indicator:* A green light means the container is healthy and actively serving requests. A red light means it crashed, and grey means it is stopped.
*   **Logs Tab:**
    *   *Function:* Clicking a container displays stdout/stderr console prints. Essential for reading server boot errors and database query logs in real-time.
*   **Terminal Tab:**
    *   *Function:* Opens an interactive terminal session inside the container's isolated Linux sandbox. Allows you to run directory listings (`ls`) and inspect database files (`database.db`) inside the virtual system.
*   **Images Tab:*
    *   *Function:* Lists locally downloaded or compiled Docker Images. Shows version tags, compilation dates, and file size on your hard drive.

---

## 🏗️ 1.5. Container Isolation Mechanics & Image Settings

### A. Deep Level Container Isolation
Docker achieves isolation by leveraging native Linux Kernel features:
1.  **Namespaces (Isolation Boundary)**: Isolates what the container can *see*.
    *   `pid` namespace: The container only sees its own processes (e.g. Node is PID 1), hiding host processes.
    *   `net` namespace: Gives the container its own virtual IP address and network stack, separating its network from your laptop.
    *   `mnt` namespace: Isolates the file system. The container cannot access your host drive unless explicitly mapped via a Volume.
2.  **Control Groups / cgroups (Resource Limiting)**: Limits how much the container can *use*.
    *   cgroups prevent a single leaking container from eating 100% of your laptop's RAM or CPU, which could crash the host system.
3.  **Read-Only Filesystems**: In banking, a common security hardening step is mounting the container's file system as read-only. This prevents hackers from downloading malicious scripts (e.g. into `/tmp`) if the app is compromised.

### B. Image Settings: Optimizing Size for Cloud Deployments
By default, official Docker images can be massive (e.g., the default `node:20` image is over 1GB because it contains full Debian operating system libraries and Python build compilers).
In production, we use **lightweight base images**:

*   **Slim Version (`node:20-slim`)**: Contains only the bare minimum package libraries to run Node.js. Wipes out compilers. Cuts size down to ~150MB.
*   **Alpine Version (`node:20-alpine`)**: Uses **Alpine Linux**, a security-hardened Linux distribution that is only 5MB in size. Cuts total Node image size down to **under 80MB**.

#### 💡 Why Small Images Matter in Banking:
1.  **Minimized Attack Surface**: Fewer packages mean fewer security vulnerabilities (CVEs) for hackers to exploit.
2.  **Faster Deployments**: An 80MB image transfers across network pipes and boots up on Azure/AWS in seconds, whereas a 1GB image takes minutes.

---

## ⌨️ 2. Essential Docker CLI Commands
Open your terminal (PowerShell, CMD, or Bash) in the project root directory and run these commands to manage your containers:

### 🚀 Booting & Orchestrating
*   **`docker-compose up`**
    *   *What it does:* Builds, compiles, creates, and starts all services defined inside your `docker-compose.yml` (e.g., node backend + DB mounts).
    *   *Tip:* Add the `-d` flag (`docker-compose up -d`) to start containers in the background, freeing up your terminal window.
*   **`docker-compose down`**
    *   *What it does:* Stops running containers and completely removes the containers, networks, and volumes created by `up`.
*   **`docker-compose build`**
    *   *What it does:* Recompiles and rebuilds the container images. Run this whenever you modify your backend code or install new npm packages.

### 🔍 Monitoring & Debugging
*   **`docker ps`**
    *   *What it does:* Lists all active, running containers. Shows container IDs, names, uptime, and mapped ports.
*   **`docker logs <container_name>`** (e.g., `docker logs vindobona-backend`)
    *   *What it does:* Prints the history of console outputs since the container booted.
*   **`docker exec -it <container_name> sh`** (e.g., `docker exec -it vindobona-backend sh`)
    *   *What it does:* Connects your terminal directly into the container's shell (`sh`). You can type `exit` to disconnect.

---

## 🚢 2.5. Graphical Dashboard Alternative: Portainer Guide
If you do not like command line commands but want something more advanced than Docker Desktop, developers use **Portainer**. It is an open-source visual manager tool that runs *inside* a container itself.

### A. How to Install Portainer
To spin up a local Portainer instance on your machine, run these two commands in your terminal:
```bash
# 1. Create a persistent volume so Portainer settings are saved
docker volume create portainer_data

# 2. Run the Portainer container mapping ports 9000 (HTTP) and 9443 (HTTPS)
# It mounts your local docker.sock so Portainer can command the host's Docker engine.
docker run -d -p 9000:9000 -p 9443:9443 --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

### B. How to Use Portainer (Visual Interface Workflow)
1.  **Access the Dashboard**: Open your web browser and go to `http://localhost:9000`.
2.  **Initial Setup**: Set up your admin account password, then select **"Get Started"** to connect to your local Docker environment.
3.  **Explore the Navigation Panel**:
    *   **Dashboard**: Shows a high-level summary of your images, volumes, networks, and containers.
    *   **Containers**: Lists all containers. You can select multiple containers and click **Start**, **Stop**, or **Restart** with a single click.
    *   **Stats**: Displays real-time charts showing RAM usage, CPU percentage, and network bandwidth of a running container.
    *   **Console**: Click the `>_` Console icon next to any container to spawn a web-terminal shell inside your browser tab without typing `docker exec`.
    *   **App Templates**: Spawns popular containers (like Nginx, MySQL, or Redis) from pre-configured cards instantly.

---

## 🛡️ 3. Professional Security & Optimization Tools
Large banking systems require strict image scanning and auditing before they are deployed to cloud environments.

*   **Trivy (Security & Vulnerability Scanner):**
    *   *Purpose:* Scans the container's base Operating System (e.g., Alpine Linux) and Node dependencies for security vulnerabilities.
    *   *Command:* `trivy image vindobona-backend`
*   **Dive (Layer & Size Analyzer):**
    *   *Purpose:* A terminal tool that breaks down your Docker image layer by layer. It shows you which files take up the most memory and helps you remove unnecessary files to keep your container size minimal.
    *   *Command:* `dive vindobona-backend`
*   **Hadolint (Dockerfile Linter):**
    *   *Purpose:* Analyzes your `Dockerfile` file structure against best-practice rules (e.g., warning you if you are running as root or missing version tags).
    *   *Online Checker:* [Hadolint Linter](https://hadolint.github.io/hadolint/)

---

## ☁️ 3.5. Light-Weight & Cloud-Based Docker Development (No Laptop Slowdowns!)
Running full Docker container runtimes on Windows requires a virtual Linux machine (using WSL2 or Hyper-V) in the background. This can eat up 2GB to 4GB of RAM and CPU, slowing down mid-range laptops. 

You do **not** need Docker running locally to learn or work with it. You can build your configurations locally and test/audit them using free cloud services:

*   **🌐 Online Container Testing: [Play with Docker](https://labs.play-with-docker.com/)**
    *   *What it is:* A free, web-based playground provided by Docker.
    *   *How it works:* Log in with a free Docker Hub account in your web browser. It gives you a full, interactive Linux terminal in a browser tab. You can build images, run `docker-compose`, and test containers on Docker's cloud servers.
    *   *Why it's great:* **0% CPU/RAM impact** on your laptop. You can close the browser tab when finished and your computer stays fast.
*   **🔍 Online Dockerfile Linting: [Hadolint Web](https://hadolint.github.io/hadolint/)**
    *   *What it is:* A webpage linter.
    *   *How it works:* Paste the text of your `Dockerfile` into the validator box. It instantly highlights syntax errors, warnings, and security deviations.
*   **🛡️ Online Security Scanning: [Snyk Cloud](https://snyk.io/)**
    *   *What it is:* An enterprise-grade cloud security scanner (used by major banks).
    *   *How it works:* Create a free account and connect it to your GitHub repository. Snyk automatically reads your `Dockerfile` and package dependencies in the cloud, runs vulnerability scans, and shows you the security reports in your browser.

### 🚀 Recommended Performance Workflow
To develop efficiently without slowing down your computer, follow this professional team workflow:
1.  **Develop Natively Local:** Run your React frontend (`npm run dev`) and Express backend (`node server/server.js`) directly on Windows. This takes almost no memory (under 100MB) and keeps your PC running at full speed.
2.  **Commit to GitHub:** Push your code changes and Dockerfiles to your repository.
3.  **Build & Scan in the Cloud:** Let cloud security tools (Snyk) and automated pipelines (GitHub Actions) build, test, and scan the Docker containers on remote servers instead of your local machine.

---

## 💬 4. Mock Interview Questions: Docker
Here is what tech leads in banks will ask you to test your container knowledge:

*   **Question:** *"What is the difference between a Docker Image and a Docker Container?"*
    *   **Answer:** *"A Docker Image is a read-only blueprint or class. It contains the code, runtime, libraries, and environment settings frozen in time. A Docker Container is a live, running instance of that image, similar to an instantiated object in Object-Oriented Programming."*
*   **Question:** *"Why do you map ports in docker-compose, like `5001:5001`?"*
    *   **Answer:** *"Containers run in isolated sandboxes with their own virtual network interfaces. Port mapping connects a port on the host machine (our laptop) to a port inside the container so external HTTP clients can route requests into the Express server."*
*   **Question:** *"How do you persist SQLite database changes in a container?"*
    *   **Answer:** *"Since container storage is ephemeral (erased when the container is deleted), I configure a Docker Volume inside docker-compose.yml. This maps a local directory on the host hard drive directly to the database file directory inside the container."*
*   **Question:** *"How does Docker isolate data and filesystem changes from the host system?"*
    *   **Answer:** *"Docker uses namespaces to isolate the mounting boundaries (mnt namespace). Changes made inside the container filesystem are written to a copy-on-write scratch layer inside the container sandbox. These changes do not affect the host files unless a volume has been mounted, keeping files isolated."*
