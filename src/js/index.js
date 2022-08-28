import * as THREE from 'three'

import CustomEventTarget from '@/js/utils/Event/CustomEventTarget'
import EventManager from '@/js/utils/Event/EventManager'
import Loader from '@/js/utils/Loader/index'
import Size from '@/js/utils/Size'
import Tick from '@/js/utils/Tick'
import Debug from '@/js/utils/Debug'

import Renderer from '@/js/base/Renderer'
import PerspectiveCamera from '@/js/base/PerspectiveCamera'
import OrthographicCamera from '@/js/base/OrthographicCamera'
import Scene from '@/js/base/Scene'
import Raycaster from '@/js/base/Raycaster'
import Postprocessing from '@/js/base/Postprocessing'
import RenderTarget from '@/js/base/RenderTarget'

import World from '@/js/worlds/World'

import sources from '@/js/data/sources'

const Sketch = class extends CustomEventTarget {
    #update = function update() {
        if (this.postprocessing) {
            this.postprocessing.composer.render()
            return
        }
        this.renderer.render(this.scene, this.camera)
    }.bind(this)

    constructor(el, options) {
        super()

        this.el = el
        this.options = {
            fps: 60,
            control: true,
        }
        if (!(this.el instanceof HTMLElement)) {
            this.el = document.body
        }
        this.eventManager = new EventManager()
        this.loader = new Loader(sources)
        this.loader.setGlobalTextureLoad = (texture) => {
            if (texture) {
                texture.generateMipmaps = false
                texture.minFilter = THREE.NearestFilter
                texture.magFilter = THREE.NearestFilter
                texture.encoding = THREE.sRGBEncoding
                texture.needsUpdate = true
            }
        }
        this.loader.setGlobalImageBitmapLoad = (texture) => {}
        this.loader.setGlobalCubeTextureLoad = (texture) => {}
        this.loader.setGlobalGltfLoad = (gltf) => {}
        this.size = new Size(this)
        this.tick = new Tick(this)
        this.debug = new Debug(this)

        const { height, aspect } = this.size
        this.setOptions({
            renderer: {
                alpha: false,
                autoClear: true,
                enableShadow: false,
                shadowAutoUpdate: false,
                autoRender: true,
            },
            camera: {
                fov: 45,
                aspect,
                left: (height * aspect) / -2,
                right: (height * aspect) / 2,
                top: height / 2,
                bottom: height / -2,
                near: 0.01,
                far: 100,
            },
            ...options,
        })

        this.scene = new Scene()
        this.camera = new PerspectiveCamera(this)
        // this.camera = new OrthographicCamera(this)
        this.renderer = new Renderer(this)
        this.raycaster = new Raycaster(this, this.camera)
        // this.postprocessing = new Postprocessing(this)
        this.world = new World(this)

        this.el.appendChild(this.renderer.domElement)

        this.render()
    }

    setOptions(options) {
        this.options = {
            ...this.options,
            ...options,
        }
    }

    stop() {
        this.eventManager.removeEventListener(this.tick, 'tick', this.#update)
    }

    render() {
        this.eventManager.addEventListener(this.tick, 'tick', this.#update)
    }

    destroy() {
        super.destroy()

        this.stop()

        this.el.removeChild(this.renderer.domElement)

        this.eventManager.destroy()
        this.loader.destroy()
        this.size.destroy()
        this.tick.destroy()
        this.debug.destroy()

        this.scene.destroy()
        this.renderer.dispose()
        this.raycaster.destroy()

        if (this.postprocessing) {
            this.postprocessing.destroy()
        }

        this.world.destroy()
    }
}

window.Sketch = Sketch

export default Sketch
