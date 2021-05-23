import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import Basic from './basic'
import vertexShader from '@/glsl/vertexShader.glsl'
import fragmentShader from '@/glsl/fragmentShader.glsl'
import postprocessingVertexShader from '@/glsl/postprocessing/vertexShader.glsl'
import postprocessingFragmentShader from '@/glsl/postprocessing/fragmentShader.glsl'

export default class extends Basic {
  constructor(el = document.body) {
    super(el)
  }

  async init() {
    await super.init()

    this.createPostprocessing()
    this.createShaderSketch()

    this.dev(true)

    this.reqRenders.push(() => {
      if (this.effectComposer) {
        this.effectComposer.render()
      } else {
        this.renderer.render(this.scene, this.camera)
      }
    })
  }

  createPostprocessing() {
    const { width, height, dpr } = this.viewport

    const renderTargetOptions = {
      encoding: THREE.sRGBEncoding,
    }
    const renderTarget =
      dpr <= 1 && this.renderer.capabilities.isWebGL2
        ? new THREE.WebGLMultisampleRenderTarget(width, height, renderTargetOptions)
        : new THREE.WebGLRenderTarget(width, height, renderTargetOptions)

    this.effectComposer = new EffectComposer(this.renderer, renderTarget)

    const renderPass = new RenderPass(this.scene, this.camera)
    this.effectComposer.addPass(renderPass)

    const uniforms = {
      tDiffuse: new THREE.Uniform(),
      uTime: new THREE.Uniform(0),
    }
    const shader = {
      uniforms,
      vertexShader: postprocessingVertexShader,
      fragmentShader: postprocessingFragmentShader,
    }
    const shaderPass = new ShaderPass(shader)
    this.effectComposer.addPass(shaderPass)

    this.reqRenders.push((d, t) => {
      shaderPass.material.uniforms.uTime.value = t
    })
    this.resizes.push(() => {
      const { width, height } = this.viewport
      renderTarget.setSize(width, height)
    })
  }

  createShaderSketch() {
    const { width: vpWidth, height: vpHeight } = this.viewport
    const { width, height } = this.viewSize

    const uniforms = THREE.UniformsUtils.merge([
      {
        uResolution: new THREE.Uniform(new THREE.Vector2(vpWidth, vpHeight)),
        uTime: new THREE.Uniform(0),
        uTexture: new THREE.Uniform(this.getResource('bg').resource),
        uTextureRatio: new THREE.Uniform(2560 / 1440),
      },
    ])

    const geometry = new THREE.PlaneBufferGeometry(1, 1, 30, 30)
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      side: THREE.DoubleSide,
    })
    const planeSketch = new THREE.Mesh(geometry, material)
    planeSketch.scale.set(width, height, 1)
    this.scene.add(planeSketch)

    this.reqRenders.push((d, t) => {
      uniforms.uTime.value = t
    })
    this.resizes.push(() => {
      const { width: vpWidth, height: vpHeight } = this.viewport
      const { width, height } = this.viewSize
      uniforms.uResolution.value = new THREE.Vector2(vpWidth, vpHeight)
      planeSketch.scale.set(width, height, 1)
    })
  }
}
