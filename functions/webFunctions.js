const episodeSchema = require('../model/Episodes')
const seriesSchema = require('../model/Series')

const addSeries = async(data) => {
    const prepareSeries = new seriesSchema(data)
    return await prepareSeries.save().then(newSeries => {
        return { success: true, msg: 'Series Added', data: newSeries }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const getSeriess = async() => {
    return await seriesSchema.find().then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const getSeries = async(id) => {
    return await seriesSchema.findById(id).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const getMySeries = async(id) => {
    return await seriesSchema.find({ addedBy: id }).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const addEpisode = async(data) => {
    const prepareEpisode = new episodeSchema(data)
    return await prepareEpisode.save().then(newEpisode => {
        return { success: true, msg: 'Episode Added', data: newEpisode }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const getTitle = async(id) =>{
    return await seriesSchema.findById(id).then(response => {
        return response.title
    }).catch(err => {
        return false
    })
}

const getEpisodes = async() => {
    return await episodeSchema.find().then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const getWebEpisodes = async(id) => {
    return await episodeSchema.find({seriesId: id}).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const getEpisode = async(id) => {
    return await episodeSchema.findById(id).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const fetchWeb = async(retObject) => {
    return await seriesSchema.find(retObject.query).sort(retObject.sortArray).limit(retObject.limit).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const recomWeb = async(keyword)=>{
    let genres =  keyword.split(',').map(val => val.trim())
    let returnRes = await Promise.all(genres.map(async (val,ind)=>{
        return await seriesSchema.find({genres: {$regex: val}}).sort({popularity: -1}).limit(5).then(response => {
            return (response)
        }).catch(err => {
            return (null)
        })
    }))

    returnResTemp = []
    returnRes.map((val)=>{
        val.map((val2)=>{
            returnResTemp.push(val2)
        })
    })
    const flags = []
    const finalReturn = []
    returnResTemp.map((val) => {
        if(flags.indexOf((val._id).toString()) === -1){
            flags.push((val._id).toString())
            finalReturn.push(val)
        }
    })
    return finalReturn
}

const randomWeb = async() => {
    return await seriesSchema.aggregate([{$sample:{size: 10}}]).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const searchSeries = async(keyword)=>{
    return await seriesSchema.find({$or: [{title: {$regex: keyword}}, {genres: {$regex: keyword}}]}).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

function counterWeb(){
    return seriesSchema.countDocuments()
}

const viewedEp = async(id)=>{
    return await episodeSchema.findByIdAndUpdate(id,{$inc:{views: 1}}).then(response => {
        return ({ success: true, msg: "Viwed", data: response.views+1 })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

module.exports = {
    addSeries,
    getSeriess,
    getSeries,
    addEpisode,
    getTitle,
    getEpisodes,
    getEpisode,
    fetchWeb,
    recomWeb,
    randomWeb,
    getWebEpisodes,
    searchSeries,
    counterWeb,
    getMySeries,
    viewedEp
}