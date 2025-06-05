import amqp, { Channel, ChannelModel, ConsumeMessage } from 'amqplib';
import { appLogger, LogAllMethods } from './logger';
import { getTransactionId, setTransactionId } from './logger/async-hooks';

@LogAllMethods()
export class RabbitMQUtils {
  private static connection: ChannelModel | null = null;
  private static channel: Channel | null = null;

  static async initialize(url: string) {
    if (RabbitMQUtils.connection) return;

    try {
      RabbitMQUtils.connection = await amqp.connect(url);
      RabbitMQUtils.channel = await RabbitMQUtils.connection.createChannel();
      appLogger.info('Connected to RabbitMQ');
    } catch (error) {
      appLogger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  static async ensureQueue(queueName: string) {
    if (!RabbitMQUtils.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    await RabbitMQUtils.channel?.assertQueue(queueName, { durable: true });
  }

  static async ensureExchange(exchangeName: string) {
    if (!RabbitMQUtils.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    await RabbitMQUtils.channel?.assertExchange(exchangeName, 'topic', { durable: true });
  }

  static async bindQueueToExchange(
    queueName: string,
    exchangeName: string,
    routingKey: string = '#'
  ) {
    if (!RabbitMQUtils.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    await RabbitMQUtils.channel?.bindQueue(queueName, exchangeName, routingKey);
  }

  /**
   * Publish a message to an exchange
   * @param exchangeName - The name of the exchange to publish the message to
   * @param content - The content of the message to publish
   * @param routingKey - The routing key to use for the message
   */
  static publish(exchangeName: string, content: Record<string, any>, routingKey: string = '#') {
    if (!RabbitMQUtils.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    const message = {
      data: content,
    };
    const messageBuffer = Buffer.from(JSON.stringify(message));
    RabbitMQUtils.channel?.publish(exchangeName, routingKey, messageBuffer, { persistent: true });
  }

  static async consume(queueName: string, callback: (msg: Record<string, any>) => void) {
    if (!RabbitMQUtils.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    await RabbitMQUtils.channel?.consume(queueName, (msg: ConsumeMessage | null) => {
      if (msg) {
        const content = msg.content.toString();
        const parsedContent = JSON.parse(content);

        callback(parsedContent);
        RabbitMQUtils.channel?.ack(msg);
      }
    });
  }

  static async close() {
    if (RabbitMQUtils.channel) await RabbitMQUtils.channel.close();
    if (RabbitMQUtils.connection) await RabbitMQUtils.connection.close();
  }
}
