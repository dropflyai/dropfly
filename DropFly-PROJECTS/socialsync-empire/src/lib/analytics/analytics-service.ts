import { createClient } from '@/lib/supabase/server';
import { getAyrshareClient } from '@/lib/ayrshare/client';

interface AnalyticsData {
  views: number;
  engagement: number;
  reach: number;
  avgRating: number;
}

/**
 * Analytics Service
 * Fetches real-time analytics from social media platforms via Ayrshare
 */
export class AnalyticsService {
  /**
   * Get real-time analytics for a user from social media platforms
   * Fetches data from Ayrshare API based on user's published posts
   *
   * @param userId - The user's ID
   * @param daysAgo - Number of days to look back (default: 7)
   * @returns Aggregated analytics data
   */
  static async getUserAnalytics(userId: string, daysAgo: number = 7): Promise<AnalyticsData> {
    try {
      const supabase = await createClient();

      // Calculate date threshold
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

      // Fetch user's published posts from database with Ayrshare IDs
      const { data: posts, error } = await supabase
        .from('posts')
        .select('ayrshare_id')
        .eq('user_id', userId)
        .eq('status', 'published')
        .not('ayrshare_id', 'is', null)
        .gte('created_at', dateThreshold.toISOString());

      if (error) {
        console.error('[Analytics Service] Error fetching posts:', error);
        return { views: 0, engagement: 0, reach: 0, avgRating: 0 };
      }

      // If no posts, return zeros
      if (!posts || posts.length === 0) {
        return { views: 0, engagement: 0, reach: 0, avgRating: 0 };
      }

      // Extract Ayrshare IDs
      const ayrshareIds = posts
        .map(p => p.ayrshare_id)
        .filter((id): id is string => id !== null);

      if (ayrshareIds.length === 0) {
        return { views: 0, engagement: 0, reach: 0, avgRating: 0 };
      }

      // Fetch analytics from Ayrshare for all posts
      const ayrshare = getAyrshareClient();
      const analytics = await ayrshare.getAggregatedAnalytics(ayrshareIds);

      return {
        views: analytics.totalViews,
        engagement: analytics.engagement,
        reach: analytics.reach,
        avgRating: 0, // Placeholder for future rating system
      };

    } catch (error) {
      console.error('[Analytics Service] Error:', error);
      // Return zeros on error rather than failing
      return { views: 0, engagement: 0, reach: 0, avgRating: 0 };
    }
  }

  /**
   * Get analytics for a specific post
   */
  static async getPostAnalytics(ayrshareId: string) {
    try {
      const ayrshare = getAyrshareClient();
      return await ayrshare.getPostAnalytics(ayrshareId);
    } catch (error) {
      console.error('[Analytics Service] Error fetching post analytics:', error);
      return null;
    }
  }

  /**
   * Get platform-level analytics (account metrics)
   */
  static async getPlatformAnalytics(platforms: string[]) {
    try {
      const ayrshare = getAyrshareClient();
      return await ayrshare.getSocialAnalytics(platforms);
    } catch (error) {
      console.error('[Analytics Service] Error fetching platform analytics:', error);
      return null;
    }
  }
}
