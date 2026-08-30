import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { store } from "./mockData.js";
import { ToolCallExecution } from "../types.js";

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using fallback logic.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Function Declarations for Gemini
const getSalesAnalyticsDeclaration: FunctionDeclaration = {
  name: "getSalesAnalytics",
  description: "Fetches live sales performance, gross revenue, net profit, average order value, target progress, and top-selling SKUs for today or a specified timeframe.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      timeframe: {
        type: Type.STRING,
        description: "Timeframe to inspect: 'today', 'yesterday', 'this_week', or 'month'. Defaults to 'today'."
      }
    }
  }
};

const getInventoryStatusDeclaration: FunctionDeclaration = {
  name: "getInventoryStatus",
  description: "Inspects live inventory stock levels, critical stockout warnings, safety stock thresholds, and supplier lead times across the catalog.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      statusFilter: {
        type: Type.STRING,
        description: "Filter items by status: 'ALL', 'CRITICAL_LOW', 'LOW_STOCK', 'OPTIMAL', or 'REORDER_IN_PROGRESS'."
      },
      category: {
        type: Type.STRING,
        description: "Filter by product category e.g., 'Beverages', 'Home Goods', 'Textiles', 'Equipment'."
      }
    }
  }
};

const createRestockOrderDeclaration: FunctionDeclaration = {
  name: "createRestockOrder",
  description: "Generates an official supplier Purchase Order (PO) to replenish low-stock inventory items.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      sku: {
        type: Type.STRING,
        description: "The product SKU to restock (e.g. 'SKU-AURORA-MUG', 'SKU-ESPRESSO-BEANS', 'SKU-MATCHA-CEREMONY')."
      },
      quantity: {
        type: Type.NUMBER,
        description: "Number of units to reorder from the supplier."
      },
      notes: {
        type: Type.STRING,
        description: "Optional notes for the supplier regarding delivery urgency or batch preference."
      }
    },
    required: ["sku", "quantity"]
  }
};

const runOperationalAuditDeclaration: FunctionDeclaration = {
  name: "runOperationalAudit",
  description: "Runs a comprehensive health check across sales targets, unfulfilled orders, inventory risks, and scheduled automation statuses.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      includeForecast: {
        type: Type.BOOLEAN,
        description: "Whether to include next-day revenue forecasting and supplier lead-time estimations."
      }
    }
  }
};

const triggerWorkflowDeclaration: FunctionDeclaration = {
  name: "triggerWorkflow",
  description: "Triggers one of the scheduled Cloud Run automated workflows immediately (e.g., Morning Briefing, Low-Stock Guard, Midday Velocity, EOD Reconciliation).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      workflowId: {
        type: Type.STRING,
        description: "The ID of the workflow: 'wf-morning-brief', 'wf-inventory-guard', 'wf-midday-velocity', or 'wf-eod-reconcile'."
      }
    },
    required: ["workflowId"]
  }
};

// Tool execution map
export function executeTool(toolName: string, args: Record<string, any>): Record<string, any> {
  const timestamp = new Date().toISOString();

  switch (toolName) {
    case "getSalesAnalytics": {
      const sales = store.sales;
      const pctAchieved = Number(((sales.grossRevenue / sales.targetDailyRevenue) * 100).toFixed(1));
      return {
        status: "success",
        timeframe: args.timeframe || "today",
        grossRevenue: `$${sales.grossRevenue.toFixed(2)}`,
        netProfit: `$${sales.netProfit.toFixed(2)}`,
        ordersCount: sales.ordersCount,
        averageOrderValue: `$${sales.averageOrderValue.toFixed(2)}`,
        dailyTarget: `$${sales.targetDailyRevenue.toFixed(2)}`,
        targetProgress: `${pctAchieved}%`,
        targetStatus: sales.grossRevenue >= sales.targetDailyRevenue ? "EXCEEDED_TARGET" : "ON_TRACK",
        topProducts: sales.topSellingProducts.map(p => ({
          sku: p.sku,
          name: p.name,
          unitsSold: p.unitsSold,
          revenue: `$${p.revenue.toFixed(2)}`
        }))
      };
    }

    case "getInventoryStatus": {
      let items = [...store.inventory];
      if (args.statusFilter && args.statusFilter !== "ALL") {
        items = items.filter(i => i.status === args.statusFilter);
      }
      if (args.category) {
        items = items.filter(i => i.category.toLowerCase().includes(args.category.toLowerCase()));
      }
      const criticalCount = items.filter(i => i.status === "CRITICAL_LOW").length;
      return {
        status: "success",
        totalItemsMatched: items.length,
        criticalLowStockCount: criticalCount,
        items: items.map(i => ({
          sku: i.sku,
          name: i.name,
          stock: i.stock,
          safetyStock: i.safetyStock,
          reorderQty: i.reorderQty,
          status: i.status,
          supplier: i.supplier,
          leadTimeDays: `${i.leadTimeDays} days`,
          unitCost: `$${i.unitCost.toFixed(2)}`
        }))
      };
    }

    case "createRestockOrder": {
      const sku = args.sku;
      const qty = Number(args.quantity) || 50;
      const po = store.createPurchaseOrder(sku, qty, args.notes);
      if (!po) {
        return { status: "error", message: `SKU '${sku}' was not found in catalog.` };
      }
      return {
        status: "success",
        message: `Successfully created Purchase Order ${po.id} for ${qty} units of ${po.productName}.`,
        purchaseOrder: po
      };
    }

    case "runOperationalAudit": {
      const sales = store.sales;
      const criticalItems = store.inventory.filter(i => i.status === "CRITICAL_LOW");
      const activeWorkflows = store.workflows.filter(w => w.status === "ACTIVE").length;

      return {
        status: "success",
        timestamp,
        operationalHealthScore: 92,
        financials: {
          grossRevenue: `$${sales.grossRevenue.toFixed(2)}`,
          target: `$${sales.targetDailyRevenue.toFixed(2)}`,
          variancePct: `+${sales.growthVsYesterdayPct}%`
        },
        risks: criticalItems.map(i => ({
          riskType: "STOCKOUT_VULNERABILITY",
          severity: "HIGH",
          item: i.name,
          stockRemaining: i.stock,
          recommendedReorder: i.reorderQty,
          supplier: i.supplier
        })),
        automationStatus: {
          activeWorkflowsCount: activeWorkflows,
          totalWorkflows: store.workflows.length,
          allSystemsNominal: true
        }
      };
    }

    case "triggerWorkflow": {
      const wf = store.workflows.find(w => w.id === args.workflowId);
      if (!wf) {
        return { status: "error", message: `Workflow '${args.workflowId}' not found.` };
      }
      const log = {
        id: `log-${Date.now()}`,
        timestamp: 'Just now (Manual Cloud Run Trigger)',
        status: 'SUCCESS' as const,
        summary: `Manually triggered '${wf.name}' successfully.`,
        details: `Task completed via Cloud Run Agent tool call in 280ms.`,
        executionTimeMs: 280
      };
      wf.lastRun = 'Just now';
      wf.executionLogs.unshift(log);
      return {
        status: "success",
        workflowId: wf.id,
        workflowName: wf.name,
        log
      };
    }

    default:
      return { status: "unknown_tool", message: `Tool '${toolName}' is not recognized.` };
  }
}

// Interactive Agent Chat Handler
export async function runAgentChat(userMessage: string, history: Array<{ role: string; content: string }> = []) {
  const ai = getAiClient();
  const executedToolCalls: ToolCallExecution[] = [];

  const systemInstruction = `
You are the Cloud Run Daily Operations Productivity Assistant for Apex Retail & Lifestyle Store.
Your job is to help the business owner autonomously manage daily operations:
1. Monitoring sales velocity, revenue milestones, and order performance.
2. Tracking inventory levels, catching critical stockouts, and drafting supplier Purchase Orders (POs).
3. Executing and inspecting scheduled Cloud Run automation workflows.
4. Providing high-density, actionable operational briefings and financial audits.

Always use your provided tools when the user asks about sales, stock, reordering, operational status, or workflows.
Be professional, structured, concise, and proactive. Highlight urgent actions (like restocking critical items) clearly with concrete numbers.
`;

  if (!ai) {
    // Graceful fallback simulation if GEMINI_API_KEY is not configured
    const lower = userMessage.toLowerCase();
    let textResponse = "";

    if (lower.includes("sale") || lower.includes("revenue") || lower.includes("order")) {
      const toolRes = executeTool("getSalesAnalytics", { timeframe: "today" });
      executedToolCalls.push({
        toolName: "getSalesAnalytics",
        args: { timeframe: "today" },
        result: toolRes,
        timestamp: new Date().toISOString()
      });
      textResponse = `📊 **Sales Performance Summary (Today)**:\n\n- **Gross Revenue**: ${toolRes.grossRevenue} (Target: ${toolRes.dailyTarget} — **${toolRes.targetProgress} achieved**)\n- **Total Orders**: ${toolRes.ordersCount} orders (AOV: ${toolRes.averageOrderValue})\n- **Top Item**: ${toolRes.topProducts[0].name} (${toolRes.topProducts[0].unitsSold} units sold for ${toolRes.topProducts[0].revenue})\n\nDaily revenue is tracking +14.2% ahead of yesterday's pace.`;
    } else if (lower.includes("stock") || lower.includes("inventory") || lower.includes("low")) {
      const toolRes = executeTool("getInventoryStatus", { statusFilter: "CRITICAL_LOW" });
      executedToolCalls.push({
        toolName: "getInventoryStatus",
        args: { statusFilter: "CRITICAL_LOW" },
        result: toolRes,
        timestamp: new Date().toISOString()
      });
      textResponse = `⚠️ **Critical Inventory Alert**:\n\nFound **${toolRes.criticalLowStockCount} items** below their minimum safety thresholds:\n` +
        toolRes.items.map((i: any) => `- **${i.name}**: ${i.stock} in stock (Safety Min: ${i.safetyStock}) → Supplier: ${i.supplier} (${i.leadTimeDays})`).join("\n") +
        `\n\nWould you like me to generate Purchase Orders (POs) to restock these immediately?`;
    } else if (lower.includes("po") || lower.includes("restock") || lower.includes("order")) {
      const toolRes = executeTool("createRestockOrder", { sku: "SKU-AURORA-MUG", quantity: 50, notes: "Urgent replenishment for weekend peak" });
      executedToolCalls.push({
        toolName: "createRestockOrder",
        args: { sku: "SKU-AURORA-MUG", quantity: 50 },
        result: toolRes,
        timestamp: new Date().toISOString()
      });
      textResponse = `✅ **Purchase Order Created & Submitted**:\n\n- **PO ID**: \`${toolRes.purchaseOrder.id}\`\n- **Product**: ${toolRes.purchaseOrder.productName}\n- **Quantity**: ${toolRes.purchaseOrder.quantity} units\n- **Total Cost**: $${toolRes.purchaseOrder.totalCost.toFixed(2)}\n- **Supplier**: ${toolRes.purchaseOrder.supplier} (${toolRes.purchaseOrder.supplierEmail})\n- **Status**: \`${toolRes.purchaseOrder.status}\``;
    } else {
      const auditRes = executeTool("runOperationalAudit", { includeForecast: true });
      executedToolCalls.push({
        toolName: "runOperationalAudit",
        args: { includeForecast: true },
        result: auditRes,
        timestamp: new Date().toISOString()
      });
      textResponse = `🌟 **Daily Operations Health Briefing**:\n\n- **Health Score**: 92 / 100\n- **Today's Revenue**: ${auditRes.financials.grossRevenue} (${auditRes.financials.variancePct} vs target)\n- **Active Automations**: ${auditRes.automationStatus.activeWorkflowsCount} of ${auditRes.automationStatus.totalWorkflows} Cloud Run cron jobs running normally\n- **Immediate Priority**: 3 items in critical low stock require supplier PO approvals.`;
    }

    return {
      text: textResponse,
      toolCalls: executedToolCalls
    };
  }

  try {
    // Step 1: Initial call with tools declared
    const response1 = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: userMessage,
      config: {
        systemInstruction,
        tools: [{
          functionDeclarations: [
            getSalesAnalyticsDeclaration,
            getInventoryStatusDeclaration,
            createRestockOrderDeclaration,
            runOperationalAuditDeclaration,
            triggerWorkflowDeclaration
          ]
        }],
        temperature: 0.3
      }
    });

    const functionCalls = response1.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      // Execute each function call
      const functionResponses: any[] = [];
      for (const call of functionCalls) {
        const result = executeTool(call.name, call.args || {});
        executedToolCalls.push({
          toolName: call.name,
          args: call.args || {},
          result,
          timestamp: new Date().toISOString()
        });

        functionResponses.push({
          name: call.name,
          response: { result }
        });
      }

      // Step 2: Feed back function outputs to model for final comprehensive synthesis
      const followUpContents = [
        { role: 'user', parts: [{ text: userMessage }] },
        response1.candidates?.[0]?.content || { role: 'model', parts: [] },
        {
          role: 'user',
          parts: functionResponses.map(fr => ({
            functionResponse: {
              name: fr.name,
              response: fr.response
            }
          }))
        }
      ];

      const response2 = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: followUpContents as any,
        config: {
          systemInstruction,
          temperature: 0.3
        }
      });

      return {
        text: response2.text || "Operations task evaluated successfully.",
        toolCalls: executedToolCalls
      };
    }

    return {
      text: response1.text || "Operations assistant ready.",
      toolCalls: executedToolCalls
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Graceful fallback to deterministic tool execution
    const fallbackResult = executeTool("getSalesAnalytics", { timeframe: "today" });
    return {
      text: `Analyzed daily operations. Gross Sales are at ${fallbackResult.grossRevenue} across ${fallbackResult.ordersCount} orders. Identified ${store.inventory.filter(i => i.status === 'CRITICAL_LOW').length} low-stock products.`,
      toolCalls: [{
        toolName: "getSalesAnalytics",
        args: { timeframe: "today" },
        result: fallbackResult,
        timestamp: new Date().toISOString()
      }]
    };
  }
}

// Generate Quick Morning Briefing text + audio
export async function generateDailyBriefingAudio(textSummary: string): Promise<string | null> {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const ttsResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Good morning! Here is your daily operational summary: ${textSummary}` }] }],
      config: {
        responseModalities: ["AUDIO"] as any,
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Puck" }
          }
        }
      }
    });

    const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (err) {
    console.warn("TTS generation skipped or not available:", err);
    return null;
  }
}
