import DefaultTheme from 'vitepress/theme'
import CourseTiles from './components/CourseTiles.vue'
import SubCategoryTiles from './components/SubCategoryTiles.vue'
import MemberDashboard from './components/MemberDashboard.vue'
import AdminDashboard from './components/AdminDashboard.vue'
import ExerciseBox from './components/ExerciseBox.vue'
import QuizBox from './components/QuizBox.vue'
import DriveVideoCard from './components/DriveVideoCard.vue'
import DriveVideoGrid from './components/DriveVideoGrid.vue'
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
    app.component('DriveVideoCard', DriveVideoCard)
    app.component('DriveVideoGrid', DriveVideoGrid)
  }
}

