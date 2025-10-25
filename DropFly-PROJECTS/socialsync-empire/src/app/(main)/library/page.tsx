'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Filter, Search, Trash2, Copy, Edit, Calendar, Sparkles } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface SavedContent {
  id: string;
  title: string;
  type: string;
  content: {
    hook: string;
    script: string;
    cta: string;
    hashtags: string[];
    duration: string;
  };
  metadata: {
    creator_mode: string;
    platform: string;
    duration: string;
    generated_at: string;
  };
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export default function LibraryPage() {
  const [content, setContent] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'script' | 'video'>('all');
  const [selectedContent, setSelectedContent] = useState<SavedContent | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content');
      const data = await response.json();

      if (response.ok) {
        setContent(data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setContent(content.filter(c => c.id !== id));
        setSelectedContent(null);
      }
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  const copyToClipboard = (item: SavedContent) => {
    const text = `
Hook: ${item.content.hook}

Script:
${item.content.script}

CTA: ${item.content.cta}

Hashtags: ${item.content.hashtags.join(' ')}
    `.trim();

    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.script.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const creatorModeEmojis: Record<string, string> = {
    ugc: '📱',
    educational: '🎓',
    entertainment: '🎭',
    review: '⭐',
    tutorial: '📚',
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--bg-tertiary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[var(--accent-500)] to-[var(--primary-500)] rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Content Library</h1>
              <p className="text-sm text-[var(--text-tertiary)]">
                {content.length} saved {content.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <Button icon={<Sparkles className="w-4 h-4" />} onClick={() => window.location.href = '/create'}>
            Create New
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-6 border-b border-[var(--bg-tertiary)] space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder="Search your content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
            Filter
          </Button>
        </div>

        {/* Type Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-[var(--primary-500)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('script')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'script'
                ? 'bg-[var(--primary-500)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            Scripts
          </button>
          <button
            onClick={() => setFilterType('video')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'video'
                ? 'bg-[var(--primary-500)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            Videos
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Content List */}
        <div className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} padding="lg" className="animate-pulse">
                  <div className="h-24 bg-[var(--bg-tertiary)] rounded mb-4"></div>
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded mb-2"></div>
                  <div className="h-4 bg-[var(--bg-tertiary)] rounded w-2/3"></div>
                </Card>
              ))}
            </div>
          ) : filteredContent.length === 0 ? (
            <Card padding="xl" className="text-center max-w-md mx-auto mt-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-[var(--text-tertiary)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                {searchQuery ? 'No results found' : 'No content yet'}
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Start creating AI-powered content to see it here'}
              </p>
              {!searchQuery && (
                <Button variant="primary" onClick={() => window.location.href = '/create'}>
                  Create Your First Script
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((item) => (
                <Card
                  key={item.id}
                  padding="lg"
                  variant={selectedContent?.id === item.id ? 'bordered' : 'glass'}
                  className={`cursor-pointer transition-all ${
                    selectedContent?.id === item.id
                      ? 'ring-2 ring-[var(--primary-500)]'
                      : 'hover:shadow-lg'
                  }`}
                  onClick={() => setSelectedContent(item)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">
                        {creatorModeEmojis[item.metadata.creator_mode] || '📝'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--text-primary)] truncate mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[var(--text-tertiary)] capitalize">
                        {item.metadata.creator_mode?.replace('_', ' ')} • {item.metadata.platform}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--text-secondary)] line-clamp-3 mb-4">
                    {item.content.hook}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <span className="px-2 py-1 bg-[var(--bg-tertiary)] rounded">
                      {item.metadata.duration}
                    </span>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      icon={<Copy className="w-3 h-3" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item);
                      }}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      icon={<Edit className="w-3 h-3" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedContent(item);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedContent && (
          <div className="w-full md:w-[400px] p-6 bg-[var(--bg-secondary)]/50 border-l border-[var(--bg-tertiary)] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Details</h2>
              <button
                onClick={() => setSelectedContent(null)}
                className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
              >
                <span className="text-[var(--text-secondary)]">✕</span>
              </button>
            </div>

            <Card padding="lg" variant="glass" className="mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-500)] to-[var(--secondary-500)] rounded-lg flex items-center justify-center">
                  <span className="text-2xl">
                    {creatorModeEmojis[selectedContent.metadata.creator_mode] || '📝'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    {selectedContent.title}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)] capitalize">
                    {selectedContent.metadata.creator_mode?.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                    🎣 Hook
                  </p>
                  <p className="text-sm text-[var(--text-primary)]">
                    {selectedContent.content.hook}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                    📝 Script
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                    {selectedContent.content.script}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                    📢 Call to Action
                  </p>
                  <p className="text-sm text-[var(--text-primary)]">
                    {selectedContent.content.cta}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                    #️⃣ Hashtags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedContent.content.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 bg-[var(--primary-500)]/10 text-[var(--primary-500)] rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-1">
                    ⏱️ Duration
                  </p>
                  <p className="text-sm text-[var(--text-primary)]">
                    {selectedContent.content.duration}
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="md" className="mb-4">
              <h4 className="font-semibold text-[var(--text-primary)] mb-3 text-sm">Metadata</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Platform</span>
                  <span className="text-[var(--text-primary)] capitalize">
                    {selectedContent.metadata.platform}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Created</span>
                  <span className="text-[var(--text-primary)]">
                    {new Date(selectedContent.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Status</span>
                  <span className="text-[var(--text-primary)] capitalize">
                    {selectedContent.status}
                  </span>
                </div>
              </div>
            </Card>

            <div className="space-y-2">
              <Button
                variant="primary"
                fullWidth
                icon={<Copy className="w-4 h-4" />}
                onClick={() => copyToClipboard(selectedContent)}
              >
                Copy to Clipboard
              </Button>
              <Button
                variant="secondary"
                fullWidth
                icon={<Edit className="w-4 h-4" />}
              >
                Use as Template
              </Button>
              <Button
                variant="ghost"
                fullWidth
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => deleteContent(selectedContent.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
