import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { setTransactionId } from '../../../async-hooks';
import { appLogger } from '../../logger/logger';

@Injectable()
export class LogHttpRequestsNest implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    let requestId = req.headers['x-request-id'];

    if (!requestId) {
      requestId = uuidv4();
    }

    setTransactionId(requestId);

    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const logContext = `${controllerName}.${handlerName}`;

    const { method, url, body, params, query } = req;

    const response = context.switchToHttp().getResponse();
    response.setHeader('x-request-id', requestId);

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

    return next.handle().pipe(
      tap({
        next: data => {
          const executionTime = Date.now() - startTime;
          appLogger.log({
            message: `Response ${method} ${url} (${executionTime}ms)`,
            module: logContext,
          });
        },
        error: error => {
          const executionTime = Date.now() - startTime;
          appLogger.error(
            {
              message: `Failed ${method} ${url} (${executionTime}ms)`,
              module: logContext,
            },
            {
              requestId,
              status: error.status || 500,
              error: error.message,
            }
          );
        },
      })
    );
  }
}
