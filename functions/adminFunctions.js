const adminSchema = require('../model/Admin')
const userSchema = require('../model/User')
const { compare } = require('bcrypt')
const { verify } = require('jsonwebtoken')
const { secret } = require('../config/envExport')
const { sendMail } = require('./globalFunctions')
const { hash } = require('bcrypt')

const addMasterAdmin = async(data) => {
    const emailCheck = await adminSchema.find({ email: data.email })
    if (emailCheck.length > 0) return { success: false, msg: 'Email is already taken' }
    const prepareUser = new adminSchema(data)
    return await prepareUser.save().then(masterAdmin => {
        return { success: true, msg: 'Admin Created', data: masterAdmin }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

const loginAdmin = async(data) => {
    const checkData = await adminSchema.find({ email: data.email }, { email: true, password: true, fromSso: true })
    if (checkData.length == 0) return { success: false, msg: 'Email is invalid' }
    if (checkData[0].fromSso) return { success: false, msg: 'Not Logged In with this platform' }
    const passCheck = await compare(data.password, checkData[0].password)
    if (!passCheck) return { success: false, msg: 'Password is invalid' }
    const getData = await adminSchema.findOne({ email: data.email }, { username: true, email: true, _id: true })
    return { success: true, msg: 'Logged in', data: getData }
}

const addPublisher = async(data) => {
    const emailCheck = await adminSchema.find({ email: data.email })
    if (emailCheck.length > 0) return { success: false, msg: 'Email is already taken' }
    const prepareUser = new adminSchema(data)
    return await prepareUser.save().then(publisher => {
        return { success: true, msg: 'Admin Created', data: publisher }
    }).catch(err => {
        return { success: false, msg: err.message }
    })
}

function validateAdmin(roleToCheck) {
    return async(req, res, next) => {
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
                var admin = await adminSchema.findById(confirmation.id)
                if ((admin == null)) retError += 'You are not authorized.'
                else if (!( admin.role.includes('master') || admin.role.includes(roleToCheck) )) retError += 'You are not authorized.'
            }
        }
        if (retError.length != 0) res.json({ success: false, msg: retError })
        else next()
    }
}

const getUserDetails = async(_id) => {
    return await userSchema.findById(_id, { password: false }).then(response => {
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

const addDetails = async({gender, name, country, _id}) => {
    return await userSchema.findByIdAndUpdate(_id, { gender: gender, name: name, country: country }).then(response => {
        return ({ success: true, msg: "User updated", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

const forgot = async(email) =>{
    const checkData = await adminSchema.find({ email: email })
    if (checkData.length == 0) return { success: false, msg: 'Email is invalid' }
    if (checkData[0].fromSso) return { success: false, msg: 'No need to change password..! Try SSO!' }
    let otp = parseInt(Math.random()*9999)
    await adminSchema.findOneAndUpdate({ email: email }, {verificationCode: otp})
    sendMail({
        to: email,
        subject: 'Forgot Password OTP',
        text: '' + otp,
        html: '<strong>'+ otp +'</strong>',
    })
    return { success: true, msg: 'Mail has been successfully sent' }
}

const reset = async(email, otp, password) =>{
    const checkData = await adminSchema.find({ email: email, verificationCode: otp })
    if (checkData.length == 0) return { success: false, msg: 'Email or OTP is invalid' }
    password = await hash(password, 10)
    await adminSchema.findOneAndUpdate({ email: email }, {password: password})
    return { success: true, msg: 'Password Changed' }
}

function counterAdmin(){
    return adminSchema.countDocuments()
}
const getAdmins = async() => {
    return await adminSchema.find().then(response => {
        return ({ success: true, msg: "Here's your data", data: response })
    }).catch(err => {
        return ({ success: false, msg: err.message })
    })
}

module.exports = {
    addMasterAdmin,
    loginAdmin,
    addPublisher,
    validateAdmin,
    getUserDetails,
    deleteUser,
    addDetails,
    forgot,
    reset,
    counterAdmin,
    getAdmins
}