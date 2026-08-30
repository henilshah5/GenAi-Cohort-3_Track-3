import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Clock, 
  FileText, 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  ArrowRight,
  Truck,
  Terminal
} from 'lucide-react';
import { InventoryItem, PurchaseOrder } from '../types';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  onRestockItem: (sku: string, quantity: number, notes?: string) => Promise<void>;
  onUpdateStock: (sku: string, newStock: number) => Promise<void>;
  isProcessing: boolean;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  inventory,
  purchaseOrders,
  onRestockItem,
  onUpdateStock,
  isProcessing
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeModalItem, setActiveModalItem] = useState<InventoryItem | null>(null);
  const [reorderQty, setReorderQty] = useState<number>(50);
  const [reorderNotes, setReorderNotes] = useState<string>('');

  const categories = ['ALL', ...Array.from(new Set(inventory.map(i => i.category)))];

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const criticalCount = inventory.filter(i => i.status === 'CRITICAL_LOW').length;
  const lowCount = inventory.filter(i => i.status === 'LOW_STOCK').length;
  const optimalCount = inventory.filter(i => i.status === 'OPTIMAL').length;

  const handleOpenRestockModal = (item: InventoryItem) => {
    setActiveModalItem(item);
    setReorderQty(item.reorderQty);
    setReorderNotes(`Automated Restock via Operations Agent for ${item.supplier}`);
  };

  const handleConfirmRestock = async () => {
    if (!activeModalItem) return;
    await onRestockItem(activeModalItem.sku, reorderQty, reorderNotes);
    setActiveModalItem(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search/Filter Controls */}
      <div className="bg-[#0A0A0C] border border-[#222] p-6 shadow-2xl text-[#E0E0E0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#222]">
          <div>
            <span className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono">
              Catalog & Safety Buffers
            </span>
            <h2 className="text-2xl font-black italic tracking-tighter text-white">
              INVENTORY TELEMETRY & AUTO-PROCUREMENT
            </h2>
            <p className="text-xs text-[#888] font-mono mt-1">
              Live stock levels with dynamic safety buffers, lead-time tracking, and automated PO generation.
            </p>
          </div>

          {/* Search and Category Filter */}
          <div className="flex flex-wrap items-center gap-2.5 font-mono">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search SKU or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#111] border border-[#333] pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#00FF41] transition-all w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center gap-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
                    selectedCategory === c
                      ? 'bg-white text-black border-white shadow-sm'
                      : 'bg-[#111] border-[#222] text-[#888] hover:text-white hover:border-[#444]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredItems.map((item) => {
            const stockPct = Math.min(100, Math.round((item.stock / (item.safetyStock * 2)) * 100));
            const isCritical = item.status === 'CRITICAL_LOW';
            const isLow = item.status === 'LOW_STOCK';
            const isReordering = item.status === 'REORDER_IN_PROGRESS';

            return (
              <div
                key={item.sku}
                className={`bg-[#111] border p-5 flex flex-col justify-between transition-all ${
                  isCritical
                    ? 'border-[#FF5F56]/60 shadow-[0_0_15px_rgba(255,95,86,0.1)]'
                    : isLow
                    ? 'border-[#FFBD2E]/40'
                    : isReordering
                    ? 'border-[#61AFEF]/40'
                    : 'border-[#222] hover:border-[#444]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h4 className="font-bold text-sm text-white font-mono line-clamp-1">{item.name}</h4>
                      <div className="text-[10px] text-[#666] font-mono mt-0.5">{item.sku}</div>
                    </div>

                    {/* Status Badge */}
                    {isCritical && (
                      <span className="px-2 py-0.5 border border-[#FF5F56]/40 bg-[#FF5F56]/10 text-[#FF5F56] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Critical
                      </span>
                    )}
                    {isLow && (
                      <span className="px-2 py-0.5 border border-[#FFBD2E]/40 bg-[#FFBD2E]/10 text-[#FFBD2E] text-[10px] font-mono font-bold uppercase tracking-wider shrink-0">
                        Low Stock
                      </span>
                    )}
                    {isReordering && (
                      <span className="px-2 py-0.5 border border-[#61AFEF]/40 bg-[#61AFEF]/10 text-[#61AFEF] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                        <Truck className="w-3 h-3" /> In Reorder
                      </span>
                    )}
                    {item.status === 'OPTIMAL' && (
                      <span className="px-2 py-0.5 border border-[#00FF41]/40 bg-[#00FF41]/10 text-[#00FF41] text-[10px] font-mono font-bold uppercase tracking-wider shrink-0">
                        Optimal
                      </span>
                    )}
                  </div>

                  {/* Stock Metrics */}
                  <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-[#050505] border border-[#222] text-center font-mono">
                    <div>
                      <div className="text-[10px] text-[#666] uppercase">Stock</div>
                      <div className={`text-base font-bold ${isCritical ? 'text-[#FF5F56]' : 'text-white'}`}>
                        {item.stock}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#666] uppercase">Buffer</div>
                      <div className="text-base font-semibold text-[#888]">
                        {item.safetyStock}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#666] uppercase">Cost</div>
                      <div className="text-base font-semibold text-[#00FF41]">
                        ${item.unitCost.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Stock Level Progress Bar */}
                  <div className="space-y-1.5 mb-4 font-mono">
                    <div className="flex justify-between text-[10px] text-[#666]">
                      <span className="uppercase tracking-wider">Safety Capacity</span>
                      <span className={isCritical ? 'text-[#FF5F56] font-bold' : 'text-[#888]'}>
                        {item.stock} / {item.safetyStock * 2} target
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#222] overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isCritical
                            ? 'bg-[#FF5F56]'
                            : isLow
                            ? 'bg-[#FFBD2E]'
                            : 'bg-[#00FF41]'
                        }`}
                        style={{ width: `${stockPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Supplier Info */}
                  <div className="text-[10px] font-mono text-[#666] mb-4 flex items-center justify-between">
                    <span>SUPPLIER: <strong className="text-white">{item.supplier}</strong></span>
                    <span className="text-[#888]">{item.leadTimeDays}d lead</span>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#222]">
                  <button
                    onClick={() => handleOpenRestockModal(item)}
                    className="flex-1 py-2 px-3 bg-white text-black hover:bg-gray-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all font-mono shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                  >
                    <Send className="w-3 h-3" />
                    <span>Draft PO</span>
                  </button>

                  <button
                    onClick={() => onUpdateStock(item.sku, item.stock + 10)}
                    title="Quick manual stock receipt (+10)"
                    className="py-2 px-3 bg-[#151517] hover:bg-[#222] text-[#AAA] hover:text-white text-xs font-bold font-mono border border-[#333] transition-all"
                  >
                    +10
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Supplier Purchase Orders Table */}
      <div className="bg-[#0A0A0C] border border-[#222] p-6 shadow-2xl text-[#E0E0E0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[#222]">
          <div>
            <span className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono">
              Outbound Procurement Stream
            </span>
            <h3 className="text-xl font-black italic tracking-tighter text-white">
              DISPATCHED SUPPLIER PURCHASE ORDERS ({purchaseOrders.length})
            </h3>
          </div>
          <span className="text-xs font-mono text-[#888]">
            AUTO-AUDITED BY AGENT: <strong className="text-[#00FF41]">100%</strong>
          </span>
        </div>

        {purchaseOrders.length === 0 ? (
          <div className="text-center py-8 text-[#666] text-xs font-mono">
            No purchase orders created yet. Click &quot;Draft PO&quot; above to initiate a supplier restock.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[#666] border-b border-[#222] text-[10px] tracking-widest uppercase">
                  <th className="pb-3 font-semibold">PO Reference</th>
                  <th className="pb-3 font-semibold">Product & SKU</th>
                  <th className="pb-3 font-semibold">Supplier Details</th>
                  <th className="pb-3 font-semibold text-right">Units</th>
                  <th className="pb-3 font-semibold text-right">Total Cost</th>
                  <th className="pb-3 font-semibold text-right">Order Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1E] text-[#888]">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-[#111] transition-colors">
                    <td className="py-3 font-mono font-bold text-white">
                      {po.id}
                    </td>
                    <td className="py-3 font-medium text-white">
                      <div>{po.productName}</div>
                      <div className="text-[10px] text-[#666] font-mono">{po.sku}</div>
                    </td>
                    <td className="py-3 text-[#AAA]">
                      <div>{po.supplier}</div>
                      <div className="text-[10px] text-[#666]">{po.supplierEmail}</div>
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      {po.quantity}
                    </td>
                    <td className="py-3 text-right font-bold text-[#00FF41]">
                      ${po.totalCost.toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[#333] bg-[#111] text-[#AAA] text-[10px] uppercase font-bold tracking-wider">
                        <Clock className="w-3 h-3 text-[#00FF41]" />
                        {po.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Restock PO Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0A0C] border border-[#333] max-w-lg w-full p-6 shadow-2xl text-[#E0E0E0] font-mono animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#222]">
              <div>
                <span className="text-[10px] tracking-[0.4em] text-[#666] uppercase">
                  Procurement Form
                </span>
                <h3 className="text-xl font-black italic tracking-tighter text-white">
                  GENERATE REPLENISHMENT PO
                </h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="text-[#888] hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 my-5 text-xs">
              <div className="p-3 bg-[#111] border border-[#222]">
                <div className="font-bold text-white text-sm">{activeModalItem.name}</div>
                <div className="text-[#666] text-[10px] mt-0.5">{activeModalItem.sku} &bull; {activeModalItem.category}</div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#222] text-[10px] text-[#888]">
                  <span>STOCK: <strong className="text-[#FF5F56]">{activeModalItem.stock}</strong></span>
                  <span>BUFFER: <strong className="text-white">{activeModalItem.safetyStock}</strong></span>
                  <span>SUPPLIER: <strong className="text-white">{activeModalItem.supplier}</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase text-[#888] mb-1.5">
                  Reorder Units:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={reorderQty}
                    onChange={(e) => setReorderQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 bg-[#111] border border-[#333] px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF41]"
                  />
                  <div className="text-xs font-bold text-[#00FF41] px-3 py-2 bg-[#111] border border-[#333]">
                    Total: ${(reorderQty * activeModalItem.unitCost).toFixed(2)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase text-[#888] mb-1.5">
                  Purchase Order Dispatch Notes:
                </label>
                <textarea
                  rows={3}
                  value={reorderNotes}
                  onChange={(e) => setReorderNotes(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] p-3 text-white text-xs focus:outline-none focus:border-[#00FF41]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222]">
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 border border-[#333] text-xs uppercase font-bold text-[#888] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRestock}
                disabled={isProcessing}
                className="px-5 py-2 bg-white text-black hover:bg-gray-200 text-xs uppercase font-bold tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                {isProcessing ? (
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Transmit PO</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

