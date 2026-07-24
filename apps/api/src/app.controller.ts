import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

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

    return {
      plans,
      promo: {
        text: settingsMap['promo_banner_text'] || '',
        enabled: settingsMap['promo_banner_enabled'] === 'true',
        discountPercent: parseInt(settingsMap['promo_discount_percent'] || '0', 10),
      },
    };
  }
}
