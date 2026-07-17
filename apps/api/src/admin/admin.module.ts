import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BillingModule } from '../billing/billing.module';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { QUEUE_NAMES } from '../queue/constants';

@Module({
  imports: [
    BillingModule,
    MonitoringModule,
    BullModule.registerQueue(
      { name: QUEUE_NAMES.INSTAGRAM_MEDIA_FETCH },
      { name: QUEUE_NAMES.SEND_DM },
    ),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
