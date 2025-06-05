import { Collection, MongoClient } from 'mongodb';
import { config } from '../../config/env';
import { LogAllMethods } from '../../packages/logger';
import { RabbitMQUtils } from '../../packages/rabbitmq';
import { ExampleDatabaseEntity, ExamplePublishedEvent } from './validations';

@LogAllMethods()
export class ExampleFlowMongoDAL {
  private static client: MongoClient | null = null;
  private static readonly dbName = 'app_db';
  private static readonly exampleDatabaseEntityCollectionName = 'example_database_entity';

  public static async initialize(): Promise<void> {
    this.client = await MongoClient.connect(config.MONGODB_URI);

    // Create indexes
    const exampleDatabaseEntityCollection = this.getExampleDatabaseEntityCollection();
    await exampleDatabaseEntityCollection.createIndex({ id: 1 }, { unique: true });
  }

  private static getExampleDatabaseEntityCollection(): Collection<ExampleDatabaseEntity> {
    if (!this.client) {
      throw new Error('ExampleFlowMongoDAL not initialized');
    }
    return this.client.db(this.dbName).collection(this.exampleDatabaseEntityCollectionName);
  }

  public static async getExampleDatabaseEntity(id: string): Promise<ExampleDatabaseEntity | null> {
    const collection = this.getExampleDatabaseEntityCollection();
    const exampleDatabaseEntity = await collection.findOne({ id });
    return exampleDatabaseEntity;
  }
}

@LogAllMethods()
export class ExampleFlowRabbitMQDAL {
  //publishers:
  private static readonly EXAMPLE_EVENT_2_EXCHANGE = 'example_flow_example_event_2_exchange';

  //consumers:
  private static readonly EXAMPLE_EVENT_EXCHANGE = 'other_service_example_event_exchange';
  private static readonly EXAMPLE_CONSUMED_QUEUE = 'example_flow_example_consumed_queue';

  public static async initialize(): Promise<void> {
    await RabbitMQUtils.ensureExchange(this.EXAMPLE_EVENT_2_EXCHANGE);

    await RabbitMQUtils.ensureExchange(this.EXAMPLE_EVENT_EXCHANGE);
    await RabbitMQUtils.ensureQueue(this.EXAMPLE_CONSUMED_QUEUE);
    await RabbitMQUtils.bindQueueToExchange(
      this.EXAMPLE_CONSUMED_QUEUE,
      this.EXAMPLE_EVENT_EXCHANGE
    );
  }

  public static async consumeExampleEvent(callback: (msg: Record<string, any>) => void) {
    await RabbitMQUtils.consume(this.EXAMPLE_CONSUMED_QUEUE, callback);
  }

  public static async publishExampleEvent(payload: ExamplePublishedEvent) {
    await RabbitMQUtils.publish(this.EXAMPLE_EVENT_2_EXCHANGE, payload);
  }
}

// Export singletons
export const exampleFlowMongoDAL = ExampleFlowMongoDAL;
export const exampleFlowRabbitMQDAL = ExampleFlowRabbitMQDAL;
