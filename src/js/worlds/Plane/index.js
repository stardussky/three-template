import * as THREE from 'three'
import vertexShader from './glsl/vertexShader.glsl'
import fragmentShader from './glsl/fragmentShader.glsl'

const Plane = class extends THREE.Mesh {
    constructor(sketch) {
        let uniforms = {}
        if (window.Sketch && sketch instanceof window.Sketch) {
            const { width, height } = sketch.size.viewport
            const texture = sketch.loader.get('uv')
            uniforms = {
                ...THREE.UniformsUtils.merge([]),
                uResolution: new THREE.Uniform(new THREE.Vector2(width, height)),
                uTime: new THREE.Uniform(0),
                uTexture: new THREE.Uniform(texture),
                uTextureRatio: new THREE.Uniform(texture.image.width / texture.image.height),
            }
        }
        const geometry = new THREE.PlaneBufferGeometry(1, 1)
        const material = new THREE.ShaderMaterial({
            // precision: 'lowp',
            uniforms,
            vertexShader,
            fragmentShader,
            side: THREE.DoubleSide,
        })

        super(geometry, material)
    }

    update(e) {
        this.material.uniforms.uTime.value += e.getDelta()
    }
}

export default Plane
