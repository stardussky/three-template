import * as dat from 'dat.gui'
import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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

export default class {
  constructor(el) {
    if (el instanceof Element) {
      this.el = el
      this.reqRenders = []
      this.resizes = []
      this.resources = []
      this.events = []
      this.clock = new THREE.Clock()
      this.render = this.render.bind(this)

      this.loadStatus = {
        total: 0,
        progress: 0,
        isDone: false,
      }
      this.loaderManager = new THREE.LoadingManager()
      this.loaderManager.onProgress = (url, itemsLoaded, itemsTotal) => {
        this.loadStatus.total = itemsTotal
        this.loadStatus.progress = itemsLoaded / this.loadStatus.total
      }
      this.loaderManager.onLoad = () => {
        this.loadStatus.isDone = true
      }
      this.textureLoader = new THREE.TextureLoader(this.loaderManager)
      this.cubeTextureLoader = new THREE.CubeTextureLoader(this.loaderManager)
      this.gltfLoader = new GLTFLoader(this.loaderManager).setDRACOLoader(
        new DRACOLoader().setDecoderPath('/draco/')
      )
    }
  }

  dev(control) {
    if (control) {
      new OrbitControls(this.camera, this.el)
    }
    this.gui = new dat.GUI()
    this.scene.add(new THREE.AxesHelper(1, 1))
  }

  async init() {
    await Promise.all([this.loadDefaultResources()])
    const { width, height, aspect, dpr } = this.viewport
    this.scene = new THREE.Scene()

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: dpr <= 1,
      // alpha: true,
      // preserveDrawingBuffer: true,
    })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(dpr)
    // this.renderer.autoClear = false
    this.renderer.physicallyCorrectLights = true
    this.renderer.outputEncoding = THREE.sRGBEncoding
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1
    this.renderer.shadowMap.type = THREE.VSMShadowMap
    // this.renderer.shadowMap.enabled = true
    // this.renderer.shadowMap.autoUpdate = false
    this.el.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 100)
    // const frustum = 2
    // this.camera = new THREE.OrthographicCamera(
    //   (frustum * aspect) / -2,
    //   (frustum * aspect) / 2,
    //   frustum / 2,
    //   frustum / -2,
    //   0.01,
    //   100
    // )
    this.camera.position.set(0, 0, 3)

    this.addEvent(this.resize.bind(this), window, 'resize')
    this.render()

    this.resizes.push(() => {
      const { width, height, aspect } = this.viewport
      this.renderer.setSize(width, height)

      this.camera.aspect = aspect
      this.camera.updateProjectionMatrix()
    })
  }

  resize() {
    for (let i = 0, len = this.resizes.length; i < len; i++) {
      this.resizes[i]()
    }
  }

  render() {
    this.reqID = requestAnimationFrame(this.render)

    const d = this.clock.getDelta()
    for (let i = 0, len = this.reqRenders.length; i < len; i++) {
      this.reqRenders[i](d, this.clock.elapsedTime)
    }
  }

  stop() {
    window.cancelAnimationFrame(this.reqID)
  }

  destroy() {
    this.stop()

    this.gui?.destroy()
    this.removeEvents()
    this.disposeObject(this.scene)
    this.renderer.dispose()
    this.scene = null
    this.camera = null
    this.renderer = null
    while (this.el.lastChild) {
      this.el.removeChild(this.el.lastChild)
    }
  }

  async loadDefaultResources() {
    return await this.addResources(defaultResources)
  }

  async addResource(payload) {
    let { type, src, name, options } = payload

    if (!src.match(/^(http|https):\/\//)) {
      src = require(`@/assets/${src}`)
    }

    let resource
    if (type === 'texture') {
      resource = await this.loadTexture(src, options)
    }
    if (type === 'cubeTexture') {
      resource = await this.loadCubeTexture(name, src, options)
    }
    if (type === 'model') {
      resource = await this.loadGltf(src, options)
    }
    if (resource) {
      this.resources.push({
        type,
        name: name || src,
        resource,
      })
    }
    return resource
  }

  async addResources(payload) {
    const promises = payload.map((resource) => this.addResource(resource))

    return await Promise.all(promises).then((result) => result)
  }

  getResource = (() => {
    const memo = {}
    return (string, type = 'name') => {
      if (memo[string]) return memo[string]
      const target = this.resources.find((resource) => resource[type] === string)
      memo[string] = target
      return target
    }
  })()

  getResources(payload, type = 'name') {
    if (typeof payload === 'function') {
      return this.resources.filter(payload)
    }
    return this.resources.filter((resource) => resource[type] === payload)
  }

  loadTexture(url, options) {
    return new Promise((resolve) => {
      this.textureLoader.load(url, (texture) => {
        for (const key in options) {
          texture[key] = options[key]
        }
        resolve(texture)
      })
    })
  }

  loadCubeTexture = (() => {
    const memo = {}
    return function (name, url, options) {
      const mats = memo[name]
      mats ? mats.push(url) : (memo[name] = [url])

      if (mats && mats.length === 6) {
        return new Promise((resolve) => {
          this.cubeTextureLoader.load(mats, (texture) => {
            delete memo[name]
            for (const key in options) {
              texture[key] = options[key]
            }
            resolve(texture)
          })
        })
      }
    }
  })()

  loadGltf(url, options) {
    return new Promise((resolve) => {
      this.gltfLoader.load(url, (gltf) => {
        for (const key in options) {
          gltf[key] = options[key]
        }

        const model = gltf.scene
        const group = new THREE.Group()
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        group.add(model)
        gltf.scene = group

        resolve(gltf)
      })
    })
  }

  disposeObject(obj) {
    while (obj.children.length) {
      let child = obj.children.pop()
      this.disposeObject.call(this, child)
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

  addEvent(event, object, type) {
    const instance = {
      event,
      object,
      type,
    }
    this.events.push(instance)
    object.addEventListener(type, event)
    return instance
  }

  removeEvent(event, object, type) {
    const index = this.events.findIndex((item) => {
      return item.event === event && item.object === object && item.type === type
    })
    if (~index) {
      object.removeEventListener(type, event)
      this.events.splice(index, 1)
    }
  }

  removeEvents() {
    while (this.events.length) {
      const { event, object, type } = this.events.pop()
      object.removeEventListener(type, event)
    }
  }

  get viewport() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      aspect: window.innerWidth / window.innerHeight,
      dpr: Math.min(window.devicePixelRatio, 1.5),
    }
  }

  get viewSize() {
    if (this.camera.type === 'OrthographicCamera') {
      const { top, right, bottom, left } = this.camera
      return {
        width: Math.abs(right) + Math.abs(left),
        height: Math.abs(top) + Math.abs(bottom),
      }
    }
    const { position, fov, aspect } = this.camera
    const distance = position.z
    const vFov = THREE.Math.degToRad(fov)
    const height = 2 * Math.tan(vFov / 2) * distance
    const width = height * aspect
    return { width, height }
  }
}
