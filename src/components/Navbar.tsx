import React from 'react';
import { 
  Bot, 
  Activity, 
  Layers, 
  Package, 
  Zap, 
  Cloud, 
  Sparkles,
  Terminal
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'hub' | 'chat' | 'inventory' | 'automations' | 'deploy';
  setActiveTab: (tab: 'hub' | 'chat' | 'inventory' | 'automations' | 'deploy') => void;
  onQuickAction: (action: string) => void;
  isQuickLoading: boolean;
  criticalStockCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onQuickAction,
  isQuickLoading,
  criticalStockCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0C]/95 backdrop-blur-md border-b border-[#222] text-[#E0E0E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Brand & Instance Status Bar */}
        <div className="flex items-center justify-between py-4 border-b border-[#1A1A1E] gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono">
                System.Status / v1.0.4
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></span>
            </div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white">
                OPS_AGENT.AI
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 border border-[#333] text-[#888] rounded">
                CLOUD RUN EDITION
              </span>
            </div>
          </div>

          {/* Instance Status & Quick Trigger */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono">
                Cloud Run Instance
              </span>
              <span className="text-xs sm:text-sm font-mono text-[#00FF41]">
                prod-agent-u7x-001
              </span>
            </div>

            <div className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center bg-[#050505]">
              <div className="w-2.5 h-2.5 bg-[#00FF41] rounded-full shadow-[0_0_10px_#00FF41]"></div>
            </div>

            {/* AI Executive Briefing Trigger Button */}
            <button
              onClick={() => onQuickAction('MORNING_BRIEFING')}
              disabled={isQuickLoading}
              className="bg-white text-black px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              {isQuickLoading ? (
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Executive Briefing</span>
              <span className="sm:hidden">Briefing</span>
            </button>
          </div>

        </div>

        {/* Navigation Bar Row */}
        <div className="flex items-center justify-between py-2.5 overflow-x-auto gap-2">
          
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('hub')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-medium uppercase tracking-wider transition-all border ${
                activeTab === 'hub'
                  ? 'bg-white text-black border-white font-bold shadow-sm'
                  : 'bg-[#111] text-[#888] border-[#222] hover:text-white hover:border-[#444]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Operations Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-medium uppercase tracking-wider transition-all border ${
                activeTab === 'chat'
                  ? 'bg-white text-black border-white font-bold shadow-sm'
                  : 'bg-[#111] text-[#888] border-[#222] hover:text-white hover:border-[#444]'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Agent Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-medium uppercase tracking-wider transition-all border relative ${
                activeTab === 'inventory'
                  ? 'bg-white text-black border-white font-bold shadow-sm'
                  : 'bg-[#111] text-[#888] border-[#222] hover:text-white hover:border-[#444]'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Inventory & POs</span>
              {criticalStockCount > 0 && (
                <span className="px-1.5 py-0.2 bg-[#FF5F56] text-white text-[10px] font-bold rounded-none">
                  {criticalStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('automations')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-medium uppercase tracking-wider transition-all border ${
                activeTab === 'automations'
                  ? 'bg-white text-black border-white font-bold shadow-sm'
                  : 'bg-[#111] text-[#888] border-[#222] hover:text-white hover:border-[#444]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Scheduled Crons</span>
            </button>

            <button
              onClick={() => setActiveTab('deploy')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono font-medium uppercase tracking-wider transition-all border ${
                activeTab === 'deploy'
                  ? 'bg-white text-black border-white font-bold shadow-sm'
                  : 'bg-[#111] text-[#888] border-[#222] hover:text-white hover:border-[#444]'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Deploy Source</span>
            </button>
          </nav>

          {/* Micro status ticker */}
          <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono text-[#555]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]"></span>
              RUN: 3000/TCP
            </span>
            <span>|</span>
            <span>MODEL: GEMINI-3.7-FLASH</span>
          </div>

        </div>

      </div>
    </header>
  );
};

