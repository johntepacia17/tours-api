const Tour = require('./../models/tourModel');
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

    res.status(200).render('tour', {
        title: 'The Forest Hiker',
        tour
    });
});