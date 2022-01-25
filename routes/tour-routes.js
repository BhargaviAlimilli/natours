const fs= require('fs')
const express= require("express")

const authControllers=require('./../controllers/authController')
const tourController= require('./../controllers/tour-controllers') // importing tour handlers

const reviewRoute= require('./review-routes')

// const tours= JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)) //reading file synchronously 

const router= express.Router()

//as we nw dont have checkID so we are commenting.This used to get parmtrs
//router.param('id', tourController.checkID)


router.route('/').get( authControllers.protect,tourController.getAllTours)
router.route('/').post( authControllers.protect,authControllers.restrictTo('admin'),tourController.createTour)
router.route('/top5-cheap-tours').get( authControllers.protect,tourController.aliasTopTours, tourController.getAllTours)
router.route('/tour-stats').get( authControllers.protect,tourController.getTourStats);
router.route('/monthly-plan/:year').get( authControllers.protect,tourController.getMonthlyPlan);
router.route('/:id').get(authControllers.protect,tourController.getTour)
router.route('/:id').patch( authControllers.protect,authControllers.restrictTo('admin'),tourController.updateTour)
router.route('/:id').delete(authControllers.protect,authControllers.restrictTo('admin', 'lead-guide'),tourController.deleteTour);
router.route('/distance-within/:distance/center/:latlng/unit/:unit').get(authControllers.protect,tourController.distanceWithIn)

router.use('/:tourId/reviews', reviewRoute)


module.exports= router; // exporting routers (to app.js)


