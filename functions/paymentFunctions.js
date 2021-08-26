const paymentSchema = require('../model/Payments')

const paymentSuccess = async (data)=>{
    const preparePay = new paymentSchema(data)
    return await preparePay.save().then(newPay => {
        return { success: true, msg: 'Pay Done', data: newPay }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

module.exports = {
    paymentSuccess
}