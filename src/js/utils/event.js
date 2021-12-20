export default class Event {
    constructor () {
        this.listeners = []
        this.callbacks = {}
    }

    addListener (type, object, callback) {
        if (object.addEventListener !== undefined) {
            const instance = {
                type,
                object,
                callback,
            }
            this.listeners.push(instance)
            object.addEventListener(type, callback)
        }
    }

    removeListener (type, object, callback) {
        if (object.removeEventListener !== undefined) {
            const index = this.listeners.findIndex((listener) => {
                return (
                    listener.type === type && listener.object === object && listener.callback === callback
                )
            })
            if (~index) {
                object.removeEventListener(type, callback)
                this.listeners.splice(index, 1)
            }
        }
    }

    on (name, callback) {
        if (typeof name === 'string' && typeof callback === 'function') {
            if (this.callbacks[name]) {
                this.callbacks[name].push(callback)
                return
            }
            this.callbacks[name] = [callback]
        }
    }

    off (name, callback) {
        if (typeof name === 'string' && typeof callback === 'function') {
            if (this.callbacks[name]) {
                const index = this.callbacks[name].findIndex(cb => cb === callback)
                this.callbacks[name].splice(index, 1)
            }
        }
    }

    trigger (name, ...args) {
        if (this.callbacks[name]) {
            this.callbacks[name].forEach(callback => {
                callback.apply(this, args)
            })
        }
    }

    destroy () {
        while (this.listeners.length) {
            const { type, object, callback } = this.listeners.pop()
            object.removeEventListener(type, callback)
        }

        for (const name in this.callbacks) {
            while (this.callbacks[name].length) {
                this.callbacks[name].pop()
            }
        }
        this.callbacks = undefined
    }
}
