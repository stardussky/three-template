import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import Sketch from './sketch'
import vertexShader from '@/glsl/vertexShader.glsl'
import fragmentShader from '@/glsl/fragmentShader.glsl'
import postprocessingVertexShader from '@/glsl/postprocessing/vertexShader.glsl'
import postprocessingFragmentShader from '@/glsl/postprocessing/fragmentShader.glsl'

export default class extends Sketch {
    constructor (el) {
        super(el, {
            develop: true,
            control: true,
            gui: true,
            alpha: false,
            autoClear: true,
            shadow: false,
            shadowAutoUpdate: false,
            camera: 'perspective',
            autoRender: true,
        })
    }

    async init () {
        await super.init()

        // this.createPostprocessing()
        this.createShaderSketch()

        this.reqRenders.push(() => {
            if (this.effectComposer) {
                this.effectComposer.render()
            } else {
                this.renderer.render(this.scene, this.camera)
            }
        })
    }

    createPostprocessing () {
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
        this.resizes.push((viewport) => {
            const { width, height } = viewport
            renderTarget.setSize(width, height)
        })
    }

    createShaderSketch () {
        const { width: vpWidth, height: vpHeight } = this.viewport
        const { width, height } = this.viewSize

        const texture = this.loader.getResource('grid').resource

        const uniforms = {
            ...THREE.UniformsUtils.merge([]),
            uResolution: new THREE.Uniform(new THREE.Vector2(vpWidth, vpHeight)),
            uTime: new THREE.Uniform(0),
            uTexture: new THREE.Uniform(texture),
            uTextureRatio: new THREE.Uniform(texture.image.width / texture.image.height),
        }

        const geometry = new THREE.PlaneBufferGeometry(1, 1, 30, 30)
        const material = new THREE.ShaderMaterial({
            // precision: 'lowp',
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
        this.resizes.push((viewport, viewSize) => {
            const { width: vpWidth, height: vpHeight } = viewport
            const { width, height } = viewSize
            uniforms.uResolution.value = new THREE.Vector2(vpWidth, vpHeight)
            planeSketch.scale.set(width, height, 1)
        })
    }
}
