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
