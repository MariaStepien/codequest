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
import AdminUserListPage from './pages/AdminUserListPage'
import AdminForumPage from './pages/AdminForumPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Login screen */}
      <Route path="/" element={<LoginPage/>} />

      {/* register screen */}
      <Route path="/register" element={<RegisterPage/>} />


      {/* Routes protected by ProtectedRoute where admin is not required can only be accessed by logged in users */}
      <Route element={<ProtectedRoute isAdminRequired={false} />} >
        
        {/* level selection screen */}
        <Route path="/course/:courseId" element={<LevelSelectionPage/>} />

        {/* dashboard */}
        <Route path="/dashboard" element={<DashboardPage/>} />

        {/*lesson level by id */}
        <Route path="/level/:lessonId" element={<LevelWrapper />} />

        {/* available courses list */}
        <Route path="/courses" element={<CoursesPage />} />

        {/* available lesson page with tasks */}
        <Route path="/course/:courseId/level/:levelNumber" element={<LevelTemplate />} />
        
        {/* ranking with users */}
        <Route path='/ranking' element={<RankingPage/>} />

        {/* page with user's equipment */}
        <Route path='/user-equipment' element={<EquipmentPage />} />

        {/* Page showcasing trophies obtained by user for finishing courses */}
        <Route path='/user-trophies' element={<TrophiesPage />} />

        {/* Forum where user can communicate with other users via posts and comments */}
        <Route path='/forum' element={<ForumPage />} />

        {/* Page where user can change password */}
        <Route path='/change-password' element={<ChangePasswordPage />} />

      </Route>


      {/* Routes protected by ProtectedRoute where admin role is required can be accessed by admin only */}
      <Route element={<ProtectedRoute isAdminRequired={true} />}>
        {/* admin dashboard */}
        <Route path='/admin-dashboard' element={<AdminDashboardPage/>} />
        {/* Page where courses can be created */}
        <Route path='/admin/create-course' element={<CourseCreationPage/>} />

        {/* Page with all existing courses */}
        <Route path='/admin/courses' element={<AdminCoursesPage/>} />

        {/* Page to edit course */}
        <Route path='/admin/edit-course/:id' element={<EditCoursePage/>} />

        {/* Page where lessons can be created */}
        <Route path='/admin/create-lesson' element={<LessonCreationPage />} />

        {/* List of lessons in course */}
        <Route path='/admin/course-lessons/:courseId' element={<AdminLessonsPage/>} />

        {/* Page to edit lesson */}
        <Route path="/admin/edit-lesson/:lessonId" element={<EditLessonPage />} />

        {/* List of users who started course with given id */}
        <Route path='/admin/course-users-progress/:courseId' element={<CourseUsersListPage />} />

        {/* Admin preview of existing lesson */}
        <Route path= "/admin/preview-lesson/:courseId/level/:levelNumber" element={<LevelTemplate isAdminPreview={true} nextLevelPath="/admin/courses" />} />
        
        {/* Page where new equipment can be created */}
        <Route path='/admin/add-equipment' element={<AddEquipmentPage />} />

        {/* List of all equipment */}
        <Route path='/admin/equipment' element={<AdminEquipmentListPage />} />

        {/* Page to edit equipment */}
        <Route path='/admin/edit-equipment/:id' element={<EditEquipmentPage />} />

        {/* Page where images can be added to showcase a set of equipment */}
        <Route path='/admin/add-sprite' element={<AddSpritePage />} />

        {/* Page where enemy can be created */}
        <Route path='/admin/add-enemy' element={<AddEnemyPage />} />

        {/* List of enemies */}
        <Route path='/admin/enemies' element={<EnemyListPage />} />

        {/* Page where enemy can be edited */}
        <Route path='/admin/edit-enemy/:id' element={<EditEnemyPage />} />

        {/* Forum with moderation options for admin */}
        <Route path='/admin/forum' element={<AdminForumPage />} />

        {/* List of user made reports */}
        <Route path='/admin/reports' element={<ReportListPage />} />

        {/* List of users in app */}
        <Route path='/admin/user-list' element={<AdminUserListPage />} />
      </Route>

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
