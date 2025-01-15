const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

// allow router to merge from tourRoutes
const router = express.Router();

// this route is only for the client just to get the checkout sessions
router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession);


module.exports = router;