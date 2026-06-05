const { app } = require('@azure/functions');
const sql = require('mssql');
const { BlobServiceClient } = require('@azure/storage-blob');
const { checkApimCert } = require('./certAuth');

async function getSqlPool() {
    try {
        if (!poolPromise) {
            const connectionString = process.env.SQL_CONNECTION_STRING;

            poolPromise = sql.connect(connectionString);
        }

        return await poolPromise;

    } catch (error) {
        poolPromise = null;
        throw error;
    }
}

function parseBoolean(value, defaultValue = true) {
    if (value === undefined || value === null) {
        return defaultValue;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }

    return Boolean(value);
}

async function deleteBlobIfExists(blobName, context) {
    if (!blobName) return;

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.BLOB_CONTAINER_NAME || 'libros';

    if (!connectionString) {
        context.warn('AZURE_STORAGE_CONNECTION_STRING no está configurado. No se eliminó el blob.');
        return;
    }

    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.deleteIfExists();
        context.log(`Blob eliminado o inexistente: ${blobName}`);
    } catch (error) {
        context.warn(`No se pudo eliminar el blob ${blobName}: ${error.message}`);
    }
}

async function getBooks(context) {
    context.log('Ejecutando GET /api/books');

    const pool = await getSqlPool();

    const result = await pool.request().query(`
        SELECT 
            id,
            user_id,
            title,
            author,
            description,
            category,
            language,
            current_status,
            is_public,
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
}

async function getBookById(request, context) {
    const id = parseInt(request.params.id, 10);

    if (isNaN(id)) {
        return {
            status: 400,
            jsonBody: {
                message: 'El id del libro debe ser un número válido.'
            }
        };
    }

    context.log(`Ejecutando GET /api/books/${id}`);

    const pool = await getSqlPool();

    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            SELECT 
                id,
                user_id,
                title,
                author,
                description,
                category,
                language,
                current_status,
                is_public,
                pdf_blob_name,
                cover_blob_name,
                created_at
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

    return {
        status: 200,
        jsonBody: result.recordset[0]
    };
}

async function createBook(request, context) {
    context.log('Ejecutando POST /api/books');

    const body = await request.json();

    const {
        title,
        author,
        description,
        category,
        pdf_blob_name,
        cover_blob_name
    } = body;

    const userId = body.user_id || body.userId || null;
    const language = body.language || 'es';
    const currentStatus = body.current_status || body.currentStatus || 'activo';
    const isPublic = parseBoolean(body.is_public ?? body.isPublic, true);

    if (!title || !pdf_blob_name) {
        return {
            status: 400,
            jsonBody: {
                message: 'title y pdf_blob_name son obligatorios.'
            }
        };
    }

    const pool = await getSqlPool();

    const result = await pool.request()
        .input('user_id', sql.NVarChar(100), userId)
        .input('title', sql.NVarChar(200), title)
        .input('author', sql.NVarChar(150), author || null)
        .input('description', sql.NVarChar(sql.MAX), description || null)
        .input('category', sql.NVarChar(100), category || null)
        .input('language', sql.NVarChar(20), language)
        .input('current_status', sql.NVarChar(50), currentStatus)
        .input('is_public', sql.Bit, isPublic)
        .input('pdf_blob_name', sql.NVarChar(500), pdf_blob_name)
        .input('cover_blob_name', sql.NVarChar(500), cover_blob_name || null)
        .query(`
            INSERT INTO dbo.Books (
                user_id,
                title,
                author,
                description,
                category,
                language,
                current_status,
                is_public,
                pdf_blob_name,
                cover_blob_name
            )
            OUTPUT 
                INSERTED.id,
                INSERTED.user_id,
                INSERTED.title,
                INSERTED.author,
                INSERTED.description,
                INSERTED.category,
                INSERTED.language,
                INSERTED.current_status,
                INSERTED.is_public,
                INSERTED.pdf_blob_name,
                INSERTED.cover_blob_name,
                INSERTED.created_at
            VALUES (
                @user_id,
                @title,
                @author,
                @description,
                @category,
                @language,
                @current_status,
                @is_public,
                @pdf_blob_name,
                @cover_blob_name
            );
        `);

    return {
        status: 201,
        jsonBody: {
            message: 'Libro creado correctamente',
            book: result.recordset[0]
        }
    };
}

async function updateBook(request, context) {
    const id = parseInt(request.params.id, 10);

    if (isNaN(id)) {
        return {
            status: 400,
            jsonBody: {
                message: 'El id del libro debe ser un número válido.'
            }
        };
    }

    context.log(`Ejecutando PUT /api/books/${id}`);

    const body = await request.json();

    const pool = await getSqlPool();

    const existingResult = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            SELECT 
                id,
                pdf_blob_name,
                cover_blob_name
            FROM dbo.Books
            WHERE id = @id;
        `);

    if (existingResult.recordset.length === 0) {
        return {
            status: 404,
            jsonBody: {
                message: 'Libro no encontrado.'
            }
        };
    }

    const userId = body.user_id || body.userId;
    const currentStatus = body.current_status || body.currentStatus;
    const isPublicValue = body.is_public ?? body.isPublic;
    const isPublic = isPublicValue === undefined ? null : parseBoolean(isPublicValue, true);

    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('user_id', sql.NVarChar(100), userId ?? null)
        .input('title', sql.NVarChar(200), body.title ?? null)
        .input('author', sql.NVarChar(150), body.author ?? null)
        .input('description', sql.NVarChar(sql.MAX), body.description ?? null)
        .input('category', sql.NVarChar(100), body.category ?? null)
        .input('language', sql.NVarChar(20), body.language ?? null)
        .input('current_status', sql.NVarChar(50), currentStatus ?? null)
        .input('is_public', sql.Bit, isPublic)
        .input('pdf_blob_name', sql.NVarChar(500), body.pdf_blob_name ?? null)
        .input('cover_blob_name', sql.NVarChar(500), body.cover_blob_name ?? null)
        .query(`
            UPDATE dbo.Books
            SET
                user_id = COALESCE(@user_id, user_id),
                title = COALESCE(@title, title),
                author = COALESCE(@author, author),
                description = COALESCE(@description, description),
                category = COALESCE(@category, category),
                language = COALESCE(@language, language),
                current_status = COALESCE(@current_status, current_status),
                is_public = COALESCE(@is_public, is_public),
                pdf_blob_name = COALESCE(@pdf_blob_name, pdf_blob_name),
                cover_blob_name = COALESCE(@cover_blob_name, cover_blob_name)
            OUTPUT 
                INSERTED.id,
                INSERTED.user_id,
                INSERTED.title,
                INSERTED.author,
                INSERTED.description,
                INSERTED.category,
                INSERTED.language,
                INSERTED.current_status,
                INSERTED.is_public,
                INSERTED.pdf_blob_name,
                INSERTED.cover_blob_name,
                INSERTED.created_at
            WHERE id = @id;
        `);

    return {
        status: 200,
        jsonBody: {
            message: 'Libro actualizado correctamente',
            book: result.recordset[0]
        }
    };
}

async function deleteBook(request, context) {
    const id = parseInt(request.params.id, 10);

    if (isNaN(id)) {
        return {
            status: 400,
            jsonBody: {
                message: 'El id del libro debe ser un número válido.'
            }
        };
    }

    context.log(`Ejecutando DELETE /api/books/${id}`);

    const pool = await getSqlPool();

    const existingResult = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            SELECT 
                id,
                title,
                pdf_blob_name,
                cover_blob_name
            FROM dbo.Books
            WHERE id = @id;
        `);

    if (existingResult.recordset.length === 0) {
        return {
            status: 404,
            jsonBody: {
                message: 'Libro no encontrado.'
            }
        };
    }

    const book = existingResult.recordset[0];

    await pool.request()
        .input('id', sql.Int, id)
        .query(`
            DELETE FROM dbo.Books
            WHERE id = @id;
        `);

    await deleteBlobIfExists(book.pdf_blob_name, context);
    await deleteBlobIfExists(book.cover_blob_name, context);

    return {
        status: 200,
        jsonBody: {
            message: 'Libro eliminado correctamente',
            deletedBook: {
                id: book.id,
                title: book.title
            }
        }
    };
}

app.http('books', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    route: 'books',
    handler: async (request, context) => {
        const certError = checkApimCert(request);
        if (certError) return certError;

        try {
            if (request.method === 'GET') {
                return await getBooks(context);
            }

            if (request.method === 'POST') {
                return await createBook(request, context);
            }

            return {
                status: 405,
                jsonBody: {
                    message: 'Método no permitido.'
                }
            };

        } catch (error) {
            context.error('Error en /api/books:', error);

            return {
                status: 500,
                jsonBody: {
                    message: 'Error interno en /api/books',
                    error: error.message
                }
            };
        }
    }
});

app.http('bookById', {
    methods: ['GET', 'PUT', 'DELETE'],
    authLevel: 'anonymous',
    route: 'books/{id}',
    handler: async (request, context) => {
        const certError = checkApimCert(request);
        if (certError) return certError;

        try {
            if (request.method === 'GET') {
                return await getBookById(request, context);
            }

            if (request.method === 'PUT') {
                return await updateBook(request, context);
            }

            if (request.method === 'DELETE') {
                return await deleteBook(request, context);
            }

            return {
                status: 405,
                jsonBody: {
                    message: 'Método no permitido.'
                }
            };

        } catch (error) {
            context.error('Error en /api/books/{id}:', error);

            return {
                status: 500,
                jsonBody: {
                    message: 'Error interno en /api/books/{id}',
                    error: error.message
                }
            };
        }
    }
});