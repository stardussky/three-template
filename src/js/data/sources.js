import Source from '@/js/utils/Loader/Source'

const sources = [
    new Source('uv', {
        type: Source.SOURCE_TYPE.TEXTURE,
        name: 'uv',
        src: new URL('../../assets/uv_grid.jpg', import.meta.url).href,
        load(texture) { },
    }),
    new Source('helmet', {
        type: Source.SOURCE_TYPE.GLTF,
        name: 'helmet',
        src: new URL('../../assets/helmet.glb', import.meta.url).href,
        load(gltf) { },
    }),
]

export default sources
