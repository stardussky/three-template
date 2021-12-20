import * as THREE from 'three'
import App from '../index'

export default class Camera extends THREE.OrthographicCamera {
    constructor () {
        const app = new App()
        const { height, aspect } = app.size.viewport
        const frustumSize = height
        super(
            (frustumSize * aspect) / -2,
            (frustumSize * aspect) / 2,
            frustumSize / 2,
            frustumSize / -2,
            0.01,
            100
        )
        this.app = app
        this.position.set(0, 0, 3)
    }

    resize () {
        const { height, aspect } = this.app.size.viewport
        const frustumSize = height
        this.left = (frustumSize * aspect) / -2
        this.right = (frustumSize * aspect) / 2
        this.top = frustumSize / 2
        this.bottom = frustumSize / -2
        this.updateProjectionMatrix()
    }
}
