const { Schema, model } = require('mongoose')

const personSchema = new Schema({

    name: { type: String },
    photoPath: { type: String },
    special:{ type: Boolean, default: false }
    
},
{
    timestamps: true
} , { typeKey: '$type' }
)

module.exports = model('Persons', personSchema)