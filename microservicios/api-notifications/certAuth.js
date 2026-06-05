const crypto = require('crypto');

module.exports = function certAuth(req, res, next) {
    if (req.path === '/health' || req.path === '/debug-headers') return next();

    const expectedThumbprint = (process.env.APIM_CERT_THUMBPRINT || '')
        .toUpperCase()
        .replace(/:/g, '')
        .replace(/\s/g, '');

    if (!expectedThumbprint) return next();

    const certHeader = req.headers['x-arr-clientcert'];
    if (!certHeader) {
        return res.status(401).json({ message: 'Client certificate required' });
    }

    try {
        const certDer = Buffer.from(certHeader, 'base64');
        const thumbprint = crypto.createHash('sha1').update(certDer).digest('hex').toUpperCase();

        if (thumbprint !== expectedThumbprint) {
            return res.status(403).json({ message: 'Invalid client certificate' });
        }

        next();
    } catch {
        return res.status(400).json({ message: 'Invalid certificate format' });
    }
};
