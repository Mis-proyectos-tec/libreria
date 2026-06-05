const { app } = require('@azure/functions');

app.http('health', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'health',
    handler: async (request, context) => {
        context.log('Health endpoint ejecutado correctamente');

        return {
            status: 200,
            jsonBody: {
                message: 'API funcionando correctamente',
                service: 'func-milibreria-api',
                status: 'ok'
            }
        };
    }
});