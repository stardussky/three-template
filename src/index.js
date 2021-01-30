import '@/style/main.scss'
import App from '@/js/app'

let app = new App(document.getElementById('three'))
app.init()

if (module.hot) {
  module.hot.accept('@/js/app.js', () => {
    app.destroy()
    app = new App(document.getElementById('three'))
    app.init()
  })
}
