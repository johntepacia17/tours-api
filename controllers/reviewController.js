const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');
// const catchAsync = require('./../utils/catchAsync');


// exports.getAllReviews = catchAsync(async (req, res, next) => {

//     const review = await Review.find(filter);

//     res.status(200).json({
//         status: 'Success',
//         results: review.length,
//         data: {review}
//     });

// });

// middleware for createReview
exports.setTourUserIds = (req, res, next) => {
    // allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next();
}

/**using Factory Functions */
exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
// delete action
exports.deleteReview = factory.deleteOne(Review);
/**end of using Factory Functions */


// exports.createReview = catchAsync( async (req, res, next) => {
 
//     const newReview = await Review.create(req.body);

//     res.status(201).json({
//         status: 'Success',
//         data: {
//             review: newReview
//         }
//     });

// });

