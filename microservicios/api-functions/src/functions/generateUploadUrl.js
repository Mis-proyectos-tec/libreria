const { app } = require('@azure/functions');
const {
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters,
    BlobSASPermissions
} = require('@azure/storage-blob');
const crypto = require('crypto');
const { checkApimCert } = require('./certAuth');

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

function cleanFileName(fileName) {
    return fileName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9.\-_]/g, '');
}

function getFolderByContentType(contentType) {
    if (contentType === 'application/pdf') {
        return 'pdfs';
    }

    if (contentType && contentType.startsWith('image/')) {
        return 'images';
    }

    return 'others';
}

app.http('generateUploadUrl', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'generate-upload-url',
    handler: async (request, context) => {
        const certError = checkApimCert(request);
        if (certError) return certError;

        try {
            const body = await request.json();

            const fileName = body.fileName;
            const contentType = body.contentType;

            if (!fileName || !contentType) {
                return {
                    status: 400,
                    jsonBody: {
                        message: 'fileName y contentType son obligatorios.'
                    }
                };
            }

            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/webp'
            ];

            if (!allowedTypes.includes(contentType)) {
                return {
                    status: 400,
                    jsonBody: {
                        message: 'Tipo de archivo no permitido. Solo PDF, JPG, PNG o WEBP.'
                    }
                };
            }

            const containerName = process.env.BLOB_CONTAINER_NAME || 'libros';
            const { accountName, credential } = getStorageCredential();

            const folder = getFolderByContentType(contentType);
            const safeFileName = cleanFileName(fileName);
            const uniqueId = crypto.randomUUID();

            const blobName = `${folder}/${uniqueId}-${safeFileName}`;

            const startsOn = new Date(Date.now() - 5 * 60 * 1000);
            const expiresOn = new Date(Date.now() + 15 * 60 * 1000);

            const sasOptions = {
                containerName,
                blobName,
                permissions: BlobSASPermissions.parse('cw'),
                startsOn,
                expiresOn,
                protocol: 'https'
            };

            const sasToken = generateBlobSASQueryParameters(sasOptions, credential).toString();

            const uploadUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

            return {
                status: 200,
                jsonBody: {
                    uploadUrl,
                    blobName,
                    expiresOn
                }
            };

        } catch (error) {
            context.error('Error generando upload URL:', error);

            return {
                status: 500,
                jsonBody: {
                    message: 'Error al generar URL de subida',
                    error: error.message
                }
            };
        }
    }
});