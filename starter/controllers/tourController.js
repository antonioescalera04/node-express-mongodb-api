//const fs = require('fs');
const Tour = require('./../models/tourModel');
// Al inicio del archivo tourController.js
const tours = require('../dev-data/data/tours-simple.json'); // Ajusta la ruta según tu estructura
const APIFeatures = require('./../utils/apiFeatures');
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingAverage,price'
    req.query.fields = 'name,prices,ratingsAverage,summary,difficulty';
    next();
};



exports.getAllTours = async (req, res) => {
    try { 
        //EXECUTE QUERY
         const features = new APIFeatures(Tour.find(), req.query)
         .filter()
         .sort()
         .limitFields()
         .paginate();
         const tours = await features.query;

        // const query = Tour.find();
           // .where('duration')
            //.equals(5)
          //  .where('difficulty')
        //    .equals('easy');
        //SEND RESPONSE
            res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        })

        

    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
    
};

exports.getTour = async (req, res) => {

    try {
        const tour =  await Tour.findById(req.params.id);
        res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })
        

    }catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });

    }
    console.log(req.params);
    //Convierte los datos a datos esperados en este caso a numeros
    const id = req.params.id * 1;


    //Sanitizacion de datos.
    if (id > tours.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID'
      });  
    }

    

    
/*
    const tour = tours.find(el => el.id === id);    
    
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    })*/
}

exports.createTour = async (req,res) => {
    try {

        const newTour = await Tour.create(req.body);

        res.status(201).json({
                status: 'success',
                data: {
                    tours: newTour
                }
        })
        //console.log(req.body);
        /*
        const newId = tours[tours.length -1].id + 1;
        const newTour = Object.assign({ id: newId }, req.body);

        tours.push(newTour);
        fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
            res.status(201).json({
                status: 'success',
                data: {
                    tours: newTour
                }
            })
        })*/
    }catch(err) {
        res.status(400).json({
            status: 'fail',
            message: err

        })
    }
};

exports.updateTour = async (req,res) => {
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: false 
        })
        res.status(200).json({
            status: 'succes',
            data: {
                tour: "<Updated tour here..>"
            }
        });
    }catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });

    }
};

exports.deleteTour = async (req,res) => {

    try{
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'succes',
            data: null
        });
    }catch(err){
        res.status(404).json({
            status: 'fail',
            message: err
        });
            
    }
}

exports.getToursStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage : { $gte:4.5 } }
            },
            {
                $group: {
                _id: {$toUpper: '$difficulty'},
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price'},
                }   
            },
            {
        $sort: { 
            avgPrice: 1   // <--- CORRECTO
        }
    }



        ]);

        res.status(200).json({
            status: 'success',
            data: { 
                stats
             } 
        });


    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: { 
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    }
                }
            },
            {
                $group: {
                  _id:  { $month: '$startDates' },
                  numTourStarts: { $sum: 1 },
                  tours: { $push: '$name' }
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
                $sort: { numTourStarts: -1 } 
            },
            {
                $limit: 6
            }
        ]);

          res.status(200).json({
            status: 'success',
            data: { 
                plan
             } 
        });

    } catch(err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}