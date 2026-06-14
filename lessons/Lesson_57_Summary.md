# Lesson 57 Summary: Kubernetes (K8s) Container Orchestration ☸️📦🚀

Welcome to the study log for Lesson 57. In this lesson, we study **Kubernetes (K8s)**, the gold standard in enterprise container orchestration. In major financial environments, hundreds of microservices must be deployed, scaled, and managed simultaneously. Running containers manually via Docker Compose is insufficient for production resilience. Kubernetes automates container scheduling, scaling, self-healing, and networking, ensuring that banking services achieve 99.999% uptime.

---

## 📍 Key Concepts & Blueprints

### 1. The Core K8s Architecture
Kubernetes coordinates clusters of physical or virtual servers. You define a **declarative state** in configuration files, and K8s continuously monitors the cluster to keep the active state matching your specification.

*   **Pods**: The smallest execution units in K8s. A Pod wraps one or more application containers (e.g., our Node backend), sharing the same network namespace and IP address.
*   **Deployments**: Declarative templates that define the desired state for our Pods (e.g., *"Run exactly 3 replicas of the `vindobona-backend` image, updating them one-by-one with zero downtime"*).
*   **Services**: Stable network interfaces. Because Pods are ephemeral and their IP addresses change when recreated, a Service acts as a static load balancer that routes traffic to active Pods.
*   **Ingress**: The cluster gateway that manages external HTTP/S routing into the Services, typically handling SSL certificates and hostname mapping.

```
       Public Traffic
             │
             ▼
      ┌──────────────┐
      │   Ingress    │ (Domain Route: vindobonafintech.com)
      └──────────────┘
             │
             ▼
      ┌──────────────┐
      │   Service    │ (Stable Load Balancer)
      └──────────────┘
        /    │    \
       ▼     ▼     ▼
     ┌───┐ ┌───┐ ┌───┐
     │Pod│ │Pod│ │Pod│ (Replicated backend running in container)
     └───┘ └───┘ └───┘
```

### 2. Declarative Configurations (YAML Blueprints)
Rather than launching containers using CLI commands, we write declarative YAML manifests.

#### 📝 Backend Deployment Blueprint (`backend-deployment.yaml`):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vindobona-backend
  labels:
    app: vindobona-backend
spec:
  replicas: 3 # Run three identical instances for high availability
  selector:
    matchLabels:
      app: vindobona-backend
  template:
    metadata:
      labels:
        app: vindobona-backend
    spec:
      containers:
      - name: backend-server
        image: andyrugero/vindobona-backend:latest
        ports:
        - containerPort: 5001
        env:
        - name: PORT
          value: "5001"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        # Self-healing checks
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5001
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 5001
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### 📝 Backend Service Load Balancer Blueprint (`backend-service.yaml`):
```yaml
apiVersion: v1
kind: Service
metadata:
  name: vindobona-backend-service
spec:
  selector:
    app: vindobona-backend # Route traffic to Pods matching this label
  ports:
    - protocol: TCP
      port: 80       # Port exposed by the service
      targetPort: 5001 # Port the Node app listens on in the container
  type: ClusterIP # Internal routing only (use LoadBalancer for public clouds)
```

### 3. Self-Healing & Health Probes
Banks cannot afford system hangs. Kubernetes ensures stability by checking application health using two probes:
1.  **Liveness Probe**: Monitors if the container has crashed or entered an unrecoverable infinite loop. If the liveness HTTP check returns a failure, K8s automatically kills the container and boots a fresh one.
2.  **Readiness Probe**: Monitors if the container is ready to accept user requests (e.g., has finished connecting to the database or loading settings). If this check fails, K8s temporarily removes the Pod from the Service load balancer so users do not experience connection errors.

### 4. ConfigMaps & Secrets
*   **ConfigMap**: Used to store non-sensitive configuration keys (e.g., API endpoints, log levels, static settings).
*   **Secret**: Stores base64-encoded sensitive information (e.g., database passwords, JWT tokens, OTPLIB session seeds). These are stored in memory (`tmpfs`) within the cluster and are never written to physical disk on nodes, ensuring security.

---

## 🏗️ Lesson 57 Study Checklist

1.  [ ] **Add Health Checks**: Implement a `/api/health` endpoint in the Express backend that returns an HTTP `200 OK` status.
2.  [ ] **Create Secrets & Configs**: Write and apply K8s YAML config files for application variables and secrets.
3.  [ ] **Write Manifests**: Write the Deployment configuration targeting 3 replicas with readiness/liveness probes, and define the Service.
4.  [ ] **Cluster Deployment**: Deploy the configurations to a local testing cluster (Minikube / Docker Desktop Kubernetes) or a cloud cluster (AKS).
5.  [ ] **Simulate Failures**: Delete a running Pod manually and watch Kubernetes spin up a replacement instance automatically.

---

## 💬 Mock Interview Questions: Kubernetes

*   **Question**: *"What is the difference between a Liveness Probe and a Readiness Probe?"*
    *   **Answer**: *"A Liveness Probe checks if the container is still running. If the liveness check fails, Kubernetes assumes the application is dead or deadlocked and restarts the container. A Readiness Probe checks if the container is ready to receive network traffic. If it fails, Kubernetes stops sending network requests to that Pod by removing it from the Service load balancer, but does not restart the container. This prevents users from hitting the container while it performs startup tasks."*
*   **Question**: *"Why is a Service needed in front of a group of Pods? Why not just access Pod IPs directly?"*
    *   **Answer**: *"Pods in Kubernetes are ephemeral; they are continuously created, scaled, and destroyed. When a Pod restarts or a deployment updates, it receives a new, random IP address. A Service provides a single, stable IP address and DNS name that never changes. It acts as an internal load balancer, routing traffic dynamically to whatever active Pod instances currently exist."*
*   **Question**: *"How does Kubernetes handle 'rolling updates' during a backend deployment?"*
    *   **Answer**: *"When you update a Deployment configuration with a new container image, Kubernetes initiates a rolling update. It boots up the new Pod version alongside the old version. Once the readiness probe on the new Pod reports healthy, K8s redirects network traffic to it and safely terminates an older Pod. This step-by-step replacement guarantees zero-downtime deployments."*
