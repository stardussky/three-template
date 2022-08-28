const Source = class {
    #key

    #options

    #type

    #name

    #src

    #load

    static SOURCE_TYPE = Object.freeze({
        TEXTURE: 'texture',
        BITMAP: 'bitmap',
        CUBE: 'cube',
        GLTF: 'gltf',
    })

    constructor(key, options) {
        if (!key) {
            console.warn('Source: key is required')
        }

        this.key = key
        this.#options = {
            ...options,
        }
        this.result = null

        const {
            type, name, src, load,
        } = this.#options
        this.type = type
        this.name = name
        this.src = src
        this.load = load
    }

    set key(value) {
        if (typeof value === 'string') {
            this.#key = value
            return
        }
        console.warn('Source: key must be a string')
    }

    get key() {
        return this.#key
    }

    set type(value) {
        if (Object.values(Source.SOURCE_TYPE).includes(value)) {
            this.#type = value
            return
        }
        console.warn(`Source: type must one of "${Object.values(Source.SOURCE_TYPE).join(', ')}"`)
    }

    get type() {
        return this.#type
    }

    set name(value) {
        if (value) {
            if (typeof value === 'string') {
                this.#name = value
                return
            }
            console.warn('Source: name must be a string')
        }
    }

    get name() {
        return this.#name
    }

    set src(value) {
        if (value) {
            if (this.type === Source.SOURCE_TYPE.CUBE) {
                if (Array.isArray(value)) {
                    this.#src = value
                    return
                }
                console.warn('Source: src must be an array')
                return
            }
            if (typeof value === 'string') {
                this.#src = value
                return
            }
            console.warn('Source: src must be a string')
        }
    }

    get src() {
        return this.#src
    }

    set load(value) {
        if (value) {
            if (typeof value === 'function') {
                this.#load = value
                return
            }
            console.warn('Source: load must be a function')
        }
    }

    get load() {
        return this.#load
    }

    setResult(result) {
        this.result = result
    }
}

export default Source
