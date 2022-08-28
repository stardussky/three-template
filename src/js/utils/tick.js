import * as THREE from 'three'

import CustomEventTarget from '@/js/utils/Event/CustomEventTarget'
import CustomEvent from '@/js/utils/Event/CustomEvent'

const Tick = class extends CustomEventTarget {
    #reqId

    #then

    #interval

    #clock

    constructor(sketch) {
        super()

        this.#clock = new THREE.Clock()
        this.update = this.update.bind(this)

        if (window.Sketch && sketch instanceof window.Sketch) {
            const options = sketch.options ?? {}
            const {
                fps,
            } = options

            if (typeof fps === 'number') {
                this.#then = Date.now()
                this.#interval = 1000 / fps
            }
        }

        this.update()
    }

    stop() {
        window.cancelAnimationFrame(this.#reqId)
    }

    update() {
        this.#reqId = window.requestAnimationFrame(this.update)

        if (typeof this.#interval === 'number') {
            const now = Date.now()
            const delta = now - this.#then

            if (delta > this.#interval) {
                this.#then = now - (delta % this.#interval)

                this.dispatchEvent(new CustomEvent('tick', this.#clock))
            }
            return
        }
        this.dispatchEvent(new CustomEvent('tick', this.#clock))
    }

    destroy() {
        super.destroy()

        this.stop()
    }
}

export default Tick
