const router = require('express').Router()
const path = require('path')

router.use("/live/:file", async(req, res)=>{
    const {file} = req.params
    res.sendFile(path.resolve(__dirname + "/../uploads/live/" + file))
})

router.use("/person/:file", async(req, res)=>{
    const {file} = req.params
    res.sendFile(path.resolve(__dirname + "/../uploads/person/" + file))
})

router.use("/movie/:movieName/:file", async(req, res)=>{
    const {movieName, file} = req.params
    res.sendFile(path.resolve(__dirname + "/../uploads/movie/"+ movieName + '/' + file))
})

router.use("/web/:webName/:file", async(req, res)=>{
    const {webName, file} = req.params
    res.sendFile(path.resolve(__dirname + "/../uploads/web/"+ webName + '/' + file))
})

router.use("/song/:songName/:file", async(req, res)=>{
    const {songName, file} = req.params
    res.sendFile(path.resolve(__dirname + "/../uploads/song/"+ songName + '/' + file))
})

module.exports = router