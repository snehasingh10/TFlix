const packageSchema = require('../model/Packages')

const getPackages = async ()=>{
    return await packageSchema.find().then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const addPackage = async(data)=>{
    const preparePackage = new packageSchema(data)
    return await preparePackage.save().then(newPackage => {
        return { success: true, msg: 'Package Added', data: newPackage }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const deletePackage = async(_id)=>{
    return await packageSchema.findByIdAndDelete(_id).then(deletedPack => {
        return { success: true, msg: 'Package Deleted', data: deletedPack }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const getPackage = async(_id)=>{
    return await packageSchema.findById(_id).then(data => {
        return { success: true, msg: 'Here is your data', data: data }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

module.exports = {
    getPackages,
    addPackage,
    deletePackage,
    getPackage
}