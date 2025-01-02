const mongoose = require('mongoose');
const dotenv = require('dotenv');

// errors outside express: uncaught exception
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION!... Shutting down');
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({path: './config.env'});
const app = require('./app');

const DB = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
    })
    .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port! ${port}...`);
});

// errors outside express: unhandled rejections
process.on('unhandledRejection', err => {
    console.log('Unhandler rejection!... Shutting down');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
    
});