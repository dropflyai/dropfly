"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Phone, Mail, MoreVertical, Calendar, Building2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type LeadStatus = "cold" | "warm" | "hot" | "closed" | "lost";

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  score?: number;
  lastContact?: string;
  createdAt?: string;
  avatar?: string;
}

export interface LeadCardProps extends React.HTMLAttributes<HTMLDivElement> {
  lead: Lead;
  onCall?: (lead: Lead) => void;
  onEmail?: (lead: Lead) => void;
  onMoreClick?: (lead: Lead) => void;
  compact?: boolean;
}

const statusConfig: Record<
  LeadStatus,
  { label: string; variant: "default" | "success" | "warning" | "error" | "info" }
> = {
  cold: { label: "Cold", variant: "default" },
  warm: { label: "Warm", variant: "warning" },
  hot: { label: "Hot", variant: "error" },
  closed: { label: "Closed", variant: "success" },
  lost: { label: "Lost", variant: "default" },
};

export function LeadCard({
  className,
  lead,
  onCall,
  onEmail,
  onMoreClick,
  compact = false,
  ...props
}: LeadCardProps) {
  const { label, variant } = statusConfig[lead.status];

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] transition-all hover:border-[var(--color-border-strong)] cursor-pointer",
          className
        )}
        {...props}
      >
        <Avatar src={lead.avatar} name={lead.name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--color-text-primary)] truncate">
            {lead.name}
          </p>
          {lead.company && (
            <p className="text-xs text-[var(--color-text-tertiary)] truncate">
              {lead.company}
            </p>
          )}
        </div>
        <Badge variant={variant} size="sm">
          {label}
        </Badge>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] transition-all hover:border-[var(--color-border-strong)]",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar src={lead.avatar} name={lead.name} size="md" />
          <div>
            <h3 className="font-semibold text-[var(--color-text-primary)]">
              {lead.name}
            </h3>
            {lead.company && (
              <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {lead.company}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={variant}>{label}</Badge>
          {onMoreClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMoreClick(lead)}
              className="h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Score */}
      {lead.score !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--color-text-tertiary)]">
              Lead Score
            </span>
            <span className="text-xs font-medium text-[var(--color-text-primary)]">
              {lead.score}/100
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                lead.score >= 80
                  ? "bg-[var(--color-success)]"
                  : lead.score >= 50
                  ? "bg-[var(--color-warning)]"
                  : "bg-[var(--color-text-tertiary)]"
              )}
              style={{ width: `${lead.score}%` }}
            />
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {lead.email && (
          <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
            {lead.email}
          </p>
        )}
        {lead.phone && (
          <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-[var(--color-text-tertiary)]" />
            {lead.phone}
          </p>
        )}
        {lead.lastContact && (
          <p className="text-sm text-[var(--color-text-tertiary)] flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Last contact: {lead.lastContact}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-[var(--color-border-default)]">
        {onCall && lead.phone && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onCall(lead)}
            className="flex-1 gap-2"
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
        )}
        {onEmail && lead.email && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEmail(lead)}
            className="flex-1 gap-2"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
        )}
      </div>
    </div>
  );
}

export default LeadCard;
