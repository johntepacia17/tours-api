const path = require('path');
// nodejs web application framework
const express = require('express');
// for http logger
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// set pug as view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));



//Global MIDDLEWARES
// serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// set security http headers
app.use(helmet());

// development logging
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// limit request from same API
const limiter = rateLimit({
    max: 100,
    windowM: 60 * 60 * 1000,
    message: 'Too many request from this IP, please try again in an hour!'
});

app.use('/api', limiter);


// body parser, reading data from body into req.body
app.use(express.json({limit: '10kb'}));
// parse data from url encoded form ex. update user form
app.use(express.urlencoded({ extended: true, limit: '10kb'}));
// parse data from cookie
app.use(cookieParser())

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(hpp({
    //allow duration paramater to duplicate
    whitelist: [
        'duration', 
        'ratingsQuantity', 
        'ratingsAverage', 
        'maxGroupSize', 
        'difficulty', 
        'price'
    ]
}));

app.use(compression());

// testing middlewares
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// get all http or routes
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `can't find ${req.originalUrl}`
    // });

    next(new AppError(`can't find ${req.originalUrl}`, 404));
});     

app.use(globalErrorHandler);

// SERVER
module.exports = app;