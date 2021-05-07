import logger from 'library/logger';

// This plugin is designed for graphql log. each funciton represents the grahpql life cycle in Apollo
const graphqlLogPlugin = {
  // when graphql request started
  requestDidStart(requestContext) {
    const start = Date.now();
    let op = requestContext.operationName;
    // IntrospectionQuery is something that indicate the detail of the service besides the actual query or mutation
    // We don't need to log these detail, so we skip it to get only what we want
    if (op !== 'IntrospectionQuery') {
      logger.debug(`Request: ${requestContext.request.query}`);
    }
    return {
      // when resolver operation is happened
      didResolveOperation(context) {
        op = context.operationName;
      },
      // everything is prepared and ready to send data back to client
      willSendResponse(context) {
        const stop = Date.now();
        const elapsed = stop - start;
        const size = JSON.stringify(context.response.data).length * 2;
        // IntrospectionQuery is something that indicate the detail of the service besides the actual query or mutation
        // We don't need to log these detail, so we skip it to get only what we want
        if (op !== 'IntrospectionQuery') {
          logger.debug(
            `Response ${JSON.stringify(
              context.response.data,
              undefined,
              2,
            )} completed in ${elapsed} ms and returned ${size} bytes`,
          );
        }
      },
    };
  },
};

export default graphqlLogPlugin;
