const express= require("express")
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss= require('xss-clean')
const hpp = require('hpp')
const path = require('path')

//requiring modules from other files
const viewRouter= require('./routes/view-routes')
const tourRouter= require('./routes/tour-routes')
const userRouter= require('./routes/user-routes')
const reviewRouter= require('./routes/review-routes')
const AppError= require('./utils/AppError')
const globalErrorHandler= require('./controllers/error-controllers')


const app= express()
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.use(express.json())// body parser to read json objects from req.body

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req,res,next)=>{
    // res.status(404).json({     ---> 0 level of error handling
    //     status: "fail",
    //     message: `Sorry, can't find the webpage ${req.originalUrl} you are looking for`
    // })
//  ---> 0+ level of error handling  
//const err= new Error(`Sorry, can't find the webpage ${req.originalUrl} you are looking for`)
//   err.status="fail",
//   err.statusCode=404
  next(new AppError(`Sorry, can't find the webpage ${req.originalUrl} you are looking for`)) 
  // required from AppError js file and using that modified code for level 1 of error handling
})

app.use(globalErrorHandler)

module.exports=app;   //// exporting app to start server in server.js

