/**
 * This file uses TypeScript decorators which require the following tsconfig.json properties:
 * - experimentalDecorators: true
 * - emitDecoratorMetadata: true
 */
import { appLogger } from '../../logger/logger';

/**
 * Decorator that logs all method calls in a class
 * Usage: @LogAllMethods()
 * class MyClass { ... }
 */
export function LogAllMethods() {
  return function (target: any) {
    // Log instance methods
    const instancePropertyNames = Object.getOwnPropertyNames(target.prototype);
    for (const propertyName of instancePropertyNames) {
      if (propertyName === 'constructor') {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyName);
      if (descriptor && typeof descriptor.value === 'function') {
        const newDescriptor = LogMethod()(target.prototype, propertyName, descriptor);
        Object.defineProperty(target.prototype, propertyName, newDescriptor);
      }
    }

    // Log static methods
    const staticPropertyNames = Object.getOwnPropertyNames(target);
    for (const propertyName of staticPropertyNames) {
      if (['length', 'prototype', 'name'].includes(propertyName)) {
        continue;
      }
      const descriptor = Object.getOwnPropertyDescriptor(target, propertyName);
      if (descriptor && typeof descriptor.value === 'function') {
        const newDescriptor = LogMethod()(target, propertyName, descriptor);
        Object.defineProperty(target, propertyName, newDescriptor);
      }
    }

    return target;
  };
}

/**
 * Decorator that logs a single method call
 * Usage:
 * class MyClass {
 *   @LogMethod()
 *   myMethod() { ... }
 * }
 */
export function LogMethod() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    // Improve class name detection with a more robust approach
    let className;

    if (target.constructor?.name && target.constructor.name !== 'Object') {
      className = target.constructor.name;
    } else if (target.name) {
      className = target.name;
    } else if (typeof target === 'function') {
      className = target.name;
    } else {
      // Fall back to getting the name from the prototype chain
      const proto = Object.getPrototypeOf(target);
      className = proto?.constructor?.name || 'UnknownClass';
    }

    const methodName = propertyKey;
    const logContext = `${className}.${methodName}`;

    descriptor.value = function (...args: any[]) {
      appLogger.log(
        {
          message: `Entering method ${logContext}`,
          module: logContext,
        },
        {
          arguments: args,
        }
      );

      let result;
      const startTime = Date.now();

      try {
        result = originalMethod.apply(this, args);

        if (result instanceof Promise) {
          return result
            .then(value => {
              const executionTime = Date.now() - startTime;
              appLogger.log({
                message: `Exiting method ${logContext} (${executionTime}ms)`,
                module: logContext,
              });
              return value;
            })
            .catch(err => {
              const executionTime = Date.now() - startTime;
              appLogger.error(
                {
                  message: `Method ${logContext} failed (${executionTime}ms)`,
                  module: logContext,
                },
                { error: err.message }
              );
              throw err;
            });
        }

        const executionTime = Date.now() - startTime;
        appLogger.log({
          message: `Exiting method ${logContext} (${executionTime}ms)`,
          module: logContext,
        });
        return result;
      } catch (err: any) {
        const executionTime = Date.now() - startTime;
        appLogger.error(
          {
            message: `Method ${logContext} failed (${executionTime}ms)`,
            module: logContext,
          },
          { error: err.message }
        );
        throw err;
      }
    };

    return descriptor;
  };
}
