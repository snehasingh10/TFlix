const { Schema, model } = require('mongoose')

const sliderSchema = new Schema({

    what: {
        type: String //movie,web,song
    },
    contId: {
        type: String
    }

},
{
    timestamps: true
}
)

module.exports = model('Sliders', sliderSchema)