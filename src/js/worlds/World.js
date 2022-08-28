import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Plane from './Plane'

const World = class {
    constructor(sketch) {
        if (window.Sketch && sketch instanceof window.Sketch) {
            this.sketch = sketch

            this.render = this.render.bind(this)

            this.sketch.eventManager.addEventListener(this.sketch.loader, 'ready', (e) => {
                this.render()
            })
        }
    }

    render() {
        this.controls = new OrbitControls(this.sketch.camera, this.sketch.renderer.domElement)
        this.controls.enableDamping = true

        this.sketch.camera.position.set(0, 0, 5)

        const plane = new Plane(this.sketch)
        this.sketch.scene.add(plane)
        this.sketch.raycaster.add(plane)

        this.sketch.eventManager.addEventListener(this.sketch.tick, 'tick', (e) => {
            this.controls.update()
            plane.update(e.detail)
        })
    }

    destroy() {
        this.controls.dispose()
    }
}

export default World
