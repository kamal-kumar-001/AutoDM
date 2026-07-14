import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Get('connect')
  @UseGuards(JwtAuthGuard)
  connect(@GetUser() user: { id: string }) {
    const authUrl = this.instagramService.getAuthUrl(user.id);
    return { url: authUrl };
  }

  @Get('callback')
  @Redirect()
  async callback(@Query('code') code: string, @Query('state') state: string) {
    if (!code || !state) {
      // If code/state is missing, redirect to frontend with error state
      return { url: 'http://localhost:3000/settings?error=oauth_missing_parameters' };
    }

    try {
      await this.instagramService.exchangeCodeForTokens(code, state);
      return { url: 'http://localhost:3000/settings?success=instagram_connected' };
    } catch (error) {
      const errMsg =
        error instanceof Error ? encodeURIComponent(error.message) : 'oauth_exchange_failed';
      return { url: `http://localhost:3000/settings?error=${errMsg}` };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async disconnect(@Param('id') id: string, @GetUser() user: { id: string }) {
    return this.instagramService.disconnectAccount(id, user.id);
  }
}
