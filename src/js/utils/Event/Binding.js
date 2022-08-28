const Binding = class {
    constructor(target, type, listener, options) {
        this.target = target
        this.type = type
        this.listener = listener
        this.options = options

        if ('addEventListener' in target) {
            this.target.addEventListener(type, listener, this.options)
        }
    }

    removeEventListener() {
        this.target.removeEventListener(this.type, this.listener, this.options)

        this.target = null
        this.listener = null
        this.options = false
    }
}

export default Binding
