"use client";

import { useState } from "react";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  Play,
  Pause,
  MoreVertical,
  Filter,
  Download,
} from "lucide-react";
import { MayaStatus } from "@/components/domain/maya-status";
import { StatCard } from "@/components/domain/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CallLog {
  id: string;
  caller: string;
  phone: string;
  direction: "inbound" | "outbound";
  status: "completed" | "missed" | "voicemail";
  duration: string;
  time: string;
  recording?: string;
}

const callLogs: CallLog[] = [
  {
    id: "1",
    caller: "Sarah Johnson",
    phone: "+1 (555) 123-4567",
    direction: "inbound",
    status: "completed",
    duration: "4:32",
    time: "10:30 AM",
    recording: "rec_001",
  },
  {
    id: "2",
    caller: "Unknown",
    phone: "+1 (555) 987-6543",
    direction: "inbound",
    status: "missed",
    duration: "0:00",
    time: "10:15 AM",
  },
  {
    id: "3",
    caller: "Michael Chen",
    phone: "+1 (555) 234-5678",
    direction: "outbound",
    status: "completed",
    duration: "2:15",
    time: "9:45 AM",
    recording: "rec_002",
  },
  {
    id: "4",
    caller: "Emily Davis",
    phone: "+1 (555) 345-6789",
    direction: "inbound",
    status: "voicemail",
    duration: "0:45",
    time: "9:30 AM",
    recording: "rec_003",
  },
  {
    id: "5",
    caller: "James Wilson",
    phone: "+1 (555) 456-7890",
    direction: "inbound",
    status: "completed",
    duration: "6:20",
    time: "Yesterday",
    recording: "rec_004",
  },
];

const statusConfig = {
  completed: { label: "Completed", variant: "success" as const, icon: Phone },
  missed: { label: "Missed", variant: "error" as const, icon: PhoneMissed },
  voicemail: { label: "Voicemail", variant: "warning" as const, icon: Phone },
};

export default function MayaPage() {
  const [mayaOnline, setMayaOnline] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const togglePlayback = (id: string) => {
    setPlayingId(playingId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Maya AI Hub
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Manage your AI voice assistant and view call history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            Export Calls
          </Button>
          <Button variant="secondary">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Maya Status */}
      <MayaStatus
        isOnline={mayaOnline}
        callsToday={24}
        messagesHandled={47}
        onToggle={() => setMayaOnline(!mayaOnline)}
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Calls"
          value={124}
          change={15}
          changeLabel="this week"
          icon={<Phone className="h-5 w-5 text-[var(--color-accent-purple)]" />}
        />
        <StatCard
          title="Avg Duration"
          value="3:45"
          icon={<Clock className="h-5 w-5 text-[var(--color-accent-purple)]" />}
        />
        <StatCard
          title="Inbound"
          value={89}
          icon={<PhoneIncoming className="h-5 w-5 text-[var(--color-accent-cyan)]" />}
        />
        <StatCard
          title="Outbound"
          value={35}
          icon={<PhoneOutgoing className="h-5 w-5 text-[var(--color-success)]" />}
        />
      </div>

      {/* Call Logs */}
      <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border-default)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Recent Calls
          </h2>
        </div>

        <div className="divide-y divide-[var(--color-border-subtle)]">
          {callLogs.map((call) => {
            const { label, variant, icon: StatusIcon } = statusConfig[call.status];
            const isPlaying = playingId === call.id;

            return (
              <div
                key={call.id}
                className="flex items-center gap-4 p-4 hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                {/* Direction Icon */}
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    call.direction === "inbound"
                      ? "bg-[var(--color-accent-cyan-subtle)]"
                      : "bg-[var(--color-success-subtle)]"
                  )}
                >
                  {call.direction === "inbound" ? (
                    <PhoneIncoming
                      className={cn(
                        "h-5 w-5",
                        call.status === "missed"
                          ? "text-[var(--color-error)]"
                          : "text-[var(--color-accent-cyan)]"
                      )}
                    />
                  ) : (
                    <PhoneOutgoing className="h-5 w-5 text-[var(--color-success)]" />
                  )}
                </div>

                {/* Caller Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--color-text-primary)] truncate">
                    {call.caller}
                  </p>
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    {call.phone}
                  </p>
                </div>

                {/* Status Badge */}
                <Badge variant={variant} size="sm">
                  {label}
                </Badge>

                {/* Duration */}
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {call.duration}
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {call.time}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {call.recording && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePlayback(call.id)}
                      className="h-8 w-8"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
