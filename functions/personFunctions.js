const personSchema = require('../model/Persons')
const { movieByCast } = require('./movieFunctions')

const addPerson = async(data) => {
    const prepareUser = new personSchema(data)
    return await prepareUser.save().then(personData => {
        return { success: true, msg: 'Person Created', data: personData }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const searchPerson = async(name) =>{
    return await personSchema.find({"name": {$regex: name}}).then(personData => {
        return { success: true, msg: "Here's Your Data", data: personData }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const searchPersons = async(ids) =>{
    return await personSchema.find({"_id": {$in: ids}}).then(personData => {
        return { success: true, msg: "Here's Your Data", data: personData }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const getPersons = async() =>{
    return await personSchema.find().then(personData => {
        return { success: true, msg: "Here's Your Data", data: personData }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

function counterPerson(){
    return personSchema.countDocuments()
}

const bdaySpecial = async() =>{
    return await personSchema.findOne({special: true}).then(async(personData) => {
        return(await movieByCast(personData._id))
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const allUnspecial = async()=>{
    return await personSchema.updateMany({special: true}, {special: false}).then(async(personData) => {
        return { success: true, msg: "Done", data: personData }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const oneSpecial = async(id)=>{
    return await personSchema.updateMany({special: true}, {special: false}).then(async(personData) => {
        return await personSchema.findByIdAndUpdate(id, {special: true}).then(async(personData) => {
            return { success: true, msg: "Done", data: personData }
        }).catch(err => {
            return { success: false, msg: err.message }
        })
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

module.exports = {
    addPerson,
    searchPerson,
    searchPersons,
    counterPerson,
    getPersons,
    bdaySpecial,
    allUnspecial,
    oneSpecial
}