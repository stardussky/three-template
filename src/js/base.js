import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default class Base {
  constructor() {}
  dev(camera, el) {
    const control = new OrbitControls(camera, el)

    return control
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
