import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Loader from './loader'
import Event from './event'

const defaultResources = [
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

export default class Sketch {
    constructor (el, options = {}) {
        this.sketchOptions = {
            develop: true,
            control: true,
            gui: true,
            alpha: false,
            autoClear: true,
            shadow: false,
            shadowAutoUpdate: false,
            camera: 'perspective',
            autoRender: true,
            ...options,
        }
        if (!(el instanceof Element)) {
            el = document.body
        }

        this.loader = new Loader(defaultResources)
        this.event = new Event()
        this.el = el
        this.reqRenders = []
        this.resizes = []
        this.clock = new THREE.Clock()
        this.render = this.render.bind(this)

        const {
            develop,
            control,
            gui,
            alpha,
            autoClear,
            shadow,
            shadowAutoUpdate,
            camera = 'perspective',
            autoRender,
        } = this.sketchOptions
        const { width, height, aspect, dpr } = this.viewport
        this.scene = new THREE.Scene()

        this.renderer = new THREE.WebGLRenderer({
            powerPreference: 'high-performance',
            antialias: dpr <= 1,
            alpha,
            preserveDrawingBuffer: !autoClear,
        })
        this.renderer.setSize(width, height)
        this.renderer.setPixelRatio(dpr)
        this.renderer.autoClear = autoClear
        this.renderer.physicallyCorrectLights = true
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1
        this.renderer.shadowMap.type = THREE.VSMShadowMap
        this.renderer.shadowMap.enabled = shadow
        this.renderer.shadowMap.autoUpdate = shadowAutoUpdate
        this.el.appendChild(this.renderer.domElement)

        const frustumSize = height
        if (camera === 'perspective') {
            this.camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 100)
        } else {
            this.camera = new THREE.OrthographicCamera(
                (frustumSize * aspect) / -2,
                (frustumSize * aspect) / 2,
                frustumSize / 2,
                frustumSize / -2,
                0.01,
                100
            )
        }
        this.camera.position.set(0, 0, 3)

        this.event.add('resize', window, this.resize.bind(this))

        this.resizes.push((viewport) => {
            const { width, height, aspect } = viewport
            this.renderer.setSize(width, height)

            if (this.camera.type === 'OrthographicCamera') {
                this.camera.left = (frustumSize * aspect) / -2
                this.camera.right = (frustumSize * aspect) / 2
                this.camera.top = frustumSize / 2
                this.camera.bottom = frustumSize / -2
            } else {
                this.camera.aspect = aspect
            }
            this.camera.updateProjectionMatrix()
        })

        if (autoRender) this.render()

        this.dev(develop, control, gui)
    }

    dev (develop, control, gui) {
        if (develop) {
            this.scene.add(new THREE.AxesHelper(1, 1))
        }
        if (control) {
            new OrbitControls(this.camera, this.el)
        }
        if (gui) {
            this.gui = new dat.GUI()
        }
    }

    async init () {
        await this.loader.load()
    }

    resize () {
        const viewport = this.viewport
        const viewSize = this.viewSize
        for (let i = 0, len = this.resizes.length; i < len; i++) {
            this.resizes[i](viewport, viewSize)
        }
    }

    update () {
        const d = this.clock.getDelta()
        for (let i = 0, len = this.reqRenders.length; i < len; i++) {
            this.reqRenders[i](d, this.clock.elapsedTime)
        }
    }

    stop () {
        window.cancelAnimationFrame(this.reqID)
    }

    render () {
        this.reqID = requestAnimationFrame(this.render)

        this.update()
    }

    destroy () {
        this.stop()

        if (this.sketchOptions.gui) this.gui.destroy()
        this.event.destroy()
        this.disposeObject(this.scene)
        this.renderer.dispose()
        this.scene = null
        this.camera = null
        this.renderer = null
        while (this.el.lastChild) {
            this.el.removeChild(this.el.lastChild)
        }
    }

    disposeObject (obj) {
        while (obj.children.length) {
            let child = obj.children.pop()
            this.disposeObject.bind(this)(child)
            obj.remove(child)
            child = null
        }

        if (obj.geometry) {
            obj.geometry.dispose()
        }

        if (obj.material) {
            Object.values(obj.material).forEach((prop) => {
                if (prop && typeof prop.dispose === 'function') {
                    prop.dispose()
                }
            })
            obj.material.dispose()
        }
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
        if (this.camera.type === 'OrthographicCamera') {
            const { top, right, bottom, left } = this.camera
            return {
                width: Math.abs(right) + Math.abs(left),
                height: Math.abs(top) + Math.abs(bottom),
            }
        }
        const { position, fov, aspect } = this.camera
        const distance = position.distanceTo(new THREE.Vector3(0)) * Math.sign(position.z)
        const vFov = THREE.Math.degToRad(fov)
        const height = 2 * Math.tan(vFov / 2) * distance
        const width = height * aspect
        return { width, height }
    }
}
