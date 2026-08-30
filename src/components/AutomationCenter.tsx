import React, { useState } from 'react';
import { 
  Zap, 
  Clock, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Terminal, 
  Send, 
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ScheduledWorkflow } from '../types';

interface AutomationCenterProps {
  workflows: ScheduledWorkflow[];
  onTriggerWorkflow: (workflowId: string) => Promise<void>;
  isTriggering: boolean;
}

export const AutomationCenter: React.FC<AutomationCenterProps> = ({
  workflows,
  onTriggerWorkflow,
  isTriggering
}) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || '');
  const [customWebhookPayload, setCustomWebhookPayload] = useState<string>(
    JSON.stringify({ trigger_type: "CRON_MORNING_BRIEF", timestamp: new Date().toISOString() }, null, 2)
  );
  const [webhookResult, setWebhookResult] = useState<string | null>(null);
  const [isSendingWebhook, setIsSendingWebhook] = useState<boolean>(false);

  const handleSendWebhook = async () => {
    setIsSendingWebhook(true);
    setWebhookResult(null);
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(customWebhookPayload);
      } catch {
        parsed = { trigger_type: "CUSTOM_WEBHOOK" };
      }

      // Simulate webhook call to backend
      const res = await fetch('/api/operations/automations/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: selectedWorkflowId })
      });
      const data = await res.json();
      setWebhookResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setWebhookResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsSendingWebhook(false);
    }
  };

  return (
    <div className="space-y-6 text-[#E0E0E0]">
      
      {/* Top Header */}
      <div className="bg-[#0A0A0C] border border-[#222] p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#222]">
          <div>
            <span className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono">
              Autonomous Operations Daemon
            </span>
            <h2 className="text-2xl font-black italic tracking-tighter text-white">
              CLOUD RUN SCHEDULED CRON WORKFLOWS
            </h2>
            <p className="text-xs text-[#888] font-mono mt-1">
              Automate morning briefings, inventory safety scans, midday velocity checks, and EOD financial reconciliation with Cloud Scheduler.
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="flex items-center gap-1.5 px-3 py-1 border border-[#00FF41]/40 bg-[#00FF41]/10 text-[#00FF41] text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></span>
              ALL 4 CRONS HEALTHY
            </span>
          </div>
        </div>

        {/* Workflow Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="bg-[#111] border border-[#222] hover:border-[#444] p-5 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 border border-[#333] bg-[#050505] text-[#00FF41] flex items-center justify-center font-mono text-xs font-bold">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white font-mono">{wf.name}</h4>
                      <div className="text-[10px] text-[#666] font-mono mt-0.5">{wf.cron} &bull; {wf.frequency}</div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 border border-[#00FF41]/40 bg-[#00FF41]/10 text-[#00FF41] text-[10px] font-mono font-bold uppercase tracking-wider">
                    {wf.status}
                  </span>
                </div>

                <p className="text-xs text-[#AAA] my-3 leading-relaxed font-sans">
                  {wf.description}
                </p>

                {/* Timing info */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#666] py-2 border-t border-[#222] my-2">
                  <span>LAST RUN: <strong className="text-white">{wf.lastRun}</strong></span>
                  <span>NEXT RUN: <strong className="text-[#00FF41]">{wf.nextRun}</strong></span>
                </div>

                {/* Latest Execution Log preview */}
                {wf.executionLogs.length > 0 && (
                  <div className="p-3 bg-[#050505] border border-[#222] text-xs my-3 font-mono">
                    <div className="flex items-center justify-between text-[10px] text-[#00FF41] font-bold uppercase tracking-wider mb-1">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> RESULT: {wf.executionLogs[0].status}
                      </span>
                      <span className="text-[#666]">{wf.executionLogs[0].executionTimeMs}ms</span>
                    </div>
                    <p className="text-[#888] text-[11px] leading-relaxed">{wf.executionLogs[0].summary}</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-[#222] flex items-center justify-end">
                <button
                  onClick={() => onTriggerWorkflow(wf.id)}
                  disabled={isTriggering}
                  className="px-4 py-2 bg-white text-black hover:bg-gray-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all font-mono active:scale-95 disabled:opacity-50 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Trigger Now</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Cloud Scheduler / Webhook Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Webhook Payload Dispatcher */}
        <div className="bg-[#0A0A0C] border border-[#222] p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-[#222]">
              <span className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono">
                API Test Environment
              </span>
              <h3 className="text-xl font-black italic tracking-tighter text-white">
                GOOGLE CLOUD SCHEDULER WEBHOOK TESTER
              </h3>
            </div>
            <p className="text-xs text-[#888] font-mono mt-2 mb-4 leading-relaxed">
              Simulate incoming HTTP POST trigger payloads sent by Google Cloud Scheduler or Pub/Sub to the Cloud Run agent service.
            </p>

            <div className="space-y-4 font-mono">
              <div>
                <label className="block text-[10px] tracking-widest uppercase text-[#888] mb-1.5">
                  Target Automation Cron Route:
                </label>
                <select
                  value={selectedWorkflowId}
                  onChange={(e) => setSelectedWorkflowId(e.target.value)}
                  className="w-full bg-[#111] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00FF41]"
                >
                  {workflows.map((w) => (
                    <option key={w.id} value={w.id} className="bg-[#111] text-white">
                      {w.name} ({w.cron})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] tracking-widest uppercase text-[#888] mb-1.5">
                  Simulated JSON Payload (HTTP POST /api/webhook):
                </label>
                <textarea
                  rows={4}
                  value={customWebhookPayload}
                  onChange={(e) => setCustomWebhookPayload(e.target.value)}
                  className="w-full font-mono bg-[#050505] border border-[#333] p-3 text-[#00FF41] text-xs focus:outline-none focus:border-[#00FF41]"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#222]">
            <button
              onClick={handleSendWebhook}
              disabled={isSendingWebhook}
              className="w-full py-2.5 px-4 bg-white text-black hover:bg-gray-200 text-xs font-bold uppercase tracking-widest transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 font-mono shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            >
              {isSendingWebhook ? (
                <span className="animate-spin inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Dispatch Webhook to Cloud Run</span>
            </button>
          </div>
        </div>

        {/* Live Execution Output Terminal */}
        <div className="bg-[#0A0A0C] border border-[#222] p-6 shadow-2xl font-mono text-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#222] text-[#888]">
              <span className="flex items-center gap-2 text-white font-bold uppercase tracking-wider">
                <span className="w-2 h-2 bg-[#00FF41] inline-block animate-pulse"></span>
                CLOUD RUN AGENT EXECUTION OUTPUT
              </span>
              <span className="text-[10px] text-[#00FF41] border border-[#00FF41]/40 px-2 py-0.5">200 OK</span>
            </div>

            <div className="mt-4 text-[#AAA] space-y-2">
              <div className="text-[10px] text-[#666]">// Cloud Run HTTP Response & Tool Execution Log</div>
              {webhookResult ? (
                <pre className="text-[#00FF41] bg-[#050505] p-3 border border-[#222] overflow-x-auto text-[11px] leading-relaxed">
                  {webhookResult}
                </pre>
              ) : (
                <div className="p-6 bg-[#050505] border border-[#222] text-[#666] text-center text-xs">
                  Trigger an automation or click &quot;Dispatch Webhook&quot; to inspect real-time tool execution response.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#222] text-[10px] text-[#666] flex items-center justify-between">
            <span>IMAGE: gcr.io/productivity-agent:latest</span>
            <span>REGION: us-central1</span>
          </div>
        </div>

      </div>

    </div>
  );
};

