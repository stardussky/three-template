import * as THREE from 'three'
import GUI from 'lil-gui'
import CustomEventTarget from '@/js/utils/Event/CustomEventTarget'
import CustomEvent from '@/js/utils/Event/CustomEvent'
import Scene from '@/js/base/Scene'

const Debug = class extends CustomEventTarget {
    #axe

    #initialize = function initialize() {
        this.gui = new GUI()

        if (this.sketch) {
            this.sketch.eventManager.addEventListener(this.sketch.loader, 'ready', (e) => {
                this.#axe = new THREE.AxesHelper(1, 1)
                this.sketch.scene.add(this.#axe)
            })
        }
    }.bind(this)

    constructor(sketch) {
        super()
        this.#axe = null

        if (window.Sketch && sketch instanceof window.Sketch) {
            this.sketch = sketch
        }

        this.isDebug = false
        this.gui = null

        const urlParams = new URLSearchParams(window.location.search)

        if (import.meta.env.DEV && urlParams.get('debug')) {
            this.isDebug = true
            this.#initialize()
        }
    }

    get console() {
        if (this.isDebug) {
            return console
        }
        return {
            ...Object.keys(console).reduce((accumulator, key) => {
                accumulator[key] = () => {}
                return accumulator
            }, {}),
        }
    }

    destroy() {
        super.destroy()

        if (this.gui) {
            this.gui.destroy()
            this.gui = null
        }
        if (this.#axe) {
            Scene.disposeMeshes(this.#axe)
            this.sketch.scene.remove(this.#axe)
            this.#axe = null
        }
    }
}

export default Debug
