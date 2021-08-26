const userSchema = require('../model/User')
const { compare } = require('bcrypt')
const { verify } = require('jsonwebtoken')
const { secret } = require('../config/envExport')
const { sendMail } = require('./globalFunctions')
const { hash } = require('bcrypt')
const { getMovie } = require('./movieFunctions')
const { getSeries } = require('./webFunctions')
const { getPackage } = require('./packageFunctions')

const registerUser = async(data) => {
    const emailCheck = await userSchema.find({ email: data.email })
    if (emailCheck.length > 0) return { success: false, msg: 'Email is already taken' }
    const prepareUser = new userSchema(data)
    return await prepareUser.save().then(newUser => {
        sendMail({
            to: data.email,
            subject: 'Your Account is registered',
            text: 'Welcome to TFLIX',
            html: '<strong>Welcome to TFLIX</strong>',
        })
        return { success: true, msg: 'User Registered', data: newUser }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const loginUser = async(data) => {
    const checkData = await userSchema.find({ email: data.email }, { email: true, password: true, fromSso: true })
    if (checkData.length == 0) return { success: false, msg: 'Email is invalid' }
    if (checkData[0].fromSso) return { success: false, msg: 'Not Logged In with this platform' }
    const passCheck = await compare(data.password, checkData[0].password)
    if (!passCheck) return { success: false, msg: 'Password is invalid' }
    const getData = await userSchema.findOne({ email: data.email }, { password: false })
    return { success: true, msg: 'Logged in', data: getData }
}

const validateUser = async(req, res, next) => {
    var retError = ''
    if (!req.headers.authorization) {
        retError += 'Token not found'
    } else {
        let bearerToken = req.headers.authorization.split(" ")[1];
        try {
            verify(bearerToken, secret)
        } catch (e) {
            retError += e.message
        } finally {}
        if (retError.length == 0) {
            var confirmation = verify(bearerToken, secret)
            await userSchema.findById(confirmation.id).then((user)=>{ 
                if(user == null) retError += 'You are not authorized.'
            }).catch((err)=>{
                retError += 'You are not authorized.'
            })
        }
    }
    if (retError.length != 0) res.json({ success: false, msg: retError })
    else next()
}

const getUserDetails = async(_id) => {
    return await userSchema.findById(_id, { password: false }).then(async(response) => {
        if(response.isPremium){
            if((response.planTill) < new Date()){
                await userSchema.findByIdAndUpdate(_id, {isPremium: false})
                return await userSchema.findById(_id, { password: false }).then(responseAfter => {
                    return ({ success: true, msg: "Here's your details", data: responseAfter })
                }).catch(err => {
                    return ({ success: false, msg: err.message })
                })
            }
        } 
        return ({ success: true, msg: "Here's your details", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const deleteUser = async(_id) => {
    return await userSchema.findByIdAndDelete(_id).then(response => {
        return ({ success: true, msg: "User is deleted", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const allUser = async() => {
    return await userSchema.find().then(response => {
        return ({ success: true, msg: "Here's your data", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const addDetails = async({gender, name, country, _id, storedLangs}) => {
    return await userSchema.findByIdAndUpdate(_id, { gender: gender, name: name, country: country, storedLangs }).then(response => {
        return ({ success: true, msg: "User updated", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const fbsso = async(data) => {
    let emailCheck = await userSchema.find({ email: data.email })
    if (emailCheck.length > 0) {
        emailCheck = emailCheck[0]
        if(emailCheck.fromSso && emailCheck.ssoId.startsWith('fb_')){
            return { success: true, msg: 'Logged in!', data: emailCheck }
        }
        else{
            return { success: false, msg: 'You are not loggged in with this platform' }
        }
    }
    data.ssoId = 'fb_' + data.ssoId
    const prepareUser = new userSchema(data)
    return await prepareUser.save().then(newUser => {
        return { success: true, msg: 'User Registered', data: newUser }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const gsso = async(data) => {
    let emailCheck = await userSchema.find({ email: data.email })
    if (emailCheck.length > 0) {
        emailCheck = emailCheck[0]
        if(emailCheck.fromSso && emailCheck.ssoId.startsWith('g_')){
            return { success: true, msg: 'Logged in!', data: emailCheck }
        }
        else{
            return { success: false, msg: 'You are not loggged in with this platform' }
        }
    }
    data.ssoId = 'g_' + data.ssoId
    const prepareUser = new userSchema(data)
    return await prepareUser.save().then(newUser => {
        return { success: true, msg: 'User Registered', data: newUser }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const forgot = async(email) =>{
    const checkData = await userSchema.find({ email: email })
    if (checkData.length == 0) return { success: false, msg: 'Email is invalid' }
    if (checkData[0].fromSso) return { success: false, msg: 'No need to change password..! Try SSO!' }
    let otp = parseInt(Math.random()*9999)
    await userSchema.findOneAndUpdate({ email: email }, {verificationCode: otp})
    sendMail({
        to: email,
        subject: 'Forgot Password OTP',
        text: '' + otp,
        html: '<strong>'+ otp +'</strong>',
    })
    return { success: true, msg: 'Mail has been successfully sent' }
}

const reset = async(email, otp, password) =>{
    const checkData = await userSchema.find({ email: email, verificationCode: otp })
    if (checkData.length == 0) return { success: false, msg: 'Email or OTP is invalid' }
    password = await hash(password, 10)
    await userSchema.findOneAndUpdate({ email: email }, {password: password})
    return { success: true, msg: 'Password Changed' }
}

const toggle = {
    likeMovie: async function(uid, id) {
        return await userSchema.findById(uid, { liked: true }).then(async (response) => {
            if(response.liked.movie.includes(id)){
                response.liked.movie = response.liked.movie.slice(0, response.liked.movie.indexOf(id)).concat(response.liked.movie.slice(response.liked.movie.indexOf(id)+1))
                await userSchema.findByIdAndUpdate(uid, {liked: response.liked}).then(responseAfterUpdate=>{return ({ success: true, msg: "Here's your details", data: responseAfterUpdate })}).catch()
            }
            else{
                response.liked.movie.push(id)
                await userSchema.findByIdAndUpdate(uid, {liked: response.liked}).then(responseAfterUpdate=>{return ({ success: true, msg: "Here's your details", data: responseAfterUpdate })}).catch()
            }
            return await userSchema.findById(uid, { password: false }).then(mainResponse => {
                return ({ success: true, msg: "Here's your details", data: mainResponse })
            }).catch(err => {
                return ({ success: false, msg: err.message })
            })
        }).catch(err => {
            return ({ success: false, msg: err.message })
        })
    },
    likeWeb: async function(uid, id) {
        return await userSchema.findById(uid, { liked: true }).then(async (response) => {
            if(response.liked.web.includes(id)){
                response.liked.web = response.liked.web.slice(0, response.liked.web.indexOf(id)).concat(response.liked.web.slice(response.liked.web.indexOf(id)+1))
                await userSchema.findByIdAndUpdate(uid, {liked: response.liked}).then(responseAfterUpdate=>{return ({ success: true, msg: "Here's your details", data: responseAfterUpdate })}).catch()
            }
            else{
                response.liked.web.push(id)
                await userSchema.findByIdAndUpdate(uid, {liked: response.liked}).then(responseAfterUpdate=>{return ({ success: true, msg: "Here's your details", data: responseAfterUpdate })}).catch()
            }
            return await userSchema.findById(uid, { password: false }).then(mainResponse => {
                return ({ success: true, msg: "Here's your details", data: mainResponse })
            }).catch(err => {
                return ({ success: false, msg: err.message })
            })
        }).catch(err => {
            return ({ success: false, msg: err.message })
        })
    },
    watchListMovie: async function(uid, id) {
        return await userSchema.findById(uid, { watchList: true }).then(async (response) => {
            if(response.watchList.movie.includes(id)){
                response.watchList.movie = response.watchList.movie.slice(0, response.watchList.movie.indexOf(id)).concat(response.watchList.movie.slice(response.watchList.movie.indexOf(id)+1))
                await userSchema.findByIdAndUpdate(uid, {watchList: response.watchList}).then(responseAfterUpdate=>{return ({ success: true, msg: "Here's your details", data: responseAfterUpdate })}).catch()
            }
            else{
                response.watchList.movie.push(id)
                await userSchema.findByIdAndUpdate(uid, {watchList: response.watchList}).then(responseAfterUpdate=>{return ({ success: true, msg: "Here's your details", data: responseAfterUpdate })}).catch()
            }
            return await userSchema.findById(uid, { password: false }).then(mainResponse => {
                return ({ success: true, msg: "Here's your details", data: mainResponse })
            }).catch(err => {
                return ({ success: false, msg: err.message })
            })
        }).catch(err => {
            return ({ success: false, msg: err.message })
        })
    },
    watchListWeb: async function(uid, id) {
        return await userSchema.findById(uid, { watchList: true }).then(async (response) => {
            if(response.watchList.web.includes(id)){
                response.watchList.web = response.watchList.web.slice(0, response.watchList.web.indexOf(id)).concat(response.watchList.web.slice(response.watchList.web.indexOf(id)+1))
                await userSchema.findByIdAndUpdate(uid, {watchList: response.watchList}).then(responseAfterUpdate=>{return ({ success: true, msg: "Here's your details", data: responseAfterUpdate })}).catch()
            }
            else{
                response.watchList.web.push(id)
                await userSchema.findByIdAndUpdate(uid, {watchList: response.watchList}).then(responseAfterUpdate=>{return ({ success: true, msg: "Here's your details", data: responseAfterUpdate })}).catch()
            }
            return await userSchema.findById(uid, { password: false }).then(mainResponse => {
                return ({ success: true, msg: "Here's your details", data: mainResponse })
            }).catch(err => {
                return ({ success: false, msg: err.message })
            })
        }).catch(err => {
            return ({ success: false, msg: err.message })
        })
    },
}

const moviePurchased = async(id,uid)=>{
    return await userSchema.findById(uid).then(async(response)=>{
        let newPrShows = response.purchacedShows
        newPrShows.movie.push(id)
        return await userSchema.findByIdAndUpdate(uid, {purchacedShows: newPrShows}).then((res)=>{
            return ({ success: true, msg: 'Purchased' })
        }).catch((err)=>{ return ({ success: false, msg: err.message }) })
    }).catch((err)=>{
        return ({ success: false, msg: err.message })
    })
}

const webPurchased = async(id,uid)=>{
    return await userSchema.findById(uid).then(async(response)=>{
        let newPrShows = response.purchacedShows
        newPrShows.web.push(id)
        return await userSchema.findByIdAndUpdate(uid, {purchacedShows: newPrShows}).then((res)=>{
            return ({ success: true, msg: 'Purchased' })
        }).catch((err)=>{ return ({ success: false, msg: err.message }) })
    }).catch((err)=>{
        return ({ success: false, msg: err.message })
    })
}

const gimmeList = {
    likedMovie: async function(id){
        return await userSchema.findById(id).then(async(response)=>{
            const likedMovies = response.liked.movie
            const retRes = await Promise.all(likedMovies.map(async(val, ind)=>{
                return((await getMovie(val)).data)
            }))
            return({success: true, msg: "Here's your data", data: retRes})
        }).catch((err)=>{ return({success: false, msg: err.message}) })
    },
    likedWeb: async function(id){
        return await userSchema.findById(id).then(async(response)=>{
            const likedWeb = response.liked.web
            const retRes = await Promise.all(likedWeb.map(async(val, ind)=>{
                return((await getSeries(val)).data)
            }))
            return({success: true, msg: "Here's your data", data: retRes})
        }).catch((err)=>{ return({success: false, msg: err.message}) })
    },
    watchListMovie: async function(id){
        return await userSchema.findById(id).then(async(response)=>{
            const watchListMovies = response.watchList.movie
            const retRes = await Promise.all(watchListMovies.map(async(val, ind)=>{
                return((await getMovie(val)).data)
            }))
            return({success: true, msg: "Here's your data", data: retRes})
        }).catch((err)=>{ return({success: false, msg: err.message}) })
    },
    watchListWeb: async function(id){
        return await userSchema.findById(id).then(async(response)=>{
            const watchListWeb = response.watchList.web
            const retRes = await Promise.all(watchListWeb.map(async(val, ind)=>{
                return((await getSeries(val)).data)
            }))
            return({success: true, msg: "Here's your data", data: retRes})
        }).catch((err)=>{ return({success: false, msg: err.message}) })
    }
}

function counterUser(){
    return userSchema.countDocuments()
}

const packPurchased = async(id,uid)=>{
    const packRes = await getPackage(id)
    function addDays(date, days) {
        const copy = new Date(Number(date))
        copy.setDate(date.getDate() + days)
        return copy
    }
    
    const date = new Date();
    const newDate = addDays(date, packRes.data.validDays);
    return await userSchema.findByIdAndUpdate(uid, {isPremium: true, planTill:  newDate, packageId: id}).then((response)=>{
        return ({ success: true, msg: 'Purchased' })
    }).catch((err)=>{ return ({ success: false, msg: err.message }) })
}

module.exports = {
    registerUser,
    loginUser,
    validateUser,
    getUserDetails,
    deleteUser,
    addDetails,
    fbsso,
    gsso,
    forgot,
    reset,
    toggle,
    moviePurchased,
    webPurchased,
    gimmeList,
    counterUser,
    packPurchased,
    allUser
}