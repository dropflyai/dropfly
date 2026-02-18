"use client";

import { useState } from "react";
import {
  Search,
  Sparkles,
  History,
  Bookmark,
  ExternalLink,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ResearchResult {
  id: string;
  query: string;
  response: string;
  sources: { title: string; url: string }[];
  timestamp: string;
}

const recentQueries = [
  "What are the top marketing trends for dental practices in 2024?",
  "How to improve patient retention in medical clinics",
  "Best practices for salon appointment reminders",
  "Competitive analysis of local auto repair shops",
];

const savedResearch: ResearchResult[] = [
  {
    id: "1",
    query: "What are effective lead generation strategies for B2B SaaS?",
    response:
      "Based on current market analysis, the most effective B2B SaaS lead generation strategies include: 1) Content marketing with gated resources, 2) LinkedIn outreach campaigns, 3) Webinar hosting, 4) Strategic partnerships, and 5) Account-based marketing (ABM). Companies seeing the best results combine multiple channels with strong attribution tracking.",
    sources: [
      { title: "HubSpot 2024 Marketing Report", url: "#" },
      { title: "Gartner B2B Trends", url: "#" },
    ],
    timestamp: "2 days ago",
  },
];

export default function ResearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setResult({
      id: Date.now().toString(),
      query,
      response: `Based on my analysis of "${query}", here are the key insights:\n\n1. Market Overview: The industry is experiencing significant growth with increasing demand for AI-powered solutions.\n\n2. Competitive Landscape: Major players are investing heavily in automation and personalization features.\n\n3. Opportunities: There's a clear gap in the market for affordable, easy-to-use solutions targeting small businesses.\n\n4. Recommendations: Focus on user experience, integrate with popular platforms, and emphasize ROI in marketing materials.`,
      sources: [
        { title: "Industry Report 2024", url: "#" },
        { title: "Market Analysis Study", url: "#" },
        { title: "Expert Interview", url: "#" },
      ],
      timestamp: "Just now",
    });
    setIsSearching(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Research Hub
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          AI-powered market intelligence and competitor analysis
        </p>
      </div>

      {/* Search Section */}
      <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-[var(--color-accent-purple)]" />
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Powered by DeepSeek
          </span>
          <Badge variant="success" size="sm">
            98% cost savings
          </Badge>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="Ask anything about your market, competitors, or industry trends..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            className="resize-none"
          />

          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Press Enter to search or click the button
            </p>
            <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Research
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick queries */}
        <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
          <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-2">
            Try these queries:
          </p>
          <div className="flex flex-wrap gap-2">
            {recentQueries.map((q, index) => (
              <button
                key={index}
                onClick={() => setQuery(q)}
                className="px-3 py-1.5 text-xs rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                {q.length > 50 ? q.slice(0, 50) + "..." : q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Result */}
      {result && (
        <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6 animate-fadeIn">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-medium text-[var(--color-text-primary)]">
                {result.query}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                {result.timestamp}
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-[var(--color-text-secondary)]">
            <p className="whitespace-pre-line">{result.response}</p>
          </div>

          {/* Sources */}
          <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
            <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-2">
              Sources
            </p>
            <div className="flex flex-wrap gap-2">
              {result.sources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-[var(--color-bg-elevated)] text-[var(--color-accent-purple)] hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  {source.title}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Was this helpful?
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="gap-1">
                <ThumbsUp className="h-4 w-4" />
                Yes
              </Button>
              <Button variant="ghost" size="sm" className="gap-1">
                <ThumbsDown className="h-4 w-4" />
                No
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Research */}
      <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-[var(--color-text-tertiary)]" />
          <h2 className="font-semibold text-[var(--color-text-primary)]">
            Saved Research
          </h2>
        </div>

        <div className="space-y-4">
          {savedResearch.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-lg bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-[var(--color-text-primary)] text-sm">
                  {item.query}
                </h3>
                <span className="text-xs text-[var(--color-text-tertiary)]">
                  {item.timestamp}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                {item.response}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
