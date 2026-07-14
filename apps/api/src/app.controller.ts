import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getIndex() {
    return {
      name: 'AutoDM API',
      version: '1.0.0',
      status: 'healthy',
    };
  }

  @Get('health')
  checkHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
    };
  }
}
