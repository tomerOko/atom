import { app } from './app';
import { config } from './config/env';
import { helmetDetectionConsumers } from './flows/helmet-detection/consumers';
import { helmetDetectionMongoDAL, helmetDetectionRabbitMQDAL } from './flows/helmet-detection/dal';

import { AppLogger, appLogger, listenForProcessEnding } from './packages/logger';
import { startLoggingToConsole } from './packages/logger/logging/log-providers/basic-console/basic-console';
import { MinioUtils } from './packages/minio';

listenForProcessEnding();

const startServer = async () => {
  try {
    AppLogger.initialize('main', 'debug', 1000);
    startLoggingToConsole();

    // Initialize MinIO
    await MinioUtils.initialize(
      config.MINIO_ENDPOINT,
      config.MINIO_PORT,
      config.MINIO_USE_SSL,
      config.MINIO_ACCESS_KEY,
      config.MINIO_SECRET_KEY,
      config.MINIO_REGION
    );

    await helmetDetectionMongoDAL.initialize();
    await helmetDetectionRabbitMQDAL.initialize();
    await helmetDetectionConsumers.startConsuming();

    const server = app.listen(config.PORT);
    server.on('error', error => {
      const errorMessage = `Server error: ${error.message}`;
      appLogger.error(errorMessage);
      process.exit(1);
    });

    appLogger.info(`Server started on port ${config.PORT}`);
  } catch (error) {
    appLogger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
