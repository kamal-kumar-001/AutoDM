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
import { WebhookRouterService } from './webhook-router.service';
import * as crypto from 'crypto';

@Controller('instagram/webhook')
export class WebhookController {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
    private readonly webhookRouter: WebhookRouterService,
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
      res.setHeader('Content-Type', 'text/plain');
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
    const body = req.body;
    const entryId = body?.entry?.[0]?.id;

    // 1. Log and save incoming webhook event to DB first for complete auditing
    let savedEventId: string | null = null;
    try {
      const saved = await this.prisma.webhookEvent.create({
        data: {
          eventId: entryId ? `${entryId}_${Date.now()}` : undefined,
          payload: body,
          status: 'PENDING',
        },
      });
      savedEventId = saved.id;
      this.logger.log(`Logged webhook event in DB. Entry ID: ${entryId || 'unknown'}`);
    } catch (error) {
      this.logger.error(
        'Failed to log Meta webhook event to DB',
        error instanceof Error ? error.stack : undefined,
      );
    }

    // 2. Signature Integrity Validation
    if (appSecret && appSecret !== 'change_me') {
      let isSignatureValid = true;
      let expectedSignature = '';

      if (!signature) {
        isSignatureValid = false;
      } else {
        const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
        if (!rawBody) {
          this.logger.error('rawBody buffer is missing. Ensure NestFactory rawBody:true is set.');
          throw new InternalServerErrorException('Raw body buffer unavailable');
        }

        const hash = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
        expectedSignature = `sha256=${hash}`;

        if (signature !== expectedSignature) {
          isSignatureValid = false;
        }
      }

      if (!isSignatureValid) {
        this.logger.warn(
          `HMAC signature verification failed. Expected ${expectedSignature || 'N/A'}, got ${signature || 'N/A'}`,
        );

        const nodeEnv = this.configService.get('NODE_ENV');
        if (nodeEnv === 'development') {
          this.logger.warn('Bypassing signature validation check in development mode.');
        } else {
          if (savedEventId) {
            await this.prisma.webhookEvent
              .update({
                where: { id: savedEventId },
                data: { status: 'FAILED', errorMessage: 'Invalid HMAC signature validation' },
              })
              .catch(() => null);
          }
          throw new ForbiddenException('Invalid signature');
        }
      }
    } else {
      this.logger.warn(
        'META_APP_SECRET not configured. Bypassing HMAC signature validation in developer mode.',
      );
    }

    // 3. Fire-and-forget routing
    if (savedEventId) {
      this.webhookRouter
        .route(savedEventId, body)
        .catch((err) => this.logger.error('WebhookRouter unhandled error', err?.stack));
    }

    return { received: true };
  }
}
