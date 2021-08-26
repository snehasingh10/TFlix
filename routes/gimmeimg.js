const router = require('express').Router()
const path = require('path')

router.use("/logo", async(req, res)=>{
    res.sendFile(path.resolve(__dirname + "/../uploads/tflix.png"))
})

module.exports = router