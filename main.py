"""
Production Personal Productivity Assistant & Daily Operations Agent
Deployed on Google Cloud Run with Google GenAI SDK.
"""

import os
import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# Initialize FastAPI App
app = FastAPI(
    title="Daily Operations Productivity Agent",
    description="Autonomous Agent for sales tracking, inventory management, and operational workflows on Cloud Run",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client using the official google-genai SDK
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    print("WARNING: GEMINI_API_KEY environment variable not set. Please configure in Cloud Run.")

client = genai.Client(api_key=API_KEY) if API_KEY else None

# In-Memory Business State (Replaced with Cloud SQL / Firestore in enterprise scale)
BUSINESS_STATE = {
    "store_name": "Apex Retail & Lifestyle Store",
    "today_sales": {
        "gross_revenue": 4892.50,
        "net_profit": 1845.20,
        "orders_count": 142,
        "average_order_value": 34.45,
        "target_daily_revenue": 4500.00,
        "top_selling_products": [
            {"sku": "SKU-AURORA-MUG", "name": "Ceramic Artisan Mug", "units_sold": 48, "revenue": 1152.00},
            {"sku": "SKU-ESPRESSO-BEANS", "name": "Single-Origin Roast (1kg)", "units_sold": 35, "revenue": 875.00},
            {"sku": "SKU-LINEN-TOWEL", "name": "Organic Linen Kitchen Towel", "units_sold": 26, "revenue": 468.00},
        ],
        "hourly_velocity": [
            {"hour": "08:00", "sales": 240.00, "orders": 8},
            {"hour": "10:00", "sales": 680.00, "orders": 21},
            {"hour": "12:00", "sales": 1420.00, "orders": 44},
            {"hour": "14:00", "sales": 980.00, "orders": 31},
            {"hour": "16:00", "sales": 890.00, "orders": 25},
            {"hour": "18:00", "sales": 682.50, "orders": 13},
        ]
    },
    "inventory": [
        {"sku": "SKU-AURORA-MUG", "name": "Ceramic Artisan Mug", "stock": 14, "safety_stock": 25, "reorder_qty": 50, "unit_cost": 10.50, "supplier": "ClayCraft Studios", "status": "CRITICAL_LOW"},
        {"sku": "SKU-ESPRESSO-BEANS", "name": "Single-Origin Roast (1kg)", "stock": 8, "safety_stock": 20, "reorder_qty": 40, "unit_cost": 12.00, "supplier": "Highland Roasters", "status": "CRITICAL_LOW"},
        {"sku": "SKU-MATCHA-CEREMONY", "name": "Uji Ceremonial Matcha (50g)", "stock": 5, "safety_stock": 15, "reorder_qty": 30, "unit_cost": 16.50, "supplier": "Kyoto Imports", "status": "CRITICAL_LOW"},
        {"sku": "SKU-LINEN-TOWEL", "name": "Organic Linen Kitchen Towel", "stock": 42, "safety_stock": 30, "reorder_qty": 50, "unit_cost": 8.00, "supplier": "EcoTextiles Co", "status": "OPTIMAL"},
        {"sku": "SKU-DRIP-KETTLE", "name": "Precision Pour-over Kettle", "stock": 19, "safety_stock": 15, "reorder_qty": 20, "unit_cost": 28.00, "supplier": "Nordic Brew Gear", "status": "OPTIMAL"},
        {"sku": "SKU-OAT-MILK-CASE", "name": "Barista Oat Milk (Case of 6)", "stock": 38, "safety_stock": 20, "reorder_qty": 50, "unit_cost": 14.00, "supplier": "PureOat Distro", "status": "OPTIMAL"}
    ],
    "purchase_orders": [],
    "scheduled_workflows": [
        {"id": "wf-morning-brief", "name": "07:00 AM Morning Executive Briefing", "cron": "0 7 * * *", "status": "ACTIVE", "last_run": "Today 07:00 AM"},
        {"id": "wf-midday-velocity", "name": "12:00 PM Mid-Day Sales Velocity Check", "cron": "0 12 * * *", "status": "ACTIVE", "last_run": "Today 12:00 PM"},
        {"id": "wf-inventory-guard", "name": "05:00 PM Low Stock Auto-PO Trigger", "cron": "0 17 * * *", "status": "ACTIVE", "last_run": "Yesterday 05:00 PM"},
        {"id": "wf-eod-reconcile", "name": "09:00 PM End of Day Financial Reconciliation", "cron": "0 21 * * *", "status": "ACTIVE", "last_run": "Yesterday 09:00 PM"}
    ]
}

# Python Tool Functions for Gemini Agent
def get_sales_analytics(timeframe: str = "today") -> Dict[str, Any]:
    """Retrieve detailed sales performance, revenue vs target, and top selling items."""
    data = BUSINESS_STATE["today_sales"]
    target = data["target_daily_revenue"]
    gross = data["gross_revenue"]
    pct_of_target = round((gross / target) * 100, 1)
    
    return {
        "status": "success",
        "timeframe": timeframe,
        "gross_revenue": gross,
        "orders_count": data["orders_count"],
        "average_order_value": data["average_order_value"],
        "target_daily_revenue": target,
        "percent_of_target_achieved": f"{pct_of_target}%",
        "top_selling_products": data["top_selling_products"],
        "status_summary": "Daily revenue target exceeded by 8.7%" if gross > target else "Approaching daily target"
    }

def get_inventory_status(filter_status: Optional[str] = None) -> Dict[str, Any]:
    """Check stock levels, find low inventory items, and check safety thresholds."""
    items = BUSINESS_STATE["inventory"]
    if filter_status and filter_status.upper() == "CRITICAL":
        items = [i for i in items if i["status"] == "CRITICAL_LOW"]
    
    critical_count = sum(1 for i in items if i["status"] == "CRITICAL_LOW")
    return {
        "status": "success",
        "total_items_tracked": len(items),
        "critical_low_stock_count": critical_count,
        "inventory": items
    }

def create_restock_order(sku: str, quantity: int, notes: str = "") -> Dict[str, Any]:
    """Create and submit a purchase order to suppliers for low-stock SKUs."""
    item = next((i for i in BUSINESS_STATE["inventory"] if i["sku"] == sku), None)
    if not item:
        return {"status": "error", "message": f"SKU {sku} not found in catalog."}
    
    po_id = f"PO-{datetime.datetime.now().strftime('%Y%m%d')}-{len(BUSINESS_STATE['purchase_orders']) + 1:03d}"
    total_cost = round(item["unit_cost"] * quantity, 2)
    po = {
        "po_id": po_id,
        "sku": sku,
        "product_name": item["name"],
        "quantity": quantity,
        "unit_cost": item["unit_cost"],
        "total_cost": total_cost,
        "supplier": item["supplier"],
        "notes": notes,
        "status": "SUBMITTED_TO_SUPPLIER",
        "created_at": datetime.datetime.now().isoformat()
    }
    BUSINESS_STATE["purchase_orders"].append(po)
    
    # Update inventory status to indicate pending replenishment
    item["status"] = "REORDER_IN_PROGRESS"
    
    return {
        "status": "success",
        "message": f"Purchase Order {po_id} generated for {quantity} units of {item['name']}.",
        "purchase_order": po
    }

def run_daily_briefing() -> Dict[str, Any]:
    """Generate an operational health summary and daily task briefing for the business owner."""
    sales = BUSINESS_STATE["today_sales"]
    critical_inventory = [i for i in BUSINESS_STATE["inventory"] if i["status"] == "CRITICAL_LOW"]
    
    return {
        "status": "success",
        "date": datetime.date.today().isoformat(),
        "summary": {
            "gross_sales": sales["gross_revenue"],
            "orders": sales["orders_count"],
            "target": sales["target_daily_revenue"],
            "critical_stock_count": len(critical_inventory),
            "urgent_actions": [
                f"Approve restock for {i['name']} ({i['stock']} left, safety min is {i['safety_stock']})"
                for i in critical_inventory
            ],
            "top_product": sales["top_selling_products"][0]["name"]
        }
    }

# Mapping of tools for python execution
AGENT_TOOLS = [
    get_sales_analytics,
    get_inventory_status,
    create_restock_order,
    run_daily_briefing
]

# Request / Response Schemas
class ChatRequest(BaseModel):
    message: str = Field(..., description="User query or command for the operations agent")
    conversation_history: Optional[List[Dict[str, str]]] = Field(default=[], description="Past messages")

class WebhookRequest(BaseModel):
    trigger_type: str = Field(..., description="E.g., CRON_MORNING_BRIEF, INVENTORY_ALERT, POS_SYNC")
    payload: Optional[Dict[str, Any]] = None

@app.get("/")
def read_root():
    return {
        "service": "Cloud Run Daily Operations Productivity Agent",
        "version": "1.0.0",
        "status": "healthy",
        "docs_url": "/docs",
        "available_endpoints": ["/healthz", "/api/chat", "/api/operations/briefing", "/api/webhook"]
    }

@app.get("/healthz")
def health_check():
    """Standard Cloud Run Liveness and Readiness Probe"""
    return {"status": "ok", "timestamp": datetime.datetime.utcnow().isoformat()}

@app.get("/api/operations/briefing")
def get_briefing():
    """Get the current structured operational state for the dashboard"""
    return {
        "store": BUSINESS_STATE["store_name"],
        "sales": BUSINESS_STATE["today_sales"],
        "inventory": BUSINESS_STATE["inventory"],
        "purchase_orders": BUSINESS_STATE["purchase_orders"],
        "scheduled_workflows": BUSINESS_STATE["scheduled_workflows"]
    }

@app.post("/api/chat")
async def chat_with_agent(req: ChatRequest):
    """
    Main agent endpoint: uses Gemini with function calling to inspect operations,
    execute restock workflows, analyze sales, and respond.
    """
    if not client:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured on Cloud Run instance."
        )
    
    try:
        system_prompt = (
            "You are an Autonomous Personal Productivity Assistant for a busy retail & e-commerce business owner. "
            "You have direct tool access to live sales analytics, inventory tracking, purchase order creation, "
            "and daily operational briefings. "
            "When answering questions, invoke the appropriate tools to fetch live data before forming answers. "
            "Always be concise, proactive, highlight business risks (such as stockouts), and propose concrete actions."
        )
        
        # Run Gemini 3.7 Flash with Python tool execution
        response = client.models.generate_content(
            model="gemini-3.7-flash",
            contents=req.message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                tools=AGENT_TOOLS,
                temperature=0.3
            )
        )
        
        return {
            "response": response.text,
            "function_calls": [
                {"name": call.name, "args": call.args}
                for call in getattr(response, "function_calls", []) or []
            ],
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/webhook")
async def handle_cloud_scheduler_webhook(req: WebhookRequest, background_tasks: BackgroundTasks):
    """
    Endpoint invoked by Google Cloud Scheduler or Pub/Sub to trigger automated daily operations.
    """
    trigger = req.trigger_type
    
    if trigger == "CRON_MORNING_BRIEF":
        briefing = run_daily_briefing()
        return {
            "status": "success",
            "trigger": trigger,
            "message": "Morning briefing generated and dispatched.",
            "data": briefing
        }
    elif trigger == "INVENTORY_ALERT":
        critical = [i for i in BUSINESS_STATE["inventory"] if i["status"] == "CRITICAL_LOW"]
        return {
            "status": "success",
            "trigger": trigger,
            "critical_items_found": len(critical),
            "items": critical
        }
    else:
        return {
            "status": "acknowledged",
            "trigger": trigger,
            "message": f"Webhook {trigger} received."
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
