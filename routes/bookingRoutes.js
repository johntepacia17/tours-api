const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

// allow router to merge from tourRoutes
const router = express.Router();

// only accessible to login users
router.use(authController.protect);

// this route is only for the client just to get the checkout sessions
router.get('/checkout-session/:tourId', authController.protect, bookingController.getCheckoutSession);

// only accessible to admin and lead guides
router.use(authController.restrictTo('admin', 'lead-guide'))

router
    .route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking);

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);



module.exports = router;