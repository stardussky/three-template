import * as THREE from 'three'
import App from '../index'
import vertexShader from '@/glsl/vertexShader.glsl'
import fragmentShader from '@/glsl/fragmentShader.glsl'

export default class World {
    constructor () {
        this.app = new App()

        this.app.loader.on('ready', () => {
            this.init()
        })
    }

    init () {
        const { width: vpWidth, height: vpHeight } = this.app.size.viewport
        const { width, height } = this.app.size.viewSize

        const texture = this.app.loader.getResource('grid').resource
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
        this.app.scene.add(planeSketch)

        this.app.tick.on('tick', (d, t) => {
            uniforms.uTime.value = t
        })
        this.app.size.on('resize', (viewport, viewSize) => {
            const { width: vpWidth, height: vpHeight } = viewport
            const { width, height } = viewSize
            uniforms.uResolution.value = new THREE.Vector2(vpWidth, vpHeight)
            planeSketch.scale.set(width, height, 1)
        })
    }
}
