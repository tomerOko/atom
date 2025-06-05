// import { LogAllMethods } from '../../packages/logger';
// import { exampleFlowMongoDAL, exampleFlowRabbitMQDAL } from './dal';
// import { ExampleConsumedEvent, ExampleDatabaseEntity, ExampleRequestPayload } from './validations';

// @LogAllMethods()
// class ExampleFlowService {
//   public exampleRequestHandler = async (
//     payload: ExampleRequestPayload
//   ): Promise<ExampleDatabaseEntity> => {
//     //what every logic is here
//     const responseData = await exampleFlowMongoDAL.getExampleDatabaseEntity(payload.exampleField);
//     if (!responseData) {
//       throw new Error('Example database entity not found');
//     }
//     return responseData;
//   };

//   public exampleConumerHandler = async (request: ExampleConsumedEvent): Promise<void> => {
//     //what every logic is here
//     await exampleFlowMongoDAL.getExampleDatabaseEntity(request.exampleField);
//     return;
//   };
// }

// export const exampleFlowService = new ExampleFlowService();
