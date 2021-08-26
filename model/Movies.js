const { Schema, model } = require('mongoose')

const movieSchema = new Schema({

    backdropPath: { type: String },
    genres: { type: String },
    originalLanguage: { type: String },
    overview: { type: String },
    popularity: { type: String },
    productionCompany: { type: String },
    tagline: { type: String },
    title: { type: String },
    voteCount: { type: Number },
    voteAverage: { type: String },
    videoPath: { type: String },
    subtitlesPath: { type: Array },
    trailerPath: { type: String },
    castDetail: { type: String },
    writer: { type: String },
    director: { type: String },
    producer: { type: String },
    isRent: { type: Boolean },
    rent: { type: Number },
    grp: { type: Number, default: 1 },
    /*
     * 1 => Worldwide
     * 2 => India Only
     * 3 => Saarc nations (Afghanistan, Bangladesh, Bhutan, India, the Maldives, Nepal, Pakistan, and Sri Lanka)
     * 4 => Wordwide without India
     */
    addedBy: { type: String },
    views: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
})

module.exports = model('Movies', movieSchema)