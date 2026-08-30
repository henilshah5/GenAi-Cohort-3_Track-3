import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DailyBriefingCard } from './components/DailyBriefingCard';
import { SalesTracker } from './components/SalesTracker';
import { InventoryManager } from './components/InventoryManager';
import { AutomationCenter } from './components/AutomationCenter';
import { AgentChat } from './components/AgentChat';
import { DeploymentHub } from './components/DeploymentHub';
import { 
  SalesSummary, 
  InventoryItem, 
  PurchaseOrder, 
  ScheduledWorkflow, 
  ChatMessage 
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'hub' | 'chat' | 'inventory' | 'automations' | 'deploy'>('hub');
  
  // App State
  const [sales, setSales] = useState<SalesSummary>({
    grossRevenue: 4892.50,
    netProfit: 1845.20,
    ordersCount: 142,
    averageOrderValue: 34.45,
    targetDailyRevenue: 4500.00,
    growthVsYesterdayPct: 14.2,
    topSellingProducts: [],
    hourlyVelocity: []
  });
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [workflows, setWorkflows] = useState<ScheduledWorkflow[]>([]);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      text: "👋 Hello! I am your Cloud Run Daily Operations Productivity Agent. I continuously monitor sales velocity, track catalog inventory safety stock, draft supplier purchase orders, and execute scheduled automated operational workflows. How can I assist you with today's operations?",
      timestamp: 'Today, 07:00 AM'
    }
  ]);

  // Loading States
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(true);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [isQuickLoading, setIsQuickLoading] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);

  // Load initial operational dashboard data
  const loadDashboardData = async () => {
    try {
      const res = await fetch('/api/operations/dashboard');
      if (res.ok) {
        const data = await res.json();
        setSales(data.sales);
        setInventory(data.inventory);
        setPurchaseOrders(data.purchaseOrders);
        setWorkflows(data.workflows);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Send message in Agent Chat
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.text || "Operations evaluated.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: data.toolCalls || []
      };

      setMessages(prev => [...prev, agentMsg]);
      // Refresh dashboard data to sync any tool side-effects
      loadDashboardData();
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'agent',
        text: `Encountered an issue executing agent operation: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Quick Action execution
  const handleQuickAction = async (actionType: string) => {
    setIsQuickLoading(true);
    try {
      const res = await fetch('/api/agent/quick-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType })
      });

      const data = await res.json();
      
      const newMsg: ChatMessage = {
        id: `action-${Date.now()}`,
        sender: 'agent',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: data.toolCalls || [],
        isAction: true,
        actionType
      };

      setMessages(prev => [...prev, newMsg]);
      setActiveTab('chat');
      loadDashboardData();
    } catch (err) {
      console.error("Quick action failed:", err);
    } finally {
      setIsQuickLoading(false);
    }
  };

  // Simulate POS checkout sale
  const handleSimulateSale = async (sku: string, qty: number) => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/operations/sales/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, quantity: qty })
      });
      if (res.ok) {
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Manual stock update
  const handleUpdateStock = async (sku: string, newStock: number) => {
    try {
      const res = await fetch('/api/operations/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, newStock })
      });
      if (res.ok) {
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Stock update failed:", err);
    }
  };

  // Restock item by creating Purchase Order
  const handleRestockItem = async (sku: string, quantity: number, notes?: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/operations/inventory/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, quantity, notes })
      });
      if (res.ok) {
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Restock failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger automation workflow
  const handleTriggerWorkflow = async (workflowId: string) => {
    try {
      const res = await fetch('/api/operations/automations/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId })
      });
      if (res.ok) {
        await loadDashboardData();
      }
    } catch (err) {
      console.error("Trigger workflow failed:", err);
    }
  };

  // Generate TTS Audio
  const handleGenerateAudio = async () => {
    try {
      const summaryText = `Today's gross sales are $${sales.grossRevenue.toFixed(2)}, which is ${((sales.grossRevenue / sales.targetDailyRevenue) * 100).toFixed(1)}% of your daily target. You have ${inventory.filter(i => i.status === 'CRITICAL_LOW').length} items critically low on inventory requiring restocking. All scheduled Cloud Run automations are healthy.`;
      const res = await fetch('/api/agent/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summaryText })
      });
      const data = await res.json();
      if (data.audioBase64) {
        setAudioBase64(data.audioBase64);
      }
    } catch (err) {
      console.warn("TTS generation failed:", err);
    }
  };

  const criticalStockCount = inventory.filter(i => i.status === 'CRITICAL_LOW').length;

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] flex flex-col font-sans selection:bg-white selection:text-black">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickAction={handleQuickAction}
        isQuickLoading={isQuickLoading}
        criticalStockCount={criticalStockCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* VIEW 1: Operations Hub (Default) */}
        {activeTab === 'hub' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Daily Executive Briefing */}
            <DailyBriefingCard
              sales={sales}
              inventory={inventory}
              workflows={workflows}
              onTriggerAction={handleQuickAction}
              isLoading={isQuickLoading}
              audioBase64={audioBase64}
              onGenerateAudio={handleGenerateAudio}
            />

            {/* Sales Velocity & POS Simulator */}
            <SalesTracker
              sales={sales}
              inventory={inventory}
              onSimulateSale={handleSimulateSale}
              isSimulating={isSimulating}
            />
          </div>
        )}

        {/* VIEW 2: Interactive AI Agent Chat */}
        {activeTab === 'chat' && (
          <div className="animate-in fade-in duration-300">
            <AgentChat
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
              onQuickAction={handleQuickAction}
            />
          </div>
        )}

        {/* VIEW 3: Inventory & Supply Chain */}
        {activeTab === 'inventory' && (
          <div className="animate-in fade-in duration-300">
            <InventoryManager
              inventory={inventory}
              purchaseOrders={purchaseOrders}
              onRestockItem={handleRestockItem}
              onUpdateStock={handleUpdateStock}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {/* VIEW 4: Scheduled Cloud Run Crons & Automations */}
        {activeTab === 'automations' && (
          <div className="animate-in fade-in duration-300">
            <AutomationCenter
              workflows={workflows}
              onTriggerWorkflow={handleTriggerWorkflow}
              isTriggering={isProcessing}
            />
          </div>
        )}

        {/* VIEW 5: Ready-Made Cloud Run Deployment Studio */}
        {activeTab === 'deploy' && (
          <div className="animate-in fade-in duration-300">
            <DeploymentHub />
          </div>
        )}

      </main>

      {/* Modern Compact Footer */}
      <footer className="border-t border-[#222] bg-[#0A0A0C] text-[#666] text-xs py-4 px-4 sm:px-6 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase tracking-wider">APEX OPERATIONS PRODUCTIVITY AGENT</span>
            <span>&bull;</span>
            <span className="text-[#888]">DEPLOYED ON GOOGLE CLOUD RUN</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] tracking-wider text-[#888]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41]"></span>
              GOOGLE GENAI SDK (GEMINI 2.5 FLASH)
            </span>
            <span>CLOUD SCHEDULER ENGINE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
