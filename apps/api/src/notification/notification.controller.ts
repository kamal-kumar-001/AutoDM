import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@GetUser() user: { id: string }) {
    return this.notificationService.getUserNotifications(user.id);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @GetUser() user: { id: string }) {
    await this.notificationService.markAsRead(user.id, id);
    return { success: true };
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@GetUser() user: { id: string }) {
    await this.notificationService.markAllAsRead(user.id);
    return { success: true };
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @GetUser() user: { id: string }) {
    await this.notificationService.deleteNotification(user.id, id);
    return { success: true };
  }
}
