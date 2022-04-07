import * as THREE from 'three'
import GUI from 'lil-gui'
import App from '../index'
import Event from './event'

export default class Debug extends Event {
    constructor () {
        super()
        this.app = new App()
        this.gui = null
        this.axe = null

        if (window.location.hash === '#debug') {
            this.init()
        }
        this.addListener('hashchange', window, () => {
            if (window.location.hash === '#debug') {
                this.init()
                return
            }
            this.destroy()
        })
    }

    init () {
        this.gui = new GUI()
        this.axe = new THREE.AxesHelper(1, 1)
        this.app.scene.add(this.axe)
    }

    destroy () {
        super.destroy()
        if (this.gui) {
            this.gui.destroy()
        }
        this.app.scene.remove(this.axe)
    }
}
