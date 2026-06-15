import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'twstockfilter2 service API',
      version: '0.1.0',
      description: 'API documentation for twstockfilter2 service'
    },
    servers: [
      {
        url: 'http://localhost:8080',
      }
    ]
  },
  // Paths to your route files containing JSDoc comments
  apis: [ './api/*.ts' ]
};

export const swaggerSpec = swaggerJSDoc(options);