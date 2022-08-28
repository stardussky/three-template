import Utils from '@/js/utils/Utils'
import Binding from './Binding'

const EventManager = class {
    constructor() {
        this.listeners = new Utils.Map()
    }

    addEventListener(target, type, listener, options) {
        if (!this.listeners) {
            return
        }

        const binding = new Binding(target, type, listener, options)
        this.listeners.set(type, binding)
    }

    removeEventListener(target, type, listener) {
        if (!this.listeners) {
            return
        }

        const binding = this.listeners.get(type)

        if (Array.isArray(binding)) {
            for (const value of binding) {
                if (value && value.target === target) {
                    if (listener === value.listener) {
                        value.removeEventListener()
                        this.listeners.delete(type, value)
                    }
                }
            }
            return
        }

        if (binding && binding.target === target) {
            if (listener === binding.listener) {
                binding.removeEventListener()
                this.listeners.delete(type, listener)
            }
        }
    }

    removeAllEventListener() {
        if (!this.listeners) {
            return
        }

        for (const [, binding] of this.listeners) {
            if (Array.isArray(binding)) {
                for (const value of binding) {
                    value.removeEventListener()
                }
            } else {
                binding.removeEventListener()
            }
        }

        this.listeners.clear()
    }

    destroy() {
        this.removeAllEventListener()
        this.listeners = null
    }
}

export default EventManager
