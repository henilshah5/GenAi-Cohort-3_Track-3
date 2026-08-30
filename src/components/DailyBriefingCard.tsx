import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRight, 
  DollarSign, 
  ShoppingBag, 
  PackageCheck,
  Zap,
  RefreshCw
} from 'lucide-react';
import { SalesSummary, InventoryItem, ScheduledWorkflow } from '../types';

interface DailyBriefingCardProps {
  sales: SalesSummary;
  inventory: InventoryItem[];
  workflows: ScheduledWorkflow[];
  onTriggerAction: (action: string) => void;
  isLoading: boolean;
  audioBase64?: string | null;
  onGenerateAudio: () => void;
}

export const DailyBriefingCard: React.FC<DailyBriefingCardProps> = ({
  sales,
  inventory,
  workflows,
  onTriggerAction,
  isLoading,
  audioBase64,
  onGenerateAudio
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const criticalItems = inventory.filter(i => i.status === 'CRITICAL_LOW');
  const targetPct = ((sales.grossRevenue / sales.targetDailyRevenue) * 100).toFixed(1);
  const activeWorkflowsCount = workflows.filter(w => w.status === 'ACTIVE').length;

  const handleToggleAudio = () => {
    if (isPlayingAudio && audioElement) {
      audioElement.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (audioBase64) {
      const audioBlob = new Blob([Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlayingAudio(false);
      audio.play().then(() => {
        setAudioElement(audio);
        setIsPlayingAudio(true);
      }).catch(err => {
        console.warn("Audio playback issue:", err);
      });
    } else {
      onGenerateAudio();
    }
  };

  return (
    <div className="bg-[#0A0A0C] border border-[#222] p-6 md:p-8 relative overflow-hidden text-[#E0E0E0] shadow-2xl">
      {/* Giant artistic watermark text */}
      <div className="text-[100px] sm:text-[140px] font-black leading-[0.8] tracking-tighter text-white opacity-[0.03] absolute -top-4 -left-4 pointer-events-none select-none">
        OPERATIONS
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#222] relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono">
              Live Feed / Telemetry Stream
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#00FF41]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] shadow-[0_0_8px_#00FF41]"></span>
              SYNCED
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white">
            DAILY EXECUTIVE BRIEFING
          </h2>
          <p className="text-xs text-[#888] mt-1 font-mono">
            Autonomous agent synthesis of revenue targets, inventory safety stock, and Cloud Run cron workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
              isPlayingAudio
                ? 'bg-[#00FF41] text-black border-[#00FF41] animate-pulse'
                : 'bg-[#111] text-[#E0E0E0] border-[#333] hover:border-[#555]'
            }`}
            title="Read out morning briefing with Gemini Audio TTS"
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#00FF41]" />}
            <span>{isPlayingAudio ? 'Pause Voice' : 'Audio Briefing'}</span>
          </button>

          <button
            onClick={() => onTriggerAction('MORNING_BRIEFING')}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-white text-black border border-white hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Audit</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6 relative z-10">
        
        {/* Gross Revenue */}
        <div className="bg-[#111] border border-[#222] p-5 flex flex-col justify-between">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono mb-2">
              Gross Revenue
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                ${sales.grossRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 font-mono text-xs text-[#00FF41]">
              <span>+{sales.growthVsYesterdayPct}%</span>
              <span className="text-[#555]">|</span>
              <span className="text-[#888]">{targetPct}% of target</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1 bg-[#222] mt-4 overflow-hidden">
            <div className="h-full bg-[#00FF41]" style={{ width: `${Math.min(100, Number(targetPct))}%` }}></div>
          </div>
        </div>

        {/* Orders Count & AOV */}
        <div className="bg-[#111] border border-[#222] p-5 flex flex-col justify-between">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono mb-2">
              Orders / AOV
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {sales.ordersCount}
              </span>
              <span className="text-xs font-mono text-[#666]">UNITS</span>
            </div>
            <div className="mt-2 font-mono text-xs text-[#888]">
              Avg Ticket: <span className="text-white font-bold">${sales.averageOrderValue.toFixed(2)}</span>
            </div>
          </div>
          <div className="w-full h-1 bg-[#222] mt-4 overflow-hidden">
            <div className="h-full bg-white" style={{ width: '74%' }}></div>
          </div>
        </div>

        {/* Inventory Stock Risk */}
        <div className="bg-[#111] border border-[#222] p-5 flex flex-col justify-between">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono mb-2">
              Inventory Health
            </p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl sm:text-4xl font-bold tracking-tight ${criticalItems.length > 0 ? 'text-[#FF5F56]' : 'text-white'}`}>
                {criticalItems.length > 0 ? `${criticalItems.length} LOW` : '100%'}
              </span>
            </div>
            <div className="mt-2 font-mono text-xs">
              {criticalItems.length > 0 ? (
                <span className="text-[#FF5F56]">{criticalItems.length} SKUs below safety floor</span>
              ) : (
                <span className="text-[#00FF41]">Safety buffers nominal</span>
              )}
            </div>
          </div>
          <div className="w-full h-1 bg-[#222] mt-4 overflow-hidden">
            <div className={`h-full ${criticalItems.length > 0 ? 'bg-[#FF5F56]' : 'bg-[#00FF41]'}`} style={{ width: criticalItems.length > 0 ? '38%' : '92%' }}></div>
          </div>
        </div>

        {/* Automation Cron Status */}
        <div className="bg-[#111] border border-[#222] p-5 flex flex-col justify-between">
          <div>
            <p className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono mb-2">
              Cloud Run Crons
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                {activeWorkflowsCount}/{workflows.length}
              </span>
              <span className="text-xs font-mono text-[#00FF41]">ACTIVE</span>
            </div>
            <div className="mt-2 font-mono text-xs text-[#888] truncate">
              Next: 05:00 PM Auto-PO
            </div>
          </div>
          <div className="w-full h-1 bg-[#222] mt-4 overflow-hidden">
            <div className="h-full bg-[#00FF41]" style={{ width: '100%' }}></div>
          </div>
        </div>

      </div>

      {/* Recommended Priority Actions */}
      <div className="bg-[#050505] border border-[#222] p-5 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono">
            Autonomous Agent Directives / 1-Click Execution
          </p>
          <span className="text-[10px] font-mono text-[#00FF41]">SYSTEM_READY</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Action 1 */}
          <button
            onClick={() => onTriggerAction('RESTOCK_ALL_CRITICAL')}
            className="p-4 bg-[#111] hover:bg-[#151517] border border-[#222] hover:border-[#444] text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-[#00FF41] transition-colors uppercase font-mono">
                <span>01. Draft Critical Restock POs</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#555] group-hover:text-[#00FF41] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-[#888] mt-2 leading-relaxed">
                Issue supplier restock orders for Ceramic Artisan Mugs (14) & Espresso Beans (8).
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-[#555] group-hover:text-[#888]">
              TRIGGER: RESTOCK_AGENT
            </div>
          </button>

          {/* Action 2 */}
          <button
            onClick={() => onTriggerAction('SALES_VELOCITY_CHECK')}
            className="p-4 bg-[#111] hover:bg-[#151517] border border-[#222] hover:border-[#444] text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-[#00FF41] transition-colors uppercase font-mono">
                <span>02. Midday Sales Rush Velocity</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#555] group-hover:text-[#00FF41] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-[#888] mt-2 leading-relaxed">
                Peak velocity achieved $1,420 between 12:00 - 2:00 PM with 44 completed POS tickets.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-[#555] group-hover:text-[#888]">
              TRIGGER: VELOCITY_SCAN
            </div>
          </button>

          {/* Action 3 */}
          <button
            onClick={() => onTriggerAction('EOD_RECONCILIATION')}
            className="p-4 bg-[#111] hover:bg-[#151517] border border-[#222] hover:border-[#444] text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-[#00FF41] transition-colors uppercase font-mono">
                <span>03. Pre-Reconcile Payment Gateways</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#555] group-hover:text-[#00FF41] group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-xs text-[#888] mt-2 leading-relaxed">
                Verify Stripe online payouts vs POS physical card drawer totals with zero variance.
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-[#555] group-hover:text-[#888]">
              TRIGGER: EOD_FINANCE
            </div>
          </button>

        </div>
      </div>

    </div>
  );
};

