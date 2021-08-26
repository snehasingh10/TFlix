const movieSchema = require('../model/Movies')

const addMovie = async(data) => {
    const prepareMovie = new movieSchema(data)
    return await prepareMovie.save().then(newMovie => {
        return { success: true, msg: 'Movie Added', data: newMovie }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const getMovies = async() => {
    return await movieSchema.find().then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const getMovie = async(id) => {
    return await movieSchema.findById(id).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const fetchMovie = async(retObject) => {
    return await movieSchema.find(retObject.query).sort(retObject.sortArray).limit(retObject.limit).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const recomMovie = async(keyword)=>{
    let genres =  keyword.split(',').map(val => val.trim())
    let returnRes = await Promise.all(genres.map(async (val,ind)=>{
        return await movieSchema.find({genres: {$regex: val}}).sort({popularity: -1}).limit(5).then(response => {
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

const randomMovie = async() => {
    return await movieSchema.aggregate([{$sample:{size: 10}}]).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const searchMovie = async(keyword)=>{
    return await movieSchema.find({$or: [{title: {$regex: keyword}}, {genres: {$regex: keyword}}]}).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

function counterMovie(){
    return movieSchema.countDocuments()
}

const movieByCast = async(_id)=>{
    return await movieSchema.find({castDetail: {$regex: _id}}).then(response => {
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const viewedMovie = async(id)=>{
    return await movieSchema.findByIdAndUpdate(id,{$inc:{views: 1}}).then(response => {
        return ({ success: true, msg: "Viwed", data: response.views+1 })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

module.exports = {
    addMovie,
    getMovies,
    getMovie,
    fetchMovie,
    recomMovie,
    randomMovie,
    searchMovie,
    counterMovie,
    movieByCast,
    viewedMovie
}