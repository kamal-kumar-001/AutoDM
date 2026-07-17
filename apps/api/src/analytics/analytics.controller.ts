import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  getSummary(@GetUser() user: { id: string }) {
    return this.analyticsService.getSummary(user.id);
  }

  @Get('chart')
  getChart(@GetUser() user: { id: string }) {
    return this.analyticsService.getChartData(user.id);
  }

  @Get('rates')
  getRates(@GetUser() user: { id: string }) {
    return this.analyticsService.getRates(user.id);
  }

  @Get('daily-usage')
  getDailyUsage(@GetUser() user: { id: string }, @Query('days') days?: string) {
    return this.analyticsService.getDailyUsage(user.id, days ? parseInt(days, 10) : 30);
  }

  @Get('top-posts')
  getTopPosts(@GetUser() user: { id: string }, @Query('limit') limit?: string) {
    return this.analyticsService.getTopPosts(user.id, limit ? parseInt(limit, 10) : 10);
  }

  @Get('top-keywords')
  getTopKeywords(@GetUser() user: { id: string }, @Query('limit') limit?: string) {
    return this.analyticsService.getTopKeywords(user.id, limit ? parseInt(limit, 10) : 10);
  }

  @Get('activity')
  getActivity(@GetUser() user: { id: string }) {
    return this.analyticsService.getRecentActivity(user.id, 15);
  }

  /** Admin-only: all creator usage */
  @Get('creators')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getCreatorUsage(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.analyticsService.getCreatorUsageStats(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
