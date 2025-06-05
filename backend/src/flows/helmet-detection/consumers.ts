import { ConsumeMessage } from 'amqplib';
import { appLogger } from '../../packages/logger';
import { helmetDetectionRabbitMQDAL } from './dal';
import { helmetDetectionService } from './service';
import { ProcessingResult } from './types';

class HelmetDetectionConsumers {
  async startConsuming(): Promise<void> {
    await this.setupProcessingResultsConsumer();
    appLogger.info('Helmet Detection consumers setup completed');
  }

  private async setupProcessingResultsConsumer(): Promise<void> {
    const channel = helmetDetectionRabbitMQDAL.getChannel();
    const queueName = helmetDetectionRabbitMQDAL.getResultsQueueName();

    if (!channel) {
      throw new Error('RabbitMQ channel not available');
    }

    await channel.consume(queueName, async (msg: ConsumeMessage | null) => {
      if (msg) {
        try {
          const content = msg.content.toString();
          const processingResult: ProcessingResult = JSON.parse(content);

          appLogger.info(
            `Received processing result for image: ${processingResult.image_filename}`
          );

          // Handle the processing result
          await helmetDetectionService.handleProcessingResult(processingResult);

          // Acknowledge the message
          channel.ack(msg);
        } catch (error) {
          appLogger.error('Error processing result message:', error);

          // Reject and requeue the message for retry
          channel.nack(msg, false, true);
        }
      }
    });

    appLogger.info(`Started consuming processing results from queue: ${queueName}`);
  }
}

export const helmetDetectionConsumers = new HelmetDetectionConsumers();
