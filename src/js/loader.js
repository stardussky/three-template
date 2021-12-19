import { LoadingManager, TextureLoader, CubeTextureLoader } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default class Loader {
    constructor (defaultResources) {
        this.defaultResources = defaultResources
        this.resources = []
        this.status = {
            total: 0,
            progress: 0,
            isDone: false,
        }
        this.loaderManager = new LoadingManager()
        this.loaderManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.status.total = itemsTotal
            this.status.progress = itemsLoaded / this.status.total
        }
        this.loaderManager.onLoad = () => {
            this.status.isDone = true
        }
        this.textureLoader = new TextureLoader(this.loaderManager)
        this.cubeTextureLoader = new CubeTextureLoader(this.loaderManager)
        this.gltfLoader = new GLTFLoader(this.loaderManager).setDRACOLoader(
            new DRACOLoader().setDecoderPath('/draco/')
        )
    }

    async load () {
        await this.add(this.defaultResources)
    }

    async add (payload) {
        const resources = await this.loadResources(payload)
        this.resources.push(...resources)
    }

    async loadResources (payload) {
        if (Array.isArray(payload)) {
            return await Promise.all(payload.map((resource) => this.loadResources(resource)))
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
        return new Promise((resolve) => {
            this.textureLoader.load(url, (texture) => {
                for (const key in options) {
                    texture[key] = options[key]
                }
                resolve(texture)
            })
        })
    }

    loadCubeTexture = (() => {
        const memo = {}
        return function (name, url, options) {
            const mats = memo[name]
            mats ? mats.push(url) : (memo[name] = [url])

            if (mats && mats.length === 6) {
                return new Promise((resolve) => {
                    this.cubeTextureLoader.load(mats, (texture) => {
                        delete memo[name]
                        for (const key in options) {
                            texture[key] = options[key]
                        }
                        resolve(texture)
                    })
                })
            }
        }
    })()

    loadGltf (url, options) {
        return new Promise((resolve) => {
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
            })
        })
    }
}
