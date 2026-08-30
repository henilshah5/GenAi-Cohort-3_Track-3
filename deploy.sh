#!/bin/bash
# ==============================================================================
# Google Cloud Run Deployment Script for Productivity Operations Agent
# ==============================================================================
set -e

SERVICE_NAME="productivity-agent"
REGION="us-central1"
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "your-gcp-project-id")

echo "🚀 Deploying Personal Productivity Assistant to Google Cloud Run..."
echo "Project ID: ${PROJECT_ID}"
echo "Service:    ${SERVICE_NAME}"
echo "Region:     ${REGION}"

# Ensure GEMINI_API_KEY is available
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️ Warning: GEMINI_API_KEY is not set in your shell environment."
    echo "Please set it before deploying or via Google Secret Manager."
    read -p "Enter your Gemini API Key (or press enter to skip): " INPUT_KEY
    if [ ! -z "$INPUT_KEY" ]; then
        GEMINI_API_KEY="$INPUT_KEY"
    fi
fi

# Deploy directly from source directory using Cloud Run buildpacks / Dockerfile
gcloud run deploy "$SERVICE_NAME" \
    --source . \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars GEMINI_API_KEY="$GEMINI_API_KEY" \
    --min-instances 0 \
    --max-instances 5 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300

# Retrieve deployed service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --platform managed --region "$REGION" --format 'value(status.url)')

echo "✅ Deployment Successful!"
echo "📡 Service URL: $SERVICE_URL"
echo "🩺 Health Check: $SERVICE_URL/healthz"
echo "🤖 Operations API: $SERVICE_URL/api/operations/briefing"

# Optional: Set up Cloud Scheduler for Daily 7:00 AM Morning Briefing
echo "⏰ Creating Cloud Scheduler Job for Daily 7:00 AM Briefing..."
gcloud scheduler jobs create http daily-operations-briefing \
    --location "$REGION" \
    --schedule "0 7 * * *" \
    --time-zone "America/New_York" \
    --uri "$SERVICE_URL/api/webhook" \
    --http-method POST \
    --headers "Content-Type=application/json" \
    --message-body '{"trigger_type": "CRON_MORNING_BRIEF"}' \
    || echo "Scheduler job already exists or skipped."

echo "🎉 All Done! Your Productivity Operations Agent is live on Cloud Run."
