import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import amqp, { Channel, ChannelModel } from 'amqplib';
import { config } from '../../config/env';
import { appLogger } from '../../packages/logger';
import { ImageRecord, ProcessingMessage, ProcessingResult, Detection } from './types';

class HelmetDetectionMongoDAL {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private imagesCollection: Collection<ImageRecord> | null = null;

  async initialize(): Promise<void> {
    try {
      this.client = new MongoClient(config.MONGODB_URI);
      await this.client.connect();
      this.db = this.client.db(config.MONGODB_DB_NAME);
      this.imagesCollection = this.db.collection<ImageRecord>('helmet_images');

      // Create indexes
      await this.imagesCollection.createIndex({ filename: 1 });
      await this.imagesCollection.createIndex({ uploadedAt: -1 });
      await this.imagesCollection.createIndex({ processingStatus: 1 });

      appLogger.info('Helmet Detection MongoDB DAL initialized');
    } catch (error) {
      appLogger.error('Failed to initialize Helmet Detection MongoDB DAL:', error);
      throw error;
    }
  }

  async createImageRecord(imageData: Omit<ImageRecord, '_id'>): Promise<string> {
    if (!this.imagesCollection) {
      throw new Error('MongoDB not initialized');
    }

    try {
      const result = await this.imagesCollection.insertOne(imageData);
      appLogger.info(`Created image record: ${result.insertedId}`);
      return result.insertedId.toString();
    } catch (error) {
      appLogger.error('Failed to create image record:', error);
      throw error;
    }
  }

  async getImageRecord(id: string): Promise<ImageRecord | null> {
    if (!this.imagesCollection) {
      throw new Error('MongoDB not initialized');
    }

    try {
      const result = await this.imagesCollection.findOne({ _id: new ObjectId(id) } as any);
      return result;
    } catch (error) {
      appLogger.error('Failed to get image record:', error);
      throw error;
    }
  }

  async getImageRecordByFilename(filename: string): Promise<ImageRecord | null> {
    if (!this.imagesCollection) {
      throw new Error('MongoDB not initialized');
    }

    try {
      const result = await this.imagesCollection.findOne({ filename });
      return result;
    } catch (error) {
      appLogger.error('Failed to get image record by filename:', error);
      throw error;
    }
  }

  async getAllImageRecords(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ images: ImageRecord[]; total: number }> {
    if (!this.imagesCollection) {
      throw new Error('MongoDB not initialized');
    }

    try {
      const total = await this.imagesCollection.countDocuments();
      const images = await this.imagesCollection
        .find({})
        .sort({ uploadedAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray();

      return { images, total };
    } catch (error) {
      appLogger.error('Failed to get all image records:', error);
      throw error;
    }
  }

  async updateImageProcessingResult(imageId: string, result: ProcessingResult): Promise<void> {
    if (!this.imagesCollection) {
      throw new Error('MongoDB not initialized');
    }

    try {
      const detections: Detection[] = result.detections.map(d => ({
        bbox: d.bbox,
        confidence: d.confidence,
        hasHelmet: d.has_helmet,
        helmetConfidence: d.helmet_confidence,
        status: d.status as 'wearing_helmet' | 'no_helmet',
      }));

      const updateData: Partial<ImageRecord> = {
        processingStatus: result.processing_status as 'completed' | 'failed',
        annotatedFilename: result.annotated_filename,
        totalPeople: result.total_people,
        peopleWithHelmets: result.people_with_helmets,
        complianceRate: result.compliance_rate,
        detections,
        processedAt: new Date(),
        error: result.error,
      };

      await this.imagesCollection.updateOne({ _id: new ObjectId(imageId) } as any, {
        $set: updateData,
      });

      appLogger.info(`Updated image processing result for: ${imageId}`);
    } catch (error) {
      appLogger.error('Failed to update image processing result:', error);
      throw error;
    }
  }

  async updateProcessingStatus(
    imageId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed'
  ): Promise<void> {
    if (!this.imagesCollection) {
      throw new Error('MongoDB not initialized');
    }

    try {
      await this.imagesCollection.updateOne({ _id: new ObjectId(imageId) } as any, {
        $set: { processingStatus: status },
      });

      appLogger.info(`Updated processing status for ${imageId}: ${status}`);
    } catch (error) {
      appLogger.error('Failed to update processing status:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      appLogger.info('Helmet Detection MongoDB DAL closed');
    }
  }
}

class HelmetDetectionRabbitMQDAL {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly IMAGE_PROCESSING_QUEUE = 'image_processing';
  private readonly PROCESSING_RESULTS_QUEUE = 'processing_results';

  async initialize(): Promise<void> {
    try {
      this.connection = await amqp.connect(config.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();

      // Declare queues
      await this.channel.assertQueue(this.IMAGE_PROCESSING_QUEUE, { durable: true });
      await this.channel.assertQueue(this.PROCESSING_RESULTS_QUEUE, { durable: true });

      appLogger.info('Helmet Detection RabbitMQ DAL initialized');
    } catch (error) {
      appLogger.error('Failed to initialize Helmet Detection RabbitMQ DAL:', error);
      throw error;
    }
  }

  async publishProcessingRequest(message: ProcessingMessage): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ not initialized');
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      await this.channel.sendToQueue(this.IMAGE_PROCESSING_QUEUE, messageBuffer, {
        persistent: true,
      });

      appLogger.info(`Published processing request for image: ${message.image_filename}`);
    } catch (error) {
      appLogger.error('Failed to publish processing request:', error);
      throw error;
    }
  }

  getChannel(): Channel | null {
    return this.channel;
  }

  getResultsQueueName(): string {
    return this.PROCESSING_RESULTS_QUEUE;
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      appLogger.info('Helmet Detection RabbitMQ DAL closed');
    } catch (error) {
      appLogger.error('Error closing RabbitMQ connection:', error);
    }
  }
}

export const helmetDetectionMongoDAL = new HelmetDetectionMongoDAL();
export const helmetDetectionRabbitMQDAL = new HelmetDetectionRabbitMQDAL();
