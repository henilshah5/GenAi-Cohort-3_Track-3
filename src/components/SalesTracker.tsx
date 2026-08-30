import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  CreditCard, 
  Plus, 
  Sparkles, 
  ArrowUpRight, 
  Activity,
  CheckCircle2,
  Terminal
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SalesSummary, InventoryItem } from '../types';

interface SalesTrackerProps {
  sales: SalesSummary;
  inventory: InventoryItem[];
  onSimulateSale: (sku: string, qty: number) => Promise<void>;
  isSimulating: boolean;
}

export const SalesTracker: React.FC<SalesTrackerProps> = ({
  sales,
  inventory,
  onSimulateSale,
  isSimulating
}) => {
  const [selectedSku, setSelectedSku] = useState<string>(inventory[0]?.sku || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [lastSaleMessage, setLastSaleMessage] = useState<string | null>(null);

  const handleSimulate = async () => {
    if (!selectedSku) return;
    await onSimulateSale(selectedSku, quantity);
    const item = inventory.find(i => i.sku === selectedSku);
    
    // Trigger celebratory micro-confetti
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#00FF41', '#FFFFFF', '#333333']
    });

    setLastSaleMessage(`+ $${((item?.retailPrice || 24) * quantity).toFixed(2)} recorded on POS stream`);
    setTimeout(() => setLastSaleMessage(null), 4000);
  };

  const chartData = sales.hourlyVelocity.map(h => ({
    hour: h.hour,
    sales: h.sales,
    orders: h.orders
  }));

  return (
    <div className="space-y-6">
      
      {/* Top Section: Velocity Chart & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Velocity Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#0A0A0C] border border-[#222] p-6 shadow-2xl text-[#E0E0E0] flex flex-col justify-between relative overflow-hidden">
          <div className="text-[120px] font-black leading-[0.8] tracking-tighter text-white opacity-[0.02] absolute -top-4 -right-4 pointer-events-none select-none font-mono">
            VELOCITY
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-2 border-b border-[#222] relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono">
                  Telemetry / Hourly Stream
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]"></span>
              </div>
              <h3 className="text-xl font-black italic tracking-tighter text-white mt-0.5">
                INTRADAY REVENUE VELOCITY
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#00FF41] font-semibold">
                <span className="w-2 h-2 bg-[#00FF41] inline-block shadow-[0_0_8px_#00FF41]"></span>
                $ GROSS / HR
              </span>
              <span className="text-[#888]">
                PEAK: <strong className="text-white">12:00 PM ($1,420)</strong>
              </span>
            </div>
          </div>

          {/* Recharts Area Container */}
          <div className="h-64 w-full mt-2 relative z-10 font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="artisticVelocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF41" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00FF41" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#222222" vertical={false} />
                <XAxis dataKey="hour" stroke="#666666" fontSize={11} tickLine={false} />
                <YAxis stroke="#666666" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#151517] border border-[#333] p-3 shadow-2xl text-xs font-mono text-[#E0E0E0]">
                          <div className="text-[10px] tracking-widest text-[#888] uppercase mb-1">{label} WINDOW</div>
                          <div className="text-[#00FF41] font-bold text-base">
                            ${payload[0]?.value?.toLocaleString()} Sales
                          </div>
                          <div className="text-[#888] mt-0.5">
                            {payload[0]?.payload?.orders} completed tickets
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#00FF41"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#artisticVelocityGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live POS / Checkout Simulator (1 col) */}
        <div className="bg-[#0A0A0C] border border-[#222] p-6 shadow-2xl text-[#E0E0E0] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#222]">
              <div>
                <span className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono">
                  Input Stream / POST
                </span>
                <h3 className="text-lg font-black italic tracking-tighter text-white">
                  SIMULATE POS CHECKOUT
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[#333] text-[#00FF41] bg-[#111]">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-[#888] mt-3 font-mono leading-relaxed">
              Inject live mock checkout events. Deducts inventory safety thresholds and logs transaction volume.
            </p>

            <div className="space-y-4 mt-5 font-mono">
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-[#888] mb-1.5">
                  Select SKU to Purchase:
                </label>
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00FF41] transition-all font-mono"
                >
                  {inventory.map((item) => (
                    <option key={item.sku} value={item.sku} className="bg-[#111] text-white">
                      {item.sku} - {item.name} (${item.retailPrice.toFixed(2)}) [Stock: {item.stock}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase text-[#888] mb-1.5">
                  Batch Multiplier:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuantity(num)}
                      className={`flex-1 py-1.5 text-xs font-mono font-bold border transition-all ${
                        quantity === num
                          ? 'bg-white text-black border-white shadow-sm'
                          : 'bg-[#111] border-[#222] text-[#888] hover:text-white hover:border-[#444]'
                      }`}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#222]">
            {lastSaleMessage && (
              <div className="mb-3 p-2.5 bg-[#111] border border-[#00FF41]/40 text-[#00FF41] text-xs font-mono flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{lastSaleMessage}</span>
              </div>
            )}

            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 bg-white text-black hover:bg-gray-200 text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 font-mono shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              {isSimulating ? (
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Commit POS Transaction</span>
            </button>
          </div>
        </div>

      </div>

      {/* Top-Selling Products Table */}
      <div className="bg-[#0A0A0C] border border-[#222] p-6 shadow-2xl text-[#E0E0E0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-[#222]">
          <div>
            <span className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono">
              SKU Ranking / Gross Output
            </span>
            <h3 className="text-xl font-black italic tracking-tighter text-white">
              TOP REVENUE GENERATING SKUS
            </h3>
          </div>
          <span className="text-xs font-mono text-[#888]">
            TRACKED_ITEMS: <strong className="text-white">{sales.topSellingProducts.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[#666] border-b border-[#222] text-[10px] tracking-widest uppercase">
                <th className="pb-3 font-semibold">SKU & Product Name</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold text-right">Units Sold</th>
                <th className="pb-3 font-semibold text-right">Gross Revenue</th>
                <th className="pb-3 font-semibold text-right">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1E] text-[#888]">
              {sales.topSellingProducts.map((prod, idx) => {
                const contributionPct = ((prod.revenue / sales.grossRevenue) * 100).toFixed(1);
                return (
                  <tr key={prod.sku} className="hover:bg-[#111] transition-colors">
                    <td className="py-3 font-medium text-white flex items-center gap-3">
                      <span className="w-5 h-5 bg-[#111] border border-[#333] text-[#888] text-[10px] flex items-center justify-center font-bold font-mono">
                        0{idx + 1}
                      </span>
                      <div>
                        <div className="text-white font-bold">{prod.name}</div>
                        <div className="text-[10px] text-[#666] font-mono">{prod.sku}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 border border-[#333] bg-[#111] text-[#AAA] text-[10px] uppercase tracking-wider">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      {prod.unitsSold}
                    </td>
                    <td className="py-3 text-right font-bold text-[#00FF41]">
                      ${prod.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right text-white">
                      <div className="inline-flex items-center gap-1 font-bold">
                        <span>{contributionPct}%</span>
                        <ArrowUpRight className="w-3 h-3 text-[#00FF41]" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

