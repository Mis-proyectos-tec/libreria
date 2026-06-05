const { app } = require('@azure/functions');
const sql = require('mssql');
const {
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters,
    BlobSASPermissions
} = require('@azure/storage-blob');
const { checkApimCert } = require('./certAuth');

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

function getStorageCredential() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString) {
        throw new Error('AZURE_STORAGE_CONNECTION_STRING no está configurado.');
    }

    const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
    const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);

    if (!accountNameMatch || !accountKeyMatch) {
        throw new Error('No se pudo leer AccountName o AccountKey desde la connection string.');
    }

    const accountName = accountNameMatch[1];
    const accountKey = accountKeyMatch[1];

    const credential = new StorageSharedKeyCredential(accountName, accountKey);

    return {
        accountName,
        credential
    };
}

app.http('bookCoverUrl', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'books/{id}/cover-url',
    handler: async (request, context) => {
        const certError = checkApimCert(request);
        if (certError) return certError;

        try {
            const id = parseInt(request.params.id, 10);

            if (isNaN(id)) {
                return {
                    status: 400,
                    jsonBody: {
                        message: 'El id del libro debe ser un número válido.'
                    }
                };
            }

            context.log(`Generando URL temporal de portada para el libro con id ${id}`);

            const pool = await getSqlPool();

            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT 
                        id,
                        title,
                        cover_blob_name
                    FROM dbo.Books
                    WHERE id = @id;
                `);

            if (result.recordset.length === 0) {
                return {
                    status: 404,
                    jsonBody: {
                        message: 'Libro no encontrado.'
                    }
                };
            }

            const book = result.recordset[0];

            if (!book.cover_blob_name) {
                return {
                    status: 404,
                    jsonBody: {
                        message: 'Este libro no tiene portada asociada.'
                    }
                };
            }

            const containerName = process.env.BLOB_CONTAINER_NAME || 'libros';
            const { accountName, credential } = getStorageCredential();

            const startsOn = new Date(Date.now() - 5 * 60 * 1000);
            const expiresOn = new Date(Date.now() + 30 * 60 * 1000);

            const sasOptions = {
                containerName,
                blobName: book.cover_blob_name,
                permissions: BlobSASPermissions.parse('r'),
                startsOn,
                expiresOn,
                protocol: 'https'
            };

            const sasToken = generateBlobSASQueryParameters(sasOptions, credential).toString();

            const coverUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${book.cover_blob_name}?${sasToken}`;

            return {
                status: 200,
                jsonBody: {
                    bookId: book.id,
                    title: book.title,
                    coverUrl,
                    expiresOn
                }
            };

        } catch (error) {
            context.error('Error generando URL de portada:', error);

            return {
                status: 500,
                jsonBody: {
                    message: 'Error al generar URL de portada',
                    error: error.message
                }
            };
        }
    }
});