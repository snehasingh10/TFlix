const { Schema, model } = require('mongoose')

const liveSchema = new Schema({

    name: {
        type: String
    },
    url:{
        type: String
    },
    logoPath: {
        type: String
    }

}, {
    timestamps: true
})

module.exports = model('Live', liveSchema)