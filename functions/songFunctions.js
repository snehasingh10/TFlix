const songSchema = require('../model/Songs')

const addSong = async(data) => {
    const prepareSong = new songSchema(data)
    return await prepareSong.save().then(newSong => {
        return { success: true, msg: 'Song Added', data: newSong }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const getSongs = async() => {
    return await songSchema.find().then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const getSong = async(id) => {
    return await songSchema.findById(id).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const searchSong = async(keyword)=>{
    return await songSchema.find({$or: [{title: {$regex: keyword}}, {belongsTo: {$regex: keyword}}]}).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

function counterSong(){
    return songSchema.countDocuments()
}

const viewedSong = async(id)=>{
    return await songSchema.findByIdAndUpdate(id,{$inc:{views: 1}}).then(response => {
        return ({ success: true, msg: "Viwed", data: response.views+1 })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

module.exports = {
    addSong,
    getSongs,
    getSong,
    searchSong,
    counterSong,
    viewedSong
}