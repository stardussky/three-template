import '@/style/main.scss'
import App from '@/js/index'

let app = new App(document.getElementById('three'))

if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => {
        console.clear()
        app.destroy()
        app = new App(document.getElementById('three'))
    })
}
