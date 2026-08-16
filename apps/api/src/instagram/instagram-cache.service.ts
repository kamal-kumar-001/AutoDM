import { Injectable } from '@nestjs/common';

export interface CachedPost {
  id: string;
  caption: string;
  mediaUrl: string;
  permalink: string;
  timestamp: string;
  likes: number;
  comments: number;
}

/**
 * Simple in-memory cache for Instagram media fetched by the background job.
 * Replace with Redis-backed store for multi-instance deployments.
 */
@Injectable()
export class InstagramCacheService {
  private readonly cache = new Map<string, { posts: CachedPost[]; timestamp: number }>();
  private readonly TTL_MS = 5 * 60 * 1000; // 5 minutes TTL

  set(instagramId: string, posts: CachedPost[]) {
    this.cache.set(instagramId, { posts, timestamp: Date.now() });
  }

  get(instagramId: string): CachedPost[] | undefined {
    const entry = this.cache.get(instagramId);
    if (!entry) return undefined;
    // Check TTL expiration
    if (Date.now() - entry.timestamp > this.TTL_MS) {
      this.cache.delete(instagramId);
      return undefined;
    }
    return entry.posts;
  }

  clear(instagramId: string) {
    this.cache.delete(instagramId);
  }
}
