# 📧 Email Reply Digital Twin

A smart AI-powered platform for generating professional email replies using uploaded PDFs and email thread context. Designed for the Ease Vertical take-home project.

---

## ✨ Features

- Upload and preview **PDF attachments** and **email threads**
- AI-powered **summary** of uploaded content (PDF & email)
- Generate smart, tone-adjustable email replies
- Choose strategies: Concise, Elaborate, Email-only, PDF-first, etc.
- Follow-up interaction: "Make it more concise", "Add enthusiasm", etc.
- Copy & download replies
- Fully responsive, mobile-friendly UI

---

## 🧑‍💻 Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React, TypeScript, Tailwind CSS     |
| Backend  | FastAPI, Python, OpenAI API         |
| Testing  | Jest, React Testing Library, Pytest |
| DevOps   | GitHub Actions (CI), Docker         |

---

## 📂 Folder Structure

```
email-digital-twin/
├── backend/              # FastAPI backend
│   ├── app/              # FastAPI app logic (main, parser, responder)
│   ├── tests/            # Pytest unit tests
│   └── Dockerfile        # Backend Docker image
├── frontend/             # React + Vite frontend
│   ├── src/              # UploadForm.tsx and supporting logic
│   ├── tests/            # Frontend unit tests
│   └── Dockerfile        # Frontend Docker image
├── requirements.txt      # Backend Python dependencies
├── compose.yml           # Docker Compose (multi-service)
├── ci.yml                # GitHub Actions CI workflow
├── .gitignore
├── test_content/         # test files stored here (txt/pdf)
└── README.md             # This file
```

---

## 🚀 Local Development

### 1. Backend (FastAPI)

```bash
cd backend
pip install -r ../requirements.txt
uvicorn app.main:app --reload
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

---

## 🔧 .env Setup

To use the OpenAI API, follow these steps:

1. Get your API key:
   - Visit [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
   - Log in and create a new key

2. Create a `.env` file under the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

3. Paste your API key:
```env
OPENAI_API_KEY=sk-xxx-your-key-here
```

> Note: Keep this file private. It's ignored via `.gitignore`.

---

## 🤪 Run Tests

### Backend (Pytest)
```bash
PYTHONPATH=. pytest backend/tests
```

### Frontend (Jest)
```bash
cd frontend
npm test
```

---

## 📊 Architecture / Ops Notes

### 🎯 Market Insight
This tool targets busy professionals, customer success teams, and executives who frequently manage large volumes of client communications. The need arises from the time-consuming nature of writing personalized, tone-appropriate replies, especially when emails reference lengthy attached documents.

### 📈 Scalability Plan
- **Horizontal Scaling**: The backend can scale via Docker containers and Kubernetes replicas. Stateless APIs make it easy to deploy across multiple nodes.
- **Async Tasks**: Heavy inference operations (like OpenAI requests) can be offloaded to background tasks via `async`/`await`, and further optimized with a task queue system like Celery + Redis for future enhancements.
- **Caching**: Strategy can include memoization or Redis to cache repeated summary or email generation requests.

### 🔐 Privacy & Security Choices
- **No storage**: Uploaded files are read in-memory and not persisted.
- **Environment secrets**: OpenAI API key is stored in a `.env` file, excluded from version control.
- **CORS & HTTPS**: CORS is configured in FastAPI, and production deployment would use HTTPS termination via a secure ingress controller or cloud proxy.
- **Clear all / manual removal**: Users can clear all files and previews locally, ensuring they control what stays in session.

### ⚡ Latency (Inference + OpenAI API)
- **PDF and email summary**: ~2–3 seconds per file using GPT-3.5-turbo on average.
- **Reply generation**: ~2–4 seconds, depending on prompt complexity and selected strategy.
- **Cost consideration**: Estimated ~0.2¢–0.4¢ per full prompt/response interaction using gpt-3.5-turbo-16k.

### 🚧 Deployment Hurdles + Next Steps
- **Kubernetes**: Attempted Minikube deployment, but faced image pull and port tunneling issues due to system constraints on macOS.
- **Fallback**: Docker Compose runs the full stack locally.
- **Next steps**:
  - Push working Docker images to a registry (e.g., Docker Hub)
  - Deploy via managed Kubernetes (GKE/EKS) or use Render/Heroku for simpler deployment
  - Add TLS + domain with Ingress

### 🛠️ **Deployment Strategy (AWS Production Plan)**

To deploy this email-reply generation platform reliably at scale, the following AWS services are recommended:

| Need                          | AWS Service                                           | Purpose                                                                 |
|-------------------------------|--------------------------------------------------------|-------------------------------------------------------------------------|
| **Compute**                   | `Amazon ECS` (Fargate) or `Amazon EKS`                | Container orchestration (Docker Compose → ECS or Kubernetes → EKS)     |
| **API Hosting**               | `AWS API Gateway` + `Lambda` _(serverless alt)_       | For handling lightweight inference and routing via RESTful endpoints    |
| **Static Frontend Hosting**   | `Amazon S3` + `CloudFront`                            | Distribute Vite-built frontend globally with CDN & caching              |
| **Environment Secrets**       | `AWS Secrets Manager`                                 | Securely store and rotate the OpenAI API key                           |
| **CI/CD Pipeline**            | `AWS CodePipeline` + `CodeBuild`                      | Automate testing, image builds, and deployments                        |
| **Logging & Monitoring**      | `Amazon CloudWatch`                                   | Aggregate logs from FastAPI backend and monitor container health       |
| **Custom Domain & HTTPS**     | `Amazon Route 53` + `ACM` (SSL Certs)                 | Custom DNS + secure HTTPS endpoints                                    |
| **File Storage (Optional)**   | `Amazon S3` (if persisting uploaded files later)      | Currently files are processed in-memory, but this enables durability   |
| **Future Add-ons**            | `Amazon Bedrock`, `SageMaker`, `Aurora`, `DynamoDB`   | For integrating custom LLMs, user auth, stateful memory, RAG, etc.     |

> ⚙️ This stack enables a production-ready system with full scalability, secure API management, and seamless frontend/backend integration.

---

### 🧠 LLM / Agent Usage: Current vs Future
- **Current**: Single-agent OpenAI GPT-3.5 integration for summarization and email generation.
- **Future**:
  - **LangChain router**: Direct task-based routing (e.g., classify tone request, then select summarizer or rewriter agent).
  - **RAG**: Retrieve relevant knowledge base entries (e.g., past emails or company docs) for context injection.
  - **Long-term memory**: Store past conversations securely for continuity.
  - **Multimodal input**: Add voice-to-text and calendar integration for smart scheduling replies.

### Youtube Link For Working Demo:
- https://youtu.be/tdG7xgrHexE

---

## 🐳 Docker Build

### Build Images Locally
```bash
docker-compose up --build
```

> The app will run at: `http://localhost:5173`

---

## 🔁 CI/CD

CI runs on every push via GitHub Actions:
- Backend tests using `pytest`
- Frontend tests using `jest`
- Pip & NPM dependency caching

CI config: `.github/workflows/ci.yml`

---

## 🌐 Deployment (Placeholder)

While the app is fully containerized and ready for deployment:

🚫 Deployment still needs some work.

📄 Docker images build successfully  
🔄 CI/CD passes consistently  
📄 `compose.yml` and Kubernetes manifests (`*.yaml`) are included  
📋 Deployment-ready with minimal effort by others

---
