import { LoggerPubSub } from '../../logger/logPubSub';

type ConsoleLogLevel = 'log' | 'error' | 'warn' | 'debug' | 'info';

export const startLoggingToConsole = () => {
  LoggerPubSub.consume(log => {
    const { level, prefix, data, message } = log;
    const consoleMethod =
      (level as ConsoleLogLevel) in console ? (level as ConsoleLogLevel) : 'log';
    console[consoleMethod](prefix, message, data);
  });
};
