import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import Utils from '@/js/utils/Utils'
import CustomEventTarget from '@/js/utils/Event/CustomEventTarget'
import CustomEvent from '@/js/utils/Event/CustomEvent'
import Source from './Source'

const Loader = class extends CustomEventTarget {
    #resources

    #loaderManager

    #loader

    #setGlobalTextureLoad

    #setGlobalImageBitmapLoad

    #setGlobalCubeTextureLoad

    #setGlobalGltfLoad

    async #loadResource(source) {
        if (source instanceof Array) {
            const resources = await Promise.allSettled(
                source.map((s) => this.#loadResource(s)),
            )
            return resources
        }

        if (source instanceof Source) {
            const loader = this.#loader[source.type]
            if (loader) {
                try {
                    const resource = await loader(source)
                    return resource
                } catch (e) {
                    return Promise.reject(new Error(`Loader: load source failure "${source.key}"`))
                }
            }
        }
        return Promise.reject(new Error(`Loader: unknown source "${source.key}"`))
    }

    #loadTexture = function loadTexture(source) {
        if (source instanceof Source) {
            return new Promise((resolve, reject) => {
                this.textureLoader.load(source.src, (texture) => {
                    this.setGlobalTextureLoad?.(texture)
                    source?.load?.(texture)
                    source.setResult(texture)
                    resolve(source)
                }, undefined, (err) => {
                    reject(err)
                })
            })
        }
        return null
    }.bind(this)

    #loadImageBitmap = function loadImageBitmap(source) {
        if (source instanceof Source) {
            return new Promise((resolve, reject) => {
                this.imageBitmapLoader.load(source.src, (imageBitmap) => {
                    const texture = new THREE.CanvasTexture(imageBitmap)
                    this.setGlobalImageBitmapLoad?.(texture)
                    source?.load?.(texture)
                    source.setResult(texture)
                    resolve(source)
                }, undefined, (err) => {
                    reject(err)
                })
            })
        }
        return null
    }.bind(this)

    #loadCubeTexture = function loadCubeTexture(source) {
        if (source instanceof Source) {
            return new Promise((resolve, reject) => {
                if (!(Array.isArray(source.src)) || source.src.length !== 6) {
                    reject(new Error('Loader: loadCubeTexture src must be an array with 6 elements'))
                    return
                }
                this.cubeTextureLoader.load(source.src, (texture) => {
                    this.setGlobalCubeTextureLoad?.(texture)
                    source?.load?.(texture)
                    source.setResult(texture)
                    resolve(source)
                }, undefined, (err) => {
                    reject(err)
                })
            })
        }
        return null
    }.bind(this)

    #loadGltf = function loadGltf(source) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(source.src, (gltf) => {
                this.setGlobalGltfLoad?.(gltf)
                source?.load?.(gltf)
                source.setResult(gltf)
                resolve(source)
            }, undefined, (err) => {
                reject(err)
            })
        })
    }.bind(this)

    constructor(sources) {
        super()

        this.#resources = new Utils.Map()

        this.#loaderManager = new THREE.LoadingManager()
        this.#loaderManager.onStart = (url, itemsLoaded, itemsTotal) => {
            this.dispatchEvent(new CustomEvent('start', {
                url, itemsLoaded, itemsTotal,
            }))
        }
        this.#loaderManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.dispatchEvent(new CustomEvent('progress', {
                url, itemsLoaded, itemsTotal,
            }))
        }
        this.#loaderManager.onLoad = () => {
            window.requestAnimationFrame(() => {
                this.dispatchEvent(new CustomEvent('load', this.#resources))
            })
        }
        this.#loaderManager.onError = () => {
            this.dispatchEvent(new CustomEvent('error'))
        }

        this.#loader = {
            [Source.SOURCE_TYPE.TEXTURE]: this.#loadTexture,
            [Source.SOURCE_TYPE.BITMAP]: this.#loadImageBitmap,
            [Source.SOURCE_TYPE.CUBE]: this.#loadCubeTexture,
            [Source.SOURCE_TYPE.GLTF]: this.#loadGltf,
        }

        this.textureLoader = new THREE.TextureLoader(this.#loaderManager)
        this.imageBitmapLoader = new THREE.ImageBitmapLoader(this.#loaderManager)
        this.imageBitmapLoader.setOptions({ imageOrientation: 'flipY' })
        this.cubeTextureLoader = new THREE.CubeTextureLoader(this.#loaderManager)
        this.gltfLoader = new GLTFLoader(this.#loaderManager).setDRACOLoader(
            new DRACOLoader().setDecoderPath('/draco/'),
        )

        this.add(sources).then(() => {
            this.dispatchEvent(new CustomEvent('ready', this.#resources))
        })
    }

    set setGlobalTextureLoad(value) {
        if (value) {
            if (typeof value === 'function') {
                this.#setGlobalTextureLoad = value
                return
            }
            console.warn('Loader: setGlobalTextureLoad must be a function')
        }
    }

    get setGlobalTextureLoad() {
        return this.#setGlobalTextureLoad
    }

    set setGlobalImageBitmapLoad(value) {
        if (value) {
            if (typeof value === 'function') {
                this.#setGlobalImageBitmapLoad = value
                return
            }
            console.warn('Loader: setGlobalImageBitmapLoad must be a function')
        }
    }

    get setGlobalImageBitmapLoad() {
        return this.#setGlobalImageBitmapLoad
    }

    set setGlobalCubeTextureLoad(value) {
        if (value) {
            if (typeof value === 'function') {
                this.#setGlobalCubeTextureLoad = value
                return
            }
            console.warn('Loader: setGlobalCubeTextureLoad must be a function')
        }
    }

    get setGlobalCubeTextureLoad() {
        return this.#setGlobalCubeTextureLoad
    }

    set setGlobalGltfLoad(value) {
        if (value) {
            if (typeof value === 'function') {
                this.#setGlobalGltfLoad = value
                return
            }
            console.warn('Loader: setGlobalGltfLoad must be a function')
        }
    }

    get setGlobalGltfLoad() {
        return this.#setGlobalGltfLoad
    }

    async add(source) {
        if (source) {
            try {
                const resources = await this.#loadResource(source)
                if (resources && this.#resources) {
                    if (resources instanceof Array) {
                        resources.forEach((resource) => {
                            if (resource.status === 'fulfilled') {
                                this.#resources.set(resource.value.key, resource.value)
                                return
                            }
                            console.warn(resource.reason)
                        })
                        return
                    }
                    this.#resources.set(resources.key, resources)
                }
            } catch (e) {
                console.warn(e.message)
            }
        }
    }

    get(key) {
        return this.#resources.get(key)?.result
    }

    destroy() {
        super.destroy()

        this.#resources.getAll().forEach((resource) => {
            if (resource.value instanceof Source) {
                if (resource.value.result instanceof THREE.CanvasTexture) {
                    resource.value.result.source.data.close()
                }
                if (resource.value.result instanceof THREE.Texture) {
                    resource.value.result.dispose()
                }
            }
        })

        this.#resources = null
        this.textureLoader = null
        this.imageBitmapLoader = null
        this.cubeTextureLoader = null
        this.gltfLoader = null
        this.#loaderManager = null
    }
}

export default Loader
