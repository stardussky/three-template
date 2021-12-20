import * as THREE from 'three'
import Event from './event'

export default class Tick extends Event {
    constructor () {
        super()
        this.clock = new THREE.Clock()
        this.reqID = null
        this.update = this.update.bind(this)
        this.update()
    }

    stop () {
        window.cancelAnimationFrame(this.reqID)
    }

    update () {
        this.reqID = window.requestAnimationFrame(this.update)

        this.trigger('tick', this.clock.getDelta(), this.clock.elapsedTime)
    }

    destroy () {
        super.destroy()
        this.stop()
    }
}
