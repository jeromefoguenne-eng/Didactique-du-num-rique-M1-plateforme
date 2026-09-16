import DefaultTheme from 'vitepress/theme'
import CourseTiles from './components/CourseTiles.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CourseTiles', CourseTiles)
  }
}
