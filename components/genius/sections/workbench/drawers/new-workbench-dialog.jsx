"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function NewWorkbenchDialog({ open, onOpenChange, onCreate }) {
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState("Analyze");
  const [initialPrompt, setInitialPrompt] = useState("");

  const handleCreate = () => {
    onCreate({ title: title || initialPrompt || "New Analysis", mode, initialPrompt });
    onOpenChange(false);
    setTitle("");
    setMode("Analyze");
    setInitialPrompt("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#0E1116] border-[#28313C] text-white">
        <DialogHeader>
          <DialogTitle>New Workbench</DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs mt-1">
            Configure a new AI workspace to analyze your enterprise data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-xs">Workbench Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Azure Spend Variance"
              className="bg-[#141A22] border-[#28313C] text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mode" className="text-xs">Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="bg-[#141A22] border-[#28313C] text-sm">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="bg-[#141A22] border-[#28313C] text-white">
                <SelectItem value="Ask">Ask</SelectItem>
                <SelectItem value="Analyze">Analyze</SelectItem>
                <SelectItem value="Compare">Compare</SelectItem>
                <SelectItem value="Diagnose">Diagnose</SelectItem>
                <SelectItem value="Build">Build</SelectItem>
                <SelectItem value="Execute">Execute</SelectItem>
                <SelectItem value="Brief">Brief</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label className="text-xs">AI Model</Label>
              <Select defaultValue="gemini-pro">
                <SelectTrigger className="bg-[#141A22] border-[#28313C] text-sm text-muted-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141A22] border-[#28313C] text-white">
                  <SelectItem value="gemini-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-flash">Gemini 1.5 Flash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Workspace</Label>
              <Select defaultValue="acme">
                <SelectTrigger className="bg-[#141A22] border-[#28313C] text-sm text-muted-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#141A22] border-[#28313C] text-white">
                  <SelectItem value="acme">Acme Corporation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2 mt-2">
            <Label className="text-xs">Initial Prompt (Optional)</Label>
            <Textarea
              value={initialPrompt}
              onChange={(event) => setInitialPrompt(event.target.value)}
              placeholder="Describe what you want to achieve..."
              className="bg-[#141A22] border-[#28313C] text-sm resize-none h-20"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" className="text-muted-foreground hover:text-white text-xs" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
            Create Workbench
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
