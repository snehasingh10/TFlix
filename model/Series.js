const { Schema, model } = require('mongoose')

const seriesSchema = new Schema({

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
    trailerPath: { type: String },
    castDetail: { type: String },
    writer: { type: String },
    director: { type: String },
    producer: { type: String },
    isRent: { type: Boolean },
    rent: { type: Number },
    addedBy: { type: String }

}, {
    timestamps: true
}
)

module.exports = model('Series', seriesSchema)