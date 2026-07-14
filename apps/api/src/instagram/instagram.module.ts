import { Module } from '@nestjs/common';
import { InstagramController } from './instagram.controller';
import { InstagramService } from './instagram.service';
import { WebhookController } from './webhook.controller';
import { AuditLogService } from '../auth/audit-log.service';

@Module({
  controllers: [InstagramController, WebhookController],
  providers: [InstagramService, AuditLogService],
  exports: [InstagramService],
})
export class InstagramModule {}
