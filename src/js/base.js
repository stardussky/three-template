import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('three/examples/js/libs/draco/')

const resources = []

export default class Base {
  constructor() {
    this.resource = null
  }
  dev(camera, el) {
    const control = new OrbitControls(camera, el)
    const axe = new THREE.AxesHelper(1, 1)
    return { control, axe }
  }
  async loadResource() {
    const promises = []

    for (const resource of resources) {
      const type = resource.type
      if (type === 'texture') {
        promises.push(this.textureLoader(require(`@/assets/${resource.src}`)))
        continue
      }
      if (type === 'model') {
        promises.push(this.gltfLoader(require(`@/assets/${resource.src}`)))
      }
    }

    this.resource = await Promise.all(promises).then((result) => {
      const obj = {}
      result.forEach((resource, i) => {
        obj[resources[i].name] = resource
      })
      return obj
    })
  }
  textureLoader(url) {
    const loader = new THREE.TextureLoader()
    return new Promise((resolve) => {
      loader.load(url, (texture) => {
        texture.needsUpdate = true
        resolve(texture)
      })
    })
  }
  gltfLoader(url) {
    const loader = new GLTFLoader()
    loader.setDRACOLoader(dracoLoader)
    return new Promise((resolve) => {
      loader.load(url, (glb) => {
        resolve(glb.scene)
      })
    })
  }

  radToDeg(rad) {
    return (rad * Math.PI) / 180
  }

  disposeObject(obj) {
    while (obj.children.length > 0) {
      this.disposeObject.bind(this)(obj.children[0])
      obj.remove(obj.children[0])
    }
    if (obj.geometry) {
      obj.geometry.dispose()
    }

    if (obj.material) {
      Object.keys(obj.material).forEach((prop) => {
        if (!obj.material[prop]) {
          return
        }
        if (typeof obj.material[prop].dispose === 'function') {
          obj.material[prop].dispose()
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

  removeEvent(instance) {
    const { event, object, type } = instance
    const index = this.events.findIndex((item) => item === instance)
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
}
