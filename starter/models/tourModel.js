const mongoose = require('mongoose');
const { kMaxLength } = require('node:buffer');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A tour must have less or equal then 40 characters'],
        minlength: [10, 'A tour must have more or equal then 10 characters'],
        validate: [validator.isAlpha, 'Tour name must only contain characters' ]
    },
    slug: {
        type: String,        
    
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },

    maxGroupSize: {
        type: Number,
        required : [true, 'A tour must have a group size']
    },

    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },

    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price'],
    },
    priceDiscount: { 
        type: Number,
        validate: {
            validator: function(val) {
                // this only points to current doc on new document creation
            return val < this.price
        },
        message: 'Discount price ({VALUE})shold be below regular price'
        } 
    }, 
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have description']
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
        default: Date.now()
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7
})

tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });  
    next();
});

//QUERY MIDDLEWARE 
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next()
});

tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    next();
});

//AGGREGATION MIDDLEWARE - CORREGIDO
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({
        $match: { secretTour: { $ne: true } }
    });
    console.log(this.pipeline());
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;