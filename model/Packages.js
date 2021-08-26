const { Schema, model } = require('mongoose')

const packageSchema = new Schema({

    name: {
        type: String
    },
    details: {
        type: String
    },
    validDays: {
        type: Number
    },
    price: {
        type: Number
    }
    
}, {
    timestamps: true
}
)

module.exports = model('Package', packageSchema)