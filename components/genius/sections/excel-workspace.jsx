"use client";

import { useMemo, useState } from "react";
import { Download, Filter, Sparkles, Table2 } from "lucide-react";
import { excelRows, formatCurrency } from "@/lib/genius-data";
import { PageHeader, Panel, StatePill } from "../shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const statusFilters = ["All", "Anomaly", "Duplicate", "Missing owner", "Forecast variance", "OK"];

export default function ExcelWorkspace({ label }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState([]);

  const rows = useMemo(() => {
    return excelRows.filter((row) => {
      const matchesStatus = status === "All" || row.status === status;
      const matchesQuery =
        !query ||
        row.vendor.toLowerCase().includes(query.toLowerCase()) ||
        row.category.toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const flaggedTotal = rows
    .filter((r) => r.status !== "OK")
    .reduce((sum, r) => sum + r.amount, 0);

  function toggleAll() {
    setSelected(allSelected ? [] : rows.map((r) => r.id));
  }

  function toggleRow(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={label}
        description="A live, AI-aware spreadsheet. Rows are scored, flagged and traceable back to source evidence — no more static exports."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download data-icon="inline-start" />
              Export
            </Button>
            <Button size="sm">
              <Sparkles data-icon="inline-start" />
              Ask about selection
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Rows in view</p>
          <p className="text-2xl font-semibold tabular">{rows.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Flagged value</p>
          <p className="text-2xl font-semibold tabular text-warning">
            {formatCurrency(flaggedTotal)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Selected</p>
          <p className="text-2xl font-semibold tabular text-evidence">
            {selected.length}
          </p>
        </div>
      </div>

      <Panel
        title="Vendor spend sheet"
        description="vendors_master.xlsx · synced 4m ago"
        contentClassName="p-0"
        actions={
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Filter className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter vendor…"
                className="h-8 w-44 pl-8 text-xs"
              />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {statusFilters.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all rows"
                />
              </TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>AI note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected.includes(row.id);
              return (
                <TableRow
                  key={row.id}
                  data-state={isSelected ? "selected" : undefined}
                  className={cn(row.status !== "OK" && "bg-secondary/20")}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleRow(row.id)}
                      aria-label={`Select ${row.vendor}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{row.vendor}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.category}
                  </TableCell>
                  <TableCell className="text-right tabular font-medium">
                    {formatCurrency(row.amount)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      row.owner === "—" ? "text-critical" : "text-muted-foreground",
                    )}
                  >
                    {row.owner}
                  </TableCell>
                  <TableCell>
                    {row.status === "OK" ? (
                      <span className="text-xs text-muted-foreground">OK</span>
                    ) : (
                      <StatePill
                        state={
                          row.status === "Anomaly"
                            ? "Pending"
                            : row.status === "Duplicate"
                              ? "In review"
                              : "Rejected"
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell className="max-w-52 truncate text-xs text-muted-foreground">
                    {row.note || "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Table2 className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No rows match your filters.
            </p>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
