const { verify } = require('jsonwebtoken')
const { secret } = require('../config/envExport')
const sgMail = require('@sendgrid/mail')
const { sendgridApi, sendgridMail } = require('../config/envExport')

function returnFromBody(want, body) {
    let retObject = {}
    let checker = -1
    for (let i = 0; i < want.length; i++) {
        let temp = want[i]
        if (!body.hasOwnProperty(temp)) {
            checker = i
            break
        }
        if (!Array.isArray(body[temp])) retObject[temp] = body[temp].toString()
        else retObject[temp] = body[temp]
    }
    if (checker !== -1) return { success: false, data: want[checker] }
    return { success: true, data: retObject }
}

function tokenToId(req, direct=false) {
    if(direct){
        let bearerToken = req.split(" ")[1];
        var confirmation = verify(bearerToken, secret)
        return confirmation.id
    }
    let bearerToken = req.headers.authorization.split(" ")[1];
    var confirmation = verify(bearerToken, secret)
    return confirmation.id
}

function sendMail(msg) {
    sgMail.setApiKey(sendgridApi)
    msg.from = sendgridMail
    sgMail.send(msg).then(() => {
        // console.log('Email sent')
    }).catch((error) => {
        // console.error(error)
    })
}

function uploadMyFile(file, path, allowExt, res, limit = 500000) {
    if (file.size > limit) { return({ success: false, msg: 'File is too large. Max Size is: ' + (limit / 1000) + "Kb" }) }
    else{
        let ext = file.name.split('.')
        ext = (ext[ext.length - 1]).toLowerCase()
        if (!(allowExt.includes(ext))) { return({ success: false, msg: 'File not supported... Only "' + allowExt.join(', ') + '" are supported' }) }
        else{
            file.mv(path, (err) => {
                if (err) return({ success: false, msg: 'Something Happened...', data: err })
            })
            return({ success: true, msg: 'Uploaded...' })
        }
    }
}

module.exports = {
    returnFromBody,
    tokenToId,
    sendMail,
    uploadMyFile
}