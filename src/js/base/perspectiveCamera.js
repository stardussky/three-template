import * as THREE from 'three'
import App from '../index'

export default class Camera extends THREE.PerspectiveCamera {
    constructor () {
        const app = new App()
        const { aspect } = app.size.viewport
        super(45, aspect, 0.01, 100)
        this.app = app
        this.position.set(0, 0, 3)
    }

    resize () {
        const { aspect } = this.app.size.viewport
        this.aspect = aspect
        this.updateProjectionMatrix()
    }
}
