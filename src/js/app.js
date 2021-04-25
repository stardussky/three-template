import * as THREE from 'three/build/three.module'
import Base from './base'
import vertexShader from '@/glsl/vertexShader.glsl'
import fragmentShader from '@/glsl/fragmentShader.glsl'

export default class extends Base {
  constructor(el = document.body) {
    if (el instanceof Element) {
      super()
      this.el = el
      this.reqRenders = []
      this.resizes = []
      this.clock = new THREE.Clock()
      this.render = this.render.bind(this)
    }
  }

  async init() {
    await Promise.all([this.loadDefaultResources()])
    const { width, height, aspect, dpr } = this.viewport
    this.scene = new THREE.Scene()

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      // alpha: true,
    })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(dpr)
    this.el.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.01, 100)
    this.camera.position.set(0, 0, 3)

    this.addEvent(this.resize.bind(this), window, 'resize')
    this.createShaderSketch()
    this.render()

    this.resizes.push(() => {
      const { width, height, aspect } = this.viewport
      this.renderer.setSize(width, height)

      this.camera.aspect = aspect
      this.camera.updateProjectionMatrix()
    })

    const { axe } = this.dev(this.camera, this.renderer.domElement)
    this.scene.add(axe)
  }

  createShaderSketch() {
    const { width: vpWidth, height: vpHeight } = this.viewport
    const { width, height } = this.viewSize
    this.uniforms = {
      uResolution: new THREE.Uniform(new THREE.Vector2(vpWidth, vpHeight)),
      uTime: new THREE.Uniform(0),
      uTexture: new THREE.Uniform(this.getResource('bg').resource),
      uTextureRatio: new THREE.Uniform(2560 / 1440),
    }
    const geometry = new THREE.PlaneBufferGeometry(1, 1, 30, 30)
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      side: THREE.DoubleSide,
    })
    this.planeSketch = new THREE.Mesh(geometry, material)
    this.planeSketch.scale.set(width, height, 1)
    this.scene.add(this.planeSketch)

    this.reqRenders.push((d, t) => {
      this.uniforms.uTime.value = t
    })
    this.resizes.push(() => {
      const { width: vpWidth, height: vpHeight } = this.viewport
      const { width, height } = this.viewSize
      this.uniforms.uResolution.value = new THREE.Vector2(vpWidth, vpHeight)
      this.planeSketch.scale.set(width, height, 1)
    })
  }

  resize() {
    for (let i = 0, len = this.resizes.length; i < len; i++) {
      this.resizes[i]()
    }
  }

  render() {
    this.reqID = requestAnimationFrame(this.render)
    this.renderer.render(this.scene, this.camera)

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
    this.renderer.domElement.addEventListener('dblclick', null, false)

    this.removeEvents()
    this.disposeObject(this.scene)
    this.scene = null
    this.camera = null
    this.renderer = null
    while (this.el.lastChild) {
      this.el.removeChild(this.el.lastChild)
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
    const distance = this.camera.position.z
    const vFov = THREE.Math.degToRad(this.camera.fov)
    const height = 2 * Math.tan(vFov / 2) * distance
    const width = height * this.viewport.aspect
    return { width, height, vFov }
  }
}
