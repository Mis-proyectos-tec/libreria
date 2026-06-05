const crypto = require('crypto');

function checkApimCert(request) {
    const expectedThumbprint = (process.env.APIM_CERT_THUMBPRINT || '')
        .toUpperCase()
        .replace(/:/g, '')
        .replace(/\s/g, '');

    if (!expectedThumbprint) return null;

    const certHeader = request.headers.get('x-arr-clientcert');
    if (!certHeader) {
        return { status: 401, jsonBody: { message: 'Client certificate required' } };
    }

    try {
        const certDer = Buffer.from(certHeader, 'base64');
        const thumbprint = crypto.createHash('sha1').update(certDer).digest('hex').toUpperCase();

        if (thumbprint !== expectedThumbprint) {
            return { status: 403, jsonBody: { message: 'Invalid client certificate' } };
        }

        return null;
    } catch {
        return { status: 400, jsonBody: { message: 'Invalid certificate format' } };
    }
}

module.exports = { checkApimCert };
