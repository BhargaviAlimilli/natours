const nodemailer= require('nodemailer')

const sendMail= async options=>{
    // create a transponder

    const transporter= nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      })

    // define the options
    const mailOptions= {
        from: 'adminstrator <admin@myoffice.io>',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    // send token to the mail
    await transporter.sendMail(mailOptions)

}

module.exports=sendMail

