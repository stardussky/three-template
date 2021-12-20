import * as THREE from 'three'
import { EffectComposer, RenderPass, ShaderPass } from 'postprocessing'
import App from '../index'
import postprocessingVertexShader from '@/glsl/postprocessing/vertexShader.glsl'
import postprocessingFragmentShader from '@/glsl/postprocessing/fragmentShader.glsl'

export default class Postprocessing {
    constructor () {
        this.app = new App()
        this.composer = new EffectComposer(this.app.renderer)
        this.renderPass = new RenderPass(this.app.scene, this.app.camera)
        this.composer.addPass(this.renderPass)

        this.uniforms = {
            tDiffuse: new THREE.Uniform(),
            uTime: new THREE.Uniform(0),
        }
        const shader = {
            uniforms: this.uniforms,
            vertexShader: postprocessingVertexShader,
            fragmentShader: postprocessingFragmentShader,
        }
        this.shaderPass = new ShaderPass(new THREE.ShaderMaterial(shader), 'tDiffuse')
        this.composer.addPass(this.shaderPass)

        this.app.tick.on('tick', (d, t) => {
            this.shaderPass.screen.material.uniforms.uTime.value = t
        })
    }
}
