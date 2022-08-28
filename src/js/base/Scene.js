import * as THREE from 'three'

const Scene = class extends THREE.Scene {
    static disposeMeshes(mesh) {
        while (mesh.children.length) {
            let child = mesh.children.pop()
            Scene.disposeMeshes(child)
            mesh.remove(child)
            child = null
        }

        if (mesh.geometry) {
            mesh.geometry.dispose()
        }

        if (mesh.material) {
            Object.values(mesh.material).forEach((prop) => {
                if (prop && typeof prop.dispose === 'function') {
                    prop.dispose()
                }
            })
            mesh.material.dispose()
        }
    }

    destroy() {
        Scene.disposeMeshes(this)
    }
}

export default Scene
