"use client";

import { useState } from "react";
import { Plus, Filter, Search, LayoutGrid, List } from "lucide-react";
import { LeadCard, type Lead, type LeadStatus } from "@/components/domain/lead-card";
import { StatCard } from "@/components/domain/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const demoLeads: Lead[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@techcorp.com",
    phone: "+1 (555) 123-4567",
    company: "TechCorp Inc",
    status: "hot",
    score: 92,
    lastContact: "2 hours ago",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael@startupxyz.io",
    phone: "+1 (555) 234-5678",
    company: "StartupXYZ",
    status: "hot",
    score: 85,
    lastContact: "Yesterday",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily@creative.co",
    phone: "+1 (555) 345-6789",
    company: "Creative Agency",
    status: "warm",
    score: 68,
    lastContact: "2 days ago",
  },
  {
    id: "4",
    name: "James Wilson",
    email: "james@enterprise.com",
    phone: "+1 (555) 456-7890",
    company: "Enterprise Solutions",
    status: "warm",
    score: 55,
    lastContact: "3 days ago",
  },
  {
    id: "5",
    name: "Lisa Anderson",
    email: "lisa@retail.com",
    company: "Retail Plus",
    status: "cold",
    score: 32,
    lastContact: "1 week ago",
  },
  {
    id: "6",
    name: "David Brown",
    email: "david@consulting.com",
    phone: "+1 (555) 567-8901",
    company: "Brown Consulting",
    status: "cold",
    score: 25,
    lastContact: "2 weeks ago",
  },
];

const statusFilters: { value: LeadStatus | "all"; label: string }[] = [
  { value: "all", label: "All Leads" },
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
  { value: "closed", label: "Closed" },
];

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredLeads = demoLeads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const leadCounts: Record<LeadStatus | "all", number> = {
    all: demoLeads.length,
    hot: demoLeads.filter((l) => l.status === "hot").length,
    warm: demoLeads.filter((l) => l.status === "warm").length,
    cold: demoLeads.filter((l) => l.status === "cold").length,
    closed: demoLeads.filter((l) => l.status === "closed").length,
    lost: demoLeads.filter((l) => l.status === "lost").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Leads
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Manage and track your sales pipeline
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={leadCounts.all}
          change={12}
          changeLabel="this month"
        />
        <StatCard
          title="Hot Leads"
          value={leadCounts.hot}
          change={25}
          changeLabel="this week"
        />
        <StatCard
          title="Conversion Rate"
          value="24%"
          change={5}
          changeLabel="vs last month"
        />
        <StatCard
          title="Avg Score"
          value="58"
          change={-2}
          changeLabel="vs last week"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                statusFilter === filter.value
                  ? "bg-[var(--color-accent-purple)] text-white"
                  : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
              )}
            >
              {filter.label}
              <span className="ml-1.5 text-xs opacity-70">
                ({leadCounts[filter.value]})
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <div className="flex border border-[var(--color-border-default)] rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "grid"
                  ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "list"
                  ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Leads Grid/List */}
      {filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-[var(--color-text-tertiary)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
            No leads found
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onCall={(l) => console.log("Call", l)}
              onEmail={(l) => console.log("Email", l)}
              onMoreClick={(l) => console.log("More", l)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLeads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} compact />
          ))}
        </div>
      )}
    </div>
  );
}
