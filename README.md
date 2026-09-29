# 🚀 PERN Stack with GitHub Actions CI/CD Pipeline

A production-ready **PERN** (**P**ostgreSQL, **E**xpress, **R**eact, **N**ode.js) project with an automated **CI/CD pipeline powered by GitHub Actions**.

---

## 📑 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Directory Structure](#project-directory-structure)
- [Quick Start with Docker Compose](#quick-start-with-docker-compose)
- [Local Development (Without Docker)](#local-development-without-docker)
- [REST API Endpoints](#rest-api-endpoints)
- [GitHub Actions CI/CD Pipeline](#github-actions-cicd-pipeline)
  - [CI Stage (Automated Testing & Build)](#1-ci-stage-automated-testing--build)
  - [CD Stage (Container Packaging & Deployment)](#2-cd-stage-container-packaging--deployment)
  - [Deploying to Cloud Providers](#deploying-to-cloud-providers)
- [License](#license)

---

## 🏛️ Architecture Overview

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Responsive UI for task & status tracking |
| **Backend** | Express 4, Node.js 20 | RESTful API with connection pooling |
| **Database** | PostgreSQL 16 | Relational store with auto-migration (`init.sql`) |
| **Containers** | Docker, Docker Compose | Multi-container environment for local & cloud |
| **CI/CD** | GitHub Actions | Automated tests, matrix validation & GHCR deployment |

---

## 📁 Project Directory Structure

```text
CICD_Jenkins/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions CI/CD workflow
├── client/                     # Frontend React (Vite)
│   ├── src/
│   │   ├── App.jsx            # Main dashboard component
│   │   ├── App.css            # Component styles
│   │   ├── main.jsx           # React DOM render entry
│   │   └── index.css          # Global typography & resets
│   ├── index.html             # Vite HTML template
│   ├── vite.config.js         # Vite configuration with /api proxy
│   ├── Dockerfile             # Multi-stage production container (Node + Nginx)
│   ├── nginx.conf             # Nginx reverse proxy & static SPA routing
│   └── package.json
├── server/                     # Backend Express (Node.js)
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js       # PostgreSQL Pool connection & auto-init
│   │   │   └── init.sql       # Database schema creation & initial seed
│   │   ├── routes/
│   │   │   └── tasks.js       # RESTful CRUD routes (/api/tasks)
│   │   ├── app.js             # Express app setup (separated for testability)
│   │   └── index.js           # Server listener entrypoint
│   ├── tests/
│   │   └── app.test.js        # Automated Jest & Supertest API tests
│   ├── Dockerfile             # Production Node.js Alpine container
│   ├── .env.example           # Environment template
│   └── package.json
├── docker-compose.yml          # One-click multi-container orchestration
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start with Docker Compose

Run the entire PERN stack (PostgreSQL + Express + React) with a single command:

```bash
docker-compose up --build
```

- **Frontend App:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **PostgreSQL:** `localhost:5432` (`user: postgres`, `password: postgres`, `database: perndb`)

To stop all services:
```bash
docker-compose down
```

---

## 💻 Local Development (Without Docker)

### 1. Database Setup
Ensure PostgreSQL is installed and running locally:
```sql
CREATE DATABASE perndb;
```
Then execute schema from `server/src/db/init.sql`.

### 2. Backend Setup
```bash
cd server
cp .env.example .env     # Adjust credentials if needed
npm install
npm test                 # Run automated tests
npm run dev              # Run server with live reload on port 5000
```

### 3. Frontend Setup
```bash
cd client
cp .env.example .env
npm install
npm run dev              # Runs Vite dev server at http://localhost:5173
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description | Payload Example |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service and PostgreSQL health check | None |
| `GET` | `/api/tasks` | Get all tasks ordered by date | None |
| `GET` | `/api/tasks/:id` | Get single task by ID | None |
| `POST` | `/api/tasks` | Create new task | `{"title":"Deploy","description":"To cloud"}` |
| `PUT` | `/api/tasks/:id` | Update task completion / content | `{"completed":true}` |
| `DELETE`| `/api/tasks/:id` | Delete task by ID | None |

---

## 🔄 GitHub Actions CI/CD Pipeline

The pipeline is defined in [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml).

### 1. CI Stage: Automated Testing & Build
Triggered on every **push** or **pull request** targeting the `main` branch.

1. **Ephemeral PostgreSQL Service:** GitHub Actions launches an isolated PostgreSQL 16 container service.
2. **Backend Validation:**
   - Installs dependencies.
   - Runs Jest & Supertest test suite (`npm test`).
   - Verifies API contract and health endpoints.
3. **Frontend Validation:**
   - Installs client dependencies.
   - Executes Vite production build (`npm run build`).
   - Confirms static bundle generation in `client/dist`.

### 2. CD Stage: Container Packaging & Deployment
Triggered automatically **only when changes are merged into `main`**.

1. **Docker Buildx:** Multi-platform container building.
2. **GitHub Container Registry (GHCR):** Authenticates securely using GitHub's built-in `${{ secrets.GITHUB_TOKEN }}`.
3. **Pushes tagged images:**
   - `ghcr.io/<username>/<repo>/pern-server:latest`
   - `ghcr.io/<username>/<repo>/pern-server:<commit-sha>`
   - `ghcr.io/<username>/<repo>/pern-client:latest`
   - `ghcr.io/<username>/<repo>/pern-client:<commit-sha>`
4. **Step Summary:** Generates a deployment markdown report directly inside GitHub Actions run logs.

---

## ☁️ Deploying to Cloud Providers

### Option A: PaaS (Render, Railway, Fly.io)
1. Add a **Deploy Webhook** URL from your provider to GitHub Repository Secrets:
   - Name: `DEPLOY_WEBHOOK_URL`
   - Value: `https://api.render.com/deploy/srv-xxxx?key=yyyy`
2. The GitHub Actions CD job will automatically trigger the webhook upon successful build.

### Option B: VPS / Cloud Server (DigitalOcean, AWS EC2, Hetzner)
You can append an SSH step to `.github/workflows/ci-cd.yml`:

```yaml
- name: Deploy to VPS via SSH
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.SSH_HOST }}
    username: ${{ secrets.SSH_USER }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      cd /opt/pern-app
      docker compose pull
      docker compose up -d --remove-orphans
```

---

## 📄 License
MIT License. Free to use and customize for your own projects!
