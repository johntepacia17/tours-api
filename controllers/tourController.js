// const fs = require('fs');

// for image upload
const multer = require('multer');
// for image resizer
const sharp = require('sharp');

const Tour  = require('./../models/tourModel');
// import APIfeatures class object
// const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb( new AppError('Not an image. Please upload only image.', 400) , false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

// allow multiple uploads
exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1},
    { name: 'images', maxCount: 3 }
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = (req, res, next) => {
    console.log(req.files);
    next();
}

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

// exports.checkID = (req, res, next, val) => {
//     console.log(`Tour id is ${val}`);
//     if(req.params.id * 1 > tours.length) {
//         return res.status(400).json({
//             status: 'failed',
//             message: 'invalid ID'
//         });
//     }
//     next();
// }


/**using Factory Functions */
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
/**end of using Factory Functions */


// exports.getAllTours = catchAsync(async (req, res, next) => {

//     const features = new APIFeatures(Tour.find(), req.query)
//                         .filter()
//                         .sort()
//                         .limitFields()
//                         .paginate();

//     const tours = await features.query;

//     // Send response
//     res.status(200).json({
//         status: 'success',
//         requestedAt: req.requestTime,
//         results: tours.length,
//         data: {tours}
//     });

    // try {
        // Build query
        //1a. filtering
        // const queryObj = {...req.query};
        // const excludedFields = ['page', 'sort', 'limit', 'fields'];
        // excludedFields.forEach(el => delete queryObj[el]);
        
        
        // // query params (filter data)
        // //1b.  advanced filtering
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // let query = Tour.find(JSON.parse(queryStr));
        
        // 2 Sorting
        // if(req.query.sort) {
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     query = query.sort(sortBy);
        //     // query = query.sort(req.query.sort)
        // } else {
        //     query = query.sort('-createdAt');
        // }

        // 3 Fields limiting
        // if(req.query.fields) {
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // } else {
        //     query = query.select('-__v');
        // }

        // 4 Pagination
        // const page = req.query.page * 1;
        // const limit = req.query.limit * 1;
        // const skip = (page - 1) * limit;

        // if(req.query.page) {
        //     const numTours = await Tour.countDocuments();
        //     if(skip >= numTours) throw new Error('This page does not exists');
        // }

        // query = query.skip(skip).limit(limit);
      

        //Execute query

        // const tours = await query;
        
        // refactoring api features
        // const features = new APIFeatures(Tour.find(), req.query)
        //                 .filter()
        //                 .sort()
        //                 .limitFields()
        //                 .paginate();

        // const tours = await features.query;

     

        // // Send response
        // res.status(200).json({
        // status: 'success',
        // requestedAt: req.requestTime,
        // results: tours.length,
        // data: {tours}
        // });
    // } catch(err) {
    //     res.status(404).json({
    //         status: 'Fail',
    //         message: err
    //     })
    // }
    
// });

// exports.getTour = catchAsync(async (req, res, next) => {

//     // const tour = await Tour.findById(req.params.id);

//     const tour = await Tour.findById(req.params.id).populate('reviews');

//     // add populate methods to fill in the user's data in guides property
//     // const tour = await Tour.findById(req.params.id).populate({
//     //     path: 'guides',
//     //     select: '-__v -passwordChangedAt' 
//     // });

//     if(!tour) {
//        return next(new AppError('No tour find with that ID', 404));
//     }

//     res.status(200).json({
//         status: 'Success',
//         data: {tour}
//     });

// });


// exports.createTour = catchAsync(async (req, res, next) => {

//     const newTour = await Tour.create(req.body);
    
//     res.status(201).json({
//         status: 'success',
//         data: {
//             tours: newTour
//         }
//     });

// });

// exports.updateTour = catchAsync(async (req, res, next) => {

//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     });

//     if(!tour) {
//         return next(new AppError('No tour find with that ID', 404));
//      }

//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     });
    
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {

//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if(!tour) {
//         return next(new AppError('No tour find with that ID', 404));
//      }

//     res.status(204).json({
//         status: 'success',
//         data: null,
//         message: 'Successfully deleted an item.'
//     });
   
// });

// Aggregation pipeline mongodb
exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        { 
            $match: { ratingsAverage: { $gte: 4.5 }}
        },
        {
            $group: {
                // _id: '$difficulty',
                _id: { $toUpper: '$difficulty'},
                numTours: {$sum: 1},
                numRatings: {$sum: '$ratingsQuantity'},
                avgRating: { $avg: '$ratingsAverage'},
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            }
        },
        {
            $sort: {
                avgPrice: 1
            }
        },
        // {
        //     $match: {
        //         _id: { $ne: 'EASY' },
        //     }
        // }
    ]);

    res.status(200).json({
        status: 'Success!',
        results: stats.length,
        data: {stats}
    });

    // try {
    //     const stats = await Tour.aggregate([
    //         { 
    //             $match: { ratingsAverage: { $gte: 4.5 }}
    //         },
    //         {
    //             $group: {
    //                 // _id: '$difficulty',
    //                 _id: { $toUpper: '$difficulty'},
    //                 numTours: {$sum: 1},
    //                 numRatings: {$sum: '$ratingsQuantity'},
    //                 avgRating: { $avg: '$ratingsAverage'},
    //                 avgPrice: { $avg: '$price' },
    //                 minPrice: { $min: '$price' },
    //                 maxPrice: { $max: '$price' },
    //             }
    //         },
    //         {
    //             $sort: {
    //                 avgPrice: 1
    //             }
    //         },
    //         // {
    //         //     $match: {
    //         //         _id: { $ne: 'EASY' },
    //         //     }
    //         // }
    //     ]);

    //     res.status(200).json({
    //         status: 'Success!',
    //         results: stats.length,
    //         data: {stats}
    //     });

    // } catch(err) {
    //     res.status(404).json({
    //         status: 'Fail',
    //         message: err
    //     });
    // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: { 
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31 `),
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: {$sum: 1},
                tours: {$push: '$name'},
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {
                numTourStarts: -1
            }
        },
        {
            $limit: 12
        }
    ]);

    res.status(200).json({
        status: 'Success',
        results: plan.length,
        data: {plan}
    });

    // try {
    //     const year = req.params.year * 1;
    //     const plan = await Tour.aggregate([
    //         {
    //             $unwind: '$startDates',
    //         },
    //         {
    //             $match: {
    //                 startDates: { 
    //                     $gte: new Date(`${year}-01-01`),
    //                     $lte: new Date(`${year}-12-31 `),
    //                 }
    //             }
    //         },
    //         {
    //             $group: {
    //                 _id: { $month: '$startDates' },
    //                 numTourStarts: {$sum: 1},
    //                 tours: {$push: '$name'},
    //             }
    //         },
    //         {
    //             $addFields: { month: '$_id' }
    //         },
    //         {
    //             $project: {
    //                 _id: 0
    //             }
    //         },
    //         {
    //             $sort: {
    //                 numTourStarts: -1
    //             }
    //         },
    //         {
    //             $limit: 12
    //         }
    //     ]);

    //     res.status(200).json({
    //         status: 'Success',
    //         results: plan.length,
    //         data: {plan}
    //     });

    // } catch(err) {
    //     res.status(404).json({
    //         status: 'Fail',
    //         message: err
    //     });
    // }
});

exports.getToursWithin = catchAsync( async (req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    // compute radius in mi and km
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in format lat,lng', 400));
    }

    const tours = await Tour.find({ 
        startLocation: { 
            $geoWithin: { 
                $centerSphere: [[lng, lat], radius] 
            } 
        } 
    });

    res.status(200).json({
        status: 'Success',
        results: tours.length,
        data: {
            data: tours
        }
    });

});

exports.getDistances = catchAsync( async (req, res, next) => {
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    // convert meters to miles or km
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in format lat,lng', 400));
    } 

    // calculate distance
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            // filter data output
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'Success',
        data: {
            data: distances
        }
    });

});