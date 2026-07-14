import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { Env } from './env.schema';

@Injectable()
export class ConfigService {
  constructor(private nestConfigService: NestConfigService<Env, true>) {}

  get<K extends keyof Env>(key: K): Env[K] {
    return this.nestConfigService.get(key, { infer: true });
  }

  get isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  get isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  get isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }
}
