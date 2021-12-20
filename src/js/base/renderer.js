import * as THREE from 'three'
import App from '../index'

export default class Renderer extends THREE.WebGLRenderer {
    constructor (options) {
        const app = new App()
        const { width, height, dpr } = app.size.viewport
        super({
            powerPreference: 'high-performance',
            antialias: dpr <= 1,
            ...options,
        })
        this.options = options
        const { autoClear, enableShadow, shadowAutoUpdate } = this.options
        this.app = app
        this.setSize(width, height)
        this.setPixelRatio(dpr)
        this.autoClear = autoClear
        this.physicallyCorrectLights = true
        this.outputEncoding = THREE.sRGBEncoding
        this.toneMapping = THREE.ACESFilmicToneMapping
        this.toneMappingExposure = 1
        this.shadowMap.type = THREE.VSMShadowMap
        this.shadowMap.enabled = enableShadow
        this.shadowMap.autoUpdate = shadowAutoUpdate
    }

    resize () {
        const { width, height, dpr } = this.app.size.viewport
        this.setSize(width, height)
        this.setPixelRatio(dpr)
    }
}
