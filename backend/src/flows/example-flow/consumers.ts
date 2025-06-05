import { appLogger, LogAllMethods } from '../../packages/logger';
import { validateSchema } from '../../utils/validate-schema';
import { exampleFlowRabbitMQDAL } from './dal';
import { exampleFlowService } from './service';
import { exampleConsumedEventSchema } from './validations';

@LogAllMethods()
class ExampleFlowConsumers {
  public async startConsuming(): Promise<void> {
    await this.setupExampleEventConsumer();
    appLogger.info('Users consumers setup completed');
  }

  private async setupExampleEventConsumer(): Promise<void> {
    await exampleFlowRabbitMQDAL.consumeExampleEvent(this.handleExampleEventMessage);
  }

  private async handleExampleEventMessage(data: any): Promise<void> {
    const validatedEvent = validateSchema(exampleConsumedEventSchema, data);
    await exampleFlowService.exampleConumerHandler(validatedEvent);
  }
}

export const exampleFlowConsumers = new ExampleFlowConsumers();
