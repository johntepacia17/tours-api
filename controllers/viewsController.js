const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {

    const tours = await Tour.find();
    
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });

});

exports.getTour = catchAsync( async (req, res, next) => {

    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        // select field to display on output
        fields: 'review rating user'
    });

    if(!tour) {
        return next( new AppError('Tour cant be found.', 404) );
    }

    res.status(200)
        .set('Content-Security-Policy',"default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;")
        .render('tour', {
            title: `${tour.name} Tour`,
            tour
        });
});

exports.getLoginForm =  (req, res) => {

    res.status(200)
        .set('Content-Security-Policy',"default-src 'self'; base-uri 'self'; block-all-mixed-content; font-src 'self' https: data:; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self' https://cdn.jsdelivr.net; script-src-attr 'none'; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;")
        .render('login', {
        title: 'Log into your account'
    });

};

exports.getAccount = (req, res) => {
    res.status(200)
        .render('account', {
        title: 'Your account'
    });
}

exports.getMyTours = catchAsync( async (req, res, next) => {
    // 1. find all bookings
    const bookings = await Booking.find({user: req.user.id});

    // 2. find tour with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    // using $in operator for tourIds
    const tours = await Tour.find({_id: {$in : tourIDs}});

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    });
});

exports.updateUserData = catchAsync( async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    },
    {
        new: true,
        runValidators: true
    });

    res.status(200).render('account', {
        title: 'Your Account',
        user: updatedUser
    });
    
});