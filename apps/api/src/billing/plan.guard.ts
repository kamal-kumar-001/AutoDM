import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Plan } from '@prisma/client';
import { SubscriptionService } from './subscription.service';

export const REQUIRED_PLAN_KEY = 'required_plan';
export const RequiresPlan =
  (...plans: Plan[]) =>
  (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(REQUIRED_PLAN_KEY, plans, descriptor.value);
    return descriptor;
  };

/**
 * Guard that ensures the user's active plan is in the allowed list.
 * Usage: @RequiresPlan(Plan.PRO, Plan.ENTERPRISE)
 */
@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlans = this.reflector.get<Plan[]>(REQUIRED_PLAN_KEY, context.getHandler());
    if (!requiredPlans || requiredPlans.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const sub = await this.subscriptionService.getOrCreate(user.id);

    if (!requiredPlans.includes(sub.plan)) {
      throw new ForbiddenException(
        `This feature requires a ${requiredPlans.join(' or ')} plan. Current plan: ${sub.plan}.`,
      );
    }

    return true;
  }
}
