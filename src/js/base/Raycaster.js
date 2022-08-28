import * as THREE from 'three'
import Utils from '@/js/utils/Utils'
import CustomEventTarget from '@/js/utils/Event/CustomEventTarget'
import CustomEvent from '@/js/utils/Event/CustomEvent'

const Raycaster = class extends Utils.classes(THREE.Raycaster, CustomEventTarget) {
    #update = function update() {
        this.setFromCamera(this.pointer, this.camera)

        this.intersects = this.intersectObjects(this.targets, true)
    }.bind(this)

    #updateVectors(clientX, clientY) {
        const { width, height } = this.sketch.size.viewport
        this.mouse.x = clientX
        this.mouse.y = clientY
        this.pointer.x = (clientX / width) * 2 - 1
        this.pointer.y = -(clientY / height) * 2 + 1
    }

    #pointermove = function pointermove(e) {
        const { clientX, clientY } = e
        this.#updateVectors(clientX, clientY)
    }.bind(this)

    #click = function click() {
        if (this.intersects.length) {
            this.dispatchEvent(new CustomEvent('click', this.intersects))
        }
    }.bind(this)

    #touchmove = function touchmove(e) {
        const [{ clientX, clientY }] = e.touches
        this.#updateVectors(clientX, clientY)
    }.bind(this)

    #touchend = function touchend(e) {
        e.preventDefault()

        const [{ clientX, clientY }] = e.changedTouches
        this.#updateVectors(clientX, clientY)
        this.#update()

        if (this.intersects.length) {
            this.dispatchEvent(new CustomEvent('touchend', this.intersects))
        }
    }.bind(this)

    constructor(sketch, camera) {
        super()
        if (window.Sketch && sketch instanceof window.Sketch) {
            this.sketch = sketch
            this.targets = []
            this.intersects = []
            this.mouse = new THREE.Vector2()
            this.pointer = new THREE.Vector2()

            this.setFromCamera(this.pointer, this.sketch.camera)

            if (camera && camera instanceof THREE.Camera) {
                this.setFromCamera(this.pointer, camera)
            }

            this.sketch.eventManager.addEventListener(this.sketch.tick, 'tick', this.#update)
            this.sketch.eventManager.addEventListener(this.sketch.el, 'pointermove', this.#pointermove)
            this.sketch.eventManager.addEventListener(this.sketch.el, 'touchmove', this.#touchmove)
            this.sketch.eventManager.addEventListener(this.sketch.el, 'touchend', this.#touchend)
            this.sketch.eventManager.addEventListener(this.sketch.el, 'click', this.#click)
        }
    }

    add(mesh) {
        if (mesh instanceof THREE.Object3D) {
            this.targets.push(mesh)
        }
    }

    reset() {
        this.targets = []
    }

    destroy() {
        this.targets = null
    }
}

export default Raycaster
