import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  RefreshCw,
  Layers,
  Zap,
  Volume2,
  Terminal
} from 'lucide-react';
import { ChatMessage, ToolCallExecution } from '../types';

interface AgentChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onQuickAction: (action: string) => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onQuickAction
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    await onSendMessage(text);
  };

  const toggleToolExpand = (id: string) => {
    setExpandedTools(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const quickPrompts = [
    { label: "Check Today's Sales & Top SKUs", prompt: "What are today's sales numbers, revenue vs target, and top selling products?" },
    { label: "Find Low Stock & Risk Warnings", prompt: "Which products are below their safety stock thresholds and at risk of stockouts?" },
    { label: "Restock Ceramic Mugs (PO)", prompt: "Create a purchase order to restock 50 units of Ceramic Artisan Mugs from ClayCraft Studios." },
    { label: "Run Full Operational Audit", prompt: "Run a full operational health check audit including finances, inventory risks, and scheduled workflows." }
  ];

  return (
    <div className="bg-[#0A0A0C] border border-[#222] shadow-2xl flex flex-col h-[calc(100vh-140px)] min-h-[580px] text-[#E0E0E0] overflow-hidden">
      
      {/* Chat Header */}
      <div className="p-4 sm:p-5 border-b border-[#222] flex items-center justify-between bg-[#050505]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-[#333] bg-[#111] flex items-center justify-center text-white">
            <Bot className="w-5 h-5 text-[#00FF41]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.3em] text-[#666] uppercase font-mono">
                Interactive Co-Pilot
              </span>
              <span className="text-[10px] px-2 py-0.5 border border-[#333] bg-[#111] text-[#888] font-mono">
                GEMINI 2.5 FLASH
              </span>
            </div>
            <h3 className="font-black italic tracking-tighter text-white text-base sm:text-lg font-mono">
              OPERATIONAL PRODUCTIVITY AGENT
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#888]">
          <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-pulse"></span>
          <span className="hidden sm:inline">5 CORE TOOLS ACTIVE</span>
        </div>
      </div>

      {/* Suggested Quick Action Pills */}
      <div className="px-4 py-3 bg-[#0A0A0C] border-b border-[#222] flex items-center gap-2 overflow-x-auto text-xs font-mono">
        <span className="text-[#666] text-[10px] uppercase tracking-widest shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#00FF41]" />
          QUICK ACTIONS:
        </span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(qp.prompt)}
            disabled={isLoading}
            className="px-3 py-1 bg-[#111] hover:bg-white text-[#AAA] hover:text-black border border-[#222] hover:border-white text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 font-mono">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 border flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'border-white bg-white text-black'
                    : 'border-[#333] bg-[#111] text-[#00FF41]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[78%] space-y-2.5`}>
                
                {/* Tool Executions Cards if any */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-2">
                    {msg.toolCalls.map((tc, idx) => {
                      const toolKey = `${msg.id}-tool-${idx}`;
                      const isExpanded = expandedTools[toolKey] ?? false;

                      return (
                        <div
                          key={idx}
                          className="bg-[#050505] border border-[#222] overflow-hidden text-xs"
                        >
                          <button
                            onClick={() => toggleToolExpand(toolKey)}
                            className="w-full px-3.5 py-2 flex items-center justify-between bg-[#111] hover:bg-[#161619] transition-colors text-left font-mono"
                          >
                            <div className="flex items-center gap-2">
                              <span className="p-1 border border-[#333] bg-[#050505] text-[#00FF41]">
                                <Wrench className="w-3 h-3" />
                              </span>
                              <span className="font-bold text-white uppercase">{tc.toolName}</span>
                              <span className="text-[9px] px-1.5 py-0.5 border border-[#00FF41]/40 bg-[#00FF41]/10 text-[#00FF41] font-bold uppercase">
                                EXECUTED
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#888]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#888]" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="p-3 bg-[#050505] font-mono text-[10px] space-y-2 border-t border-[#222]">
                              <div>
                                <span className="text-[#666] block mb-0.5">// Input Parameters</span>
                                <pre className="text-[#888] overflow-x-auto bg-[#111] p-2 border border-[#222]">
                                  {JSON.stringify(tc.args, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <span className="text-[#666] block mb-0.5">// Output Telemetry Result</span>
                                <pre className="text-[#00FF41] overflow-x-auto bg-[#111] p-2 border border-[#222]">
                                  {JSON.stringify(tc.result, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Text Content Bubble */}
                <div
                  className={`p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-white text-black font-semibold'
                      : 'bg-[#111] border border-[#222] text-[#E0E0E0]'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>

                <div className={`text-[10px] text-[#666] px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>

              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 font-mono">
            <div className="w-8 h-8 border border-[#333] bg-[#111] flex items-center justify-center shrink-0 text-[#00FF41]">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#111] border border-[#222] p-3 text-xs text-[#888] flex items-center gap-2">
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-[#00FF41] border-t-transparent rounded-full" />
              <span>Analyzing live store records & executing agent tools...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <div className="p-4 bg-[#050505] border-t border-[#222]">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 font-mono">
          <input
            type="text"
            placeholder="Ask agent: 'Check sales velocity', 'Restock low inventory', or 'Run audit'..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-[#111] border border-[#333] px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#00FF41] transition-all"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 uppercase font-bold text-xs tracking-wider transition-all active:scale-95 disabled:opacity-30 shadow-[0_0_10px_rgba(255,255,255,0.1)] flex items-center gap-2"
          >
            <span>SEND</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};

