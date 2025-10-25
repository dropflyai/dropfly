const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY;
const AYRSHARE_API_URL = 'https://app.ayrshare.com/api';

export interface AyrsharePostRequest {
  post: string;
  platforms: ('facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube')[];
  mediaUrls?: string[];
  scheduleDate?: string; // ISO 8601 format
  profileKeys?: string[];
}

export interface AyrsharePostResponse {
  status: string;
  id: string;
  post: string;
  refId: string;
  errors?: unknown[];
}

export class AyrshareClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || AYRSHARE_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('Ayrshare API key is required');
    }
  }

  async post(data: AyrsharePostRequest): Promise<AyrsharePostResponse> {
    const response = await fetch(`${AYRSHARE_API_URL}/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to post to social media');
    }

    return response.json();
  }

  async schedulePost(data: AyrsharePostRequest): Promise<AyrsharePostResponse> {
    if (!data.scheduleDate) {
      throw new Error('Schedule date is required for scheduled posts');
    }
    return this.post(data);
  }

  async getPost(postId: string) {
    const response = await fetch(`${AYRSHARE_API_URL}/post/${postId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }

    return response.json();
  }

  async deletePost(postId: string) {
    const response = await fetch(`${AYRSHARE_API_URL}/delete/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete post');
    }

    return response.json();
  }

  async getHistory(platform?: string) {
    const url = platform
      ? `${AYRSHARE_API_URL}/history?platform=${platform}`
      : `${AYRSHARE_API_URL}/history`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch history');
    }

    return response.json();
  }

  async getProfiles() {
    const response = await fetch(`${AYRSHARE_API_URL}/profiles`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profiles');
    }

    return response.json();
  }
}

// Lazy-load Ayrshare client to avoid build-time execution
export function getAyrshareClient(): AyrshareClient {
  return new AyrshareClient();
}
