const revMod= require('./../models/reviewModel')
const catchAsync=require('./../utils/catchAsync')
const AppError=require('./../utils/AppError')
const factoryFunction=require('./functionController')


exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
  };

exports.createReview=factoryFunction.createOne(revMod)
exports.getAllReviews=factoryFunction.getAll(revMod)
exports.getReview=factoryFunction.getOne(revMod)
exports.updateReview=factoryFunction.updateOne(revMod)
exports.deleteReview= factoryFunction.deleteOne(revMod)

