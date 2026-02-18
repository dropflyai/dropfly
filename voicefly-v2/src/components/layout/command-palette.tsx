"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Users,
  Search,
  Settings,
  Plus,
  FileText,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: "navigation" | "actions";
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  const commands: Command[] = [
    // Navigation
    {
      id: "nav-dashboard",
      label: "Go to Dashboard",
      shortcut: "G D",
      icon: LayoutDashboard,
      action: () => router.push("/dashboard"),
      category: "navigation",
    },
    {
      id: "nav-maya",
      label: "Go to Maya AI",
      shortcut: "G M",
      icon: Bot,
      action: () => router.push("/dashboard/maya"),
      category: "navigation",
    },
    {
      id: "nav-leads",
      label: "Go to Leads",
      shortcut: "G L",
      icon: Users,
      action: () => router.push("/dashboard/leads"),
      category: "navigation",
    },
    {
      id: "nav-research",
      label: "Go to Research",
      shortcut: "G R",
      icon: Search,
      action: () => router.push("/dashboard/research"),
      category: "navigation",
    },
    {
      id: "nav-settings",
      label: "Go to Settings",
      shortcut: "G S",
      icon: Settings,
      action: () => router.push("/dashboard/settings"),
      category: "navigation",
    },
    // Actions
    {
      id: "action-new-lead",
      label: "Create New Lead",
      shortcut: "N L",
      icon: Plus,
      action: () => router.push("/dashboard/leads?new=true"),
      category: "actions",
    },
    {
      id: "action-new-campaign",
      label: "Create New Campaign",
      shortcut: "N C",
      icon: FileText,
      action: () => console.log("New campaign"),
      category: "actions",
    },
    {
      id: "action-start-call",
      label: "Start a Call",
      shortcut: "S C",
      icon: Phone,
      action: () => console.log("Start call"),
      category: "actions",
    },
    {
      id: "action-send-email",
      label: "Send Email",
      shortcut: "S E",
      icon: Mail,
      action: () => console.log("Send email"),
      category: "actions",
    },
    {
      id: "action-schedule",
      label: "Schedule Meeting",
      shortcut: "S M",
      icon: Calendar,
      action: () => console.log("Schedule meeting"),
      category: "actions",
    },
  ];

  const filteredCommands = commands.filter((command) =>
    command.label.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = {
    navigation: filteredCommands.filter((c) => c.category === "navigation"),
    actions: filteredCommands.filter((c) => c.category === "actions"),
  };

  const flatFilteredCommands = [
    ...groupedCommands.navigation,
    ...groupedCommands.actions,
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const executeCommand = useCallback(
    (command: Command) => {
      command.action();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatFilteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatFilteredCommands.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (flatFilteredCommands[selectedIndex]) {
            executeCommand(flatFilteredCommands[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    },
    [flatFilteredCommands, selectedIndex, executeCommand, onOpenChange]
  );

  if (!mounted || !open) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={() => onOpenChange(false)}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-50 w-full max-w-lg overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] shadow-lg animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-[var(--color-border-default)] px-4">
          <Search className="mr-2 h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-[var(--color-text-tertiary)] text-[var(--color-text-primary)]"
          />
        </div>

        {/* Commands list */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {flatFilteredCommands.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--color-text-tertiary)]">
              No results found.
            </p>
          ) : (
            <>
              {/* Navigation group */}
              {groupedCommands.navigation.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 px-2 text-xs font-medium text-[var(--color-text-tertiary)]">
                    Navigation
                  </p>
                  {groupedCommands.navigation.map((command) => {
                    const index = flatFilteredCommands.indexOf(command);
                    const Icon = command.icon;
                    return (
                      <button
                        key={command.id}
                        onClick={() => executeCommand(command)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          index === selectedIndex
                            ? "bg-[var(--color-accent-purple-subtle)] text-[var(--color-accent-purple)]"
                            : "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{command.label}</span>
                        {command.shortcut && (
                          <kbd className="hidden rounded border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-text-tertiary)] sm:inline">
                            {command.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Actions group */}
              {groupedCommands.actions.length > 0 && (
                <div>
                  <p className="mb-1 px-2 text-xs font-medium text-[var(--color-text-tertiary)]">
                    Actions
                  </p>
                  {groupedCommands.actions.map((command) => {
                    const index = flatFilteredCommands.indexOf(command);
                    const Icon = command.icon;
                    return (
                      <button
                        key={command.id}
                        onClick={() => executeCommand(command)}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          index === selectedIndex
                            ? "bg-[var(--color-accent-purple-subtle)] text-[var(--color-accent-purple)]"
                            : "text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{command.label}</span>
                        {command.shortcut && (
                          <kbd className="hidden rounded border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-text-tertiary)] sm:inline">
                            {command.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--color-border-default)] px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
            <kbd className="rounded border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 font-mono">
              ↑
            </kbd>
            <kbd className="rounded border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 font-mono">
              ↓
            </kbd>
            <span>to navigate</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)]">
            <kbd className="rounded border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 font-mono">
              ↵
            </kbd>
            <span>to select</span>
            <kbd className="rounded border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 font-mono">
              esc
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export default CommandPalette;
