const jwt= require('jsonwebtoken')
const crypto= require('crypto')
const { promisify } = require('util');
const userMod= require('./../models/userModel')
const catchAsync= require('./../utils/catchAsync')
const AppError= require('./../utils/AppError')
const sendEmail= require('./../utils/email')


const signToken= id=>{
   return jwt.sign({id}, process.env.JWT_SECRET)
}

//
// creating cookie
const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true
};


exports.signup= catchAsync( async (req,res,next)=>{
    const newUser= await userMod.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    })
    const token= signToken(newUser._id)
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt',token,cookieOptions)
    res.status(200).json({
        status:"success",
        message:"new user has been created",
        token,
        data:{
            user: newUser
        }
    })
    console.log("New user signed up *******")
})

exports.login= catchAsync(async (req,res,next)=>{

    const email= req.body.email 
    const password= req.body.password
    //1. if no email n password then return error 
    if(!email || !password){
        return next(new AppError("Please provide email and password", 400))
    }
    //2. check email n password is correct
    const user= await userMod.findOne({email}).select('+password')
    if(!user || !(await user.correctPassword(password,user.password))){
        return next(new AppError("Invalid mailid or password", 401))
    }
    //if everything is okay login the user
    const usertoken= signToken(user._id)
    //cookie
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt',usertoken,cookieOptions)
    res.status(200).json({
        status: "success",
        usertoken
    })
})

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};


exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3) Check if user still exists
    const currentUser = await userMod.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }  
    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      // roles ['admin', 'lead-guide']. role='user'
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }
  
      next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await userMod.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetUrl= `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
  const message= `Forgot your password? please submit your new password and confirm passwords in the given links. ${resetUrl} If not please ignore!`

  try{
  await sendEmail({
    email: user.email,
    subject: 'your password reset token, hurry up token is valid for 10 mins',
    message
  })

  res.status(200).json({
    status: "success",
    message: "Token has been sent to your mail"
  })
 }
 catch(err){
   user.passwordResetToken= undefined
   user.passwordResetExpires= undefined

   await user.save({ validateBeforeSave: false });

   return next(new AppError("unable to send the mail please try again later",500)) 

 }

})

exports.resetPassword= catchAsync(async (req,res,next)=>{
  // check the user with given token and check the token expired or not
  const hashedtoken= crypto.createHash('sha256').update(req.params.token).digest('hex');
  console.log(hashedtoken + "   this is hased")

  const user= await userMod.findOne({
    passwordResetToken: hashedtoken,
    passwordResetExpires: { $gt: Date.now() }
  })

  if(!user){
    return next(new AppError("Invalid token or tokem has been expired",500))
  }
  //if verified then create new password
  user.password= req.body.password,
  user.passwordConfirm= req.body.passwordConfirm
  user.passwordResetToken= undefined
  user.passwordResetExpires= undefined
  await  user.save() //save the document
  const token= signToken(user._id)
  //cookie
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions)

 // send the user token 
    res.status(200).json({
        status:"success",
        message:"user has been updated",
        token,
        data:{
            user
        }
    })
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await userMod.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!
 
  const token= signToken(user._id)
// creating cookie
 if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
 res.cookie('jwt', token, cookieOptions)

  // 4) Log user in, send JWT
    res.status(200).json({
      
        status:"success",
        message:"new user has been created",
        token,
        data:{
            user
        }
    })

})


// Only for rendered pages, no errors!
// exports.isLoggedIn = async (req, res, next) => {
//   if (req.cookies.jwt) {
//     try {
//       // 1) verify token
//       const decoded = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);

//       // 2) Check if user still exists
//       const currentUser = await userMod.findById(decoded.id);
//       if (!currentUser) {
//         return next();
//       }

//       // 3) Check if user changed password after the token was issued
//       if (currentUser.changedPasswordAfter(decoded.iat)) {
//         return next();
//       }

//       // THERE IS A LOGGED IN USER
//       res.locals.user = currentUser;
//       return next();
//     } catch (err) {
//       return next();
//     }
//   }
//   next();
// };

