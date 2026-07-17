import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService } from '../billing/subscription.service';

export const PLAN_LIMIT_KEY = 'plan_limit';

/** Decorator — usage: @CheckLimit('max_campaigns') */
export function CheckLimit(metric: string) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(PLAN_LIMIT_KEY, metric, descriptor.value);
    return descriptor;
  };
}

/**
 * Guard that checks whether a user is within their plan's usage limits.
 * Decorate a route with @CheckLimit('metric') to enforce.
 */
@Injectable()
export class UsageLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metric = this.reflector.get<string>(PLAN_LIMIT_KEY, context.getHandler());
    if (!metric) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const { allowed, used, limit } = await this.subscriptionService.checkLimit(user.id, metric);

    if (!allowed) {
      throw new ForbiddenException(
        `Plan limit reached: ${metric} (${used}/${limit}). Upgrade your plan to continue.`,
      );
    }

    return true;
  }
}
