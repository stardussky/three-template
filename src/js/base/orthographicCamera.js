import * as THREE from 'three'

const OrthographicCamera = class extends THREE.OrthographicCamera {
    constructor(...args) {
        if (window.Sketch && args[0] instanceof window.Sketch) {
            const sketch = args[0]
            const options = sketch.options?.camera ?? {}
            const { height, aspect } = sketch.size.viewport
            const {
                left = (height * aspect) / -2,
                right = (height * aspect) / 2,
                top = height / 2,
                bottom = height / -2,
                near = 0.01,
                far = 100,
            } = options
            super(left, right, top, bottom, near, far)

            this.sketch = sketch

            this.sketch.eventManager.addEventListener(this.sketch.size, 'calculatesize', (e) => {
                const { height, aspect } = e.detail
                this.left = (height * aspect) / -2
                this.right = (height * aspect) / 2
                this.top = height / 2
                this.bottom = height / -2
                this.updateProjectionMatrix()
            })
        } else {
            super(...args)
        }
    }
}

export default OrthographicCamera
