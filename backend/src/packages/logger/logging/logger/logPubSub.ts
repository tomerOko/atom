import { EventEmitter } from 'events';

export interface LogEvent {
  message: string;
  level: string;
  data: Record<string, any>;
  prefix: string;
}

export class LoggerPubSub {
  private static emitter = new EventEmitter();

  public static publish(log: LogEvent): void {
    LoggerPubSub.emitter.emit('log', log);
  }

  public static consume(callback: (log: LogEvent) => void): void {
    LoggerPubSub.emitter.on('log', callback);
  }
}
