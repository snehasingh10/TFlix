const router = require('express').Router()
const { returnFromBody } = require('../functions/globalFunctions')
const { getPackages } = require('../functions/packageFunctions')
const { getLiveTvs, counterLive } = require('../functions/liveFunctions')
const { searchPerson, searchPersons, counterPerson, getPersons, bdaySpecial } = require('../functions/personFunctions')
const { getMovies, getMovie, fetchMovie, recomMovie, randomMovie, searchMovie, counterMovie, viewedMovie } = require('../functions/movieFunctions')
const { searchSong, counterSong, getSongs, viewedSong } = require('../functions/songFunctions')
const { getSliders, counterSlider } = require('../functions/sliderFunctions')
const { fetchWeb, recomWeb, randomWeb, getSeriess, getSeries, getWebEpisodes, searchSeries, counterWeb, viewedEp } = require('../functions/webFunctions')
const { counterUser, allUser } = require('../functions/userFunctions')
const { counterAdmin, getAdmins } = require('../functions/adminFunctions')
const { getEmAll } = require('../functions/objectFunctions')

router.post("/packages", async(req, res) => {
    const response = await getPackages()
    res.json(response)
})

router.post("/languages", async(req, res) => {
    const languages = require('../extras/languages')
    res.json({ success: true, msg: "Here's your data", data: languages })
})

router.post('/live-tv', async(req, res) => {
    const response = await getLiveTvs()
    res.json(response)
})

router.post('/user-list', async(req, res) => {
    const response = await allUser()
    res.json(response)
})

router.post('/search-person', async(req, res) => {
    let retObject = returnFromBody(['name'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { name } = retObject.data
        const response = await searchPerson(name)
        res.json(response)
    }
})

router.post('/search-persons', async(req, res) => {
    let retObject = returnFromBody(['ids'], req.body)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { ids } = retObject.data
        const response = await searchPersons(ids)
        res.json(response)
    }
})

router.post("/get-movie", async(req, res) => {
    res.json(await getMovies())
})

router.post("/get-person", async(req, res) => {
    res.json(await getPersons())
})

router.post("/get-publisher", async(req, res) => {
    res.json(await getAdmins())
})

router.post("/get-movie/:id", async(req, res) => {
    const { id } = req.params
    res.json(await getMovie(id))
})

router.post("/get-series", async(req, res) => {
    res.json(await getSeriess())
})

router.post("/get-series/:id", async(req, res) => {
    const { id } = req.params
    res.json(await getSeries(id))
})

router.post("/get-episodes/:id", async(req, res) => {
    const { id } = req.params
    res.json(await getWebEpisodes(id))
})

router.post("/get-song", async(req, res) => {
    res.json(await getSongs())
})

router.use('/search-it/:keyword', async(req, res) => {
    const { keyword } = req.params
    let response = {}
    response.movie = (await searchMovie(keyword)).data
    response.web = (await searchSeries(keyword)).data
    response.song = (await searchSong(keyword)).data
    res.json({success:true, msg: "Here's your data", data: response})
})

router.post('/sliders', async(req,res)=>{
    res.json(await getSliders())
})

router.post('/fetch/:what', async(req, res)=>{
    const { what } = req.params
    let retObject = {}
    retObject.what = what;
    retObject.genre = req.query.genre || null;
    retObject.lang = req.query.lang || null;
    retObject.free = req.query.free || null;
    retObject.limit = parseInt(req.query.limit || 10);
    retObject.sortWith = req.query.sortWith || '_id';
    retObject.sortArray = {}
    retObject.query = {$and: []}
    retObject.sortArray[retObject.sortWith] = -1
    if(retObject.genre !== null) {
        retObject.query.$and.push({genres: {$regex: retObject.genre}})
    }
    if(retObject.lang !== null) {
        retObject.query.$and.push({originalLanguage: retObject.lang})
    }
    if(retObject.free !== null) {
        retObject.isRent = (retObject.free !== 'true'?true:false)
        retObject.query.$and.push({isRent: retObject.isRent})
    }
    if(retObject.query.$and.length === 0) retObject.query = {}
    if(what == 'movie'){
        let countryWise = {
            india: {$or: [{grp: 1}, {grp: 2}, {grp: 3}]},
            sarcc: {$or: [{grp: 1}, {grp: 3}, {grp: 4}]},
            other: {$or: [{grp: 1}, {grp: 4}]},
            null: {grp: 1}
        }
        if(retObject.query.$and === undefined) retObject.query = countryWise[req.query.cgrp]
        else retObject.query.$and.push(countryWise[req.query.cgrp])
        res.json(await fetchMovie(retObject))
    }
    else if(what == 'web') res.json(await fetchWeb(retObject))
    else res.json({success: false, msg: 'something is messed up with API integration..!', data: retObject})
})

router.post('/recommend/:what', async(req, res)=>{
    const { what } = req.params
    let retObject = returnFromBody(['keyword'], req.query)
    if (!retObject.success) {
        res.json({ success: false, msg: retObject.data + ' is Required' })
    } else {
        const { keyword } = retObject.data
        if(what == 'movie'){
            const response = await recomMovie(keyword)
            res.json({success: true, msg: 'Here is your data',data:response})
        }
        else{
            const response = await recomWeb(keyword)
            res.json({success: true, msg: 'Here is your data',data:response})
        }
    }
})

router.post('/random/:what', async(req, res)=>{
    const { what } = req.params
    if(what == 'movie'){
        const response = await randomMovie()
        res.json({success: true, msg: 'Here is your data',data:response})
    }
    else{
        const response = await randomWeb()
        res.json({success: true, msg: 'Here is your data',data:response})
    }
})

router.use('/get-number', async(req, res)=>{
    let response = {}
    response['movie'] = await counterMovie()
    response['web'] = await counterWeb()
    response['song'] = await counterSong()
    response['liveTv'] = await counterLive()
    response['actors'] = await counterPerson()
    response['users'] = await counterUser()
    response['sliders'] = await counterSlider()
    response['publishers'] = await counterAdmin()
    res.json({success: true, msg: 'Here is your data', data: response})
})

router.use('/search-movie/:keyword', async(req, res) => {
    const { keyword } = req.params
    let response = {}
    response = (await searchMovie(keyword)).data
    res.json({success:true, msg: "Here's your data", data: response})
})

router.use('/search-series/:keyword', async(req, res) => {
    const { keyword } = req.params
    let response = {}
    response = (await searchSeries(keyword)).data
    res.json({success:true, msg: "Here's your data", data: response})
})

router.use('/search-song/:keyword', async(req, res) => {
    const { keyword } = req.params
    let response = {}
    response = (await searchSong(keyword)).data
    res.json({success:true, msg: "Here's your data", data: response})
})

router.use('/get-objects', async(req, res)=>{
    const response = await getEmAll()
    res.json(response)
})

router.use('/get-specials', async(req, res)=>{
    res.json(await bdaySpecial())
})

router.use('/viewed-song/:id', async(req,res)=>{
    res.json(await viewedSong(req.params.id))
})

router.use('/viewed-movie/:id', async(req,res)=>{
    res.json(await viewedMovie(req.params.id))
})

router.use('/viewed-ep/:id', async(req,res)=>{
    res.json(await viewedEp(req.params.id))
})

module.exports = router