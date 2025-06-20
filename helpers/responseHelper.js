const sendResponse = (res, statusCode, status, response = null) => {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(
        JSON.stringify({
            statusCode,
            status,
            response,
        })
    );
};

const successResponse = (res, statusCode = 200, response = null) => {
    sendResponse(res, statusCode, "success", response);
};

const errorResponse = (res, statusCode = 500, errors = null) => {
    sendResponse(res, statusCode, "error", errors);
};

module.exports = { successResponse, errorResponse };
