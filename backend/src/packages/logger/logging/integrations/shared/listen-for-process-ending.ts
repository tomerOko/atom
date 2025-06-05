export const listenForProcessEnding = () => {
  process.on('uncaughtException', (error: Error) => {
    console.error(`Uncaught Exception: ${error.message}`, error.stack);
    // process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error(`Unhandled Promise Rejection at: ${promise}, reason: ${reason}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully');
    process.exit(0);
  });
};
