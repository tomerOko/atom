import { Client } from 'minio';
import { Readable } from 'stream';
import { LogAllMethods } from './logger';

@LogAllMethods()
export class MinioUtils {
  private static client: Client | null = null;
  public static isConnected: boolean = false;
  private static endpoint: string;
  private static port: number;
  private static useSSL: boolean;
  private static accessKey: string;
  private static secretKey: string;
  private static region: string;
  private static bucketName = 'documents';

  public static async initialize(
    endpoint: string,
    port: number,
    useSSL: boolean,
    accessKey: string,
    secretKey: string,
    region: string
  ): Promise<void> {
    this.endpoint = endpoint;
    this.port = port;
    this.useSSL = useSSL;
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.region = region;
    await this.connect();
  }

  private static async connect(): Promise<void> {
    try {
      if (this.isConnected && this.client) {
        return;
      }

      this.client = new Client({
        endPoint: this.endpoint,
        port: this.port,
        useSSL: this.useSSL,
        accessKey: this.accessKey,
        secretKey: this.secretKey,
        // region: this.region,
      });

      // Test connection by listing buckets
      await this.client.listBuckets();
      this.isConnected = true;
      console.log('Connected to MinIO storage');
    } catch (error) {
      console.error('Failed to connect to MinIO:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private static async createBucketIfNotExist(): Promise<void> {
    if (!this.isConnected || !this.client) {
      await this.connect();
    }

    if (!this.client) {
      throw new Error('MinIO client not available');
    }

    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName, this.region);
        console.log(`Bucket ${this.bucketName} created`);
      } else {
        console.log(`Bucket ${this.bucketName} already exists`);
      }
    } catch (error) {
      console.error(`Error creating bucket ${this.bucketName}:`, error);
      throw error;
    }
  }

  public static async uploadFile(id: string, data: Buffer | Readable): Promise<string> {
    if (!this.isConnected || !this.client) {
      await this.connect();
    }

    if (!this.client) {
      throw new Error('MinIO client not available');
    }

    const readableData = Buffer.isBuffer(data) ? Readable.from(data) : data;

    try {
      await this.createBucketIfNotExist();

      await this.client.putObject(this.bucketName, this.getFileName(id), readableData);

      console.log(`File ${id} uploaded to ${this.bucketName}`);
      return id;
    } catch (error) {
      console.error(`Error uploading file ${id} to ${this.bucketName}:`, error);
      throw error;
    }
  }

  public static async getFile(id: string): Promise<Buffer> {
    if (!this.isConnected || !this.client) {
      await this.connect();
    }

    if (!this.client) {
      throw new Error('MinIO client not available');
    }

    try {
      const dataStream = await this.client.getObject(this.bucketName, this.getFileName(id));

      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];

        dataStream.on('data', chunk => chunks.push(chunk));
        dataStream.on('end', () => resolve(Buffer.concat(chunks)));
        dataStream.on('error', error => reject(error));
      });
    } catch (error) {
      console.error(`Error getting file ${id} from ${this.bucketName}:`, error);
      throw error;
    }
  }

  public static async getFileUrl(id: string, expiryInSeconds: number = 60 * 60): Promise<string> {
    if (!this.isConnected || !this.client) {
      await this.connect();
    }

    if (!this.client) {
      throw new Error('MinIO client not available');
    }

    try {
      return await this.client.presignedGetObject(
        this.bucketName,
        this.getFileName(id),
        expiryInSeconds
      );
    } catch (error) {
      console.error(`Error getting URL for file ${id} from ${this.bucketName}:`, error);
      throw error;
    }
  }

  public static async deleteFile(id: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      await this.connect();
    }

    if (!this.client) {
      throw new Error('MinIO client not available');
    }

    try {
      await this.client.removeObject(this.bucketName, this.getFileName(id));
      console.log(`File ${id} deleted from ${this.bucketName}`);
    } catch (error) {
      console.error(`Error deleting file ${id} from ${this.bucketName}:`, error);
      throw error;
    }
  }

  private static getFileName(id: string): string {
    return id.endsWith('.wav') ? id : id + '.wav';
  }
}
