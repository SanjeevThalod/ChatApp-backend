const notFound = (req, res, next) => {
    const err = new Error(`Not Found ${req.url}`);
    err.status = 404; // Set the status property of the error object
    next(err);
}

const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500; // Use the status property if available
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack
    });
};

module.exports = { notFound, errorHandler };
