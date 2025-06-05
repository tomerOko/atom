import { appLogger, LogAllMethods } from '../../packages/logger';
import { validateSchema } from '../../utils/validate-schema';
import { helmetDetectionRabbitMQDAL } from './dal';
import { helmetDetectionService } from './service';
import { processingResultEventSchema } from './validations';

@LogAllMethods()
class HelmetDetectionConsumers {
  public async startConsuming(): Promise<void> {
    await this.setupProcessingResultsConsumer();
    appLogger.info('Helmet Detection consumers setup completed');
  }

  private async setupProcessingResultsConsumer(): Promise<void> {
    await helmetDetectionRabbitMQDAL.consumeProcessingResults(this.handleProcessingResultMessage);
  }

  private async handleProcessingResultMessage(data: any): Promise<void> {
    const validatedEvent = validateSchema(processingResultEventSchema, data);
    await helmetDetectionService.handleProcessingResult(validatedEvent);
  }
}

export const helmetDetectionConsumers = new HelmetDetectionConsumers();
