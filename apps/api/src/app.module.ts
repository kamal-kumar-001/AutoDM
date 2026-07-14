import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { LoggerModule } from './common/logger/logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { EncryptionModule } from './common/encryption/encryption.module';
import { InstagramModule } from './instagram/instagram.module';
import { CampaignModule } from './campaign/campaign.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    PrismaModule,
    AuthModule,
    MailModule,
    EncryptionModule,
    InstagramModule,
    CampaignModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
