import { Collection, MongoClient, ObjectId } from 'mongodb';
import { config } from '../../config/env';
import { LogAllMethods } from '../../packages/logger';
import { RabbitMQUtils } from '../../packages/rabbitmq';
import { ImageRecord, ProcessingRequestEvent, ProcessingResultEvent } from './validations';

@LogAllMethods()
export class HelmetDetectionMongoDAL {
  private static client: MongoClient | null = null;
  private static readonly dbName = config.MONGODB_DB_NAME;
  private static readonly imageRecordCollectionName = 'helmet_images';

  public static async initialize(): Promise<void> {
    this.client = await MongoClient.connect(config.MONGODB_URI);

    // Create indexes
    const imageRecordCollection = this.getImageRecordCollection();
    await imageRecordCollection.createIndex({ filename: 1 });
    await imageRecordCollection.createIndex({ uploadedAt: -1 });
    await imageRecordCollection.createIndex({ processingStatus: 1 });
  }

  private static getImageRecordCollection(): Collection<ImageRecord> {
    if (!this.client) {
      throw new Error('HelmetDetectionMongoDAL not initialized');
    }
    return this.client.db(this.dbName).collection(this.imageRecordCollectionName);
  }

  public static async createImageRecord(imageData: Omit<ImageRecord, '_id'>): Promise<string> {
    const collection = this.getImageRecordCollection();
    const result = await collection.insertOne(imageData);
    return result.insertedId.toString();
  }

  public static async getImageRecord(id: string): Promise<ImageRecord | null> {
    const collection = this.getImageRecordCollection();
    const result = await collection.findOne({ _id: new ObjectId(id) } as any);
    if (!result) return null;

    // Convert ObjectId to string
    return {
      ...result,
      _id: result._id.toString(),
    };
  }

  public static async getAllImageRecords(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ images: ImageRecord[]; total: number }> {
    const collection = this.getImageRecordCollection();
    const total = await collection.countDocuments();
    const rawImages = await collection
      .find({})
      .sort({ uploadedAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    // Convert ObjectIds to strings
    const images = rawImages.map(image => ({
      ...image,
      _id: image._id.toString(),
    }));

    return { images, total };
  }

  public static async updateImageProcessingResult(
    imageId: string,
    result: ProcessingResultEvent
  ): Promise<void> {
    const collection = this.getImageRecordCollection();

    const detections = result.detections.map(d => ({
      bbox: d.bbox,
      confidence: d.confidence,
      hasHelmet: d.has_helmet,
      helmetConfidence: d.helmet_confidence,
      status: d.status as 'wearing_helmet' | 'no_helmet',
    }));

    const updateData: Partial<ImageRecord> = {
      processingStatus: result.processing_status,
      annotatedFilename: result.annotated_filename,
      totalPeople: result.total_people,
      peopleWithHelmets: result.people_with_helmets,
      complianceRate: result.compliance_rate,
      detections,
      processedAt: new Date(),
      error: result.error,
    };

    await collection.updateOne({ _id: new ObjectId(imageId) } as any, {
      $set: updateData,
    });
  }

  public static async updateProcessingStatus(
    imageId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed'
  ): Promise<void> {
    const collection = this.getImageRecordCollection();
    await collection.updateOne({ _id: new ObjectId(imageId) } as any, {
      $set: { processingStatus: status },
    });
  }
}

@LogAllMethods()
export class HelmetDetectionRabbitMQDAL {
  //publishers:
  private static readonly IMAGE_PROCESSING_EXCHANGE = 'helmet_detection_image_processing_exchange';

  //consumers:
  private static readonly PROCESSING_RESULTS_EXCHANGE = 'ai_service_processing_results_exchange';
  private static readonly PROCESSING_RESULTS_QUEUE = 'helmet_detection_processing_results_queue';

  public static async initialize(): Promise<void> {
    await RabbitMQUtils.initialize(config.RABBITMQ_URL);

    await RabbitMQUtils.ensureExchange(this.IMAGE_PROCESSING_EXCHANGE);

    await RabbitMQUtils.ensureExchange(this.PROCESSING_RESULTS_EXCHANGE);
    await RabbitMQUtils.ensureQueue(this.PROCESSING_RESULTS_QUEUE);
    await RabbitMQUtils.bindQueueToExchange(
      this.PROCESSING_RESULTS_QUEUE,
      this.PROCESSING_RESULTS_EXCHANGE
    );
  }

  public static async consumeProcessingResults(callback: (msg: Record<string, any>) => void) {
    await RabbitMQUtils.consume(this.PROCESSING_RESULTS_QUEUE, callback);
  }

  public static async publishProcessingRequest(payload: ProcessingRequestEvent) {
    await RabbitMQUtils.publish(this.IMAGE_PROCESSING_EXCHANGE, payload);
  }
}

// Export singletons
export const helmetDetectionMongoDAL = HelmetDetectionMongoDAL;
export const helmetDetectionRabbitMQDAL = HelmetDetectionRabbitMQDAL;
