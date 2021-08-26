const objectSchema = require("../model/Objects")

const addNewObject = async(data) => {
    const prepareObject = new objectSchema(data)
    return await prepareObject.save().then(newOne => {
        return { success: true, msg: 'Object Created', data: newOne }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const getEmAll = async() => {
    return await objectSchema.find().sort({prio: 1}).then(data => {
        return { success: true, msg: 'Here is your data', data: data }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const updatePrio = async({newPrio, oid})=>{
    return await objectSchema.findByIdAndUpdate(oid, {prio: newPrio}).then(data => {
        return { success: true, msg: 'Prio Updated', data: data }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

module.exports = {
    addNewObject,
    getEmAll,
    updatePrio
}