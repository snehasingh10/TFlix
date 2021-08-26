const { Schema, model } = require('mongoose')

const songSchema = new Schema({

    title: {
        type: String
    },
    belongsTo: {
        type: String
    },
    backdropPath: {
        type: String
    },
    videoPath: {
        type: String
    },
    addedBy: {
        type: String
    },
    views: {
        type: Number,
        default: 0
    }

},
{
    timestamps: true
}
)

module.exports = model('Songs', songSchema)