//import TextureMerger from './vendors/TextureMerger'
// import { Texture } from './ogl/core/Texture.js'
// const { createCanvas, loadImage } = require('canvas')
import { createCanvas, loadImage } from "canvas"
import fs from 'fs'

class Atlasserv2 {
    canvas = null
    spritesheet = null
    ranges = null
    spritesCount = 24
    framerate = 15
    url = `/glxp/spritesheets/ball-${this.framerate}fps/`
    textureId = 'ball_spritesheet'
    timeline = gsap.timeline({ paused: true, repeat: -1 })

    /**
     * Builds and manages a spritesheet from a folder of images
     * 
     * First time usage:
     * 0. Put the spritesheet frames in a folder with the suffix "-{framerate}fps" (e.g. "example-30fps") and set this.url to the folder path
     * 1. Initialise this manager with a scene
     * 2. Call initGUI() to add controls to the GUI
     * 3. Click on the "Make new spritesheet" button, this will build the spritesheet and download the texture and ranges files
     * 4. Put the newly downloaded files in the root of the spritesheets folder
     * 
     * Subsequent usage:
     * 1. Initialise this manager with a scene
     * 2. Call fetchSpritesheetData() to load the spritesheet texture and ranges JSON
     * 
     * @param {AbsScene} scene 
     */
    constructor(scene) {
        this.scene = scene
    }

    // Initializations
    initTimeline(duration = 1, delay = 0) {
        this.timeline.to(this, {
            currentRangeOffset: this.spritesCount - 1,
            ease: `steps(${this.spritesCount - 1})`,
            duration,
            delay
        })
    }
    initGUI(folder) {
        // Example folder parameter: buildGUI(DebugController.folders['Post Processing'])
        if (!folder) return

        // Build button
        folder.addButton({ title: "Make new spritesheet" }).on("click", () => {
            this.buildSpritesheet((spritesheet, ranges) => {
                this.downloadSpritesheetFiles()
            })
        })

        // Play button
        folder.addButton({ title: "Play" }).on("click", () => {
            this.play()
        })

        // Pause button
        folder.addButton({ title: "Pause" }).on("click", () => {
            this.pause()
        })

        // Framerate slider
        folder.addInput(this, 'currentRangeOffset', { min: 0, max: this.spritesCount - 1, step: 1 })
    }

    // On first build
    buildSpritesheet(
        callback,
        spritesCount = this.spritesCount,
        spritesheetSize = 2048,
        format = 'png',
        urlRoot = this.url,
        textureID = this.textureId
    ) {
        const texturePromises = new Array(spritesCount).fill().map((_, index) =>
            this.scene.textureLoader.load(
                `${urlRoot}${("0" + index).slice(-2)}.${format}`,
                `${textureID}_${index}`,
                [""]
            )
        )

        Promise.all(texturePromises).then((textures) => {
            // TextureMerger expects textures to have offset and repeat properties since it's used to Three.js
            textures = textures.map((texture) => ({ ...texture, offset: 0, repeat: [0, 0] }))

            console.log(textures);

            // Warning: blocks main thread
            const { ranges, canvas } = new TextureMerger(textures, spritesheetSize)
            // const { ranges, canvas } = new AtlasGenerator(textures, spritesheetSize)

            this.canvas = canvas
            this.spritesheet = new Texture(this.scene.gl, { image: canvas })
            this.ranges = ranges

            callback(this.spritesheet, this.ranges)
        })
    }
    downloadSpritesheetFiles(format = 'image/png', spritesheetName = 'spritesheet.png', rangesName = 'spritesheet_ranges.json') {
        const spritesheetDataURL = this.canvas.toDataURL(format)
        const spritesheetAnchorEl = document.createElement('a')
        spritesheetAnchorEl.href = spritesheetDataURL
        spritesheetAnchorEl.download = spritesheetName
        document.body.appendChild(spritesheetAnchorEl)
        spritesheetAnchorEl.click()
        document.body.removeChild(spritesheetAnchorEl)

        const rangesDataURL = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.ranges))
        const rangesAnchorEl = document.createElement('a')
        rangesAnchorEl.href = rangesDataURL
        rangesAnchorEl.download = rangesName
        document.body.appendChild(rangesAnchorEl)
        rangesAnchorEl.click()
        document.body.removeChild(rangesAnchorEl)
    }

    // On subsequent load
    fetchSpritesheetData(textureID = this.textureId, urlRoot = this.url) {
        return new Promise((resolve) => {
            const promises = [
                this.scene.textureLoader.load(urlRoot + `spritesheet.png`, textureID, ["flipY"]),
                fetch(urlRoot + 'spritesheet_ranges.json')
            ]

            Promise.all(promises).then(async ([texture, response]) => {
                const ranges = await response.json() // Get JSON value from the response body
                this.spritesheet = texture
                this.ranges = ranges
                resolve([texture, ranges])
            })
        })
    }
}

class Atlasser {
    path = "./sprites/example"
    size = [1024, 1024]
    name = "spritesheet.png"
    canvas
    context

    constructor(path = "./sprites/example", name = 'spritesheet.png', { size = 1024 }) {
        this.init()
        this.path = path
        this.size = [size, size] // TODO: allow for non-square spritesheets
        this.name = name
    }

    init() {
        this.canvas = createCanvas(this.size[0], this.size[1])
        this.context = this.canvas.getContext('2d')
    }

    draw() {
        loadImage('./sprites/example/00.png').then((image) => {
            this.context.drawImage(image, 50, 0, 70, 70)
        })
    }

    save() {
        const out = fs.createWriteStream(this.path + '/' + this.name)
        const stream = this.canvas.createPNGStream()
        stream.pipe(out)
        out.on('finish', () => console.log('Spritesheet saved.'))
    }
}

export default Atlasser
