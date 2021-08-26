const router = require('express').Router()
const fs = require('fs')
const path = require('path')
const { viewLiveTv } = require('../functions/liveFunctions')
const { validateUser } = require('../functions/userFunctions')

router.use('/get-video', (req, res) => {
    const { videoPath } = req.query
    const range = req.headers.range

    // const range = req.headers.range || '0'
    if (!range) res.status(400).end("Invalid Request")

    const videoDest = path.resolve(__dirname + '/../' + videoPath)
    const videoSize = fs.statSync(videoDest).size

    const chunkSize = (2 ** 9) * 1024
    const start = Number(range.replace(/\D/g, ""))
    const end = Math.min(start + chunkSize, videoSize - 1)

    const contentLength = end - start + 1
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    }

    res.writeHead(206, headers)

    const videoStream = fs.createReadStream(videoDest, { start, end })

    videoStream.pipe(res)
})

router.use("/subs", (req, res) => {
    const { subPath } = req.query
    res.sendFile(path.resolve(__dirname + '/../' + subPath))
})

router.use("/live-tv/:id", async(req, res) => { // validateUser
    const { id } = req.params
    let response = await viewLiveTv(id)
    if (!response.success) res.json(response)
    let url = response.data.url
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
        <div class="" id="myHeader">
            <div id="http">
                <script src="//content.jwplatform.com/libraries/IDzF9Zmk.js"></script>
                
                <div id="player">
                </div>
                <script type="text/javascript">
                jwplayer("player").resize(480, 270);
                    jwplayer('player').setup({
                        file: '${url}',
                        playbackRateControls: [0.75, 1, 1.25, 1.5],
                        title: 'live tv',
                        width: '100%',
                        aspectratio: '16:9',
                        mute: false,
                        repeat: 'true',
                        autostart: true,
                        primary: 'html5',
                        type: 'm3u8',
                        setFullscreen: true,
                        controls: true,
                        showCode: true,
                        responsive: true,
                        skin: {
                        name: "glow",
                            active: "red",
                            inactive: "",
                            background: ""
                        }
                    });
                </script>
            </div>
        </div>
    `)
})

module.exports = router