import { Injectable, ConsoleLogger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends ConsoleLogger {
  log(message: unknown, context?: string) {
    const sanitized = this.sanitize(message);
    if (this.isProduction()) {
      this.logJson('INFO', sanitized, context);
    } else {
      super.log(sanitized, context);
    }
  }

  error(message: unknown, stack?: string, context?: string) {
    const sanitized = this.sanitize(message);
    if (this.isProduction()) {
      this.logJson('ERROR', sanitized, context, stack);
    } else {
      super.error(sanitized, stack, context);
    }
  }

  warn(message: unknown, context?: string) {
    const sanitized = this.sanitize(message);
    if (this.isProduction()) {
      this.logJson('WARN', sanitized, context);
    } else {
      super.warn(sanitized, context);
    }
  }

  debug(message: unknown, context?: string) {
    const sanitized = this.sanitize(message);
    if (this.isProduction()) {
      this.logJson('DEBUG', sanitized, context);
    } else {
      super.debug(sanitized, context);
    }
  }

  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private sanitize(input: unknown): unknown {
    if (!input) return input;
    if (typeof input === 'string') {
      return input
        .replace(/("password"\s*:\s*")([^"]+)(")/gi, '$1[REDACTED]$3')
        .replace(/(access_token=)[^&]+/gi, '$1[REDACTED]')
        .replace(/(bearer\s+)[a-z0-9\-_.]+/gi, '$1[REDACTED]');
    }
    if (typeof input === 'object') {
      try {
        const str = JSON.stringify(input);
        return JSON.parse(this.sanitize(str) as string);
      } catch {
        return input;
      }
    }
    return input;
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
