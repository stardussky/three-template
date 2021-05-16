import * as THREE from 'three'
import Basic from './basic'
import vertexShader from '@/glsl/vertexShader.glsl'
import fragmentShader from '@/glsl/fragmentShader.glsl'

export default class extends Basic {
  constructor(el = document.body) {
    super(el)
  }

  async init() {
    await super.init()

    this.createShaderSketch()

    this.dev(true)
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
}
