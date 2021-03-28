import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('three/examples/js/libs/draco/')

const defaultResources = []

export default class Base {
  constructor() {
    this.resources = []
    this.events = []
  }

  dev(camera, el) {
    const control = new OrbitControls(camera, el)
    // const control = null
    const axe = new THREE.AxesHelper(1, 1)
    return { control, axe }
  }

  async loadDefaultResources() {
    return await this.addResources(defaultResources)
  }

  async addResource(payload) {
    const { type, src, name } = payload
    let resource
    if (type === 'texture') {
      resource = await this.textureLoader(require(`@/assets/${src}`))
    }
    if (type === 'model') {
      resource = await this.gltfLoader(require(`@/assets/${src}`))
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
        resolve(glb)
      })
    })
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
