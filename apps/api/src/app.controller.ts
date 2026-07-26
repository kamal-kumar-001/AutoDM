import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { GetUser } from './auth/decorators/get-user.decorator';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getIndex() {
    return {
      name: 'AutoDM API',
      version: '1.0.0',
      status: 'healthy',
    };
  }

  @Get('health')
  checkHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
    };
  }

  @Get('pricing-promo')
  async getPricingPromo() {
    const plans = await this.prisma.billingPlan.findMany({
      orderBy: { priceMonthly: 'asc' },
    });

    const settings = await this.prisma.systemSetting.findMany({
      where: {
        key: {
          in: ['promo_banner_text', 'promo_banner_enabled', 'promo_discount_percent'],
        },
      },
    });

    const settingsMap = settings.reduce(
      (acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      },
      {} as Record<string, string>,
    );

    const featureFlags = await this.prisma.featureFlag.findMany({
      orderBy: { key: 'asc' },
    });

    return {
      plans,
      promo: {
        text: settingsMap['promo_banner_text'] || '',
        enabled: settingsMap['promo_banner_enabled'] === 'true',
        discountPercent: parseInt(settingsMap['promo_discount_percent'] || '0', 10),
      },
      featureFlags,
    };
  }

  @Post('support/tickets')
  @UseGuards(JwtAuthGuard)
  async createSupportTicket(
    @GetUser() user: { id: string },
    @Body() body: { subject: string; message: string },
  ) {
    return this.prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject: body.subject,
        message: body.message,
      },
    });
  }
}
