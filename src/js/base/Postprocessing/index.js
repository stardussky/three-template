import * as THREE from 'three'
import { EffectComposer, RenderPass, ShaderPass } from 'postprocessing'
import vertexShader from './glsl/vertexShader.glsl'
import fragmentShader from './glsl/fragmentShader.glsl'

export default class Postprocessing {
    constructor(sketch) {
        if (window.Sketch && sketch instanceof window.Sketch) {
            this.sketch = sketch
            this.composer = new EffectComposer(this.sketch.renderer)

            this.renderPass = new RenderPass(this.sketch.scene, this.sketch.camera)
            this.composer.addPass(this.renderPass)

            this.uniforms = {
                tDiffuse: new THREE.Uniform(),
                uTime: new THREE.Uniform(0),
            }
            const shader = {
                uniforms: this.uniforms,
                vertexShader,
                fragmentShader,
            }
            this.shaderPass = new ShaderPass(new THREE.ShaderMaterial(shader), 'tDiffuse')
            this.composer.addPass(this.shaderPass)
        }
    }

    destroy() {
        this.shaderPass.dispose()
        this.renderPass.dispose()
        this.composer.dispose()
    }
}
