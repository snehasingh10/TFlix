const { Schema, model } = require('mongoose')

const paymentSchema = new Schema({

    paymentType: {
        type: String  
    },
    item: {
        type: String
    },
    itemId: {
        type: String   
    },
    paymentId: {
        type: String   
    },
    orderId: {
        type: String   
    },
    signature: {
        type: String   
    }
    
    
}, 
{
    timestamps: true
}
)

module.exports = model('Payment', paymentSchema)