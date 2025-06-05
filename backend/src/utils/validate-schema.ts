import { ZodError, z } from 'zod';
import { appLogger } from '../packages/logger';
import { Request, Response } from 'express';

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates data against a Zod schema and formats any errors in a readable way
 */
export function validateSchema<T extends z.ZodType>(schema: T, data: any): z.output<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map(
        (err): ValidationError => ({
          field: err.path.join('.'),
          message: err.message,
        })
      );

      appLogger.error('Validation failed', {
        errors: JSON.stringify(formattedErrors, null, 2),
        data: JSON.stringify(data, null, 2),
      });

      throw new Error(
        `Validation failed:\n${formattedErrors
          .map(err => `- ${err.field}: ${err.message}`)
          .join('\n')}`
      );
    }
    throw error;
  }
}

/**
 * Validates request body against a Zod schema
 */
export function requestValidation<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: () => void) => {
    try {
      const validatedData = validateSchema(schema, req.body);
      // Update request body with validated data (in case of transformations)
      req.body = validatedData;
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Validation Error',
        details: error instanceof Error ? error.message : 'Unknown validation error',
      });
    }
  };
}

/**
 * Validates response data against a Zod schema
 */
export function responseValidation<T extends z.ZodType>(schema: T) {
  return (req: Request, res: Response, next: () => void) => {
    // Store original json method
    const originalJson = res.json;

    // Override json method to validate response data
    res.json = function (data: any) {
      try {
        const validatedData = validateSchema(schema, data);
        return originalJson.call(this, validatedData);
      } catch (error) {
        appLogger.error('Response validation failed', {
          error: error instanceof Error ? error.message : 'Unknown validation error',
          data: JSON.stringify(data, null, 2),
        });
        return res.status(500).json({
          error: 'Internal Server Error',
          details: 'Response validation failed',
        });
      }
    };

    next();
  };
}

//todo: add 'requestValidation' and 'responseValidation' functions.
//todo: implement them in the controller file
//todo: make sure to update request in case we use zod transform
