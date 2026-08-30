import { SalesSummary, InventoryItem, PurchaseOrder, ScheduledWorkflow } from '../types.js';

export class OperationsStore {
  public sales: SalesSummary = {
    grossRevenue: 4892.50,
    netProfit: 1845.20,
    ordersCount: 142,
    averageOrderValue: 34.45,
    targetDailyRevenue: 4500.00,
    growthVsYesterdayPct: 14.2,
    topSellingProducts: [
      { sku: 'SKU-AURORA-MUG', name: 'Ceramic Artisan Mug (Matte Ochre)', unitsSold: 48, revenue: 1152.00, category: 'Home Goods' },
      { sku: 'SKU-ESPRESSO-BEANS', name: 'Single-Origin Ethiopian Roast (1kg)', unitsSold: 35, revenue: 875.00, category: 'Beverages' },
      { sku: 'SKU-LINEN-TOWEL', name: 'Organic French Linen Towel Set', unitsSold: 26, revenue: 468.00, category: 'Textiles' },
      { sku: 'SKU-MATCHA-CEREMONY', name: 'Uji Ceremonial Matcha Tin (50g)', unitsSold: 22, revenue: 594.00, category: 'Beverages' },
      { sku: 'SKU-DRIP-KETTLE', name: 'Precision Gooseneck Pour-Over Kettle', unitsSold: 11, revenue: 649.00, category: 'Equipment' },
    ],
    hourlyVelocity: [
      { hour: '08:00', sales: 240.00, orders: 8 },
      { hour: '10:00', sales: 680.00, orders: 21 },
      { hour: '12:00', sales: 1420.00, orders: 44 },
      { hour: '14:00', sales: 980.00, orders: 31 },
      { hour: '16:00', sales: 890.00, orders: 25 },
      { hour: '18:00', sales: 682.50, orders: 13 },
    ]
  };

  public inventory: InventoryItem[] = [
    {
      id: 'inv-1',
      sku: 'SKU-AURORA-MUG',
      name: 'Ceramic Artisan Mug (Matte Ochre)',
      category: 'Home Goods',
      stock: 14,
      safetyStock: 25,
      reorderQty: 50,
      unitCost: 10.50,
      retailPrice: 24.00,
      supplier: 'ClayCraft Studios',
      supplierEmail: 'orders@claycraftstudios.com',
      leadTimeDays: 4,
      status: 'CRITICAL_LOW',
      lastRestocked: '2026-08-15'
    },
    {
      id: 'inv-2',
      sku: 'SKU-ESPRESSO-BEANS',
      name: 'Single-Origin Ethiopian Roast (1kg)',
      category: 'Beverages',
      stock: 8,
      safetyStock: 20,
      reorderQty: 40,
      unitCost: 12.00,
      retailPrice: 25.00,
      supplier: 'Highland Roasters Inc',
      supplierEmail: 'supply@highlandroasters.co',
      leadTimeDays: 2,
      status: 'CRITICAL_LOW',
      lastRestocked: '2026-08-20'
    },
    {
      id: 'inv-3',
      sku: 'SKU-MATCHA-CEREMONY',
      name: 'Uji Ceremonial Matcha Tin (50g)',
      category: 'Beverages',
      stock: 5,
      safetyStock: 15,
      reorderQty: 30,
      unitCost: 16.50,
      retailPrice: 27.00,
      supplier: 'Kyoto Heritage Direct',
      supplierEmail: 'wholesale@kyotodirect.jp',
      leadTimeDays: 7,
      status: 'CRITICAL_LOW',
      lastRestocked: '2026-08-10'
    },
    {
      id: 'inv-4',
      sku: 'SKU-LINEN-TOWEL',
      name: 'Organic French Linen Towel Set',
      category: 'Textiles',
      stock: 42,
      safetyStock: 30,
      reorderQty: 50,
      unitCost: 8.00,
      retailPrice: 18.00,
      supplier: 'EcoTextiles Provence',
      supplierEmail: 'sales@ecotextiles-france.com',
      leadTimeDays: 5,
      status: 'OPTIMAL',
      lastRestocked: '2026-08-22'
    },
    {
      id: 'inv-5',
      sku: 'SKU-DRIP-KETTLE',
      name: 'Precision Gooseneck Pour-Over Kettle',
      category: 'Equipment',
      stock: 19,
      safetyStock: 15,
      reorderQty: 20,
      unitCost: 28.00,
      retailPrice: 59.00,
      supplier: 'Nordic Brew Equipment',
      supplierEmail: 'dispatch@nordicbrewgear.se',
      leadTimeDays: 6,
      status: 'OPTIMAL',
      lastRestocked: '2026-08-18'
    },
    {
      id: 'inv-6',
      sku: 'SKU-OAT-MILK-CASE',
      name: 'Barista Grade Oat Milk (Case of 6)',
      category: 'Beverages',
      stock: 38,
      safetyStock: 20,
      reorderQty: 50,
      unitCost: 14.00,
      retailPrice: 32.00,
      supplier: 'PureOat Specialty Distro',
      supplierEmail: 'b2b@pureoat.com',
      leadTimeDays: 3,
      status: 'OPTIMAL',
      lastRestocked: '2026-08-25'
    },
    {
      id: 'inv-7',
      sku: 'SKU-HANDMADE-SOAP',
      name: 'Cold-Pressed Cedarwood Soap Bar',
      category: 'Personal Care',
      stock: 22,
      safetyStock: 20,
      reorderQty: 40,
      unitCost: 3.20,
      retailPrice: 9.50,
      supplier: 'Botanical Craft Lab',
      supplierEmail: 'lab@botanicalcraft.com',
      leadTimeDays: 3,
      status: 'LOW_STOCK',
      lastRestocked: '2026-08-24'
    }
  ];

  public purchaseOrders: PurchaseOrder[] = [
    {
      id: 'PO-20260828-001',
      sku: 'SKU-LINEN-TOWEL',
      productName: 'Organic French Linen Towel Set',
      quantity: 50,
      unitCost: 8.00,
      totalCost: 400.00,
      supplier: 'EcoTextiles Provence',
      supplierEmail: 'sales@ecotextiles-france.com',
      status: 'IN_TRANSIT',
      createdAt: '2026-08-28T09:30:00Z',
      notes: 'Automated restock order initiated by Daily Operations Agent'
    }
  ];

  public workflows: ScheduledWorkflow[] = [
    {
      id: 'wf-morning-brief',
      name: '07:00 AM Morning Executive Briefing',
      description: 'Synthesizes overnight sales, pending orders, and urgent tasks for the day.',
      cron: '0 7 * * *',
      frequency: 'Daily at 07:00 AM EST',
      status: 'ACTIVE',
      lastRun: 'Today, 07:00 AM',
      nextRun: 'Tomorrow, 07:00 AM',
      actionType: 'MORNING_BRIEFING',
      executionLogs: [
        {
          id: 'log-1',
          timestamp: 'Today, 07:00 AM',
          status: 'SUCCESS',
          summary: 'Morning operational briefing synthesized and delivered.',
          details: 'Gross Revenue Target achieved (+14.2%). Identified 3 critical low-stock items.',
          executionTimeMs: 412
        }
      ]
    },
    {
      id: 'wf-inventory-guard',
      name: '05:00 PM Low-Stock Auto-PO Trigger',
      description: 'Scans inventory against safety thresholds and drafts purchase orders to suppliers.',
      cron: '0 17 * * *',
      frequency: 'Daily at 05:00 PM EST',
      status: 'ACTIVE',
      lastRun: 'Yesterday, 05:00 PM',
      nextRun: 'Today, 05:00 PM',
      actionType: 'INVENTORY_AUDIT',
      executionLogs: [
        {
          id: 'log-2',
          timestamp: 'Yesterday, 05:00 PM',
          status: 'WARNING',
          summary: 'Critical inventory alert triggered for 3 items.',
          details: 'Artisan Mugs (14 left), Espresso Beans (8 left), Uji Matcha (5 left). POs drafted.',
          executionTimeMs: 380
        }
      ]
    },
    {
      id: 'wf-midday-velocity',
      name: '12:00 PM Midday Sales Velocity Check',
      description: 'Checks lunch rush volume, hourly sales velocity, and payment gateway health.',
      cron: '0 12 * * *',
      frequency: 'Daily at 12:00 PM EST',
      status: 'ACTIVE',
      lastRun: 'Today, 12:00 PM',
      nextRun: 'Tomorrow, 12:00 PM',
      actionType: 'VELOCITY_CHECK',
      executionLogs: [
        {
          id: 'log-3',
          timestamp: 'Today, 12:00 PM',
          status: 'SUCCESS',
          summary: 'Midday velocity check passed. 44 orders processed between 10am-12pm ($1,420).',
          details: 'No payment transaction anomalies detected. Conversion rate at 4.2%.',
          executionTimeMs: 290
        }
      ]
    },
    {
      id: 'wf-eod-reconcile',
      name: '09:00 PM End of Day Reconciliation',
      description: 'Reconciles POS drawer, online stripe charges, refunds, and updates net margins.',
      cron: '0 21 * * *',
      frequency: 'Daily at 09:00 PM EST',
      status: 'ACTIVE',
      lastRun: 'Yesterday, 09:00 PM',
      nextRun: 'Today, 09:00 PM',
      actionType: 'EOD_RECONCILIATION',
      executionLogs: [
        {
          id: 'log-4',
          timestamp: 'Yesterday, 09:00 PM',
          status: 'SUCCESS',
          summary: 'EOD financial reconciliation complete. Zero variance detected.',
          details: 'Net revenue $4,210.30 balanced across 138 total settlement batches.',
          executionTimeMs: 510
        }
      ]
    }
  ];

  // Helper Methods
  public simulateSale(sku: string, qty: number) {
    const item = this.inventory.find(i => i.sku === sku);
    if (!item) return null;
    
    // Deduct stock
    item.stock = Math.max(0, item.stock - qty);
    if (item.stock <= item.safetyStock / 2) {
      item.status = 'CRITICAL_LOW';
    } else if (item.stock <= item.safetyStock) {
      item.status = 'LOW_STOCK';
    }

    const saleAmount = item.retailPrice * qty;
    this.sales.grossRevenue += saleAmount;
    this.sales.ordersCount += 1;
    this.sales.averageOrderValue = Number((this.sales.grossRevenue / this.sales.ordersCount).toFixed(2));
    
    // Top product check
    const topProd = this.sales.topSellingProducts.find(p => p.sku === sku);
    if (topProd) {
      topProd.unitsSold += qty;
      topProd.revenue += saleAmount;
    }

    return { item, saleAmount, newStock: item.stock };
  }

  public createPurchaseOrder(sku: string, quantity: number, notes?: string): PurchaseOrder | null {
    const item = this.inventory.find(i => i.sku === sku);
    if (!item) return null;

    const poId = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.purchaseOrders.length + 1).padStart(3, '0')}`;
    const totalCost = Number((item.unitCost * quantity).toFixed(2));

    const po: PurchaseOrder = {
      id: poId,
      sku,
      productName: item.name,
      quantity,
      unitCost: item.unitCost,
      totalCost,
      supplier: item.supplier,
      supplierEmail: item.supplierEmail,
      status: 'SUBMITTED_TO_SUPPLIER',
      createdAt: new Date().toISOString(),
      notes: notes || `Auto-generated restock order via Operations Agent for ${item.name}`
    };

    this.purchaseOrders.unshift(po);
    item.status = 'REORDER_IN_PROGRESS';
    return po;
  }
}

export const store = new OperationsStore();
