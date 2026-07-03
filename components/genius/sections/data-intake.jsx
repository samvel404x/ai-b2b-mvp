"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileUp, Link2, Sparkles, UploadCloud } from "lucide-react";
import { PageHeader, Panel, StatePill } from "../shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const extractedFields = [
  { id: 1, field: "Vendor name", value: "Acme Analytics", confidence: 98, mapped: "vendor" },
  { id: 2, field: "Contract value", value: "$9,600 / yr", confidence: 95, mapped: "amount" },
  { id: 3, field: "Renewal date", value: "2026-07-15", confidence: 92, mapped: "renewal_date" },
  { id: 4, field: "Auto-renew", value: "Yes (30 day notice)", confidence: 88, mapped: "auto_renew" },
  { id: 5, field: "Owner", value: "Finance", confidence: 74, mapped: "owner" },
  { id: 6, field: "Payment terms", value: "Net 30", confidence: 81, mapped: "terms" },
];

export default function DataIntake({ onNavigate }) {
  const [files, setFiles] = useState([
    { name: "Acme Analytics MSA.pdf", size: "1.2 MB", stage: "Extracted" },
  ]);
  const [confirmed, setConfirmed] = useState(extractedFields.map((f) => f.id));
  const inputRef = useRef(null);

  function onFiles(list) {
    const next = Array.from(list).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      stage: "Extracting",
    }));
    if (next.length) {
      setFiles((prev) => [...next, ...prev]);
      toast.success(`${next.length} file(s) uploaded`, {
        description: "Extraction started.",
      });
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
        description="Upload Excel, CSV or PDF, or pull from a URL. Review the extraction, confirm the fields, then send confirmed evidence to diagnostics."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-6">
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
              <span className="text-sm font-medium">
                Drop files or click to browse
              </span>
              <span className="text-xs text-muted-foreground">
                XLSX, CSV, PDF up to 25 MB
              </span>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </button>

            <div className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                From URL
              </span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="https://…" className="pl-8" />
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.success("URL queued", { description: "Fetching source…" })
                  }
                >
                  Fetch
                </Button>
              </div>
            </div>
          </Panel>

          <Panel title="Recent uploads" contentClassName="p-0">
            <ul className="divide-y divide-border">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <FileUp className="size-4 text-muted-foreground" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{f.name}</span>
                    <span className="text-xs text-muted-foreground">{f.size}</span>
                  </div>
                  <StatePill
                    state={f.stage === "Extracted" ? "Approved" : "Pending"}
                  />
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel
          title="Extraction review"
          description="Confirm the fields GENIUS pulled from Acme Analytics MSA.pdf"
          contentClassName="p-0"
          actions={
            <Button variant="outline" size="sm" onClick={() => onNavigate("chat")}>
              <Sparkles data-icon="inline-start" />
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
                    <Badge variant="secondary">{f.mapped}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular text-muted-foreground">
                    {f.confidence}%
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
            <Button
              onClick={() => {
                toast.success("Evidence confirmed", {
                  description: "Sent to diagnostics and the proof trail.",
                });
                onNavigate("diagnostics");
              }}
            >
              Confirm & send to diagnostics
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
