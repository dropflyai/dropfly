"use client";

import { Phone, Users, DollarSign, Calendar, ArrowRight, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/domain/stat-card";
import { MayaStatus } from "@/components/domain/maya-status";
import { LeadCard, type Lead } from "@/components/domain/lead-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Demo data
const recentLeads: Lead[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1 (555) 123-4567",
    company: "TechCorp Inc",
    status: "hot",
    score: 85,
    lastContact: "2 hours ago",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael@example.com",
    phone: "+1 (555) 234-5678",
    company: "StartupXYZ",
    status: "warm",
    score: 62,
    lastContact: "Yesterday",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily@example.com",
    company: "Creative Agency",
    status: "cold",
    score: 35,
    lastContact: "3 days ago",
  },
];

const recentActivity = [
  { type: "call", message: "Incoming call from +1 (555) 123-4567", time: "5 min ago" },
  { type: "lead", message: "New lead: Sarah Johnson from TechCorp", time: "1 hour ago" },
  { type: "appointment", message: "Appointment booked for tomorrow 2PM", time: "2 hours ago" },
  { type: "sms", message: "SMS sent to 15 contacts", time: "3 hours ago" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">View Reports</Button>
          <Button>
            <TrendingUp className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Calls Today"
          value={24}
          change={12}
          changeLabel="vs yesterday"
          icon={<Phone className="h-5 w-5 text-[var(--color-accent-purple)]" />}
        />
        <StatCard
          title="Active Leads"
          value={156}
          change={8}
          changeLabel="this week"
          icon={<Users className="h-5 w-5 text-[var(--color-accent-purple)]" />}
        />
        <StatCard
          title="Revenue"
          value="$12,450"
          change={-3}
          changeLabel="vs last month"
          icon={<DollarSign className="h-5 w-5 text-[var(--color-accent-purple)]" />}
        />
        <StatCard
          title="Appointments"
          value={8}
          change={25}
          changeLabel="vs yesterday"
          icon={<Calendar className="h-5 w-5 text-[var(--color-accent-purple)]" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Maya Status + Recent Activity */}
        <div className="space-y-6 lg:col-span-2">
          {/* Maya Status */}
          <MayaStatus
            isOnline={true}
            callsToday={24}
            messagesHandled={47}
            onToggle={() => console.log("Toggle Maya")}
          />

          {/* Recent Activity */}
          <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Recent Activity
              </h2>
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-[var(--color-border-subtle)] last:border-0 last:pb-0"
                >
                  <div className="h-2 w-2 rounded-full bg-[var(--color-accent-purple)] mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-[var(--color-text-primary)]">
                      {activity.message}
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Hot Leads
            </h2>
            <Link href="/dashboard/leads">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} compact />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
