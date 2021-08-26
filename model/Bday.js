const { Schema, model } = require('mongoose')

const bdaySchema = new Schema({

    bday: {
        type: Date
    },
    name: {
        type: String
    },
    showId:{
        type: String
    }
}, 
{
    timestamps: true
} 
)

module.exports = model('BdaySpecial', bdaySchema)