const revController= require('./../controllers/review-controller')
const authController= require('./../controllers/authController')

const express= require('express')

const router=express.Router({mergeParams: true})

router.route('/addReview').post( authController.protect,authController.restrictTo('user'),revController.setTourUserIds,revController.createReview)
router.route('/readReviews').get(authController.protect,revController.getAllReviews)
router.route('/readReviews/:id').get(authController.protect,revController.getReview)
router.route('/updateReview/:id').patch(authController.protect,authController.restrictTo('user'),revController.updateReview)
router.route('/:id').delete( authController.protect,authController.restrictTo('user','admin'),revController.deleteReview)



module.exports=router