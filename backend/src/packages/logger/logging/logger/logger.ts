import { Injectable, LoggerService, LogLevel, Scope } from '@nestjs/common';
import { getTransactionId } from '../../async-hooks';
import { clearObject } from './clear-object';
import { LoggerPubSub } from './logPubSub';

@Injectable({ scope: Scope.DEFAULT })
export class AppLogger implements LoggerService {
  private static serviceName: string;
  private static logLevel: LogLevel;
  private static logMaxLength: number;

  public static initialize(serviceName: string, logLevel: LogLevel, logMaxLength: number) {
    AppLogger.serviceName = serviceName;
    AppLogger.logLevel = logLevel;
    AppLogger.logMaxLength = logMaxLength;
  }

  private static logMessage(level: string, message: any, optionalParams: any[]): void {
    if (!this.shouldLog(level)) return;
    const { data, message: formattedMessage } = this.parseParams(message, optionalParams);
    const prefix = this.buildColorfulLogPrefix(level);
    LoggerPubSub.publish({ message: formattedMessage, level, data, prefix });
  }

  private static shouldLog(level: string): boolean {
    const logLevels = {
      error: 0,
      warn: 1,
      log: 2,
      debug: 3,
      verbose: 4,
    };

    const configLevel = logLevels[AppLogger.logLevel as keyof typeof logLevels] || logLevels.log;
    const messageLevel = logLevels[level as keyof typeof logLevels] || logLevels.log;

    return messageLevel <= configLevel;
  }

  private static parseParams(
    messageInput: any,
    optionalParams: any[]
  ): { message: string; data: Record<string, any> } {
    const message = this.isLogParams(messageInput) ? messageInput.message : messageInput;
    const module = this.isLogParams(messageInput) ? messageInput.module : '';
    const data = clearObject(
      {
        module,
        requestId: getTransactionId(),
        optionalParams,
      },
      AppLogger.logMaxLength
    );
    return {
      message,
      data,
    };
  }

  private static isLogParams(message: any): message is {
    message: string;
    module: string;
  } {
    return (
      typeof message === 'object' && message !== null && 'message' in message && 'module' in message
    );
  }

  private static buildColorfulLogPrefix(level: string): string {
    const blue = '\x1b[34m';
    const red = '\x1b[31m';
    const yellow = '\x1b[33m';
    const green = '\x1b[32m';
    const resetColor = '\x1b[0m';
    const white = '\x1b[37m';

    const colorMap = {
      info: blue,
      error: red,
      warn: yellow,
      debug: green,
    };

    const color = colorMap[level as keyof typeof colorMap] || white;

    const timestamp = new Date().toISOString();
    const requestId = getTransactionId();

    const logPrefix = `${color}[${timestamp}] [${level.toUpperCase()}] [${requestId}]${resetColor}`;
    return logPrefix;
  }

  info(message: any, ...optionalParams: any[]): any {
    AppLogger.logMessage('info', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]): any {
    AppLogger.logMessage('error', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): any {
    AppLogger.logMessage('warn', message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]): any {
    AppLogger.logMessage('debug', message, optionalParams);
  }

  //ALIASES
  verbose(message: any, ...optionalParams: any[]): any {
    AppLogger.logMessage('info', message, optionalParams);
  }

  warning(message: any, ...optionalParams: any[]): any {
    AppLogger.logMessage('warn', message, optionalParams);
  }

  exception(message: any, ...optionalParams: any[]): any {
    AppLogger.logMessage('warn', message, optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]): any {
    AppLogger.logMessage('error', message, optionalParams);
  }

  log(message: any, ...optionalParams: any[]): any {
    AppLogger.logMessage('info', message, optionalParams);
  }

  httpRequest(request: string, serviceName: any, endpoint: string, context: string): void {
    const message = `Making ${request} to ${serviceName || AppLogger.serviceName} - at ${endpoint}`;
    AppLogger.logMessage('info', message, [context]);
  }
}

export const appLogger = new AppLogger();
