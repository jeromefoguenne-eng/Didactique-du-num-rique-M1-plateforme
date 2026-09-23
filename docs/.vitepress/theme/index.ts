import DefaultTheme from 'vitepress/theme'
import CourseTiles from './components/CourseTiles.vue'
import SubCategoryTiles from './components/SubCategoryTiles.vue'
import MemberDashboard from './components/MemberDashboard.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import ExerciseBox from './components/ExerciseBox.vue'
import QuizBox from './components/QuizBox.vue'
import CourseEvaluationForm from './components/CourseEvaluationForm.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CourseTiles', CourseTiles)
    app.component('SubCategoryTiles', SubCategoryTiles)
    app.component('MemberDashboard', MemberDashboard)
    app.component('AdminDashboard', AdminDashboard)
    app.component('ExerciseBox', ExerciseBox)
    app.component('QuizBox', QuizBox)
    app.component('CourseEvaluationForm', CourseEvaluationForm)

    // Synchronisation Cloud automatique en arrière-plan dès le chargement de n'importe quelle page
    if (typeof window !== 'undefined') {
      import('./stores/userStore').then(({ userStore }) => {
        try {
          userStore.syncFromStorage()
          userStore.syncWithCloud().catch(() => {})
        } catch (e) {}
      })
    }
  }
}
