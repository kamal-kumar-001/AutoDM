import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '@autodm/types';
import { AppLogger } from '../logger/logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {
    this.logger.setContext('HttpExceptionFilter');
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: unknown = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (res && typeof res === 'object') {
        const responseObj = res as Record<string, unknown>;
        message = Array.isArray(responseObj.message)
          ? String(responseObj.message[0])
          : String(responseObj.message || message);
        code = String(responseObj.error || 'BAD_REQUEST');
        if (Array.isArray(responseObj.message)) {
          details = responseObj.message;
        } else {
          details = responseObj;
        }
      } else if (typeof res === 'string') {
        message = res;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      code = exception.name;
    }

    // Format error log message
    this.logger.error(
      `[${request.method}] ${request.url} - Status: ${status} - Error: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        message,
        code: String(code).toUpperCase().replace(/\s+/g, '_'),
        ...(details ? { details } : {}),
      },
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
