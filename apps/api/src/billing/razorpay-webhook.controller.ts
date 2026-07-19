import { Controller, Post, Headers, Req, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { SubscriptionService } from './subscription.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Controller('billing/webhook')
export class RazorpayWebhookController {
  private readonly webhookSecret: string;

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly configService: ConfigService,
  ) {
    this.webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') || '';
  }

  @Post()
  async handleWebhook(@Headers('x-razorpay-signature') signature: string, @Req() req: Request) {
    if (!signature) {
      throw new BadRequestException('Missing x-razorpay-signature header');
    }

    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Razorpay Webhook signature verification failed');
      throw new BadRequestException('Invalid signature');
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (event.event === 'payment_link.paid') {
      const paymentLink = event.payload?.payment_link?.entity || {};
      const paymentEntity = event.payload?.payment?.entity || {};
      const notes = paymentLink.notes || {};
      const userId = notes.userId;
      const plan = notes.plan;
      const cycle = notes.cycle || 'MONTHLY';
      const paymentId = paymentEntity.id || paymentLink.payment_id;
      const paymentLinkId = paymentLink.id;
      let billingDetails: any = null;
      try {
        billingDetails = notes.billingDetails ? JSON.parse(notes.billingDetails) : null;
      } catch (e) {
        // ignore parse error
      }

      if (userId && plan) {
        await this.subscriptionService.changePlan(
          userId,
          plan,
          cycle,
          paymentId,
          paymentLinkId,
          billingDetails,
        );
      }
    }

    return { received: true };
  }
}
