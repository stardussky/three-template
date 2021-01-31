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

    return control
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
}
