export default class Event {
    constructor () {
        this.listeners = []
        this.onEvents = {}
    }

    add (type, object, callback) {
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

    remove (type, object, callback) {
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
            this.onEvents[name] = callback
        }
    }

    destroy () {
        while (this.listeners.length) {
            const { type, object, callback } = this.listeners.pop()
            object.removeEventListener(type, callback)
        }

        for (const key in this.onEvents) {
            delete this.onEvents[key]
        }
    }
}
