"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  FileUp,
  Link2,
  Sparkles,
  UploadCloud,
  AlertCircle,
  Clock,
  CheckCheck,
  FileText,
  ChevronRight,
  Database,
  XCircle,
} from "lucide-react";
import { PageHeader, Panel, StatePill } from "../shared";
import { evidencePipeline } from "@/lib/genius-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const extractedFields = [
  { id: 1, field: "Vendor name", value: "Acme Analytics", confidence: 98, mapped: "vendor" },
  { id: 2, field: "Contract value", value: "$9,600 / yr", confidence: 95, mapped: "amount" },
  { id: 3, field: "Renewal date", value: "2026-07-15", confidence: 92, mapped: "renewal_date" },
  { id: 4, field: "Auto-renew", value: "Yes (30 day notice)", confidence: 88, mapped: "auto_renew" },
  { id: 5, field: "Owner", value: "Finance", confidence: 74, mapped: "owner" },
  { id: 6, field: "Payment terms", value: "Net 30", confidence: 81, mapped: "terms" },
];

const stageConfig = {
  Confirmed: { label: "Confirmed", cls: "text-primary", icon: CheckCircle2, barCls: "bg-primary" },
  Review: { label: "Review", cls: "text-warning", icon: AlertCircle, barCls: "bg-warning" },
  Extracting: { label: "Extracting", cls: "text-muted-foreground", icon: Clock, barCls: "bg-muted-foreground" },
};

const pipelineStages = ["Upload", "Extract", "Review", "Confirm", "Diagnostics"];

export default function DataIntake({ onNavigate }) {
  const [files, setFiles] = useState([
    { name: "Acme Analytics MSA.pdf", size: "1.2 MB", stage: "Extracted" },
  ]);
  const [confirmed, setConfirmed] = useState(extractedFields.map((f) => f.id));
  const [activeFile, setActiveFile] = useState("E-01");
  const [urlValue, setUrlValue] = useState("");
  const inputRef = useRef(null);

  function onFiles(list) {
    const next = Array.from(list).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      stage: "Extracting",
    }));
    if (next.length) {
      setFiles((prev) => [...next, ...prev]);
      toast.success(`${next.length} file(s) uploaded`, { description: "Extraction started." });
    }
  }

  function toggle(id) {
    setConfirmed((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Data Intake"
        description="Upload Excel, CSV, or PDF — or pull from a URL. Review the AI extraction, confirm fields, then send confirmed evidence to diagnostics."
      />

      {/* Evidence pipeline */}
      <Panel title="Evidence pipeline" contentClassName="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Stage header */}
            <div className="grid grid-cols-5 gap-px bg-border text-center text-xs font-medium text-muted-foreground">
              {pipelineStages.map((s, i) => (
                <div key={s} className="bg-card px-3 py-2 flex items-center justify-center gap-1">
                  <span className="size-4 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                  {s}
                </div>
              ))}
            </div>
            {/* Files */}
            <div className="divide-y divide-border">
              {evidencePipeline.map((ev) => {
                const stage = ev.stage;
                const stageIndex = stage === "Confirmed" ? 4 :
                  stage === "Review" ? 2 :
                  stage === "Extracting" ? 1 : 0;
                const cfg = stageConfig[stage] || stageConfig.Extracting;
                const Icon = cfg.icon;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setActiveFile(ev.id)}
                    className={cn(
                      "grid w-full grid-cols-5 gap-px text-left transition-colors hover:bg-secondary/30",
                      activeFile === ev.id && "bg-secondary/40"
                    )}
                  >
                    {pipelineStages.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "px-3 py-3 flex items-center",
                          i === 0 ? "col-start-1" : "",
                          i > stageIndex ? "opacity-30" : ""
                        )}
                      >
                        {i === 0 ? (
                          <div className="flex items-center gap-2 w-full">
                            <FileText className="size-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-medium truncate">{ev.name}</div>
                              <div className="text-[11px] text-muted-foreground">{ev.type}</div>
                            </div>
                          </div>
                        ) : i === stageIndex ? (
                          <div className="flex items-center gap-1.5">
                            <Icon className={cn("size-3.5", cfg.cls)} />
                            <span className={cn("text-xs font-medium", cfg.cls)}>{cfg.label}</span>
                          </div>
                        ) : i < stageIndex ? (
                          <CheckCheck className="size-3.5 text-primary/40" />
                        ) : null}
                      </div>
                    ))}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coverage bar for active file */}
        {(() => {
          const ev = evidencePipeline.find((e) => e.id === activeFile);
          if (!ev) return null;
          const cfg = stageConfig[ev.stage] || stageConfig.Extracting;
          return (
            <div className="border-t border-border px-4 py-3 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{ev.name} · {ev.fields} fields</span>
                  <span className={cn("font-medium", cfg.cls)}>{ev.coverage}% coverage</span>
                </div>
                <Progress value={ev.coverage} className={cn("h-1.5", ev.coverage < 80 ? "[&>div]:bg-warning" : "[&>div]:bg-primary")} />
              </div>
              <Badge variant="outline" className={cn("text-xs", cfg.cls)}>{ev.stage}</Badge>
            </div>
          );
        })()}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* Upload section */}
        <div className="flex flex-col gap-4">
          <Panel title="Upload">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                onFiles(e.dataTransfer.files);
              }}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/30 px-4 py-10 text-center transition-colors hover:border-primary/40 hover:bg-secondary/50"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-secondary">
                <UploadCloud className="size-5 text-primary" />
              </div>
              <span className="text-sm font-medium">Drop files or click to browse</span>
              <span className="text-xs text-muted-foreground">XLSX, CSV, PDF up to 25 MB</span>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </button>

            <div className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">From URL</span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="https://…"
                    className="pl-8"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!urlValue) return;
                    toast.success("URL queued", { description: "Fetching source…" });
                    setUrlValue("");
                  }}
                >
                  Fetch
                </Button>
              </div>
            </div>
          </Panel>

          <Panel title="Recent uploads" contentClassName="p-0">
            <ul className="divide-y divide-border">
              {files.slice(0, 4).map((f, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <FileUp className="size-4 text-muted-foreground shrink-0" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{f.name}</span>
                    <span className="text-xs text-muted-foreground">{f.size}</span>
                  </div>
                  <StatePill state={f.stage === "Extracted" ? "Approved" : "Pending"} />
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Extraction review */}
        <Panel
          title="Extraction review"
          description="Acme Analytics MSA.pdf"
          contentClassName="p-0"
          actions={
            <Button variant="outline" size="sm" onClick={() => onNavigate?.("chat")}>
              <Sparkles className="size-3.5 mr-1.5" />
              Ask AI
            </Button>
          }
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Use</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Extracted value</TableHead>
                <TableHead>Maps to</TableHead>
                <TableHead className="text-right">Conf.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extractedFields.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <Checkbox
                      checked={confirmed.includes(f.id)}
                      onCheckedChange={() => toggle(f.id)}
                      aria-label={`Confirm ${f.field}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{f.field}</TableCell>
                  <TableCell className="text-muted-foreground">{f.value}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">{f.mapped}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "tabular text-xs font-medium",
                      f.confidence >= 90 ? "text-primary" : f.confidence >= 80 ? "text-foreground" : "text-warning"
                    )}>
                      {f.confidence}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between gap-3 border-t border-border p-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-primary" />
              {confirmed.length} of {extractedFields.length} fields confirmed
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmed(extractedFields.map((f) => f.id))}
              >
                Select all
              </Button>
              <Button
                onClick={() => {
                  toast.success("Evidence confirmed", {
                    description: "Sent to diagnostics and the proof trail.",
                  });
                  onNavigate?.("diagnostics");
                }}
              >
                Confirm & send
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
