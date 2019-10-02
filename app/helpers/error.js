module.exports = async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        let status = err.statusCode || err.status || 500;
        let body = {
            message: err.message
        };
        // will only respond with JSON
        ctx.status = status;
        ctx.body = body
    }
};

