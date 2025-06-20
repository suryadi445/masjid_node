const getBaseUrl = (req) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    return `${protocol}://${req.headers.host}`;
};

module.exports = { getBaseUrl };
