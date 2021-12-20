import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Size from './utils/size'
import Renderer from './base/renderer'
import Camera from './base/perspectiveCamera'
import Postprocessing from './base/postprocessing'
// import Camera from './base/orthographicCamera'
import Tick from './utils/tick'
import Loader from './utils/loader'
import Debug from './utils/debug'
import World from './world/index'

let instance = null

const defaultSources = [
    {
        type: 'texture',
        name: 'grid',
        src: 'uv_grid.jpg',
        options: {
            generateMipmaps: false,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,
            encoding: THREE.sRGBEncoding,
            needsUpdate: true,
        },
    },
    {
        type: 'model',
        name: 'helmet',
        src: 'helmet.glb',
    },
]

export default class App {
    constructor (el, options) {
        if (instance) {
            return instance
        }
        instance = this

        if (!(el instanceof Element)) el = document.body

        this.options = {
            control: true,
            alpha: false,
            autoClear: true,
            enableShadow: false,
            shadowAutoUpdate: false,
            autoRender: true,
            ...options,
        }
        const { control, alpha, autoClear, enableShadow, shadowAutoUpdate } = this.options
        this.el = el
        this.size = new Size()
        this.tick = new Tick()
        this.loader = new Loader(defaultSources)
        this.scene = new THREE.Scene()
        this.renderer = new Renderer({
            alpha,
            preserveDrawingBuffer: !autoClear,
            enableShadow,
            shadowAutoUpdate,
        })
        this.camera = new Camera()
        // this.postprocessing = new Postprocessing()
        this.world = new World()
        this.debug = new Debug()
        this.el.appendChild(this.renderer.domElement)

        if (control) {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.enableDamping = true
        }

        this.tick.on('tick', (d, t) => {
            if (this.postprocessing) {
                this.postprocessing.composer.render()
            } else {
                this.renderer.render(this.scene, this.camera)
            }
            this.controls.update()
        })
        this.size.on('resize', () => {
            this.camera.resize()
            this.renderer.resize()
        })
    }

    disposeObjects (object) {
        while (object.children.length) {
            let child = object.children.pop()
            this.disposeObjects.bind(this)(child)
            object.remove(child)
            child = null
        }

        if (object.geometry) {
            object.geometry.dispose()
        }

        if (object.material) {
            Object.values(object.material).forEach((prop) => {
                if (prop && typeof prop.dispose === 'function') {
                    prop.dispose()
                }
            })
            object.material.dispose()
        }
    }

    destroy () {
        this.disposeObjects(this.scene)
        this.size.destroy()
        this.tick.destroy()
        this.loader.destroy()
        this.debug.destroy()
        this.renderer.dispose()
        if (this.controls) {
            this.controls.dispose()
        }

        while (this.el.lastChild) {
            this.el.removeChild(this.el.lastChild)
        }
    }
}
