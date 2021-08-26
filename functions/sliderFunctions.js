const sliderSchema = require('../model/Sliders')
const { getMovie } = require('./movieFunctions')
const { getSong } = require('./songFunctions')
const { getSeries } = require('./webFunctions')

const addSlider = async(data) => {
    const prepareSlider = new sliderSchema(data)
    return await prepareSlider.save().then(newSlider => {
        return { success: true, msg: 'Slider Added', data: newSlider }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const getSliders = async() => {
    return await sliderSchema.find().then(async(response)=>{
        var retResponse = await Promise.all(response.map(async (value, index)=>{
            let retResponseTemp = []
            if(value.what == 'movie') {
                return ((await getMovie(value.contId)).data)
            }
            else if(value.what == 'web') {
                return ((await getSeries(value.contId)).data)
            }
            else if(value.what == 'song') {
                return ((await getSong(value.contId)).data)
            }
            else{
                return retResponseTemp
            }
        }));
        return { success: true, msg: 'Here is your data', data: retResponse }
    }).catch(err=>{
        return { success: false, msg: err.message }
    })
}

function counterSlider(){
    return sliderSchema.countDocuments()
}

const deleteSlider = async(_id)=>{
    return await sliderSchema.findOneAndDelete({contId: _id}).then(deletedSlider => {
        return { success: true, msg: 'Slider Deleted', data: deletedSlider }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

module.exports = {
    addSlider,
    getSliders,
    counterSlider,
    deleteSlider
}