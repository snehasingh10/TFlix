const app = require('express')()
const bodyParser = require('body-parser')
const cors = require('cors')
const { connect } = require('mongoose')
const { port, requestFrom, dbString } = require('./config/envExport')
const fileUpload = require('express-fileupload')
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

const corsOption = { origin: '*' };
// const corsOption = { origin: requestFrom }
const mongoOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors(corsOption))


const initFunction = async function() {
    await new connect(dbString, mongoOption).then(() => {
        app.listen(process.env.PORT || port, err => {
            console.log((err ? err : 'Listing on port: ' + port))
        })
    }).catch(err => {
        console.log(err.message)
    })
}();


app.get('/', (req, res) => { res.json({ success: true, msg: 'Server is up' }) })

app.use('/api/user', require('./routes/user'))
app.use('/api/stream', require('./routes/stream'))
app.use('/api/global', require('./routes/global'))
app.use('/api/payment/razorpay', require('./routes/razorpay'))
app.use('/api/payment/paytm', require('./routes/paytm'))
app.use('/api/payment/stripe', require('./routes/stripe'))
app.use('/api/admin', require('./routes/admin'))



app.use('/uploads', require('./routes/uploads'))
app.use('/giveMeImg', require('./routes/gimmeimg'))