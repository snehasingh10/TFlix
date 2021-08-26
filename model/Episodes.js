const { Schema, model } = require('mongoose')

const episodeSchema = new Schema({

    seriesId: {
        type: String
    },
    seasonNumber: {
        type: String
    },
    episodeNumber: {
        type: String
    },
    videoPath: {
        type: String
    },
    subtitlesPath: {
        type: Array
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

module.exports = model('Episodes', episodeSchema)