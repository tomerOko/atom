import axios from 'axios';
import { LoggerPubSub } from '../../logger/logPubSub';

class LogsSender {
  private batchedLogs: Array<object> = [];
  private batchInterval30Seconds = 30000;
  private timer: NodeJS.Timeout | null = null;
  private static logstashUrl: string;
  private static packagePrefix: string;

  constructor() {
    this.startBatchTimer();
  }

  public static initialize(logstashUrl: string, packagePrefix: string) {
    LogsSender.logstashUrl = logstashUrl;
    LogsSender.packagePrefix = packagePrefix;
  }

  private startBatchTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = setInterval(async () => {
      await this.sendBatch();
    }, this.batchInterval30Seconds);
  }

  public addLog(log: object) {
    this.batchedLogs.push(log);
  }

  private async sendBatch() {
    if (this.batchedLogs.length === 0) {
      return;
    }

    const currentBatch = [...this.batchedLogs];
    this.batchedLogs = [];

    if (!LogsSender.logstashUrl) {
      this.batchedLogs = [];
      return;
    }
    try {
      const response = await axios.post(LogsSender.logstashUrl, currentBatch, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(
        `${LogsSender.packagePrefix} Success: Batch of ${currentBatch.length} logs sent successfully:`,
        response.data
      );
    } catch (error) {
      console.error(`${LogsSender.packagePrefix} Error: sending batch of logs:`, error);
      this.batchedLogs = [];
    }
  }

  public async flush() {
    await this.sendBatch();
  }

  public destroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const startLoggingToLogstash = () => {
  const logsSender = new LogsSender();
  LoggerPubSub.consume(log => {
    const { level, message, data } = log;
    logsSender.addLog({ level, message, ...data });
  });
};
