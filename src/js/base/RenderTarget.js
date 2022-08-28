import * as THREE from 'three'

const RenderTarget = class extends THREE.WebGLRenderTarget {
    constructor(...args) {
        if (window.Sketch && args[0] instanceof window.Sketch) {
            const sketch = args[0]
            const { width, height } = sketch.viewport
            super(width, height, {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat,
                encoding: THREE.sRGBEncoding,
            })

            this.sketch = sketch

            this.sketch.eventManager.addEventListener(this.sketch.size, 'calculatesize', (e) => {
                const { width, height, dpr } = e.detail
                this.setSize(width, height)
            })
        } else {
            super(...args)
        }
    }
}

export default RenderTarget
