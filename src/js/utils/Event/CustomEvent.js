const CustomEvent = class {
    constructor(type, detail) {
        this.bubbles = false

        this.cancelable = false

        this.defaultPrevented = false

        this.timeStamp = window.performance && window.performance.now ? window.performance.now() : Date.now()

        this.type = type

        this.detail = detail

        this.isTrusted = false

        this.currentTarget = null

        this.target = null

        this.stopped = false
    }

    preventDefault() {
        if (this.cancelable) {
            this.defaultPrevented = true
        }
    }

    stopImmediatePropagation() {
        this.stopped = true
    }
}

export default CustomEvent
