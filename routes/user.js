const router = require('express').Router()
const { returnFromBody, tokenToId } = require('../functions/globalFunctions')
const { registerUser, loginUser, validateUser, addDetails, getUserDetails, fbsso, gsso, forgot, reset, toggle, gimmeList } = require('../functions/userFunctions')
const { sign } = require('jsonwebtoken')
const { secret, bckHost } = require('../config/envExport')
const { getMovie } = require('../functions/movieFunctions')
const { getEpisode } = require('../functions/webFunctions')
const { getSong } = require('../functions/songFunctions')

router.post('/register', async(req, res) => {
    let retObject = returnFromBody(['username', 'email', 'password', 'storedLangs'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { username, email, password, storedLangs } = retObject.data
        const response = await registerUser({ username, email, password, storedLangs: ((storedLangs.toString()).split(',')) })
        res.json(response)
    }
})

router.post('/login', async(req, res) => {
    let retObject = returnFromBody(['email', 'password'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { email, password } = retObject.data
        const response = await loginUser({ email, password })
        if (response.success) {
            var token = 'Bearer ' + sign({ id: response.data._id }, secret, { expiresIn: 24 * 60 * 60 })
            res.json({...response, token })
        } else {
            res.json(response)
        }
    }
})

router.post('/add-details', validateUser, async(req, res) => {
    let retObject = returnFromBody(['gender', 'name', 'country', 'storedLangs'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { gender, name, country, storedLangs } = retObject.data
        const _id = tokenToId(req)
        const response = await addDetails({ gender, name, country, _id, storedLangs: ((storedLangs.toString()).split(',')) })
        res.json(response)
    }
})

router.post('/view-details', validateUser, async(req, res) => {
    res.json(await getUserDetails(tokenToId(req)))
})

router.post('/fbsso', async(req, res) => {
    let retObject = returnFromBody(['name', 'email', 'ssoId'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { name, email, ssoId } = retObject.data
        const response = await fbsso({ name, email, ssoId })
        if (response.success) {
            var token = 'Bearer ' + sign({ id: response.data._id }, secret, { expiresIn: 24 * 60 * 60 })
            res.json({...response, token })
        } else {
            res.json(response)
        }
    }
})

router.post('/gsso', async(req, res) => {
    let retObject = returnFromBody(['name', 'email', 'ssoId'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { name, email, ssoId } = retObject.data
        const response = await gsso({ name, email, ssoId })
        if (response.success) {
            var token = 'Bearer ' + sign({ id: response.data._id }, secret, { expiresIn: 24 * 60 * 60 })
            res.json({...response, token })
        } else {
            res.json(response)
        }
    }
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

router.use('/view-movie/:id', validateUser, async(req, res) => {
    const { id } = req.params
    const details = await getMovie(id);
    let subtitle = ''
    details.data.subtitlesPath.map((value, index) => {
        subtitle += `<track default kind="captions" srclang="${value.lang}" src="${bckHost}/api/stream/subs/?subPath=${value.path}" />`
    })
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <br />  
        <div style="position: relative;">
            <video aria-controls="true" controls="true" id="vdo" autoplay="true" style="width: 98%;border: 5px solid var(--themeRed);" crossorigin="anonymous">
                <source src="${bckHost}/api/stream/get-video/?videoPath=${details.data.videoPath}" type="video/mp4" />
                ` + subtitle +
            `
            </video>
            <img src="${bckHost}/giveMeImg/logo" style="position: absolute;top: 10px;left: 10px;opacity: 0.4;width: 100px;" />
            <div class="lit-vdoViews"><i class="fa fa-eye"></i> ${details.data.views}</div>
        </div>
    `)
})

router.use('/view-episode/:id', validateUser, async(req, res) => {
    const { id } = req.params
    const details = await getEpisode(id);
    let subtitle = ''
    details.data.subtitlesPath.map((value, index) => {
        subtitle += `<track default kind="captions" srclang="${value.lang}" src="${bckHost}/api/stream/subs/?subPath=${value.path}" />`
    })
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <br />  
        <div style="position: relative;">
            <video aria-controls="true" controls="true" id="vdo" autoplay="true" style="width: 98%;border: 5px solid var(--themeRed);" crossorigin="anonymous">
                <source src="${bckHost}/api/stream/get-video/?videoPath=${details.data.videoPath}" type="video/mp4" />
                ` + subtitle +
            `
            </video>
            <img src="${bckHost}/giveMeImg/logo" style="position: absolute;top: 10px;left: 10px;opacity: 0.4;width: 100px;" />
            <div class="lit-vdoViews"><i class="fa fa-eye"></i> ${details.data.views}</div>
        </div>
    `)
})

router.use('/view-song/:id', async(req, res) => {
    const { id } = req.params
    const details = await getSong(id);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <br />  
        <div style="position: relative;">
            <video aria-controls="true" controls="true" id="vdo" autoplay="true" style="width: 98%;border: 5px solid var(--themeRed);" crossorigin="anonymous">
                <source src="${bckHost}/api/stream/get-video/?videoPath=${details.data.videoPath}" type="video/mp4" />
            </video>
            <img src="${bckHost}/giveMeImg/logo" style="position: absolute;top: 10px;left: 30px;opacity: 0.4;width: 100px;" />
            <div class="lit-vdoViews"><i class="fa fa-eye"></i> ${details.data.views}</div>
        </div>
    `)
})

router.post('/add-to/:section/:what/:id', validateUser,async(req, res)=>{
    const { section, what, id } = req.params
    if(section == 'like'){
        if(what == 'movie') res.json(await toggle.likeMovie(tokenToId(req), id))
        else res.json(await toggle.likeWeb(tokenToId(req), id))
    }
    if(section == 'watch-list'){
        if(what == 'movie') res.json(await toggle.watchListMovie(tokenToId(req), id))
        else res.json(await toggle.watchListWeb(tokenToId(req), id))
    }
})

router.post('/gimme/:section/:what', validateUser, async(req, res)=>{
    const {section, what} = req.params
    if(section == 'like'){
        if(what == 'movie') res.json(await gimmeList.likedMovie(tokenToId(req)))
        else res.json(await gimmeList.likedWeb(tokenToId(req)))
    }
    if(section == 'watch-list'){
        if(what == 'movie') res.json(await gimmeList.watchListMovie(tokenToId(req)))
        else res.json(await gimmeList.watchListWeb(tokenToId(req)))
    }
})

module.exports = router