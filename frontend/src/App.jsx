import {Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import LevelSelectionPage from './pages/LevelSelectionPage'
import DashboardPage from './pages/DashboardPage'
import RegisterPage from './pages/RegisterPage'
import { useParams } from 'react-router-dom';
import LevelTemplate from './components/LevelTemplate'
import CoursesPage from './pages/CoursesPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import CourseCreationPage from './pages/CourseCreationPage'
import AdminCoursesPage from './pages/AdminCoursesPage'
import EditCoursePage from './pages/EditCoursePage'
import LessonCreationPage from './pages/LessonCreationPage'
import AdminLessonsPage from './pages/AdminLessonsPage'
import EditLessonPage from './pages/EditLessonPage'
import RankingPage from './pages/RankingPage'
import EquipmentPage from './pages/EquipmentPage'
import CourseUsersListPage from './pages/CourseUsersListPage'
import TrophiesPage from './pages/TrophiesPage'
import AddEquipmentPage from './pages/AddEquipment'
import AdminEquipmentListPage from './pages/AdminEquipmentListPage'
import EditEquipmentPage from './pages/EditEquipmentPage'
import AddSpritePage from './pages/AddSpritePage'
import AddEnemyPage from './pages/AddEnemyPage'
import EnemyListPage from './pages/EnemyListPage'
import EditEnemyPage from './pages/EditEnemyPage'
import ForumPage from './pages/ForumPage'
import ReportListPage from './pages/ReportListPage'

function App() {
  return (
    <Routes>
      {/* Login screen */}
      <Route path="/" element={<LoginPage/>} />

      {/* level selection screen */}
      <Route path="/course/:courseId" element={<LevelSelectionPage/>} />

      {/* dashboard */}
      <Route path="/dashboard" element={<DashboardPage/>} />

      {/* register screen */}
      <Route path="/register" element={<RegisterPage/>} />

      {/*lesson level by id */}
      <Route path="/level/:lessonId" element={<LevelWrapper />} />

      {/* available courses list */}
      <Route path="/courses" element={<CoursesPage />} />

      <Route path="/course/:courseId/level/:levelNumber" element={<LevelTemplate />} />

      <Route path= "/admin/preview-lesson/:courseId/level/:levelNumber" element={<LevelTemplate isAdminPreview={true} nextLevelPath="/admin/courses" />} />

      <Route path='/admin-dashboard' element={<AdminDashboardPage/>} />

      <Route path='/admin/create-course' element={<CourseCreationPage/>} />

      <Route path='/admin/courses' element={<AdminCoursesPage/>} />

      <Route path='/admin/edit-course/:id' element={<EditCoursePage/>} />

      <Route path='/admin/create-lesson' element={<LessonCreationPage />} />

      <Route path='/admin/course-lessons/:courseId' element={<AdminLessonsPage/>} />

      <Route path="/admin/edit-lesson/:lessonId" element={<EditLessonPage />} />

      <Route path='/ranking' element={<RankingPage/>} />

      <Route path='/user-equipment' element={<EquipmentPage />} />

      <Route path='/admin/course-users-progress/:courseId' element={<CourseUsersListPage />} />

      <Route path='/user-trophies' element={<TrophiesPage />} />

      <Route path='/admin/add-equipment' element={<AddEquipmentPage />} />

      <Route path='/admin/equipment' element={<AdminEquipmentListPage />} />

      <Route path='/admin/edit-equipment/:id' element={<EditEquipmentPage />} />

      <Route path='/admin/add-sprite' element={<AddSpritePage />} />

      <Route path='/admin/add-enemy' element={<AddEnemyPage />} />

      <Route path='/admin/enemies' element={<EnemyListPage />} />

      <Route path='/admin/edit-enemy/:id' element={<EditEnemyPage />} />

      <Route path='/forum' element={<ForumPage />} />

      <Route path='/admin/reports' element={<ReportListPage />} />

      {/* Error screen */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  )
}

function LevelWrapper() {
  // useParams() extracts the 'lessonId' from the URL
  const { lessonId } = useParams();
  
  return <LevelTemplate lessonId={Number(lessonId)} />; 
}

export default App
