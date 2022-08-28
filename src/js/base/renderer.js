import * as THREE from 'three'

const Renderer = class extends THREE.WebGLRenderer {
    constructor(...args) {
        if (window.Sketch && args[0] instanceof window.Sketch) {
            const sketch = args[0]
            const { width, height, dpr } = sketch.size.viewport
            const options = sketch.options?.renderer ?? {}
            const {
                alpha = false,
                autoClear = true,
                enableShadow = false,
                shadowAutoUpdate = false,
            } = options

            super({
                powerPreference: 'high-performance',
                antialias: dpr <= 1,
                alpha,
                preserveDrawingBuffer: !autoClear,
                enableShadow,
                shadowAutoUpdate,
            })

            this.sketch = sketch
            this.setSize(width, height)
            this.setPixelRatio(dpr)
            this.autoClear = autoClear
            this.shadowMap.enabled = enableShadow
            this.shadowMap.autoUpdate = shadowAutoUpdate

            this.sketch.eventManager.addEventListener(this.sketch.size, 'calculatesize', (e) => {
                const { width, height, dpr } = e.detail
                this.setSize(width, height)
                this.setPixelRatio(dpr)
            })
        } else {
            super(...args)
        }

        this.physicallyCorrectLights = true
        this.outputEncoding = THREE.sRGBEncoding
        this.toneMapping = THREE.ACESFilmicToneMapping
        this.toneMappingExposure = 1
        this.shadowMap.type = THREE.VSMShadowMap
    }
}

export default Renderer
