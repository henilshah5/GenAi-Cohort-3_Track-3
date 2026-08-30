export interface SalesSummary {
  grossRevenue: number;
  netProfit: number;
  ordersCount: number;
  averageOrderValue: number;
  targetDailyRevenue: number;
  growthVsYesterdayPct: number;
  topSellingProducts: TopProduct[];
  hourlyVelocity: HourlySales[];
}

export interface TopProduct {
  sku: string;
  name: string;
  unitsSold: number;
  revenue: number;
  category: string;
}

export interface HourlySales {
  hour: string;
  sales: number;
  orders: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  safetyStock: number;
  reorderQty: number;
  unitCost: number;
  retailPrice: number;
  supplier: string;
  supplierEmail: string;
  leadTimeDays: number;
  status: 'OPTIMAL' | 'LOW_STOCK' | 'CRITICAL_LOW' | 'REORDER_IN_PROGRESS';
  lastRestocked: string;
}

export interface PurchaseOrder {
  id: string;
  sku: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  supplierEmail: string;
  status: 'DRAFT' | 'SUBMITTED_TO_SUPPLIER' | 'CONFIRMED' | 'IN_TRANSIT' | 'RECEIVED';
  createdAt: string;
  notes?: string;
}

export interface ScheduledWorkflow {
  id: string;
  name: string;
  description: string;
  cron: string;
  frequency: string;
  status: 'ACTIVE' | 'PAUSED';
  lastRun: string;
  nextRun: string;
  actionType: 'MORNING_BRIEFING' | 'INVENTORY_AUDIT' | 'VELOCITY_CHECK' | 'EOD_RECONCILIATION' | 'COMPETITOR_SYNC';
  executionLogs: WorkflowLog[];
}

export interface WorkflowLog {
  id: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  summary: string;
  details: string;
  executionTimeMs: number;
}

export interface ToolCallExecution {
  toolName: string;
  args: Record<string, any>;
  result: Record<string, any>;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  text: string;
  timestamp: string;
  toolCalls?: ToolCallExecution[];
  isAction?: boolean;
  actionType?: string;
  audioBase64?: string;
}

export interface DeploymentFile {
  filename: string;
  language: string;
  description: string;
  content: string;
}
