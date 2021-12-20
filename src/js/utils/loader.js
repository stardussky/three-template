import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Event from './event'

export default class Loader extends Event {
    constructor (sources) {
        super()
        this.resources = []
        this.loaderManager = new THREE.LoadingManager()
        this.textureLoader = new THREE.TextureLoader(this.loaderManager)
        this.cubeTextureLoader = new THREE.CubeTextureLoader(this.loaderManager)
        this.gltfLoader = new GLTFLoader(this.loaderManager).setDRACOLoader(
            new DRACOLoader().setDecoderPath('/draco/')
        )

        this.loaderManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.trigger('load', url, itemsLoaded, itemsTotal)
        }
        this.loaderManager.onLoad = () => {
            this.trigger('loaded')
        }
        this.add(sources).then(() => {
            this.trigger('ready')
        })
    }

    async add (payload) {
        const resources = await this.loadResources(payload)
        if (resources) {
            if (resources instanceof Array) {
                resources.forEach((resource, i) => {
                    if (resource.status === 'fulfilled') {
                        this.resources.push(resource.value)
                    } else {
                        console.warn(`load resource fail: ${payload[i].src}`)
                    }
                })
                return
            }
            this.resources.push(resources)
        }
    }

    async loadResources (payload) {
        if (payload instanceof Array) {
            return await Promise.allSettled(payload.map((resource) => this.loadResources(resource)))
        }

        let { type, src, name, options } = payload

        if (!src.match(/^(http|https):\/\//)) {
            src = require(`@/assets/${src}`)
        }

        const generate = {
            type,
            name: name || src,
            resource: null,
        }
        try {
            if (type === 'texture') {
                generate.resource = await this.loadTexture(src, options)
            }
            if (type === 'cubeTexture') {
                generate.resource = await this.loadCubeTexture(name, src, options)
            }
            if (type === 'model') {
                generate.resource = await this.loadGltf(src, options)
            }
            return generate
        } catch (err) {
            console.warn(`load resource fail: ${src}`)
        }
    }

    getResource = (() => {
        const memo = {}
        return (string, type = 'name') => {
            if (memo[string]) return memo[string]
            const target = this.resources.find((resource) => resource[type] === string)
            memo[string] = target
            return target
        }
    })()

    getResources (payload, type = 'name') {
        if (typeof payload === 'function') {
            return this.resources.filter(payload)
        }
        return this.resources.filter((resource) => resource[type] === payload)
    }

    loadTexture (url, options) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(url, (texture) => {
                for (const key in options) {
                    texture[key] = options[key]
                }
                resolve(texture)
            }, undefined, (err) => {
                reject(err)
            })
        })
    }

    loadCubeTexture = (() => {
        const memo = {}
        return function (name, url, options) {
            const mats = memo[name]
            mats ? mats.push(url) : (memo[name] = [url])

            if (mats && mats.length === 6) {
                return new Promise((resolve, reject) => {
                    this.cubeTextureLoader.load(mats, (texture) => {
                        delete memo[name]
                        for (const key in options) {
                            texture[key] = options[key]
                        }
                        resolve(texture)
                    }, undefined, (err) => {
                        reject(err)
                    })
                })
            }
        }
    })()

    loadGltf (url, options) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(url, (gltf) => {
                for (const key in options) {
                    gltf[key] = options[key]
                }

                // const model = gltf.scene
                // const group = new THREE.Group()
                // const box = new THREE.Box3().setFromObject(model)
                // const center = box.getCenter(new THREE.Vector3())
                // model.position.sub(center)
                // group.add(model)
                // gltf.scene = group

                resolve(gltf)
            }, undefined, (err) => {
                reject(err)
            })
        })
    }
}
