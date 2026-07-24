import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { FeatureFlagService } from '../../billing/feature-flag.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Plan } from '@prisma/client';

@Injectable()
export class EmailVerificationGuard implements CanActivate {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    if (!user) return false;

    // Load full user details
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { subscription: true },
    });

    if (!dbUser) return false;

    // Check if the feature flag for email verification gating is enabled for their plan
    const plan = dbUser.subscription?.plan || Plan.FREE;
    const isGated = await this.featureFlagService.isEnabled('EMAIL_VERIFICATION_REQUIRED', plan);

    if (isGated && !dbUser.isVerified) {
      throw new ForbiddenException('Please verify your email address to access this feature.');
    }

    return true;
  }
}
