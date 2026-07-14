import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Query,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '../config/config.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppLogger } from '../common/logger/logger.service';
import * as crypto from 'crypto';

@Controller('instagram/webhook')
export class WebhookController {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext('WebhookController');
  }

  @Get()
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string,
    @Res() res: Response,
  ) {
    const configuredToken = this.configService.get('META_WEBHOOK_VERIFY_TOKEN');

    if (mode === 'subscribe' && verifyToken === configuredToken) {
      this.logger.log('Meta Webhook challenge verified successfully');
      // Bypass global ResponseInterceptor to output raw plain-text challenge
      return res.status(HttpStatus.OK).send(challenge);
    }

    this.logger.warn(`Failed webhook verification challenge. Received token: ${verifyToken}`);
    throw new ForbiddenException('Webhook verification token mismatch');
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async receive(@Req() req: Request) {
    const signature = req.headers['x-hub-signature-256'] as string;
    const appSecret = this.configService.get('META_APP_SECRET');

    // 1. Signature Integrity Validation
    if (appSecret && appSecret !== 'change_me') {
      if (!signature) {
        this.logger.warn('Received webhook event without x-hub-signature-256 header.');
        throw new ForbiddenException('Missing signature header');
      }

      const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
      if (!rawBody) {
        this.logger.error('rawBody buffer is missing. Ensure NestFactory rawBody:true is set.');
        throw new InternalServerErrorException('Raw body buffer unavailable');
      }

      const hash = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');

      const expectedSignature = `sha256=${hash}`;

      if (signature !== expectedSignature) {
        this.logger.warn(
          `HMAC signature verification failed. Expected ${expectedSignature}, got ${signature}`,
        );
        throw new ForbiddenException('Invalid signature');
      }
    } else {
      this.logger.warn(
        'META_APP_SECRET not configured. Bypassing HMAC signature validation in developer mode.',
      );
    }

    // 2. Save incoming webhook payload to db
    const body = req.body;
    const entryId = body?.entry?.[0]?.id;

    try {
      await this.prisma.webhookEvent.create({
        data: {
          eventId: entryId ? `${entryId}_${Date.now()}` : undefined,
          payload: body,
          status: 'PENDING',
        },
      });
      this.logger.log(`Logged webhook event from Meta Entry ID: ${entryId || 'unknown'}`);
    } catch (error) {
      this.logger.error(
        'Failed to log Meta webhook event to DB',
        error instanceof Error ? error.stack : undefined,
      );
    }

    // 3. Immediately return 200 OK to keep Meta connection open
    return { received: true };
  }
}
