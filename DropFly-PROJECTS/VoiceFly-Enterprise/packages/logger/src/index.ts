/**
 * VoiceFly Enterprise Logging System
 * Centralized logging with crash recovery, audit trails, and monitoring
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

export interface LogContext {
  userId?: string;
  sessionId?: string;
  callId?: string;
  organizationId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug',
  AUDIT = 'audit',
  PERFORMANCE = 'performance',
  SECURITY = 'security'
}

class VoiceFlyLogger {
  private logger: winston.Logger;
  private auditLogger: winston.Logger;
  private securityLogger: winston.Logger;
  private performanceLogger: winston.Logger;
  private crashLogger: winston.Logger;

  constructor() {
    this.ensureLogDirectories();
    this.initializeLoggers();
    this.setupProcessHandlers();
  }

  private ensureLogDirectories(): void {
    const logDirs = [
      'logs/app',
      'logs/system', 
      'logs/audit',
      'logs/crash',
      'logs/security',
      'logs/performance'
    ];

    logDirs.forEach(dir => {
      const fullPath = path.resolve(dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  private initializeLoggers(): void {
    const logFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${metaStr}`;
      })
    );

    // Main Application Logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      transports: [
        new DailyRotateFile({
          filename: 'logs/app/voicefly-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '30d',
          zippedArchive: true
        }),
        new DailyRotateFile({
          filename: 'logs/app/voicefly-error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '100m',
          maxFiles: '90d',
          zippedArchive: true
        })
      ]
    });

    // Audit Logger (Compliance & Security)
    this.auditLogger = winston.createLogger({
      format: logFormat,
      transports: [
        new DailyRotateFile({
          filename: 'logs/audit/audit-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '50m',
          maxFiles: '365d', // Keep audit logs for 1 year
          zippedArchive: true
        })
      ]
    });

    // Security Logger
    this.securityLogger = winston.createLogger({
      format: logFormat,
      transports: [
        new DailyRotateFile({
          filename: 'logs/security/security-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '50m',
          maxFiles: '365d',
          zippedArchive: true
        })
      ]
    });

    // Performance Logger
    this.performanceLogger = winston.createLogger({
      format: logFormat,
      transports: [
        new DailyRotateFile({
          filename: 'logs/performance/performance-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '200m',
          maxFiles: '7d',
          zippedArchive: true
        })
      ]
    });

    // Crash Logger
    this.crashLogger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new DailyRotateFile({
          filename: 'logs/crash/crash-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '90d',
          zippedArchive: true
        })
      ]
    });

    // Add console logging in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({ format: consoleFormat }));
    }
  }

  private setupProcessHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      this.crash('Uncaught Exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });

    // Handle unhandled promise rejections  
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      this.crash('Unhandled Promise Rejection', { reason, promise: promise.toString() });
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      this.info('Received SIGTERM, shutting down gracefully');
      this.logger.end();
      this.auditLogger.end();
      this.securityLogger.end();
      this.performanceLogger.end();
      this.crashLogger.end();
    });
  }

  // Core logging methods
  info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  error(message: string, context?: LogContext): void {
    this.logger.error(message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }

  // Specialized logging methods
  audit(action: string, context: LogContext): void {
    this.auditLogger.info('AUDIT', {
      action,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  security(event: string, context: LogContext): void {
    this.securityLogger.warn('SECURITY_EVENT', {
      event,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  performance(metric: string, duration: number, context?: LogContext): void {
    this.performanceLogger.info('PERFORMANCE_METRIC', {
      metric,
      duration,
      timestamp: new Date().toISOString(),
      ...context
    });
  }

  crash(error: string, context?: Record<string, any>): void {
    this.crashLogger.error('APPLICATION_CRASH', {
      error,
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      },
      ...context
    });
  }

  // Voice-specific logging methods
  voiceCallStarted(callId: string, context: LogContext): void {
    this.audit('VOICE_CALL_STARTED', { callId, ...context });
    this.info(`Voice call started: ${callId}`, context);
  }

  voiceCallEnded(callId: string, duration: number, outcome: string, context: LogContext): void {
    this.audit('VOICE_CALL_ENDED', { callId, duration, outcome, ...context });
    this.performance('voice_call_duration', duration, { callId, ...context });
    this.info(`Voice call ended: ${callId} (${duration}ms) - ${outcome}`, context);
  }

  webResearchStarted(researchId: string, query: string, context: LogContext): void {
    this.audit('WEB_RESEARCH_STARTED', { researchId, query, ...context });
    this.info(`Web research started: ${researchId} - ${query}`, context);
  }

  webResearchCompleted(researchId: string, duration: number, results: number, context: LogContext): void {
    this.audit('WEB_RESEARCH_COMPLETED', { researchId, duration, results, ...context });
    this.performance('web_research_duration', duration, { researchId, ...context });
    this.info(`Web research completed: ${researchId} (${duration}ms) - ${results} results`, context);
  }

  // Health check logging
  healthCheck(component: string, status: 'healthy' | 'unhealthy', details?: Record<string, any>): void {
    const level = status === 'healthy' ? 'info' : 'error';
    this.logger[level](`Health check: ${component} - ${status}`, { component, status, ...details });
  }

  // Metrics logging
  metric(name: string, value: number, unit?: string, context?: LogContext): void {
    this.performanceLogger.info('METRIC', {
      name,
      value,
      unit,
      timestamp: new Date().toISOString(),
      ...context
    });
  }
}

// Export singleton instance
export const logger = new VoiceFlyLogger();

// Export helper functions for common patterns
export function withLogging<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  context?: LogContext
): T {
  return ((...args: Parameters<T>) => {
    const start = Date.now();
    logger.debug(`Starting: ${name}`, context);
    
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result
          .then((value) => {
            logger.performance(name, Date.now() - start, context);
            logger.debug(`Completed: ${name}`, context);
            return value;
          })
          .catch((error) => {
            logger.error(`Failed: ${name}`, { error: error.message, ...context });
            throw error;
          });
      } else {
        logger.performance(name, Date.now() - start, context);
        logger.debug(`Completed: ${name}`, context);
        return result;
      }
    } catch (error: any) {
      logger.error(`Failed: ${name}`, { error: error.message, ...context });
      throw error;
    }
  }) as T;
}

export default logger;