import * as THREE from 'three'
import App from '../index'
import Event from './event'

export default class Size extends Event {
    constructor () {
        super()
        this.app = new App()
        this.addListener('resize', window, () => {
            this.trigger('resize', this.viewport, this.viewSize)
        })
    }

    get viewport () {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            aspect: window.innerWidth / window.innerHeight,
            dpr: Math.min(window.devicePixelRatio, 1.5),
        }
    }

    get viewSize () {
        if (this.app.camera instanceof THREE.PerspectiveCamera) {
            const { position, fov, aspect } = this.app.camera
            const distance = position.distanceTo(new THREE.Vector3(0)) * Math.sign(position.z)
            const vFov = THREE.Math.degToRad(fov)
            const height = 2 * Math.tan(vFov / 2) * distance
            const width = height * aspect
            return { width, height }
        }
        const { top, right, bottom, left } = this.app.camera
        return {
            width: Math.abs(right) + Math.abs(left),
            height: Math.abs(top) + Math.abs(bottom),
        }
    }
}
