const router = require('express').Router()
const { returnFromBody, tokenToId, uploadMyFile } = require('../functions/globalFunctions')
const { addMasterAdmin, loginAdmin, validateAdmin, addPublisher, forgot, reset } = require('../functions/adminFunctions')
const { addLiveTv } = require('../functions/liveFunctions')
const { addPerson, allUnspecial, oneSpecial } = require('../functions/personFunctions')
const { sign } = require('jsonwebtoken')
const { secret } = require('../config/envExport')
const fs = require("fs")
const { addMovie } = require('../functions/movieFunctions')
const { addSeries, addEpisode, getTitle, getMySeries } = require('../functions/webFunctions')
const { addSong } = require('../functions/songFunctions')
const { addSlider, deleteSlider } = require('../functions/sliderFunctions')
const { addPackage, deletePackage } = require('../functions/packageFunctions')
const { addNewObject, updatePrio } = require('../functions/objectFunctions')

router.post('/add-master-admin', async(req, res) => {
    let retObject = returnFromBody(['email', 'password'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { email, password } = retObject.data
        const response = await addMasterAdmin({ email, password })
        res.json(response)
    }
});
// Close this route after creation of master admin

router.post('/login', async(req, res) => {
    let retObject = returnFromBody(['email', 'password'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { email, password } = retObject.data
        const response = await loginAdmin({ email, password })
        if (response.success) {
            var token = 'Bearer ' + sign({ id: response.data._id }, secret, { expiresIn: 24 * 60 * 60 })
            res.json({...response, token })
        } else {
            res.json(response)
        }
    }
})

router.post("/add-publisher", validateAdmin('master'), async(req, res) => {
    let retObject = returnFromBody(['email', 'password', 'role'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { email, password, role } = retObject.data
        const response = await addPublisher({ email, password, role })
        res.json(response)
    }
})

router.post("/add-live-tv", validateAdmin('master'), async(req, res) => {
    if (!(req.files)) res.json({ success: false, msg: 'TV Logo  is required' })
    if (!(req.files.tvLogo)) res.json({ success: false, msg: 'TV Logo  is required' })
    const file = req.files.tvLogo
    const path = './uploads/live/' + Date.now() + '_' + file.name
    var upRes = uploadMyFile(file, path, ['jpg', 'png', 'jpeg'], res)
    if(upRes.success){
        let logoPath = path.substr(2)
        const { name, url } = req.body
        if (name == undefined || url == undefined) res.json({ success: false, msg: 'Name and Url is required' })
        const response = await addLiveTv({ name, url, logoPath })
        res.json(response)
    }
    else{
        res.json(upRes)
    }
})

router.post("/add-person", validateAdmin('master'), async(req, res) => {
    if (!(req.files)) res.json({ success: false, msg: 'Person Image  is required' })
    if (!(req.files.personImage)) res.json({ success: false, msg: 'Person Image  is required' })
    const file = req.files.personImage
    const path = './uploads/person/' + Date.now() + '_' + file.name
    var upRes = uploadMyFile(file, path, ['jpg', 'png', 'jpeg'], res)
    if(upRes.success){
        let photoPath = path.substr(2)
        const { name } = req.body
        if (name == undefined) res.json({ success: false, msg: 'Name  is required' })
        const response = await addPerson({ name, photoPath })
        res.json(response)
    }
    else{
        res.json(upRes)
    }
})

router.post("/add-movie", validateAdmin("movie"), async(req, res) => {
    if (!(req.files)) res.json({ success: false, msg: 'Files not found' })
    if (!(req.files.backdrop && req.files.video && req.files.subtitle)) res.json({ success: false, msg: 'All three types of files are required. Movie, Background and Subtitles', data: ['video', 'backdrop', 'subtitle'] })
    let retObject = returnFromBody(["genres", "originalLanguage", "overview", "popularity", "productionCompany", "tagline", "title", "voteCount", "voteAverage", "trailerPath", "castDetail", "writer", "director", "producer", "isRent", "rent", "subLang"], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        let data = retObject.data
        let subLang = data.subLang
        delete data.subLang

        const mainPath = "./uploads/movie/" + data.title
        await fs.mkdir(mainPath, { recursive: true }, function(err) {
            if (err) { res.json({ success: false, msg: err }) }
        })

        let file = req.files.backdrop
        let path = mainPath + '/back_' + Date.now() + '_' + file.name
        var upRes = uploadMyFile(file, path, ['jpg', 'png', 'jpeg'], res, 5000000)
        if(upRes.success){
            data.backdropPath = path.substr(2)
            file = req.files.video
            path = mainPath + '/' + Date.now() + '_' + file.name
            var upRes = uploadMyFile(file, path, ['mp4', 'mkv'], res, 1000 * 3 * 1024 * 1024) // 3 GB
            if(upRes.success){
                data.videoPath = path.substr(2)
                data.subtitlesPath = Array()
                if (Array.isArray(req.files.subtitle)) {
                    file = req.files.subtitle
                    file.map((value, index) => {
                        path = mainPath + '/' + Date.now() + '_' + value.name
                        uploadMyFile(value, path, ['vtt'], res)
                        data.subtitlesPath[index] = { path: path.substr(2), lang: subLang[index] }
                    })
                } else {
                    file = req.files.subtitle
                    path = mainPath + '/' + Date.now() + '_' + file.name
                    uploadMyFile(file, path, ['vtt'], res)
                    data.subtitlesPath[0] = { path: path.substr(2), lang: subLang.toString() }
                }
                data.addedBy = tokenToId(req)
                res.json(await addMovie(data))   
            }
            else{
                res.json(upRes)
            }
        }
        else{
            res.json(upRes)
        }
    }
})

router.post("/add-series", validateAdmin("web"), async(req, res) => {
    if (!(req.files)) res.json({ success: false, msg: 'Files not found' })
    if (!(req.files.backdrop)) res.json({ success: false, msg: 'Background Image is required', data: ['backdrop'] })
    let retObject = returnFromBody(["genres", "originalLanguage", "overview", "popularity", "productionCompany", "tagline", "title", "voteCount", "voteAverage", "trailerPath", "castDetail", "writer", "director", "producer", "isRent", "rent"], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        let data = retObject.data

        const mainPath = "./uploads/web/" + data.title
        await fs.mkdir(mainPath, { recursive: true }, function(err) {
            if (err) { res.json({ success: false, msg: err }) }
        })

        let file = req.files.backdrop
        let path = mainPath + '/back_' + Date.now() + '_' + file.name
        let upRes = uploadMyFile(file, path, ['jpg', 'png', 'jpeg'], res, 5000000)
        if(upRes.success){
            data.backdropPath = path.substr(2)
    
            data.addedBy = tokenToId(req)
            res.json(await addSeries(data))
        }
        else{
            res.json(upRes)
        }
        
    }
})

router.post('/add-episode', validateAdmin('web'), async(req,res)=>{
    if (!(req.files)) res.json({ success: false, msg: 'Files not found' })
    if (!(req.files.video && req.files.subtitle)) res.json({ success: false, msg: 'All Two types of files are required. Video and Subtitles', data: ['video', 'subtitle'] })
    let retObject = returnFromBody(["seriesId", "seasonNumber", "episodeNumber", "subLang"], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        let data = retObject.data
        let subLang = data.subLang
        delete data.subLang

        data.title = await getTitle(data.seriesId)

        const mainPath = "./uploads/web/" + data.title
        await fs.mkdir(mainPath, { recursive: true }, function(err) {
            if (err) { res.json({ success: false, msg: err }) }
        })


        file = req.files.video
        path = mainPath + '/' + Date.now() + '_' + file.name
        var upRes = uploadMyFile(file, path, ['mp4', 'mkv'], res, 1000 * 3 * 1024 * 1024) // 3 GB
        if(upRes.success){
            data.videoPath = path.substr(2)
            data.subtitlesPath = Array()
            if (Array.isArray(req.files.subtitle)) {
                file = req.files.subtitle
                file.map((value, index) => {
                    path = mainPath + '/' + Date.now() + '_' + value.name
                    uploadMyFile(value, path, ['vtt'], res)
                    data.subtitlesPath[index] = { path: path.substr(2), lang: subLang[index] }
                })
            } else {
                file = req.files.subtitle
                path = mainPath + '/' + Date.now() + '_' + file.name
                uploadMyFile(file, path, ['vtt'], res)
                data.subtitlesPath[0] = { path: path.substr(2), lang: subLang.toString() }
            }
            res.json(await addEpisode(data))
        }
        else{
            res.json(upRes)
        }
        
        
    }
})

router.post('/add-song', validateAdmin('song'), async(req, res)=>{
    if (!(req.files)) res.json({ success: false, msg: 'Files not found' })
    if (!(req.files.backdrop && req.files.video)) res.json({ success: false, msg: 'All two types of files are required. Song, Background', data: ['video', 'backdrop'] })
    let retObject = returnFromBody(["title", "belongsTo"], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        let data = retObject.data

        const mainPath = "./uploads/song/" + data.title
        await fs.mkdir(mainPath, { recursive: true }, function(err) {
            if (err) { res.json({ success: false, msg: err }) }
        })

        let file = req.files.backdrop
        let path = mainPath + '/back_' + Date.now() + '_' + file.name
        var upFileRes = uploadMyFile(file, path, ['jpg', 'png', 'jpeg'], res, 5000000)
        if(upFileRes.success){
            data.backdropPath = path.substr(2)
    
            file = req.files.video
            path = mainPath + '/' + Date.now() + '_' + file.name
            var upFileRes = uploadMyFile(file, path, ['mp4', 'mkv'], res, 1000 * 300 * 1024) // 300 MB
            if(upFileRes.success){
                data.videoPath = path.substr(2)
                
                data.addedBy = tokenToId(req)
                res.json(await addSong(data))
            }
            else{
                res.json(upFileRes)
            }
        }
        else{
            res.json(upFileRes)
        }
        
    }
})

router.post('/add-slider', validateAdmin('master'), async(req, res)=>{
    let retObject = returnFromBody(['what', 'contId'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { what, contId  } = retObject.data
        const response = await addSlider({ what, contId  })
        res.json(response)
    }
})

router.post('/add-package', validateAdmin('master'), async(req, res)=>{
    let retObject = returnFromBody(['name', 'details', 'price', 'validDays'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { name, details, price, validDays } = retObject.data
        const response = await addPackage({ name, details, price, validDays })
        res.json(response)
    }
})

router.post('/delete-package', validateAdmin('master'), async(req, res)=>{
    let retObject = returnFromBody(['_id'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { _id } = retObject.data
        const response = await deletePackage(_id)
        res.json(response)
    }
})

router.post('/delete-slider', validateAdmin('master'), async(req, res)=>{
    let retObject = returnFromBody(['_id'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { _id } = retObject.data
        const response = await deleteSlider(_id)
        res.json(response)
    }
})

router.post('/my-web', validateAdmin('web'), async(req, res)=>{
    const response = await getMySeries(tokenToId(req))
    res.json(response)
})

router.post('/forgot', async(req, res) => {
    let retObject = returnFromBody(['email'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { email } = retObject.data
        const response = await forgot(email)
        res.json(response)
    }
})

router.post('/reset', async(req, res) => {
    let retObject = returnFromBody(['email', 'otp', 'password'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { email, otp, password } = retObject.data
        const response = await reset(email, otp, password)
        res.json(response)
    }
})

router.post('/add-object', validateAdmin('master'), async(req,res)=>{
    let retObject = returnFromBody(['title', 'toogleOption', 'horizontal', 'what'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const response = await addNewObject(retObject.data)
        res.json(response)
    }
})

router.post('/update-object', validateAdmin('master'), async(req,res)=>{
    let retObject = returnFromBody(['oid', 'newPrio'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const {newPrio, oid} = retObject.data
        const response = await updatePrio({newPrio, oid})
        res.json(response)
    }
})

router.post('/all-unspecial', validateAdmin('master'), async(req, res)=>{
    res.json(await allUnspecial())
})

router.post('/one-special/:id', validateAdmin('master'), async(req, res)=>{
    res.json(await oneSpecial(req.params.id))
})

module.exports = router