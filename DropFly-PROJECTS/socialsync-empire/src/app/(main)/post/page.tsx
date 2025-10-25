'use client';

import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Check, X, Image as ImageIcon, Send } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Post {
  id: string;
  content: string;
  platforms: string[];
  media_urls: string[];
  scheduled_for: string;
  status: 'scheduled' | 'published' | 'failed';
  created_at: string;
  ayrshare_id?: string;
}

export default function PostPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showComposer, setShowComposer] = useState(false);
  const [posting, setPosting] = useState(false);

  // Composer state
  const [postContent, setPostContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [error, setError] = useState('');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/social/post');
      const data = await response.json();

      if (response.ok) {
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle post creation
  const handleCreatePost = async () => {
    if (!postContent.trim() || selectedPlatforms.length === 0) {
      setError('Content and at least one platform are required');
      return;
    }

    setPosting(true);
    setError('');

    try {
      const response = await fetch('/api/social/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent,
          platforms: selectedPlatforms,
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
          scheduleDate: scheduleDate || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create post');
      }

      // Reset form
      setPostContent('');
      setSelectedPlatforms([]);
      setMediaUrls([]);
      setScheduleDate('');
      setShowComposer(false);

      // Refresh posts
      fetchPosts();
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Something went wrong');
    } finally {
      setPosting(false);
    }
  };

  // Toggle platform selection
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // Get posts for a specific date
  const getPostsForDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];

    return posts.filter(post => {
      const postDate = new Date(post.scheduled_for).toISOString().split('T')[0];
      return postDate === dateStr;
    });
  };

  // Get today's posts
  const getTodaysPosts = () => {
    const todayStr = today.toISOString().split('T')[0];
    return posts.filter(post => {
      const postDate = new Date(post.scheduled_for).toISOString().split('T')[0];
      return postDate === todayStr;
    });
  };

  // Navigate months
  const previousMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const todaysPosts = getTodaysPosts();
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
  const publishedCount = posts.filter(p => p.status === 'published').length;

  const platforms = [
    { id: 'instagram', name: 'Instagram', emoji: '📷' },
    { id: 'facebook', name: 'Facebook', emoji: '👍' },
    { id: 'linkedin', name: 'LinkedIn', emoji: '💼' },
    { id: 'twitter', name: 'Twitter', emoji: '🐦' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--bg-tertiary)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[var(--secondary-500)] to-[var(--primary-500)] rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Post Schedule</h1>
              <p className="text-sm text-[var(--text-tertiary)]">Plan and schedule your content</p>
            </div>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowComposer(true)}>
            Schedule New Post
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left - Calendar */}
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-[var(--bg-tertiary)]">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                {scheduledCount} posts scheduled this month
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="ghost" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <Card variant="glass" padding="lg">
            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {days.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-[var(--text-tertiary)]">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day) => {
                const dayPosts = getPostsForDate(day);
                const isToday =
                  day === today.getDate() &&
                  currentMonth === today.getMonth() &&
                  currentYear === today.getFullYear();
                const postCount = dayPosts.length;

                return (
                  <button
                    key={day}
                    className={`
                      relative aspect-square p-2 rounded-lg transition-all
                      ${isToday
                        ? 'bg-[var(--primary-500)] text-white font-bold'
                        : postCount > 0
                          ? 'bg-[var(--bg-tertiary)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                          : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                      }
                    `}
                  >
                    <span className="text-sm">{day}</span>
                    {postCount > 0 && !isToday && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-[var(--primary-400)]">
                        {postCount} post{postCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {isToday && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--accent-500)] rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[var(--primary-500)] rounded"></div>
              <span className="text-[var(--text-tertiary)]">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[var(--bg-elevated)] rounded"></div>
              <span className="text-[var(--text-tertiary)]">Has Posts</span>
            </div>
          </div>
        </div>

        {/* Right - Today's Schedule */}
        <div className="w-full md:w-[400px] p-6 bg-[var(--bg-secondary)]/50">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            📋 Today&apos;s Schedule ({monthNames[today.getMonth()]} {today.getDate()})
          </h3>

          <div className="space-y-4">
            {loading ? (
              <Card padding="md" variant="glass">
                <p className="text-sm text-[var(--text-tertiary)] text-center">Loading posts...</p>
              </Card>
            ) : todaysPosts.length === 0 ? (
              <Card padding="md" variant="glass">
                <p className="text-sm text-[var(--text-tertiary)] text-center">
                  No posts scheduled for today
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="mt-3"
                  onClick={() => setShowComposer(true)}
                >
                  Schedule First Post
                </Button>
              </Card>
            ) : (
              todaysPosts.map((post) => {
                const scheduledTime = new Date(post.scheduled_for).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                });

                return (
                  <Card key={post.id} padding="md" variant="glass">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-lg flex-shrink-0 flex items-center justify-center">
                        <span className="text-2xl">
                          {post.platforms.includes('instagram') ? '📷' :
                           post.platforms.includes('facebook') ? '👍' :
                           post.platforms.includes('linkedin') ? '💼' : '🐦'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-[var(--text-primary)] truncate">
                            {post.content.substring(0, 30)}
                            {post.content.length > 30 ? '...' : ''}
                          </h4>
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] mb-2">
                          📱 {post.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                        </p>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                              post.status === 'published'
                                ? 'bg-[var(--success)]/20 text-[var(--success)]'
                                : post.status === 'failed'
                                ? 'bg-red-500/20 text-red-500'
                                : 'bg-[var(--warning)]/20 text-[var(--warning)]'
                            }`}
                          >
                            {post.status === 'published' ? (
                              <>
                                <Check className="w-3 h-3" />
                                Published {scheduledTime}
                              </>
                            ) : post.status === 'failed' ? (
                              <>Failed</>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                Scheduled {scheduledTime}
                              </>
                            )}
                          </span>
                        </div>
                        {post.status === 'scheduled' && (
                          <div className="flex gap-2 mt-3">
                            <Button variant="ghost" size="sm" fullWidth>
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" fullWidth>
                              Post Now
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Quick Stats */}
          <Card padding="md" className="mt-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-3">All Time</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-tertiary)]">Total Posts</span>
                <span className="text-[var(--text-primary)] font-semibold">{posts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-tertiary)]">Published</span>
                <span className="text-[var(--text-primary)] font-semibold">{publishedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-tertiary)]">Scheduled</span>
                <span className="text-[var(--text-primary)] font-semibold">{scheduledCount}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Post Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card padding="none" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--bg-tertiary)] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Create Post</h2>
              <button
                onClick={() => {
                  setShowComposer(false);
                  setError('');
                  setPostContent('');
                  setSelectedPlatforms([]);
                  setMediaUrls([]);
                  setScheduleDate('');
                }}
                className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-3">
                  Select Platforms *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`
                        p-4 rounded-lg border-2 transition-all
                        ${selectedPlatforms.includes(platform.id)
                          ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/10'
                          : 'border-[var(--bg-tertiary)] hover:border-[var(--bg-elevated)]'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{platform.emoji}</div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        {platform.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Post Content */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Content *
                </label>
                <Input
                  multiline
                  rows={6}
                  placeholder="What's on your mind? Share your story..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  {postContent.length} characters
                </p>
              </div>

              {/* Media URLs */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Media URLs (optional)
                </label>
                <div className="space-y-2">
                  {mediaUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...mediaUrls];
                          newUrls[index] = e.target.value;
                          setMediaUrls(newUrls);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== index))}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ImageIcon className="w-4 h-4" />}
                    onClick={() => setMediaUrls([...mediaUrls, ''])}
                  >
                    Add Media URL
                  </Button>
                </div>
              </div>

              {/* Schedule Date */}
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Schedule (optional)
                </label>
                <Input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  placeholder="Leave empty to post now"
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  {scheduleDate
                    ? `Will post on ${new Date(scheduleDate).toLocaleString()}`
                    : 'Post will be published immediately'}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <Card variant="bordered" padding="md" className="bg-red-500/10 border-red-500/20">
                  <p className="text-sm text-red-500">❌ {error}</p>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setShowComposer(false);
                    setError('');
                    setPostContent('');
                    setSelectedPlatforms([]);
                    setMediaUrls([]);
                    setScheduleDate('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  icon={<Send className="w-4 h-4" />}
                  loading={posting}
                  disabled={!postContent.trim() || selectedPlatforms.length === 0 || posting}
                  onClick={handleCreatePost}
                >
                  {posting
                    ? 'Posting...'
                    : scheduleDate
                    ? 'Schedule Post'
                    : 'Post Now'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
