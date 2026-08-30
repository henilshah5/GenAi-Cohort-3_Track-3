import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { store } from "./src/server/mockData.js";
import { runAgentChat, executeTool, generateDailyBriefingAudio } from "./src/server/agent.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // API Routes
  // ==========================================

  // Health check for Cloud Run and dev probes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      service: "Cloud Run Daily Operations Agent",
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
  });

  // Overall Operations Dashboard State
  app.get("/api/operations/dashboard", (req, res) => {
    res.json({
      sales: store.sales,
      inventory: store.inventory,
      purchaseOrders: store.purchaseOrders,
      workflows: store.workflows
    });
  });

  // Sales Data & Analytics
  app.get("/api/operations/sales", (req, res) => {
    res.json(store.sales);
  });

  // POS / Checkout Order Simulation
  app.post("/api/operations/sales/simulate", (req, res) => {
    const { sku, quantity } = req.body;
    const qty = Number(quantity) || 1;
    const targetSku = sku || store.inventory[0].sku;
    const result = store.simulateSale(targetSku, qty);

    if (!result) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({
      message: `Simulated checkout for ${qty}x ${result.item.name}`,
      saleAmount: result.saleAmount,
      newStock: result.newStock,
      salesSummary: store.sales
    });
  });

  // Inventory list
  app.get("/api/operations/inventory", (req, res) => {
    res.json(store.inventory);
  });

  // Direct manual inventory stock update
  app.post("/api/operations/inventory/update", (req, res) => {
    const { sku, newStock } = req.body;
    const item = store.inventory.find(i => i.sku === sku);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    item.stock = Number(newStock);
    if (item.stock <= item.safetyStock / 2) {
      item.status = 'CRITICAL_LOW';
    } else if (item.stock <= item.safetyStock) {
      item.status = 'LOW_STOCK';
    } else {
      item.status = 'OPTIMAL';
    }

    res.json({ item, message: `Updated ${item.name} stock to ${item.stock}` });
  });

  // Purchase order restock creation
  app.post("/api/operations/inventory/restock", (req, res) => {
    const { sku, quantity, notes } = req.body;
    const po = store.createPurchaseOrder(sku, Number(quantity) || 50, notes);
    if (!po) {
      return res.status(404).json({ error: "Product SKU not found" });
    }
    res.json({ purchaseOrder: po, message: `PO created for ${po.productName}` });
  });

  // Workflows & Automations
  app.get("/api/operations/automations", (req, res) => {
    res.json(store.workflows);
  });

  // Trigger automation workflow
  app.post("/api/operations/automations/trigger", (req, res) => {
    const { workflowId } = req.body;
    const result = executeTool("triggerWorkflow", { workflowId });
    res.json(result);
  });

  // Interactive AI Agent Chat
  app.post("/api/agent/chat", async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    try {
      const response = await runAgentChat(message, history || []);
      res.json(response);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to process agent chat" });
    }
  });

  // Quick Action Execution (e.g. Generate Briefing, Restock All Low Stock, etc.)
  app.post("/api/agent/quick-action", async (req, res) => {
    const { actionType } = req.body;

    let prompt = "";
    switch (actionType) {
      case "MORNING_BRIEFING":
        prompt = "Run a comprehensive operational health audit for today. Highlight gross sales, percentage of target reached, critical low-stock items requiring replenishment, and active automated workflows.";
        break;
      case "RESTOCK_ALL_CRITICAL":
        prompt = "Check all critical low stock items in inventory and generate supplier purchase orders for each of them to bring stock back above safety levels.";
        break;
      case "SALES_VELOCITY_CHECK":
        prompt = "Fetch today's sales velocity analytics, hourly order trends, and top revenue drivers. Provide actionable insights on what is performing best.";
        break;
      case "EOD_RECONCILIATION":
        prompt = "Perform end-of-day financial and operational reconciliation. Verify revenue vs settlement, stock variances, and trigger the EOD workflow.";
        break;
      default:
        prompt = "Provide an operational status overview and highlight any urgent bottlenecks.";
    }

    try {
      const result = await runAgentChat(prompt);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Voice TTS Audio Briefing
  app.post("/api/agent/tts", async (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS" });
    }
    const audio = await generateDailyBriefingAudio(text);
    res.json({ audioBase64: audio });
  });

  // Return standalone Cloud Run deployment files
  app.get("/api/deployment/files", (req, res) => {
    try {
      const files = [
        {
          filename: "Dockerfile",
          language: "dockerfile",
          description: "Production multi-stage container build for Google Cloud Run with Python 3.11 & FastAPI.",
          content: fs.existsSync("Dockerfile") ? fs.readFileSync("Dockerfile", "utf-8") : ""
        },
        {
          filename: "main.py",
          language: "python",
          description: "Autonomous Agent application for Cloud Run with Google GenAI SDK function-calling tools.",
          content: fs.existsSync("main.py") ? fs.readFileSync("main.py", "utf-8") : ""
        },
        {
          filename: "requirements.txt",
          language: "text",
          description: "Python package dependencies for Google GenAI, FastAPI, Uvicorn, and Pydantic.",
          content: fs.existsSync("requirements.txt") ? fs.readFileSync("requirements.txt", "utf-8") : ""
        },
        {
          filename: "deploy.sh",
          language: "bash",
          description: "Automated shell script for one-click deployment to Google Cloud Run and Cloud Scheduler setup.",
          content: fs.existsSync("deploy.sh") ? fs.readFileSync("deploy.sh", "utf-8") : ""
        },
        {
          filename: "cloudbuild.yaml",
          language: "yaml",
          description: "CI/CD automated build and deploy configuration for Google Cloud Build.",
          content: fs.existsSync("cloudbuild.yaml") ? fs.readFileSync("cloudbuild.yaml", "utf-8") : ""
        },
        {
          filename: "README.md",
          language: "markdown",
          description: "Step-by-step developer deployment guide, architecture diagram, and Cloud Scheduler setup.",
          content: fs.existsSync("README.md") ? fs.readFileSync("README.md", "utf-8") : ""
        }
      ];
      res.json(files);
    } catch (e: any) {
      res.status(500).json({ error: "Could not read deployment files" });
    }
  });

  // ==========================================
  // Vite Integration / Static Serving
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Operations Assistant Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
