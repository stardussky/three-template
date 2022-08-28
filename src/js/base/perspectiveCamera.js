import * as THREE from 'three'

const PerspectiveCamera = class extends THREE.PerspectiveCamera {
    constructor(...args) {
        if (window.Sketch && args[0] instanceof window.Sketch) {
            const sketch = args[0]
            const options = sketch.options?.camera ?? {}
            const {
                fov = 45,
                aspect = sketch.size.aspect,
                near = 0.01,
                far = 100,
            } = options
            super(fov, aspect, near, far)

            this.sketch = sketch

            this.sketch.eventManager.addEventListener(this.sketch.size, 'calculatesize', (e) => {
                const { aspect } = e.detail
                this.aspect = aspect
                this.updateProjectionMatrix()
            })
        } else {
            super(...args)
        }
    }
}

export default PerspectiveCamera
