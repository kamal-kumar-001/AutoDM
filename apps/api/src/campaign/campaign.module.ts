import { Module } from '@nestjs/common';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { AuditLogService } from '../auth/audit-log.service';

@Module({
  controllers: [CampaignController],
  providers: [CampaignService, AuditLogService],
  exports: [CampaignService],
})
export class CampaignModule {}
