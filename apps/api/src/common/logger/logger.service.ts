import { Injectable, ConsoleLogger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {
  log(message: unknown, context?: string) {
    if (this.isProduction()) {
      this.logJson('INFO', message, context);
    } else {
      super.log(message, context);
    }
  }

  error(message: unknown, stack?: string, context?: string) {
    if (this.isProduction()) {
      this.logJson('ERROR', message, context, stack);
    } else {
      super.error(message, stack, context);
    }
  }

  warn(message: unknown, context?: string) {
    if (this.isProduction()) {
      this.logJson('WARN', message, context);
    } else {
      super.warn(message, context);
    }
  }

  debug(message: unknown, context?: string) {
    if (this.isProduction()) {
      this.logJson('DEBUG', message, context);
    } else {
      super.debug(message, context);
    }
  }

  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private logJson(level: string, message: unknown, context?: string, stack?: string) {
    const logPayload = {
      timestamp: new Date().toISOString(),
      level,
      context: context || this.context || 'AppLogger',
      message: typeof message === 'object' ? message : String(message),
      ...(stack && { stack }),
    };
    console.log(JSON.stringify(logPayload));
  }
}
