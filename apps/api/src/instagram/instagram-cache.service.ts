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
  private readonly cache = new Map<string, CachedPost[]>();

  set(instagramId: string, posts: CachedPost[]) {
    this.cache.set(instagramId, posts);
  }

  get(instagramId: string): CachedPost[] | undefined {
    return this.cache.get(instagramId);
  }

  clear(instagramId: string) {
    this.cache.delete(instagramId);
  }
}
