import * as THREE from 'three'
import CustomEventTarget from '@/js/utils/Event/CustomEventTarget'
import CustomEvent from '@/js/utils/Event/CustomEvent'

const Size = class extends CustomEventTarget {
    #width

    #height

    #aspect

    #dpr

    constructor(sketch) {
        super()

        this.calculateSize = this.calculateSize.bind(this)
        if (window.Sketch && sketch instanceof window.Sketch) {
            this.sketch = sketch
            this.sketch.eventManager.addEventListener(window, 'resize', this.calculateSize)
            this.calculateSize()
        }
    }

    calculateSize() {
        this.#width = this.sketch.el.clientWidth
        this.#height = this.sketch.el.clientHeight
        this.#aspect = this.#width / this.#height
        this.#dpr = Math.min(window.devicePixelRatio, 1.5)

        this.dispatchEvent(new CustomEvent('calculatesize', this))
    }

    get width() {
        return this.#width
    }

    get height() {
        return this.#height
    }

    get aspect() {
        return this.#aspect
    }

    get dpr() {
        return this.#dpr
    }

    get viewport() {
        return {
            width: this.#width,
            height: this.#height,
            aspect: this.#aspect,
            dpr: this.#dpr,
        }
    }

    get viewsize() {
        if (this.sketch && this.sketch.camera) {
            if (this.sketch.camera instanceof THREE.PerspectiveCamera) {
                const { position, fov, aspect } = this.sketch.camera
                const distance = position.distanceTo(new THREE.Vector3(0)) * Math.sign(position.z)
                const vFov = THREE.MathUtils.degToRad(fov)
                const height = 2 * Math.tan(vFov / 2) * distance
                const width = height * aspect
                return { width, height }
            }
            const {
                top, right, bottom, left,
            } = this.sketch.camera
            return {
                width: Math.abs(right) + Math.abs(left),
                height: Math.abs(top) + Math.abs(bottom),
            }
        }
        return { width: 0, height: 0 }
    }
}

export default Size
