"use client";

import { useState } from "react";
import { LockKeyhole, Plus, MoreVertical, Copy } from "lucide-react";
import { Card } from "../shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DeveloperTab() {
  const [apiTokens, setApiTokens] = useState([
    { id: "t1", name: "Acme ETL Integration", prefix: "gen_8x...", scopes: "read, write, agents", created: "Jan 15, 2024", lastUsed: "2h ago", expires: "Never", status: "Active" },
    { id: "t2", name: "Data Exporter", prefix: "gen_3v...", scopes: "read", created: "Feb 02, 2024", lastUsed: "1d ago", expires: "Dec 31, 2025", status: "Active" },
    { id: "t3", name: "Internal Dashboard", prefix: "gen_9q...", scopes: "read, agents", created: "Mar 10, 2024", lastUsed: "3d ago", expires: "Never", status: "Active" },
    { id: "t4", name: "Legacy Connector", prefix: "gen_1a...", scopes: "read", created: "Dec 01, 2023", lastUsed: "30d ago", expires: "Jun 01, 2024", status: "Expired" },
  ]);

  const handleCreateToken = () => {
    const suffix = Math.random().toString(36).slice(2, 6);
    setApiTokens((tokens) => [
      {
        id: `local-${Date.now()}`,
        name: "Workspace API Token",
        prefix: `gen_${suffix}...`,
        scopes: "read",
        created: "Just now",
        lastUsed: "Never",
        expires: "90 days",
        status: "Active",
      },
      ...tokens,
    ]);
    toast.success("Local token placeholder created. Production token issuance stays server-side.");
  };

  const handleCopyPrefix = async (token) => {
    try {
      await navigator.clipboard.writeText(token.prefix);
      toast.success("Token prefix copied");
    } catch {
      toast.info(token.prefix);
    }
  };

  const handleToggleTokenStatus = (token) => {
    setApiTokens((tokens) => tokens.map((item) => (
      item.id === token.id
        ? { ...item, status: item.status === "Active" ? "Revoked" : "Active" }
        : item
    )));
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl animate-fade-in">
      
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-semibold text-white tracking-tight">Developer & API</h2>
      </div>

      <Card 
        title="Personal Access Tokens" 
        icon={LockKeyhole} 
        description="Tokens allow third-party scripts and applications to authenticate with the GENIUS API on your behalf."
        action={<Button onClick={handleCreateToken} className="bg-[#4EA1FF] hover:bg-[#4EA1FF]/90 text-white font-semibold active:scale-[0.98] transition-transform shadow-[0_0_20px_-5px_rgba(78,161,255,0.4)] h-9"><Plus className="size-4 mr-1.5" /> Create token</Button>}
      >
        <div className="flex flex-col w-full -mx-2 overflow-x-auto">
          <table className="w-full text-[13px] text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#28313C]/50 text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
                <th className="font-medium px-2 py-3 w-[200px]">Token Name</th>
                <th className="font-medium px-2 py-3 w-[120px]">Prefix</th>
                <th className="font-medium px-2 py-3">Scopes</th>
                <th className="font-medium px-2 py-3 w-[100px]">Created</th>
                <th className="font-medium px-2 py-3 w-[100px]">Last Used</th>
                <th className="font-medium px-2 py-3 w-[100px]">Expiration</th>
                <th className="font-medium px-2 py-3 w-[80px]">Status</th>
                <th className="font-medium px-2 py-3 w-[40px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#28313C]/30">
              {apiTokens.map(t => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-2 py-3.5">
                    <span className="text-white font-medium truncate block max-w-[180px]">{t.name}</span>
                  </td>
                  <td className="px-2 py-3.5 text-muted-foreground font-mono text-[12px]">
                    <button type="button" onClick={() => handleCopyPrefix(t)} className="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:bg-white/5 hover:text-white transition-colors" title="Copy token prefix">
                      {t.prefix} <Copy className="size-3" />
                    </button>
                  </td>
                  <td className="px-2 py-3.5 text-muted-foreground truncate max-w-[200px]">{t.scopes}</td>
                  <td className="px-2 py-3.5 text-muted-foreground">{t.created}</td>
                  <td className="px-2 py-3.5 text-muted-foreground">{t.lastUsed}</td>
                  <td className="px-2 py-3.5 text-muted-foreground">{t.expires}</td>
                  <td className="px-2 py-3.5">
                    <span className={cn(
                      "text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest", 
                      t.status === "Active" ? "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20" : "bg-muted text-muted-foreground border-muted-foreground/20"
                    )}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-2 py-3.5 text-right">
                    <button type="button" onClick={() => handleToggleTokenStatus(t)} className="text-muted-foreground hover:text-white transition-colors p-1 rounded hover:bg-white/10" title={t.status === "Active" ? "Revoke token" : "Reactivate token"}>
                      <MoreVertical className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
