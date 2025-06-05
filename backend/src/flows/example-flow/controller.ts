// import { Request, Response } from 'express';
// import { appLogger, LogAllMethods } from '../../packages/logger';
// import { validateSchema } from '../../utils/validate-schema';
// import { exampleFlowService } from './service';
// import { exampleRequestPayloadSchema, exampleRequestResponseSchema } from './validations';

// @LogAllMethods()
// class ExampleFlowController {
//   public exampleRequest = async (req: Request, res: Response): Promise<void> => {
//     try {
//       const requestPayload = validateSchema(exampleRequestPayloadSchema, req.body);
//       const responseData = exampleFlowService.exampleRequestHandler(requestPayload);
//       const response = validateSchema(exampleRequestResponseSchema, responseData);
//       res.json(response);
//     } catch (error) {
//       appLogger.error('Error in example request', { error });
//       res.status(500).json({
//         error: 'Failed to fetch example request',
//       });
//     }
//   };
// }

// export const exampleFlowController = new ExampleFlowController();
