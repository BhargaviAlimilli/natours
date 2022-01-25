// Before DB concept we gat api or data of tours by reading file system fs
//and stored that data in tours variable which is parsed..now we dont need we get data through data base

const Tour = require("../models/tourmodel")
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync= require('./../utils/catchAsync')
const AppError= require('./../utils/AppError')
const factoryFunction= require('./../controllers/functionController')


//this middle ware func we created to chck tours based on id and stored in checkID vr thi is exprt n imprtd in routes
/* exports.checkID= (req,res,next,val)=> {
   if(req.params.id * 1 > tours.length){
        return res.status(404).json({
            status:"Fail",
            message: "No tours available on this id",
        })
    }; next()
}   */

/* exports.checkBody= (req,res,next)=> {
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            status: "error",
            message: "name or price missing in the body"
        })
    }; next()
}*/

exports.aliasTopTours = (req,res,next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours= factoryFunction.getAll(Tour)

exports.getTour= factoryFunction.getOne(Tour, { path: 'reviews' })

exports.createTour= factoryFunction.createOne(Tour)

exports.updateTour= factoryFunction.updateOne(Tour)

exports.deleteTour= factoryFunction.deleteOne(Tour)

exports.getTourStats = catchAsync( async (req, res,next) => {
      const stats = await Tour.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
          $group: {
            _id: { $toUpper: '$difficulty' },
            numTours: { $sum: 1 },
            numRatings: { $sum: '$ratingsQuantity' },
            avgRating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' }
          }
        },
        {
          $sort: { avgPrice: 1 }
        },
        {
          $match: { _id: { $ne: 'EASY' } }
        }
      ]);
  
      res.status(200).json({
        status: 'success',
        data: {
          stats
        }
      });
    
})

exports.getMonthlyPlan = async (req, res) => {
    try {
      const year = req.params.year * 1; // 2021
  
      const plan = await Tour.aggregate([
        {
          $unwind: '$startDates'
        },
        {
          $match: {
            startDates: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`)
            }
          }
        },
        {
          $group: {
            _id: { $month: '$startDates' },
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
          $limit: 12
        }
      ]);
  
      res.status(200).json({
        status: 'success',
        data: {
          plan
        }
      });
    } catch (err) {
      res.status(501).json({
        status: 'fail',
        message: err
      });
    }
};


// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi

exports.distanceWithIn= catchAsync(async (req,res,next)=>{

  const {distance,latlng,unit}= req.params
  const [lat,lng]= latlng.split(',')

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next( new AppError('Please provide latitude and longitude in the format lat,lng.',400) )
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
})



