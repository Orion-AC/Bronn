# 🤖 Bronn | Industrialized AI Agent Platform

Bronn is an enterprise-grade platform that integrates autonomous AI agents with headless workflow automation. By merging the intelligence of Large Language Models with the reliability of low-code data pipelines, Bronn enables "Functional Synergy" at scale.

## 🚀 Key Features

### 1. Embedded Workflow Engine (Activepieces)
- **Seamless Integration**: Activepieces is embedded directly into the Bronn Studio UI.
- **Unified Identity (SSO)**: Automatic JWT-based authentication between Bronn and Activepieces.
- **Custom Bronn Piece**: A native Activepieces piece allowing workflows to invoke Bronn Agents, update states, and discover skills.

### 2. Autonomous Agent Workforce
- **Workflow Skills**: Assign specific Activepieces workflows to agents as "Skills".
- **Dynamic Invocation**: Agents can be triggered via API and execution results are fed back into observability dashboards.
- **MCP Compatibility**: Built-in **Model Context Protocol (MCP)** server for universal tool discovery by any AI model.

### 3. Enterprise-Grade Security
- **Multi-Tenancy (RLS)**: PostgreSQL Row-Level Security ensures strict data isolation between tenants.
- **Audit Logs**: Trigger-based auditing for all agent and workflow modifications, ensuring compliance.
- **SSO Bridge**: OIDC/SAML integration (Google Workspace, Okta, Azure AD) via Authlib.

## 🏗 Architecture

Bronn follows a modern, containerized microservices architecture:

- **Frontend**: React + Vite + TypeScript (Studio UI).
- **Backend**: FastAPI (Python) with SQLAlchemy.
- **Orchestration**: Activepieces (embedded via iframe + JWT).
- **Persistence**: PostgreSQL (shared) with Redis (Activepieces worker).

## 🛠️ Development Workflow

### GitHub as Single Source of Truth
This repository enforces a **GitHub-first** philosophy. The `main` branch on GitHub is the canonical source for all configurations, secrets, and deployment artifacts.

1.  **Mandatory Rebase**: Never use `git merge` or standard `git pull`. Always rebase from `main`.
    ```bash
    make pull-rebase
    ```
2.  **Strict Production Parity**: Local services are strictly aligned with Google Cloud Run production. Unused or experimental services are prohibited unless explicitly documented and mirrored in production.
3.  **CI/CD Deployment**: Production deployments (Cloud Run) are triggered **strictly via GitHub Actions** from the `main` branch.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- Google Cloud SDK (for production management)

### Local Setup
1.  **Clone the repo**:
    ```bash
    git clone https://github.com/Orion-AC/Bronn.git
    cd Bronn
    ```
2.  **Configure Environment**:
    ```bash
    cp .env.example .env
    # Edit .env with your local credentials
    ```
3.  **Start Services**:
    ```bash
    make up
    ```
4.  **Access Apps**:
    - **Frontend (Studio)**: [http://localhost:5173](http://localhost:5173)
    - **Backend (API)**: [http://localhost:8000/api/health](http://localhost:8000/api/health)
    - **Activepieces**: [http://localhost:8080](http://localhost:8080)

## 🚢 CI/CD & Deployment
Bronn is optimized for production deployment on **Google Cloud Platform (GCP)**:

- **Cloud Run**: Managed serverless containers for both Backend and Frontend.
- **Cloud SQL**: Managed PostgreSQL 14 instance.
- **GitHub Actions**: Automated testing and deployment to GCP on push to `main`.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
