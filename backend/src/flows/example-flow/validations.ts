import { z } from 'zod';

// HTTP Request/Response Schemas - Example
export const exampleRequestPayloadSchema = z.object({
  exampleField: z.string(),
});
export type ExampleRequestPayload = z.infer<typeof exampleRequestPayloadSchema>;

export const exampleRequestResponseSchema = z.object({
  exampleField: z.string(),
});
export type ExampleRequestResponse = z.infer<typeof exampleRequestResponseSchema>;

// Database Schemas - Example
export const exampleDatabaseEntitySchema = z.object({
  id: z.string().optional(),
  exampleField: z.string(),
});
export type ExampleDatabaseEntity = z.infer<typeof exampleDatabaseEntitySchema>;

// Event Schemas - Example (Published by Users Flow)
export const examplePublishedEventSchema = z.object({
  id: z.string().optional(),
  exampleField: z.string(),
});
export type ExamplePublishedEvent = z.infer<typeof examplePublishedEventSchema>;

// Event Schemas - Example (Consumed by Users Flow)
export const exampleConsumedEventSchema = z.object({
  id: z.string().optional(),
  exampleField: z.string(),
});

export type ExampleConsumedEvent = z.infer<typeof exampleConsumedEventSchema>;
