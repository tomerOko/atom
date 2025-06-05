import { Logtail } from '@logtail/node';
import { LoggerPubSub } from '../../logger/logPubSub';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const startLoggingToLogtail = (logtailSourceToken: string, logtailEndpoint: string) => {
  const logtailLogger = new Logtail(logtailSourceToken, {
    endpoint: logtailEndpoint,
  });

  LoggerPubSub.consume(log => {
    const { level, message, data } = log;
    const logMethod = (level as LogLevel) in logtailLogger ? (level as LogLevel) : 'info';
    logtailLogger[logMethod](message, { data });
  });
};
