const { Schema, model } = require('mongoose')

const objectSchema = new Schema({

    horizontal: { type: String },
    title: { type: String },
    what: { type: String },
    toogleOption: { type: Array },
    prio: { type: Number, default: 0 }


}, {
    timestamps: true
})

module.exports = model('Objects', objectSchema)