# Daily Operations Productivity Agent for Cloud Run

An autonomous AI Agent designed for business owners and operations teams to automate everyday operational workflows:
- 📊 **Real-time Sales Tracking & Velocity Analysis**
- 📦 **Automated Inventory Monitoring & Safety-Stock Alerts**
- 📝 **Supplier Purchase Order Drafting & Restock Generation**
- 🌅 **Automated Daily Morning Executive Briefings**
- ☁️ **Native Google Cloud Run Container Architecture with Google GenAI SDK**

---

## 🛠️ Project Structure
- `Dockerfile`: Production container specification with Python 3.11-slim, FastAPI, and Uvicorn.
- `main.py`: The core Cloud Run agent backend with Google GenAI SDK function-calling tools.
- `requirements.txt`: Python dependencies (`google-genai`, `fastapi`, `uvicorn`, `pydantic`).
- `deploy.sh`: One-click deployment script for Google Cloud Run.
- `cloudbuild.yaml`: CI/CD automation pipeline for Google Cloud Build.
- `server.ts` & `src/`: Interactive Full-Stack React + Express Dashboard & Studio for testing the agent live.

---

## 🚀 Deploying to Google Cloud Run in 1 Minute

### Method 1: Using `deploy.sh`
```bash
export GEMINI_API_KEY="your-gemini-api-key"
chmod +x deploy.sh
./deploy.sh
```

### Method 2: Direct `gcloud` command
```bash
gcloud run deploy productivity-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY
```

---

## ⏰ Automating with Google Cloud Scheduler

Set up a scheduled cron trigger that executes the morning briefing at 7:00 AM every day:
```bash
gcloud scheduler jobs create http daily-morning-briefing \
  --location us-central1 \
  --schedule "0 7 * * *" \
  --time-zone "America/New_York" \
  --uri "https://<YOUR-CLOUD-RUN-SERVICE-URL>/api/webhook" \
  --http-method POST \
  --headers "Content-Type=application/json" \
  --message-body '{"trigger_type": "CRON_MORNING_BRIEF"}'
```
