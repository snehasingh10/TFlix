const liveSchema = require('../model/Live')

const getLiveTvs = async ()=>{
    return await liveSchema.find().then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const viewLiveTv = async(id)=>{
    return await liveSchema.findById(id).then(response =>{
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const addLiveTv = async(data) => {
    const prepareUser = new liveSchema(data)
    return await prepareUser.save().then(liveTvData => {
        return { success: true, msg: 'TV Channel Created', data: liveTvData }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

function counterLive(){
    return liveSchema.countDocuments()
}

module.exports = {
    getLiveTvs,
    viewLiveTv,
    addLiveTv,
    counterLive
}