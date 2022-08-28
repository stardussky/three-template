import Utils from '@/js/utils/Utils'
import CustomEvent from './CustomEvent'

const CustomEventTarget = class {
    constructor() {
        this.listeners = new Utils.Map()

        this.dispatchTarget = this
    }

    addEventListener(type, listener) {
        if (!this.listeners) {
            return
        }
        this.listeners.set(type, listener)
    }

    removeEventListener(type, listener) {
        if (!this.listeners) {
            return
        }
        this.listeners.delete(type, listener)
    }

    dispatchEvent(event) {
        if (!this.listeners || !(event instanceof CustomEvent)) {
            return
        }

        const listener = this.listeners.get(event.type)
        event.target = this.dispatchTarget
        event.currentTarget = this.dispatchTarget

        if (Array.isArray(listener)) {
            for (const value of listener) {
                try {
                    value.call(this, event)
                } catch (err) {
                    console.log(err)
                }

                if (event.stopped) {
                    break
                }
            }
        } else if (listener) {
            listener.call(this, event)
        }

        return event.defaultPrevented
    }

    removeAllEventListener() {
        if (!this.listeners) {
            return
        }

        this.listeners.clear()
    }

    destroy() {
        this.removeAllEventListener()
        this.listeners = null
    }
}

export default CustomEventTarget
