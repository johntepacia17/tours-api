const AppError = require("./../utils/appError");

// handling invalid database id
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

// handling duplicate db fields
const handleDuplicateFieldsDB = err => {

    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value`;
    return new AppError(message, 400);
}

// handling mongoose validation error
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid Token. Please login again', 401);
const handleJWTExpiredError = () => new AppError('Token Expired. Please login again', 401);

const sendErrorDev = (err, req, res) => {
    // API
    if(req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: `Failed: ${err.message}`,
            stack: err.stack
        });
    } 

     // log error
     console.error('ERROR', err);
   
    // send error on rendered page
    return res.status(err.statusCode).render('error', {
        title: 'Uh oh! Something went wrong!',
        msg: err.message
    });

}

const sendErrorProd = (err, req, res) => {
    // API
    if(req.originalUrl.startsWith('/api')) {
        // Operational, trusted error: send message to client
        if(err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: `Failed: ${err.message}`
            });
        // programming or other unknown error: don't leak error details
        } 

        // log error
        console.error('ERROR', err);

        // send generic message
        return res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
        
    } 

    // rendered website
    if(err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Uh oh! Something went wrong!',
            msg: err.message
        });    
    // programming or other unknown error: don't leak error details
    }

    // log error
    console.error('ERROR', err);

    // send generic message
    return res.status(err.statusCode).render('error', {
        title: 'Uh oh! Something went wrong!',
        msg: 'Please try again later.'
    });

}



module.exports = (err, req, res, next) => {
 
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = {...err};

        error.message = err.message;

        if(error.name === 'CastError') error = handleCastErrorDB(error);
        if(error.code === 11000) error = handleDuplicateFieldsDB(error);
        if(error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }

}