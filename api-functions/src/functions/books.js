const { app } = require('@azure/functions');
const sql = require('mssql');

let poolPromise = null;

async function getSqlPool() {
    if (!poolPromise) {
        const connectionString = process.env.SQL_CONNECTION_STRING;

        if (!connectionString) {
            throw new Error('SQL_CONNECTION_STRING no está configurado.');
        }

        poolPromise = sql.connect(connectionString);
    }

    return poolPromise;
}

app.http('books', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'books',
    handler: async (request, context) => {
        try {
            context.log('Ejecutando GET /api/books');

            const pool = await getSqlPool();

            const result = await pool.request().query(`
                SELECT 
                    id,
                    title,
                    author,
                    description,
                    category,
                    pdf_blob_name,
                    cover_blob_name,
                    created_at
                FROM dbo.Books
                ORDER BY id DESC;
            `);

            return {
                status: 200,
                jsonBody: result.recordset
            };

        } catch (error) {
            context.error('Error en GET /api/books:', error);

            return {
                status: 500,
                jsonBody: {
                    message: 'Error al obtener los libros',
                    error: error.message
                }
            };
        }
    }
});