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

### 4. High-Scale Observability
- **OpenTelemetry**: Full instrumentation of the FastAPI backend for distributed tracing and performance metrics.
- **Monitoring Stack**: Integrated Prometheus and Grafana for real-time visualization of agent latency and workflow success rates.

## 🏗 Architecture

Bronn follows a modern, containerized microservices architecture:

- **Frontend**: React + Vite + TypeScript (Studio UI).
- **Backend**: FastAPI (Python) with SQLAlchemy.
- **Orchestration**: Activepieces (embedded via iframe + JWT).
- **Persistence**: PostgreSQL (shared) with Redis (Activepieces worker).
- **Observability**: OTel Collector -> Prometheus -> Grafana.

## 🛠 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### Local Development
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Orion-AC/Bronn.git
   cd Bronn
   ```

2. **Start the infrastructure**:
   ```bash
   make up
   ```
   *This will spin up PostgreSQL, Redis, Activepieces, and the Observability stack.*

3. **Run the Backend**:
   ```bash
   cd apps/backend-api
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

4. **Run the Studio UI**:
   ```bash
   cd apps/studio-ui
   npm install
   npm run dev
   ```

## 🚢 CI/CD & Deployment
Bronn is optimized for production deployment on **AWS**:

- **GitHub Actions**: Automated testing, ECR image builds, and SSM-based deployment.
- **Terraform/Infrastructure**: Least-privilege IAM roles and SSM Parameter Store for secret management.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
