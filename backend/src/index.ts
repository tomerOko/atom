import { app } from './app';
import { config } from './config/env';
import { exampleFlowMongoDAL, exampleFlowRabbitMQDAL } from './flows/example-flow/dal';
import { exampleFlowConsumers } from './flows/example-flow/consumers';
import { helmetDetectionMongoDAL, helmetDetectionRabbitMQDAL } from './flows/helmet-detection/dal';
import { helmetDetectionConsumers } from './flows/helmet-detection/consumers';

import { JwtUtils } from './packages/jwt';
import { AppLogger, appLogger, listenForProcessEnding } from './packages/logger';
import { startLoggingToConsole } from './packages/logger/logging/log-providers/basic-console/basic-console';
import { startLoggingToLogtail } from './packages/logger/logging/log-providers/logtail/logtail';
import { MinioUtils } from './packages/minio';

listenForProcessEnding();

const startServer = async () => {
  try {
    AppLogger.initialize('main', 'debug', 1000);
    startLoggingToConsole();
    startLoggingToLogtail(config.LOGTAIL_SOURCE_TOKEN, config.LOGTAIL_ENDPOINT);
    JwtUtils.initialize(config.JWT_SECRET);

    // Initialize MinIO
    await MinioUtils.initialize(
      config.MINIO_ENDPOINT,
      config.MINIO_PORT,
      config.MINIO_USE_SSL,
      config.MINIO_ACCESS_KEY,
      config.MINIO_SECRET_KEY,
      config.MINIO_REGION
    );

    // Initialize MongoDB DALs
    await exampleFlowMongoDAL.initialize();
    await helmetDetectionMongoDAL.initialize();

    // Initialize RabbitMQ DALs
    await exampleFlowRabbitMQDAL.initialize();
    await helmetDetectionRabbitMQDAL.initialize();

    // Initialize consumers
    await exampleFlowConsumers.startConsuming();
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
