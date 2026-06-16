# Lesson 57 Explanation: Kubernetes (K8s) Container Orchestration ☸️📦🚀

Welcome to the explanation for Lesson 57! In this lesson, we learn about **Kubernetes** (commonly called **K8s**), which is the gold standard for managing, scaling, and self-healing containerized applications in production environments.

---

## 1. What is Kubernetes (K8s) and Why Do We Need It?

### The Problem:
Previously, we ran our application using **Docker Compose** on our machine. While Docker Compose is excellent for local development, it is not built to handle production-grade infrastructure:
* What if our server crashes in the middle of the night?
* What if thousands of users suddenly log in and our server runs out of memory?
* How do we update our application code without turning the website off?

### The Solution:
**Kubernetes** is an orchestration engine. Instead of launching containers manually, we write a **declarative configuration** (a YAML file describing the "dream state" of our application). Kubernetes reads this file and works tirelessly to make sure our active systems match that dream state.

* **High Availability**: Runs multiple copies of our application. If one copy crashes, the others take over.
* **Auto-Scaling**: Automatically spins up more copies if web traffic increases.
* **Self-Healing**: Continuously monitors containers and restarts them if they freeze.
* **Zero-Downtime Updates**: Replaces old containers with new ones step-by-step so users never experience outages.

---

## 2. The Core Kubernetes Building Blocks

### 📦 A. Pods
A **Pod** is the smallest block in Kubernetes. Think of a Pod as a **wrapper** around a single running container (our Node.js app). 
* A Pod has its own private IP address inside the cluster.
* Pods are ephemeral: they die and get recreated constantly.

### 📋 B. Deployments
A **Deployment** is the manager of Pods. In a Deployment manifest, you define:
1. Which Docker image to run.
2. How many copies (replicas) of that container you want running.
3. How to check if they are healthy.

### 🌐 C. Services
Because Pods are constantly recreated, their IP addresses keep changing. A **Service** acts as a stable DNS receptionist with a fixed IP address. It sits in front of our Pods and directs traffic to whichever Pods are currently active. It also load balances the requests.

### 🔑 D. Secrets
A **Secret** is a secure vault inside the cluster. Instead of writing database passwords or JWT keys in plain text inside config files, we encode them in **Base64** and load them into a Kubernetes Secret. This keeps them encrypted in memory.

---

## 3. Step-by-Step Breakdown of Our YAML Blueprints

Here are the files we created inside the `Vindobona-Pro-FinTech/k8s/` folder:

### 📄 File 1: `k8s/secrets.yaml`
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  # Base64 encoded value of "MySuperSecretKeyWord123!"
  jwt-secret: TXlTdXBlclNlY3JldEtleVdvcmQxMjMh
```
* **Why it matters**: It registers our `JWT_SECRET` password securely under the name `app-secrets` so that other containers can read it.

---

### 📄 File 2: `k8s/backend-deployment.yaml`
This file configures our application runner:
* **`replicas: 3`**: Tells K8s to keep exactly 3 copies of our server running at all times.
* **`image: andyrugero/vindobona-backend:latest`**: The target container image from Docker Hub.
* **`valueFrom.secretKeyRef`**: Pulls the secret key securely from `app-secrets` instead of writing it in plain text.
* **`livenessProbe`**: Pings `/api/health` every 10 seconds. If the application freezes, K8s restarts it automatically.
* **`readinessProbe`**: Checks `/api/health` on startup. K8s will not direct users to a container until it is fully loaded and returns a green light.

---

### 📄 File 3: `k8s/backend-service.yaml`
Exposes the backend internally:
* **`selector.app: vindobona-backend`**: Directs traffic only to Pods with this tag.
* **`port: 80`**: Exposed port of the service.
* **`targetPort: 5001`**: Port of our Node application.
* **`type: ClusterIP`**: Keeps the network secure and accessible only inside the cluster.

---

## 4. Cheat Sheet: Essential Kubernetes Commands (`kubectl`)

To manage your cluster, you use the **`kubectl`** CLI tool:

| Command | What it does | Real-Life Analogy |
| :--- | :--- | :--- |
| `kubectl apply -f k8s/` | Deploys all YAML configurations in the `k8s` folder. | Submits your custom burger orders to the chef. |
| `kubectl get pods` | Lists all active container copies and their status. | Checks which cooks are currently working in the kitchen. |
| `kubectl get services` | Shows stable endpoints and their ports. | Locates the order pickup counter. |
| `kubectl delete pod <name>` | Manually deletes a running Pod. | Simulates a server crash to watch K8s rebuild it. |
| `kubectl logs <name>` | Shows print statements and console logs of a Pod. | Reads the cash register receipt to debug issues. |
| `kubectl describe pod <name>` | Shows detailed events and metadata about a Pod. | Asks a cook details about a specific order status. |
