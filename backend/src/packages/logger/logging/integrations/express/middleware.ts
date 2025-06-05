import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { setTransactionId } from '../../../async-hooks';
import { appLogger } from '../../logger/logger';

export const logHttpRequestsExpress = (req: Request, res: Response, next: NextFunction) => {
  let requestId = req.headers['x-request-id'] as string;

  if (!requestId) {
    requestId = uuidv4();
  }

  setTransactionId(requestId);

  const logContext = `${req.method} ${req.path}`;

  const { method, url, body, params, query } = req;

  res.setHeader('x-request-id', requestId);

  appLogger.debug(
    {
      message: `Request ${method} ${url}`,
      module: logContext,
    },
    {
      requestId,
      body,
      params,
      query,
    }
  );

  const startTime = Date.now();

  // Capture the original end function
  const originalEnd = res.end;
  const originalJson = res.json;

  // Override the end function to log the response
  res.end = function (chunk: any, ...args: any[]) {
    const executionTime = Date.now() - startTime;
    appLogger.log({
      message: `Response ${method} ${url} (${executionTime}ms)`,
      module: logContext,
    });
    //todo: fix this
    return originalEnd.call(this, chunk, args[0], args[1]);
  };

  // Override the json function to ensure we catch JSON responses
  res.json = function (body: any) {
    const executionTime = Date.now() - startTime;
    appLogger.log({
      message: `Response ${method} ${url} (${executionTime}ms)`,
      module: logContext,
    });
    return originalJson.call(this, body);
  };

  // Handle errors
  res.on('error', (error: Error) => {
    const executionTime = Date.now() - startTime;
    appLogger.error(
      {
        message: `Failed ${method} ${url} (${executionTime}ms)`,
        module: logContext,
      },
      {
        requestId,
        status: (error as any).status || 500,
        error: error.message,
      }
    );
  });

  next();
};
