import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Layers, 
  CheckCircle2, 
  Server, 
  Cpu, 
  Clock, 
  ShieldCheck,
  ExternalLink,
  Bot
} from 'lucide-react';
import { DeploymentFile } from '../types';

export const DeploymentHub: React.FC = () => {
  const [files, setFiles] = useState<DeploymentFile[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string>('Dockerfile');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [isHealthChecking, setIsHealthChecking] = useState<boolean>(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    fetch('/api/deployment/files')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFiles(data);
          if (data.length > 0) setSelectedFilename(data[0].filename);
        }
      })
      .catch(err => console.error("Failed to load deployment files:", err));
  }, []);

  const activeFile = files.find(f => f.filename === selectedFilename) || files[0];

  const handleCopy = (content: string, filename: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(filename);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runHealthProbe = async () => {
    setIsHealthChecking(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch (e: any) {
      setHealthStatus({ status: 'error', message: e.message });
    } finally {
      setIsHealthChecking(false);
    }
  };

  return (
    <div className="space-y-6 text-[#E0E0E0]">
      
      {/* Top Banner */}
      <div className="bg-[#0A0A0C] border border-[#222] p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[10px] tracking-[0.4em] text-[#666] uppercase font-mono">
              Infrastructure Blueprint & Code Generator
            </span>
            <h2 className="text-2xl font-black italic tracking-tighter text-white mt-1">
              READY-MADE CLOUD RUN DEPLOYMENT ARTIFACTS
            </h2>
            <p className="text-xs text-[#888] font-mono max-w-2xl mt-1 leading-relaxed">
              Autonomous packaging for Google Cloud Run with Google GenAI SDK, automated Cloud Scheduler cron jobs, Dockerfile, and health probes.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 font-mono">
            <button
              onClick={runHealthProbe}
              disabled={isHealthChecking}
              className="flex items-center gap-2 px-4 py-2 border border-[#00FF41]/40 bg-[#00FF41]/10 text-[#00FF41] hover:bg-[#00FF41]/20 text-xs uppercase font-bold tracking-wider transition-all active:scale-95"
            >
              <ShieldCheck className={`w-4 h-4 ${isHealthChecking ? 'animate-spin' : ''}`} />
              <span>Probe /healthz</span>
            </button>
          </div>
        </div>

        {healthStatus && (
          <div className="mt-4 p-3 bg-[#050505] border border-[#222] text-xs font-mono text-[#00FF41] flex items-center justify-between animate-in fade-in">
            <span>HEALTH PROBE RESULT: {JSON.stringify(healthStatus)}</span>
            <span className="text-[#666]">LATENCY: 24ms</span>
          </div>
        )}
      </div>

      {/* Architecture Diagram Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-[#0A0A0C] border border-[#222] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#888] text-xs mb-2 font-mono">
              <span className="text-[10px] tracking-widest text-[#666] uppercase">01 / Runtime</span>
              <Server className="w-4 h-4 text-[#00FF41]" />
            </div>
            <h4 className="font-bold text-sm text-white font-mono uppercase">Cloud Run Container</h4>
            <p className="text-xs text-[#888] mt-2 font-sans leading-relaxed">
              Python 3.11 + FastAPI + Uvicorn server packaging Google GenAI SDK tool functions.
            </p>
          </div>
          <div className="mt-4 text-[10px] font-mono text-white bg-[#111] p-2 border border-[#222]">
            Dockerfile &bull; main.py
          </div>
        </div>

        <div className="bg-[#0A0A0C] border border-[#222] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#888] text-xs mb-2 font-mono">
              <span className="text-[10px] tracking-widest text-[#666] uppercase">02 / Intelligence</span>
              <Bot className="w-4 h-4 text-[#00FF41]" />
            </div>
            <h4 className="font-bold text-sm text-white font-mono uppercase">GenAI Agent Core</h4>
            <p className="text-xs text-[#888] mt-2 font-sans leading-relaxed">
              Gemini 2.5 Flash with native function calling for sales analytics and stock reorders.
            </p>
          </div>
          <div className="mt-4 text-[10px] font-mono text-white bg-[#111] p-2 border border-[#222]">
            google-genai &bull; tools
          </div>
        </div>

        <div className="bg-[#0A0A0C] border border-[#222] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#888] text-xs mb-2 font-mono">
              <span className="text-[10px] tracking-widest text-[#666] uppercase">03 / Scheduler</span>
              <Clock className="w-4 h-4 text-[#00FF41]" />
            </div>
            <h4 className="font-bold text-sm text-white font-mono uppercase">Cloud Crons</h4>
            <p className="text-xs text-[#888] mt-2 font-sans leading-relaxed">
              Scheduled HTTP triggers for 07:00 AM Morning Briefing and 05:00 PM Low-Stock Auto-POs.
            </p>
          </div>
          <div className="mt-4 text-[10px] font-mono text-white bg-[#111] p-2 border border-[#222]">
            /api/webhook &bull; 0 7 * * *
          </div>
        </div>

        <div className="bg-[#0A0A0C] border border-[#222] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#888] text-xs mb-2 font-mono">
              <span className="text-[10px] tracking-widest text-[#666] uppercase">04 / CI-CD</span>
              <Cpu className="w-4 h-4 text-[#00FF41]" />
            </div>
            <h4 className="font-bold text-sm text-white font-mono uppercase">Cloud Build CI/CD</h4>
            <p className="text-xs text-[#888] mt-2 font-sans leading-relaxed">
              Automated image builds and zero-downtime revision rollouts to Artifact Registry.
            </p>
          </div>
          <div className="mt-4 text-[10px] font-mono text-white bg-[#111] p-2 border border-[#222]">
            cloudbuild.yaml &bull; deploy.sh
          </div>
        </div>

      </div>

      {/* Main File Viewer Container */}
      <div className="bg-[#0A0A0C] border border-[#222] shadow-2xl overflow-hidden">
        
        {/* File Tabs Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#050505] border-b border-[#222] overflow-x-auto gap-2 font-mono">
          <div className="flex items-center gap-1.5">
            {files.map((file) => (
              <button
                key={file.filename}
                onClick={() => setSelectedFilename(file.filename)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
                  selectedFilename === file.filename
                    ? 'bg-white text-black border-white shadow-sm'
                    : 'bg-[#111] text-[#888] border-[#222] hover:text-white hover:border-[#444]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{file.filename}</span>
              </button>
            ))}
          </div>

          {activeFile && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(activeFile.content, activeFile.filename)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-[#111] hover:bg-[#222] text-white border border-[#333] transition-all active:scale-95"
              >
                {copiedFile === activeFile.filename ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#00FF41]" />
                    <span className="text-[#00FF41]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownload(activeFile.filename, activeFile.content)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-white text-black hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {/* File Description Subheader */}
        {activeFile && (
          <div className="px-5 py-2.5 bg-[#0A0A0C] border-b border-[#222] text-xs text-[#888] font-mono flex items-center justify-between">
            <span>{activeFile.description}</span>
            <span className="text-[10px] text-[#666]">
              {activeFile.content.split('\n').length} lines &bull; {activeFile.language}
            </span>
          </div>
        )}

        {/* Code Content Box */}
        <div className="p-4 sm:p-6 bg-[#050505] overflow-x-auto max-h-[500px]">
          <pre className="font-mono text-xs text-[#E0E0E0] leading-relaxed">
            <code>{activeFile?.content}</code>
          </pre>
        </div>

      </div>

      {/* Quick Deployment Guide */}
      <div className="bg-[#0A0A0C] border border-[#222] p-6 shadow-2xl font-mono text-xs">
        <div className="pb-4 mb-4 border-b border-[#222]">
          <span className="text-[10px] tracking-[0.4em] text-[#666] uppercase">
            Terminal Instruction
          </span>
          <h3 className="text-xl font-black italic tracking-tighter text-white">
            QUICK DEPLOY COMMANDS FOR GOOGLE CLOUD RUN
          </h3>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="p-3 bg-[#050505] border border-[#222]">
            <span className="text-[#666] block mb-1"># 1. Export Gemini API Key</span>
            <span className="text-[#00FF41]">export GEMINI_API_KEY=&quot;your-api-key-here&quot;</span>
          </div>

          <div className="p-3 bg-[#050505] border border-[#222]">
            <span className="text-[#666] block mb-1"># 2. Deploy directly with Google Cloud Run CLI</span>
            <span className="text-white">
              gcloud run deploy productivity-agent \<br />
              &nbsp;&nbsp;--source . \<br />
              &nbsp;&nbsp;--region us-central1 \<br />
              &nbsp;&nbsp;--allow-unauthenticated \<br />
              &nbsp;&nbsp;--set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

