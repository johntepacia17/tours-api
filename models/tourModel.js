const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour must have less or equal 40 characters'],
        minlength: [10, 'A tour must have more or equal to 10 characters'],
        // from validator
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a maximum group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is only easy, medium and difficult'
        } 
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        // rounded to two decimal place
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                // this only points to current doc on NEW document creation
                return val < this. price;
            },
            // {VALUE} is from mongoose
            message: 'A tour discount ({VALUE}) must be lower than the original price'
        }
        
    },
    summary: {
        type: String,
        required: [true, 'A tour must have a summary'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour : {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum:['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    // Data Modelling Tour Guides: Embedding
    // guides: Array
    // Data Modelling Tour Guides: Child Referencing
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]   
}, {
    toJSON: { virtuals : true},
    toObject: { virtuals : true},
});

/****create index for for improving read performance */
// tourSchema.index({price: 1})
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});

/****end of create index for price for improving read performance */

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

// virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

// document middleware: runs before .save() and .create()
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower:true});
    next();
});

/**Data Modelling Tour Guides: Embedding */
// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     // override guidesPromises to this.guides
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

// tourSchema.pre('save', function(next){
//     console.log('save document');
//     next();
// });

// tourSchema.post('save', function(doc, next){
//     console.log(doc);
//     next();
// });
/**end of Data Modelling Tour Guides: Embedding */

/**Query Middleware */
// tourSchema.pre('find', function(next){
tourSchema.pre(/^find/, function(next){
    this.find({ secretTour: {$ne : true} });
    this.start = Date.now();
    next();
});


// add populate on getAllTours route
tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
});

// tourSchema.post(/^find/, function(docs, next){
//     console.log(`Query took ${Date.now() - this.start} milliseconds`);
//     next();
// });

/**end of Query Middleware */

// Aggregation middleware
// tourSchema.pre('aggregate', function(next){
//     this.pipeline().unshift({ $match: { secretTour: {$ne: true} } });
//     console.log(this.pipeline());
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;