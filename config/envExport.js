require('dotenv').config()

module.exports = {
    port: process.env.PORT,
    bckHost: process.env.BCK_HOST,
    requestFrom: process.env.REQUEST_FROM,
    dbString: process.env.DB_STRING,
    secret: process.env.SECRET,
    rzpKey: process.env.RZP_KEY,
    rzpSecret: process.env.RZP_SECRET,
    sendgridApi: process.env.SENDGRID_API,
    sendgridMail: process.env.SENDGRID_MAIL,
    paytmConfig: JSON.parse(process.env.PAYTM_CONFIG),
    stripeKey: process.env.STRIPE_PUBLISHABLE_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY
}